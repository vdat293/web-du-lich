const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDateOnly(value) {
    const text = String(value || '');
    if (!DATE_PATTERN.test(text)) return null;

    const [year, month, day] = text.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
        date.getUTCFullYear() !== year
        || date.getUTCMonth() !== month - 1
        || date.getUTCDate() !== day
    ) {
        return null;
    }
    return date;
}

export function normalizeCouponCode(value) {
    return String(value || '').trim().toUpperCase();
}

export function normalizePropertyIds(value) {
    const values = Array.isArray(value)
        ? value
        : (typeof value === 'string' ? value.split(',') : []);
    const ids = values
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0);
    return [...new Set(ids)];
}

function parseBoolean(value, defaultValue = true) {
    if (value == null || value === '') return defaultValue;
    if (value === false || value === 0 || value === '0' || value === 'false') return false;
    return true;
}

/**
 * Normalize and validate fields shared by admin and host coupon APIs.
 * Ownership and scope-specific checks are intentionally left to the caller.
 */
export function validateCoupon(body = {}, options = {}) {
    const code = normalizeCouponCode(body.code);
    const discountType = String(body.discount_type || '').trim().toLowerCase();
    const discountValue = Number(body.discount_value);
    const minOrderAmount = body.min_order_amount == null || body.min_order_amount === ''
        ? null
        : Number(body.min_order_amount);
    const maxUses = body.max_uses == null || body.max_uses === ''
        ? null
        : Number(body.max_uses);
    const validFrom = String(body.valid_from || '').trim();
    const validUntil = String(body.valid_until || '').trim();
    const description = String(body.description || '').trim() || null;
    const scopeType = String(options.scopeType || body.scope_type || 'system').trim().toLowerCase();
    const propertyIds = normalizePropertyIds(
        body.property_ids ?? body.properties ?? body.propertyIds
    );

    if (!/^[A-Z0-9_-]{3,50}$/.test(code)) {
        return { error: 'Mã phải có 3-50 ký tự A-Z, 0-9, gạch ngang hoặc gạch dưới' };
    }
    if (!['fixed', 'percent'].includes(discountType)) {
        return { error: 'Loại giảm giá không hợp lệ' };
    }
    if (
        !Number.isFinite(discountValue)
        || discountValue <= 0
        || (discountType === 'percent' && discountValue > 100)
    ) {
        return { error: 'Mức giảm không hợp lệ' };
    }
    if (minOrderAmount !== null && (!Number.isFinite(minOrderAmount) || minOrderAmount < 0)) {
        return { error: 'Giá trị đơn tối thiểu không hợp lệ' };
    }
    if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses <= 0)) {
        return { error: 'Giới hạn sử dụng phải là số nguyên dương' };
    }

    const fromDate = parseDateOnly(validFrom);
    const untilDate = parseDateOnly(validUntil);
    if (!fromDate || !untilDate || untilDate < fromDate) {
        return { error: 'Khoảng ngày áp dụng không hợp lệ' };
    }
    if (!['system', 'host'].includes(scopeType)) {
        return { error: 'Phạm vi coupon không hợp lệ' };
    }
    if (options.requireProperties && propertyIds.length === 0) {
        return { error: 'Coupon của host phải áp dụng cho ít nhất một chỗ nghỉ' };
    }

    return {
        value: {
            code,
            discount_type: discountType,
            discount_value: discountValue,
            min_order_amount: minOrderAmount,
            max_uses: maxUses,
            valid_from: validFrom,
            valid_until: validUntil,
            description,
            scope_type: scopeType,
            is_enabled: parseBoolean(body.is_enabled, true),
            property_ids: propertyIds,
        },
    };
}

export function calculateCouponDiscount(coupon, amount) {
    const orderAmount = Number(amount);
    if (!Number.isFinite(orderAmount) || orderAmount < 0) {
        return { valid: false, discount_amount: 0, final_price: 0 };
    }

    const minimum = coupon.min_order_amount == null ? null : Number(coupon.min_order_amount);
    if (minimum !== null && orderAmount < minimum) {
        return {
            valid: false,
            discount_amount: 0,
            final_price: orderAmount,
            message: 'Chưa đạt giá trị đơn tối thiểu',
        };
    }

    const rawDiscount = coupon.discount_type === 'percent'
        ? Math.round(orderAmount * Number(coupon.discount_value) / 100)
        : Number(coupon.discount_value);
    const discountAmount = Math.max(0, Math.min(orderAmount, Math.round(rawDiscount)));
    return {
        valid: true,
        discount_amount: discountAmount,
        final_price: Math.max(0, orderAmount - discountAmount),
    };
}

/**
 * Find a coupon valid for this exact property and order. The same helper is
 * used by public validation and booking creation, so the final write never
 * trusts price or scope values supplied by the client.
 */
export async function findApplicableCoupon(connection, {
    code,
    propertyId = null,
    amount = null,
    userId = null,
    forUpdate = false,
} = {}) {
    const normalizedCode = normalizeCouponCode(code);
    if (!normalizedCode) return null;

    const conditions = [
        'UPPER(c.code) = ?',
        `(
            COALESCE(c.scope_type, 'system') = 'system'
            OR (
                ? IS NOT NULL AND EXISTS (
                    SELECT 1 FROM coupon_properties cp_scope
                    JOIN properties p_scope ON p_scope.id = cp_scope.property_id
                    WHERE cp_scope.coupon_id = c.id
                      AND cp_scope.property_id = ?
                      AND p_scope.host_id = c.owner_id
                )
            )
        )`,
        'COALESCE(c.is_enabled, 1) = 1',
        'c.valid_from IS NOT NULL AND c.valid_until IS NOT NULL',
        'c.valid_from <= CURDATE() AND c.valid_until >= CURDATE()',
        '(c.max_uses IS NULL OR c.used_count < c.max_uses)',
        "(rr.id IS NULL OR (rr.user_id = ? AND r.category = 'booking'))",
    ];
    const params = [normalizedCode, propertyId, propertyId, userId];

    if (amount != null) {
        conditions.push('(c.min_order_amount IS NULL OR c.min_order_amount <= ?)');
        params.push(Number(amount));
    }

    const [rows] = await connection.execute(`
        SELECT c.*
        FROM coupons c
        LEFT JOIN reward_redemptions rr ON rr.coupon_id = c.id
        LEFT JOIN rewards r ON r.\`key\` = rr.reward_key
        WHERE ${conditions.map((condition) => `(${condition})`).join(' AND ')}
        LIMIT 1
        ${forUpdate ? 'FOR UPDATE' : ''}
    `, params);

    if (!rows[0]) return null;
    const discount = amount == null ? null : calculateCouponDiscount(rows[0], amount);
    if (discount && !discount.valid) return null;
    return { coupon: rows[0], ...(discount || {}) };
}

export async function loadCouponProperties(connection, couponIds) {
    const ids = normalizePropertyIds(couponIds);
    const byCoupon = new Map(ids.map((id) => [id, []]));
    if (ids.length === 0) return byCoupon;

    const placeholders = ids.map(() => '?').join(',');
    const [rows] = await connection.execute(`
        SELECT cp.coupon_id, p.id, p.name, p.location, p.host_id
        FROM coupon_properties cp
        JOIN properties p ON p.id = cp.property_id
        WHERE cp.coupon_id IN (${placeholders})
        ORDER BY p.name ASC
    `, ids);
    for (const row of rows) {
        const couponId = Number(row.coupon_id);
        if (!byCoupon.has(couponId)) byCoupon.set(couponId, []);
        byCoupon.get(couponId).push({
            id: Number(row.id),
            name: row.name,
            location: row.location,
            host_id: Number(row.host_id),
        });
    }
    return byCoupon;
}

export function attachCouponProperties(coupons, propertiesByCoupon) {
    return coupons.map((coupon) => ({
        ...coupon,
        id: Number(coupon.id),
        discount_value: Number(coupon.discount_value),
        min_order_amount: coupon.min_order_amount == null ? null : Number(coupon.min_order_amount),
        max_uses: coupon.max_uses == null ? null : Number(coupon.max_uses),
        used_count: Number(coupon.used_count || 0),
        owner_id: coupon.owner_id == null ? null : Number(coupon.owner_id),
        created_by: coupon.created_by == null ? null : Number(coupon.created_by),
        scope_type: coupon.scope_type || 'system',
        is_enabled: coupon.is_enabled == null ? true : Boolean(coupon.is_enabled),
        properties: propertiesByCoupon.get(Number(coupon.id)) || [],
    }));
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function validateCoupon(body) {
    const code = String(body.code || '').trim().toUpperCase();
    const discountType = body.discount_type;
    const discountValue = Number(body.discount_value);
    const minOrderAmount = body.min_order_amount == null ? null : Number(body.min_order_amount);
    const maxUses = body.max_uses == null ? null : Number(body.max_uses);
    const validFrom = String(body.valid_from || '');
    const validUntil = String(body.valid_until || '');
    const description = String(body.description || '').trim() || null;

    if (!/^[A-Z0-9_-]{3,50}$/.test(code)) {
        return { error: 'Mã phải có 3-50 ký tự A-Z, 0-9, gạch ngang hoặc gạch dưới' };
    }
    if (!['fixed', 'percent'].includes(discountType)) {
        return { error: 'Loại giảm giá không hợp lệ' };
    }
    if (!Number.isFinite(discountValue) || discountValue <= 0 || (discountType === 'percent' && discountValue > 100)) {
        return { error: 'Mức giảm không hợp lệ' };
    }
    if (minOrderAmount !== null && (!Number.isFinite(minOrderAmount) || minOrderAmount < 0)) {
        return { error: 'Giá trị đơn tối thiểu không hợp lệ' };
    }
    if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses <= 0)) {
        return { error: 'Giới hạn sử dụng phải là số nguyên dương' };
    }
    if (!DATE_PATTERN.test(validFrom) || !DATE_PATTERN.test(validUntil) || validUntil < validFrom) {
        return { error: 'Khoảng ngày áp dụng không hợp lệ' };
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
        },
    };
}


import { NextResponse } from 'next/server';
import { verifyHost } from '../../../../lib/auth';
import db from '../../../../lib/db';
import { logActivity } from '../../../../lib/logger';
import {
    attachCouponProperties,
    loadCouponProperties,
    validateCoupon,
} from '../../../../lib/coupons';

function isDuplicateError(error) {
    return error?.code === 'ER_DUP_ENTRY' || error?.errno === 1062;
}

async function getHostCoupons(hostId) {
    const [coupons] = await db.execute(`
        SELECT id, code, discount_type, discount_value, min_order_amount,
               max_uses, used_count, DATE_FORMAT(valid_from, '%Y-%m-%d') AS valid_from,
               DATE_FORMAT(valid_until, '%Y-%m-%d') AS valid_until, description,
               owner_id, created_by, COALESCE(scope_type, 'system') AS scope_type,
               COALESCE(is_enabled, 1) AS is_enabled, created_at
        FROM coupons
        WHERE owner_id = ? AND COALESCE(scope_type, 'host') = 'host'
        ORDER BY created_at DESC
    `, [hostId]);
    const propertiesByCoupon = await loadCouponProperties(db, coupons.map((coupon) => coupon.id));
    return attachCouponProperties(coupons, propertiesByCoupon);
}

async function getOwnedProperties(hostId, propertyIds) {
    if (!propertyIds.length) return [];
    const placeholders = propertyIds.map(() => '?').join(',');
    const [properties] = await db.execute(
        `SELECT id, name, location, host_id FROM properties WHERE host_id = ? AND id IN (${placeholders})`,
        [hostId, ...propertyIds]
    );
    return properties;
}

function assertHostScope(body) {
    if (body.scope_type != null && String(body.scope_type).toLowerCase() !== 'host') {
        return 'Host chỉ được tạo coupon trong phạm vi host';
    }
    return null;
}

export async function GET(req) {
    try {
        const authResult = await verifyHost(req);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }
        return NextResponse.json({ coupons: await getHostCoupons(authResult.userId) });
    } catch (error) {
        console.error('Lỗi lấy coupon host:', error);
        return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
    }
}

export async function POST(req) {
    let connection;
    try {
        const authResult = await verifyHost(req);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }
        const body = await req.json();
        const scopeError = assertHostScope(body);
        if (scopeError) return NextResponse.json({ message: scopeError }, { status: 400 });

        const validation = validateCoupon(body, { scopeType: 'host', requireProperties: true });
        if (validation.error) {
            return NextResponse.json({ message: validation.error }, { status: 400 });
        }
        const coupon = validation.value;
        const ownedProperties = await getOwnedProperties(authResult.userId, coupon.property_ids);
        if (ownedProperties.length !== coupon.property_ids.length) {
            return NextResponse.json({ message: 'Bạn chỉ được gắn coupon vào chỗ nghỉ do mình sở hữu' }, { status: 403 });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();
        const [existing] = await connection.execute('SELECT id FROM coupons WHERE code = ? LIMIT 1 FOR UPDATE', [coupon.code]);
        if (existing.length) {
            await connection.rollback();
            return NextResponse.json({ message: 'Mã giảm giá đã tồn tại' }, { status: 409 });
        }

        const [result] = await connection.execute(`
            INSERT INTO coupons
                (code, discount_type, discount_value, min_order_amount, max_uses,
                 valid_from, valid_until, description, owner_id, created_by, scope_type, is_enabled)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'host', ?)
        `, [
            coupon.code, coupon.discount_type, coupon.discount_value, coupon.min_order_amount,
            coupon.max_uses, coupon.valid_from, coupon.valid_until, coupon.description,
            authResult.userId, authResult.userId, coupon.is_enabled,
        ]);

        for (const propertyId of coupon.property_ids) {
            await connection.execute(
                'INSERT INTO coupon_properties (coupon_id, property_id) VALUES (?, ?)',
                [result.insertId, propertyId]
            );
        }
        await connection.commit();
        await logActivity(authResult.userId, 'Tạo coupon host', {
            couponId: result.insertId,
            code: coupon.code,
            propertyIds: coupon.property_ids,
        });

        return NextResponse.json({
            message: 'Tạo mã giảm giá thành công',
            id: result.insertId,
            coupon_id: result.insertId,
        }, { status: 201 });
    } catch (error) {
        if (connection) await connection.rollback().catch(() => {});
        if (isDuplicateError(error)) {
            return NextResponse.json({ message: 'Mã giảm giá đã tồn tại' }, { status: 409 });
        }
        console.error('Lỗi tạo coupon host:', error);
        return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
    } finally {
        connection?.release();
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

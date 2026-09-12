import { NextResponse } from 'next/server';
import { verifyHost } from '../../../../../lib/auth';
import db from '../../../../../lib/db';
import { logActivity } from '../../../../../lib/logger';
import { validateCoupon } from '../../../../../lib/coupons';

function isDuplicateError(error) {
    return error?.code === 'ER_DUP_ENTRY' || error?.errno === 1062;
}

async function getOwnedProperties(hostId, propertyIds) {
    if (!propertyIds.length) return [];
    const placeholders = propertyIds.map(() => '?').join(',');
    const [properties] = await db.execute(
        `SELECT id FROM properties WHERE host_id = ? AND id IN (${placeholders})`,
        [hostId, ...propertyIds]
    );
    return properties;
}

async function getCoupon(id, hostId) {
    const [coupons] = await db.execute(`
        SELECT id, code, used_count, scope_type, owner_id
        FROM coupons
        WHERE id = ? AND owner_id = ? AND COALESCE(scope_type, 'host') = 'host'
        LIMIT 1
    `, [id, hostId]);
    return coupons[0];
}

function assertHostScope(body) {
    if (body.scope_type != null && String(body.scope_type).toLowerCase() !== 'host') {
        return 'Host chỉ được quản lý coupon trong phạm vi host';
    }
    return null;
}

export async function PUT(req, { params }) {
    let connection;
    try {
        const authResult = await verifyHost(req);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }
        const id = Number((await params).id);
        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json({ message: 'Coupon không hợp lệ' }, { status: 400 });
        }
        const existingCoupon = await getCoupon(id, authResult.userId);
        if (!existingCoupon) {
            return NextResponse.json({ message: 'Coupon không tồn tại' }, { status: 404 });
        }

        const body = await req.json();
        const scopeError = assertHostScope(body);
        if (scopeError) return NextResponse.json({ message: scopeError }, { status: 400 });
        const validation = validateCoupon(body, { scopeType: 'host', requireProperties: true });
        if (validation.error) {
            return NextResponse.json({ message: validation.error }, { status: 400 });
        }
        const coupon = validation.value;
        if (coupon.max_uses !== null && coupon.max_uses < Number(existingCoupon.used_count || 0)) {
            return NextResponse.json({ message: 'Giới hạn sử dụng không được nhỏ hơn số lượt đã dùng' }, { status: 400 });
        }

        const ownedProperties = await getOwnedProperties(authResult.userId, coupon.property_ids);
        if (ownedProperties.length !== coupon.property_ids.length) {
            return NextResponse.json({ message: 'Bạn chỉ được gắn coupon vào chỗ nghỉ do mình sở hữu' }, { status: 403 });
        }
        const [duplicate] = await db.execute(
            'SELECT id FROM coupons WHERE code = ? AND id <> ? LIMIT 1',
            [coupon.code, id]
        );
        if (duplicate.length) {
            return NextResponse.json({ message: 'Mã giảm giá đã tồn tại' }, { status: 409 });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();
        await connection.execute(`
            UPDATE coupons
            SET code = ?, discount_type = ?, discount_value = ?, min_order_amount = ?,
                max_uses = ?, valid_from = ?, valid_until = ?, description = ?, is_enabled = ?
            WHERE id = ? AND owner_id = ? AND COALESCE(scope_type, 'host') = 'host'
        `, [
            coupon.code, coupon.discount_type, coupon.discount_value, coupon.min_order_amount,
            coupon.max_uses, coupon.valid_from, coupon.valid_until, coupon.description,
            coupon.is_enabled, id, authResult.userId,
        ]);
        await connection.execute('DELETE FROM coupon_properties WHERE coupon_id = ?', [id]);
        for (const propertyId of coupon.property_ids) {
            await connection.execute(
                'INSERT INTO coupon_properties (coupon_id, property_id) VALUES (?, ?)',
                [id, propertyId]
            );
        }
        await connection.commit();
        await logActivity(authResult.userId, 'Cập nhật coupon host', {
            couponId: id,
            code: coupon.code,
            propertyIds: coupon.property_ids,
        });
        return NextResponse.json({ message: 'Cập nhật mã giảm giá thành công' });
    } catch (error) {
        if (connection) await connection.rollback().catch(() => {});
        if (isDuplicateError(error)) {
            return NextResponse.json({ message: 'Mã giảm giá đã tồn tại' }, { status: 409 });
        }
        console.error('Lỗi cập nhật coupon host:', error);
        return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
    } finally {
        connection?.release();
    }
}

export async function DELETE(req, { params }) {
    try {
        const authResult = await verifyHost(req);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }
        const id = Number((await params).id);
        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json({ message: 'Coupon không hợp lệ' }, { status: 400 });
        }
        const coupon = await getCoupon(id, authResult.userId);
        if (!coupon) {
            return NextResponse.json({ message: 'Coupon không tồn tại' }, { status: 404 });
        }
        if (Number(coupon.used_count) > 0) {
            return NextResponse.json(
                { message: 'Không thể xóa coupon đã được sử dụng; hãy tắt coupon hoặc rút ngắn ngày hết hạn' },
                { status: 409 }
            );
        }

        await db.execute('DELETE FROM coupons WHERE id = ? AND owner_id = ?', [id, authResult.userId]);
        await logActivity(authResult.userId, 'Xóa coupon host', { couponId: id, code: coupon.code });
        return NextResponse.json({ message: 'Xóa mã giảm giá thành công' });
    } catch (error) {
        console.error('Lỗi xóa coupon host:', error);
        return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

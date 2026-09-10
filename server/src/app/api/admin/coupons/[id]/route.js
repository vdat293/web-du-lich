import { NextResponse } from 'next/server';
import { verifyAdmin } from '../../../../../lib/auth';
import db from '../../../../../lib/db';
import { logActivity } from '../../../../../lib/logger';
import { validateCoupon } from '../../../../../lib/coupons';

export async function PUT(req, { params }) {
    try {
        const authResult = await verifyAdmin(req);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        const { id } = await params;
        const validation = validateCoupon(await req.json());
        if (validation.error) {
            return NextResponse.json({ message: validation.error }, { status: 400 });
        }
        const coupon = validation.value;
        const [duplicate] = await db.execute(
            'SELECT id FROM coupons WHERE code = ? AND id <> ? LIMIT 1',
            [coupon.code, id]
        );
        if (duplicate.length) {
            return NextResponse.json({ message: 'Mã giảm giá đã tồn tại' }, { status: 409 });
        }

        const [result] = await db.execute(`
            UPDATE coupons
            SET code = ?, discount_type = ?, discount_value = ?, min_order_amount = ?,
                max_uses = ?, valid_from = ?, valid_until = ?, description = ?
            WHERE id = ?
        `, [
            coupon.code, coupon.discount_type, coupon.discount_value, coupon.min_order_amount,
            coupon.max_uses, coupon.valid_from, coupon.valid_until, coupon.description, id,
        ]);
        if (!result.affectedRows) {
            return NextResponse.json({ message: 'Coupon không tồn tại' }, { status: 404 });
        }

        await logActivity(authResult.userId, 'Cập nhật coupon', { couponId: Number(id), code: coupon.code });
        return NextResponse.json({ message: 'Cập nhật mã giảm giá thành công' });
    } catch (err) {
        console.error('Lỗi cập nhật coupon quản trị:', err);
        return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const authResult = await verifyAdmin(req);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        const { id } = await params;
        const [coupons] = await db.execute(
            'SELECT code, used_count FROM coupons WHERE id = ? LIMIT 1',
            [id]
        );
        const coupon = coupons[0];
        if (!coupon) {
            return NextResponse.json({ message: 'Coupon không tồn tại' }, { status: 404 });
        }
        if (Number(coupon.used_count) > 0) {
            return NextResponse.json(
                { message: 'Không thể xóa coupon đã được sử dụng; hãy rút ngắn ngày hết hạn' },
                { status: 409 }
            );
        }

        await db.execute('DELETE FROM coupons WHERE id = ?', [id]);
        await logActivity(authResult.userId, 'Xóa coupon', { couponId: Number(id), code: coupon.code });
        return NextResponse.json({ message: 'Xóa mã giảm giá thành công' });
    } catch (err) {
        console.error('Lỗi xóa coupon quản trị:', err);
        return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
    }
}

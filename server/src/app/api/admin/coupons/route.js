import { NextResponse } from 'next/server';
import { verifyAdmin } from '../../../../lib/auth';
import db from '../../../../lib/db';
import { logActivity } from '../../../../lib/logger';
import { validateCoupon } from '../../../../lib/coupons';

export async function GET(req) {
    try {
        const authResult = await verifyAdmin(req);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        const [coupons] = await db.execute(`
            SELECT id, code, discount_type, discount_value, min_order_amount,
                   max_uses, used_count,
                   DATE_FORMAT(valid_from, '%Y-%m-%d') AS valid_from,
                   DATE_FORMAT(valid_until, '%Y-%m-%d') AS valid_until,
                   description, created_at
            FROM coupons
            ORDER BY created_at DESC
        `);
        return NextResponse.json({ coupons });
    } catch (err) {
        console.error('Lỗi lấy coupon quản trị:', err);
        return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const authResult = await verifyAdmin(req);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        const validation = validateCoupon(await req.json());
        if (validation.error) {
            return NextResponse.json({ message: validation.error }, { status: 400 });
        }
        const coupon = validation.value;
        const [existing] = await db.execute('SELECT id FROM coupons WHERE code = ? LIMIT 1', [coupon.code]);
        if (existing.length) {
            return NextResponse.json({ message: 'Mã giảm giá đã tồn tại' }, { status: 409 });
        }

        const [result] = await db.execute(`
            INSERT INTO coupons
                (code, discount_type, discount_value, min_order_amount, max_uses, valid_from, valid_until, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            coupon.code, coupon.discount_type, coupon.discount_value, coupon.min_order_amount,
            coupon.max_uses, coupon.valid_from, coupon.valid_until, coupon.description,
        ]);
        await logActivity(authResult.userId, 'Tạo coupon', { couponId: result.insertId, code: coupon.code });

        return NextResponse.json({ message: 'Tạo mã giảm giá thành công', id: result.insertId }, { status: 201 });
    } catch (err) {
        console.error('Lỗi tạo coupon quản trị:', err);
        return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
    }
}

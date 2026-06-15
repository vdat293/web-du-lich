import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '../../../lib/db';

// GET: Lấy danh sách coupon (admin)
// POST: Tạo coupon mới (admin)
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');

        // Nếu có code -> kiểm tra coupon cụ thể
        if (code) {
            const authHeader = req.headers.get('authorization');
            let userId = null;
            if (authHeader?.startsWith('Bearer ')) {
                try {
                    const decoded = jwt.verify(
                        authHeader.split(' ')[1],
                        process.env.JWT_SECRET || 'your_jwt_secret_key_here'
                    );
                    userId = decoded.user.id;
                } catch {
                    userId = null;
                }
            }
            const [coupons] = await db.execute(`
                SELECT c.* FROM coupons c
                LEFT JOIN reward_redemptions rr ON rr.coupon_id = c.id
                WHERE c.code = ?
                AND c.valid_from <= CURDATE()
                AND c.valid_until >= CURDATE()
                AND (c.max_uses IS NULL OR c.used_count < c.max_uses)
                AND (rr.id IS NULL OR rr.user_id = ?)
            `, [code, userId]);

            if (coupons.length === 0) {
                return NextResponse.json({ valid: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
            }

            return NextResponse.json({
                valid: true,
                coupon: coupons[0]
            });
        }

        // Lấy tất cả coupon (cho admin)
        const [coupons] = await db.execute(`
            SELECT * FROM coupons ORDER BY created_at DESC
        `);

        return NextResponse.json(coupons);
    } catch (err) {
        console.error('Lỗi khi lấy coupon:', err);
        return NextResponse.json({ message: 'Lỗi server!', error: String(err) }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { code, discount_type, discount_value, min_order_amount, max_uses, valid_from, valid_until, description } = body;

        if (!code || !discount_type || !discount_value || !valid_from || !valid_until) {
            return NextResponse.json({ message: 'Thiếu thông tin bắt buộc' }, { status: 400 });
        }

        // Kiểm tra code đã tồn tại chưa
        const [existing] = await db.execute('SELECT id FROM coupons WHERE code = ?', [code]);
        if (existing.length > 0) {
            return NextResponse.json({ message: 'Mã giảm giá đã tồn tại' }, { status: 400 });
        }

        // Tạo coupon mới
        const [result] = await db.execute(`
            INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, valid_from, valid_until, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [code, discount_type, discount_value, min_order_amount || null, max_uses || null, valid_from, valid_until, description || null]);

        return NextResponse.json({
            message: 'Tạo mã giảm giá thành công',
            coupon_id: result.insertId
        }, { status: 201 });
    } catch (err) {
        console.error('Lỗi khi tạo coupon:', err);
        return NextResponse.json({ message: 'Lỗi server!', error: String(err) }, { status: 500 });
    }
}

export async function OPTIONS() {
    return NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

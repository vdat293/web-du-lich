import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '../../../lib/db';
import { verifyAdmin } from '../../../lib/auth';
import {
    findApplicableCoupon,
    normalizeCouponCode,
    validateCoupon,
} from '../../../lib/coupons';

function optionalUserId(req) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    try {
        const decoded = jwt.verify(
            authHeader.slice('Bearer '.length),
            process.env.JWT_SECRET || 'your_jwt_secret_key_here'
        );
        const userId = Number(decoded?.user?.id);
        return Number.isInteger(userId) && userId > 0 ? userId : null;
    } catch {
        return null;
    }
}

function publicCoupon(coupon) {
    return {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
        min_order_amount: coupon.min_order_amount == null ? null : Number(coupon.min_order_amount),
        valid_from: coupon.valid_from,
        valid_until: coupon.valid_until,
        description: coupon.description,
        scope_type: coupon.scope_type || 'system',
    };
}

// Public code validation is intentionally limited to safe, customer-facing fields.
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const code = normalizeCouponCode(searchParams.get('code'));
        if (!code) {
            // Preserve the legacy admin-only list contract when no code is
            // supplied; customer validation remains public and code-based.
            const authResult = await verifyAdmin(req);
            if (authResult.error) {
                return NextResponse.json({ message: authResult.error }, { status: authResult.status });
            }
            const [coupons] = await db.execute('SELECT * FROM coupons ORDER BY created_at DESC');
            return NextResponse.json(coupons);
        }

        const propertyParam = searchParams.get('property_id');
        const propertyId = propertyParam == null || propertyParam === '' ? null : Number(propertyParam);
        if (propertyId !== null && (!Number.isInteger(propertyId) || propertyId <= 0)) {
            return NextResponse.json({ message: 'Property không hợp lệ' }, { status: 400 });
        }

        const amountParam = searchParams.get('amount');
        const amount = amountParam == null || amountParam === '' ? null : Number(amountParam);
        if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
            return NextResponse.json({ message: 'Giá trị đơn hàng không hợp lệ' }, { status: 400 });
        }

        const result = await findApplicableCoupon(db, {
            code,
            propertyId,
            amount,
            userId: optionalUserId(req),
        });
        if (!result) {
            return NextResponse.json({
                valid: false,
                message: 'Mã giảm giá không hợp lệ, đã tắt, hết hạn hoặc chưa đạt điều kiện áp dụng',
            });
        }

        return NextResponse.json({
            valid: true,
            coupon: publicCoupon(result.coupon),
            ...(amount === null ? {} : {
                discount_amount: result.discount_amount,
                final_price: result.final_price,
            }),
        });
    } catch (error) {
        console.error('Lỗi khi kiểm tra coupon:', error);
        return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
    }
}

// Kept for legacy clients. New admin UI uses /api/admin/coupons.
export async function POST(req) {
    try {
        const authResult = await verifyAdmin(req);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }
        const validation = validateCoupon(await req.json(), { scopeType: 'system' });
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
                (code, discount_type, discount_value, min_order_amount, max_uses,
                 valid_from, valid_until, description, created_by, scope_type, is_enabled)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'system', ?)
        `, [
            coupon.code, coupon.discount_type, coupon.discount_value, coupon.min_order_amount,
            coupon.max_uses, coupon.valid_from, coupon.valid_until, coupon.description,
            authResult.userId, coupon.is_enabled,
        ]);
        return NextResponse.json({
            message: 'Tạo mã giảm giá thành công',
            coupon_id: result.insertId,
            id: result.insertId,
        }, { status: 201 });
    } catch (error) {
        if (error?.code === 'ER_DUP_ENTRY' || error?.errno === 1062) {
            return NextResponse.json({ message: 'Mã giảm giá đã tồn tại' }, { status: 409 });
        }
        console.error('Lỗi khi tạo coupon:', error);
        return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
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

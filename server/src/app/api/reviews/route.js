import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '../../../lib/db';

// GET /api/reviews?property_id=X — Lấy tất cả reviews của một property (public)
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const propertyId = searchParams.get('property_id');

        if (!propertyId) {
            return NextResponse.json({ message: 'Thiếu property_id' }, { status: 400 });
        }

        const [reviews] = await db.execute(`
            SELECT r.id, r.rating, r.comment, r.created_at,
                   u.name as user_name, u.avatar as user_avatar,
                   b.check_in, b.check_out
            FROM reviews r
            JOIN users u ON r.customer_id = u.id
            JOIN bookings b ON r.booking_id = b.id
            WHERE r.property_id = ?
            ORDER BY r.created_at DESC
        `, [propertyId]);

        // Tính rating trung bình
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

        return NextResponse.json({
            reviews,
            averageRating: parseFloat(avgRating),
            totalReviews: reviews.length
        });
    } catch (err) {
        console.error('Lỗi khi lấy reviews:', err);
        return NextResponse.json({ message: 'Lỗi server!', error: String(err) }, { status: 500 });
    }
}

// POST /api/reviews — Tạo review mới (cần đăng nhập)
export async function POST(req) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Vui lòng đăng nhập để đánh giá' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
        } catch {
            return NextResponse.json({ message: 'Token không hợp lệ hoặc đã hết hạn' }, { status: 401 });
        }

        const userId = decoded.user.id;
        const body = await req.json();
        const { property_id, booking_id, rating, comment } = body;

        if (!property_id || !booking_id || !rating) {
            return NextResponse.json({ message: 'Thiếu thông tin đánh giá' }, { status: 400 });
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ message: 'Rating phải từ 1 đến 5' }, { status: 400 });
        }

        // Kiểm tra booking thuộc về user và đã confirmed
        const [bookings] = await db.execute(
            `SELECT * FROM bookings WHERE id = ? AND customer_id = ? AND property_id = ? AND status = 'confirmed'`,
            [booking_id, userId, property_id]
        );

        if (bookings.length === 0) {
            return NextResponse.json({ message: 'Không tìm thấy booking hợp lệ để đánh giá' }, { status: 400 });
        }

        // Kiểm tra đã review booking này chưa
        const [existingReviews] = await db.execute(
            'SELECT * FROM reviews WHERE booking_id = ?',
            [booking_id]
        );

        if (existingReviews.length > 0) {
            return NextResponse.json({ message: 'Bạn đã đánh giá booking này rồi' }, { status: 400 });
        }

        // Tạo review
        await db.execute(
            `INSERT INTO reviews (customer_id, property_id, booking_id, rating, comment) VALUES (?, ?, ?, ?, ?)`,
            [userId, property_id, booking_id, rating, comment || null]
        );

        return NextResponse.json({ message: 'Đánh giá thành công!' }, { status: 201 });
    } catch (err) {
        console.error('Lỗi khi tạo review:', err);
        return NextResponse.json({ message: 'Lỗi server!', error: String(err) }, { status: 500 });
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

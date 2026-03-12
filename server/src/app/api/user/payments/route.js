import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '../../../../lib/db';

// GET: Lấy danh sách thanh toán của user
// POST: Tạo thanh toán mới (simulate thanh toán)
export async function GET(req) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
        } catch {
            return NextResponse.json({ message: 'Token không hợp lệ hoặc đã hết hạn' }, { status: 401 });
        }

        const userId = decoded.user.id;

        // Lấy tất cả thanh toán của user
        const [payments] = await db.execute(`
            SELECT
                pay.*,
                b.check_in, b.check_out, b.status as booking_status,
                p.name as property_name,
                rt.name as room_type_name
            FROM payments pay
            JOIN bookings b ON pay.booking_id = b.id
            JOIN properties p ON b.property_id = p.id
            JOIN room_types rt ON b.room_type_id = rt.id
            WHERE b.customer_id = ?
            ORDER BY pay.payment_date DESC
        `, [userId]);

        return NextResponse.json(payments);
    } catch (err) {
        console.error('Lỗi khi lấy danh sách thanh toán:', err);
        return NextResponse.json({ message: 'Lỗi server!', error: String(err) }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
        } catch {
            return NextResponse.json({ message: 'Token không hợp lệ hoặc đã hết hạn' }, { status: 401 });
        }

        const userId = decoded.user.id;
        const { booking_id, payment_method } = await req.json();

        if (!booking_id || !payment_method) {
            return NextResponse.json({ message: 'Thiếu thông tin thanh toán' }, { status: 400 });
        }

        // Kiểm tra booking thuộc về user
        const [bookings] = await db.execute(
            'SELECT * FROM bookings WHERE id = ? AND customer_id = ?',
            [booking_id, userId]
        );

        if (bookings.length === 0) {
            return NextResponse.json({ message: 'Booking không tồn tại' }, { status: 404 });
        }

        // Kiểm tra payment đã tồn tại chưa
        const [existingPayments] = await db.execute(
            'SELECT * FROM payments WHERE booking_id = ?',
            [booking_id]
        );

        const booking = bookings[0];

        // Simulate thanh toán thành công (trong thực tế sẽ gọi API MoMo/VNPay)
        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        if (existingPayments.length > 0) {
            // Cập nhật payment hiện có
            await db.execute(`
                UPDATE payments
                SET payment_method = ?, payment_status = 'completed', transaction_id = ?
                WHERE booking_id = ?
            `, [payment_method, transactionId, booking_id]);
        } else {
            // Tạo payment mới
            await db.execute(`
                INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id)
                VALUES (?, ?, ?, 'completed', ?)
            `, [booking_id, booking.total_price, payment_method, transactionId]);
        }

        // Cập nhật trạng thái booking
        await db.execute(
            `UPDATE bookings SET status = 'paid' WHERE id = ?`,
            [booking_id]
        );

        // Lưu lịch sử
        await db.execute(
            `INSERT INTO booking_status_history (booking_id, status, note, updated_by) VALUES (?, 'paid', 'Thanh toán thành công', ?)`,
            [booking_id, userId]
        );

        return NextResponse.json({
            message: 'Thanh toán thành công!',
            transaction_id: transactionId,
            payment_status: 'completed'
        }, { status: 200 });
    } catch (err) {
        console.error('Lỗi khi xử lý thanh toán:', err);
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

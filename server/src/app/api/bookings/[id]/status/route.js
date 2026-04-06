import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const [bookings] = await db.execute(`
            SELECT b.*, rt.name as room_type_name 
            FROM bookings b 
            LEFT JOIN room_types rt ON b.room_type_id = rt.id 
            WHERE b.id = ?
        `, [id]);

        if (bookings.length === 0) {
            return NextResponse.json({ message: 'Booking không tồn tại' }, { status: 404 });
        }

        return NextResponse.json(bookings[0]);
    } catch (err) {
        return NextResponse.json({ message: 'Lỗi server', error: String(err) }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status, note } = body;

        // Chỉ cho phép cập nhật sang trạng thái 'cancelled' từ phía User/Hệ thống tự động
        if (!status || status !== 'cancelled') {
            return NextResponse.json({ message: 'Trạng thái không hợp lệ' }, { status: 400 });
        }

        // Kiểm tra xem booking có tồn tại không
        const [existingBookings] = await db.execute('SELECT * FROM bookings WHERE id = ?', [id]);
        if (existingBookings.length === 0) {
            return NextResponse.json({ message: 'Booking không tồn tại' }, { status: 404 });
        }

        const booking = existingBookings[0];
        
        // Chỉ cho phép hủy nếu đơn vẫn đang 'pending'
        if (booking.status !== 'pending') {
            return NextResponse.json({ message: 'Không thể hủy đơn hàng này' }, { status: 400 });
        }

        // Cập nhật trạng thái
        await db.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

        // Thêm vào lịch sử
        const historyNote = note || 'Thanh toán thất bại hoặc quá hạn 15 phút';
        await db.execute(
            'INSERT INTO booking_status_history (booking_id, status, note, updated_by) VALUES (?, ?, ?, ?)',
            [id, status, historyNote, booking.customer_id]
        );

        // Bắn sự kiện Socket.io để các tab khác (hoặc Admin) cập nhật
        if (global.io) {
            global.io.emit('bookingStatusChanged', {
                bookingId: id,
                newStatus: status,
            });
            
            // Bắn vào phòng cụ thể
            global.io.to(`booking_${id}`).emit('bookingStatusChanged', {
                bookingId: id,
                newStatus: status,
            });
        }

        return NextResponse.json({ message: 'Cập nhật trạng thái thành công' });

    } catch (err) {
        console.error('Lỗi khi cập nhật trạng thái booking:', err);
        return NextResponse.json({ message: 'Lỗi server !', error: String(err) }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

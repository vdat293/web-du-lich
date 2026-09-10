import { NextResponse } from 'next/server';
import db from '../../../../../lib/db';
import { verifyUser } from '../../../../../lib/auth';

async function getAuthorizedBooking(req, id) {
    const authResult = await verifyUser(req);
    if (authResult.error) return { authResult };

    const [bookings] = await db.execute(`
        SELECT b.*, rt.name AS room_type_name, p.host_id
        FROM bookings b
        LEFT JOIN room_types rt ON b.room_type_id = rt.id
        JOIN properties p ON b.property_id = p.id
        WHERE b.id = ?
        LIMIT 1
    `, [id]);
    const booking = bookings[0];
    if (!booking) return { notFound: true };

    const isOwner = Number(booking.customer_id) === authResult.userId;
    const isHost = Number(booking.host_id) === authResult.userId;
    const isAdmin = authResult.user.role === 'admin';
    if (!isOwner && !isHost && !isAdmin) return { forbidden: true };

    return { booking, currentUser: authResult.user, isOwner, isHost, isAdmin };
}

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const result = await getAuthorizedBooking(req, id);
        if (result.authResult) {
            return NextResponse.json({ message: result.authResult.error }, { status: result.authResult.status });
        }
        if (result.notFound) {
            return NextResponse.json({ message: 'Booking không tồn tại' }, { status: 404 });
        }
        if (result.forbidden) {
            return NextResponse.json({ message: 'Bạn không có quyền xem booking này' }, { status: 403 });
        }

        const { host_id: _hostId, ...booking } = result.booking;
        return NextResponse.json(booking);
    } catch (err) {
        return NextResponse.json({ message: 'Lỗi server', error: String(err) }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status, note } = body;

        const authorization = await getAuthorizedBooking(req, id);
        if (authorization.authResult) {
            return NextResponse.json({ message: authorization.authResult.error }, { status: authorization.authResult.status });
        }
        if (authorization.notFound) {
            return NextResponse.json({ message: 'Booking không tồn tại' }, { status: 404 });
        }
        if (authorization.forbidden) {
            return NextResponse.json({ message: 'Bạn không có quyền cập nhật booking này' }, { status: 403 });
        }

        const { booking, currentUser, isOwner, isHost, isAdmin } = authorization;

        // Logic phân quyền
        if (status === 'cancelled') {
            // Khách chỉ có thể hủy booking của chính mình khi còn pending.
            if (isOwner && booking.status !== 'pending') {
                return NextResponse.json({ message: 'Không thể hủy đơn hàng này' }, { status: 400 });
            }
        } else if (status === 'checked_in' || status === 'checked_out') {
            // Chỉ Host hoặc Admin được check-in/check-out
            if (!isHost && !isAdmin) {
                return NextResponse.json({ message: 'Bạn không có quyền thực hiện thao tác này' }, { status: 403 });
            }
            // Logic chuyển trạng thái hợp lệ
            if (status === 'checked_in' && booking.status !== 'confirmed') {
                return NextResponse.json({ message: 'Chỉ có thể check-in cho đơn đã xác nhận' }, { status: 400 });
            }
            if (status === 'checked_out' && booking.status !== 'checked_in') {
                return NextResponse.json({ message: 'Chỉ có thể check-out cho đơn đã check-in' }, { status: 400 });
            }
        } else {
            return NextResponse.json({ message: 'Trạng thái không hợp lệ' }, { status: 400 });
        }

        // Cập nhật trạng thái và ngày check-out thực tế
        let historyNote = note;
        if (status === 'checked_out') {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const originalCheckOut = new Date(booking.check_out);
            originalCheckOut.setHours(0, 0, 0, 0);

            // Nếu trả phòng sớm hơn dự kiến
            if (now < originalCheckOut) {
                if (!historyNote) historyNote = 'Khách trả phòng sớm hơn dự kiến. Hệ thống đã cập nhật lại ngày trả phòng thực tế.';
            }
            
            // Cập nhật ngày check-out về ngày hiện tại
            await db.execute(
                'UPDATE bookings SET status = ?, actual_check_out = CURDATE() WHERE id = ?',
                [status, id]
            );
        } else {
            await db.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
        }

        // Thêm vào lịch sử
        if (!historyNote) {
            historyNote = status === 'cancelled' ? 'Thanh toán thất bại hoặc hủy bởi người dùng' : `Cập nhật trạng thái sang ${status}`;
        }
        
        await db.execute(
            'INSERT INTO booking_status_history (booking_id, status, note, updated_by) VALUES (?, ?, ?, ?)',
            [id, status, historyNote, currentUser.id]
        );

        // Bắn sự kiện Socket.io
        if (global.io) {
            const updatePayload = { bookingId: id, newStatus: status };
            global.io.emit('bookingStatusChanged', updatePayload);
            global.io.to(`booking_${id}`).emit('bookingStatusChanged', updatePayload);
            global.io.to(`user_${booking.customer_id}`).emit('bookingStatusChanged', updatePayload);
        }

        return NextResponse.json({ message: 'Cập nhật trạng thái thành công', status });

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
            'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

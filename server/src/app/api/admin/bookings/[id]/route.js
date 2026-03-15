import { NextResponse } from 'next/server';
import { verifyAdmin } from '../../../../../lib/auth';
import db from '../../../../../lib/db';

export async function GET(req, { params }) {
    try {
        // Verify admin
        const authResult = await verifyAdmin(req);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        const { id } = await params;

        // Get booking details
        const [bookings] = await db.execute(`
            SELECT
                b.*,
                p.id as property_id, p.name as property_name, p.location as property_location,
                u.id as user_id, u.name as user_name, u.email as user_email, u.phone as user_phone,
                rt.name as room_type_name, rt.price as room_type_price
            FROM bookings b
            LEFT JOIN properties p ON b.property_id = p.id
            LEFT JOIN users u ON b.customer_id = u.id
            LEFT JOIN room_types rt ON b.room_type_id = rt.id
            WHERE b.id = ?
        `, [id]);

        if (bookings.length === 0) {
            return NextResponse.json({ message: 'Booking không tồn tại' }, { status: 404 });
        }

        // Get payment info
        const [payments] = await db.execute('SELECT * FROM payments WHERE booking_id = ?', [id]);

        // Get status history
        const [statusHistory] = await db.execute(`
            SELECT * FROM booking_status_history
            WHERE booking_id = ?
            ORDER BY created_at DESC
        `, [id]);

        return NextResponse.json({
            ...bookings[0],
            payments,
            statusHistory
        });
    } catch (err) {
        console.error('Lỗi khi lấy booking:', err);
        return NextResponse.json({ message: 'Lỗi server !', error: String(err) }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        // Verify admin
        const authResult = await verifyAdmin(req);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        const { id } = await params;
        const body = await req.json();
        const { status, note } = body;

        // Check if booking exists
        const [existingBookings] = await db.execute('SELECT * FROM bookings WHERE id = ?', [id]);
        if (existingBookings.length === 0) {
            return NextResponse.json({ message: 'Booking không tồn tại' }, { status: 404 });
        }

        const oldStatus = existingBookings[0].status;

        // Update status
        if (status) {
            await db.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

            // Add to status history
            const historyNote = note || `Trạng thái thay đổi từ ${oldStatus} sang ${status}`;
            await db.execute(
                'INSERT INTO booking_status_history (booking_id, status, note, updated_by) VALUES (?, ?, ?, ?)',
                [id, status, historyNote, authResult.userId]
            );

            // If confirming booking, also update payment status
            if (status === 'completed') {
                await db.execute(
                    'UPDATE payments SET payment_status = ? WHERE booking_id = ?',
                    ['completed', id]
                );
            }
        }

        // Get updated booking
        const [bookings] = await db.execute(`
            SELECT
                b.*,
                p.name as property_name,
                u.name as user_name,
                u.id as customer_id
            FROM bookings b
            LEFT JOIN properties p ON b.property_id = p.id
            LEFT JOIN users u ON b.customer_id = u.id
            WHERE b.id = ?
        `, [id]);

        const updatedBooking = bookings[0];

        // Emit Socket.IO event for real-time update
        if (global.io && updatedBooking) {
            global.io.emit('bookingStatusChanged', {
                bookingId: id,
                newStatus: status,
                booking: updatedBooking,
            });

            // Also emit to specific user room
            global.io.to(`user_${updatedBooking.customer_id}`).emit('bookingStatusChanged', {
                bookingId: id,
                newStatus: status,
                booking: updatedBooking,
            });
        }

        return NextResponse.json({
            message: 'Cập nhật booking thành công',
            booking: updatedBooking
        });
    } catch (err) {
        console.error('Lỗi khi cập nhật booking:', err);
        return NextResponse.json({ message: 'Lỗi server !', error: String(err) }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        // Verify admin
        const authResult = await verifyAdmin(req);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        const { id } = await params;

        // Check if booking exists
        const [existingBookings] = await db.execute('SELECT * FROM bookings WHERE id = ?', [id]);
        if (existingBookings.length === 0) {
            return NextResponse.json({ message: 'Booking không tồn tại' }, { status: 404 });
        }

        // Update status to cancelled instead of hard delete
        await db.execute('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', id]);

        // Add to status history
        await db.execute(
            'INSERT INTO booking_status_history (booking_id, status, note, updated_by) VALUES (?, ?, ?, ?)',
            [id, 'cancelled', 'Booking bị hủy bởi admin', authResult.userId]
        );

        // Get cancelled booking info
        const [cancelledBookings] = await db.execute(`
            SELECT b.*, u.id as customer_id
            FROM bookings b
            LEFT JOIN users u ON b.customer_id = u.id
            WHERE b.id = ?
        `, [id]);

        const cancelledBooking = cancelledBookings[0];

        // Emit Socket.IO event for real-time update
        if (global.io && cancelledBooking) {
            global.io.emit('bookingStatusChanged', {
                bookingId: id,
                newStatus: 'cancelled',
                booking: cancelledBooking,
            });

            // Also emit to specific user room
            global.io.to(`user_${cancelledBooking.customer_id}`).emit('bookingStatusChanged', {
                bookingId: id,
                newStatus: 'cancelled',
                booking: cancelledBooking,
            });
        }

        return NextResponse.json({ message: 'Hủy booking thành công' });
    } catch (err) {
        console.error('Lỗi khi hủy booking:', err);
        return NextResponse.json({ message: 'Lỗi server !', error: String(err) }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

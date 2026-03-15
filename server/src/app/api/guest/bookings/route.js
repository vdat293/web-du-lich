import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '../../../../lib/db';

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, phone, guest_name, property_id, room_type_id, check_in, check_out, number_of_rooms, total_price, special_requests } = body;

        // Validation
        if (!email || !phone || !guest_name || !property_id || !room_type_id || !check_in || !check_out || !total_price) {
            return NextResponse.json({ message: 'Thiếu thông tin đặt phòng' }, { status: 400 });
        }

        // Kiểm tra email đã tồn tại trong hệ thống chưa
        const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);

        if (existingUsers.length > 0) {
            // Email đã tồn tại → tạo booking trực tiếp cho user đó
            const userId = existingUsers[0].id;

            const [result] = await db.execute(
                `INSERT INTO bookings (customer_id, property_id, room_type_id, check_in, check_out, number_of_rooms, total_price, status, special_requests)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
                [userId, property_id, room_type_id, check_in, check_out, number_of_rooms || 1, total_price, special_requests || null]
            );

            const bookingId = result.insertId;

            // Tạo payment record
            await db.execute(
                `INSERT INTO payments (booking_id, amount, payment_method, payment_status)
                 VALUES (?, ?, 'guest', 'completed')`,
                [bookingId, total_price]
            );

            // Lưu lịch sử trạng thái
            await db.execute(
                `INSERT INTO booking_status_history (booking_id, status, note, updated_by) VALUES (?, 'pending', 'Chờ xác nhận', ?)`,
                [bookingId, userId]
            );

            return NextResponse.json({
                status: 'pending',
                booking_id: bookingId,
                message: 'Đặt phòng thành công! Vui lòng chờ xác nhận từ admin.'
            }, { status: 201 });
        } else {
            // Email chưa tồn tại → lưu guest_bookings + tạo token
            const confirmToken = crypto.randomUUID();

            await db.execute(
                `INSERT INTO guest_bookings (email, phone, guest_name, property_id, room_type_id, check_in, check_out, number_of_rooms, total_price, special_requests, confirm_token)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [email, phone, guest_name, property_id, room_type_id, check_in, check_out, number_of_rooms || 1, total_price, special_requests || null, confirmToken]
            );

            return NextResponse.json({
                status: 'pending',
                token: confirmToken,
                email: email,
                message: 'Vui lòng xác nhận email và đặt mật khẩu để hoàn tất đặt phòng.'
            }, { status: 201 });
        }
    } catch (err) {
        console.error('Lỗi khi tạo guest booking:', err);
        return NextResponse.json({ message: 'Lỗi server!', error: String(err) }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}

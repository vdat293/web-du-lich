import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '../../../../lib/db';

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

        // Lấy danh sách booking của user với thông tin thanh toán
        const [bookings] = await db.execute(`
            SELECT
                b.id, b.check_in, b.check_out, b.number_of_rooms, b.total_price, b.status,
                b.special_requests, b.created_at,
                p.id as property_id, p.name as property_name, p.location as property_location,
                rt.name as room_type_name, rt.price as room_type_price,
                pi.image_url as property_image,
                pay.id as payment_id, pay.amount as payment_amount, pay.payment_method,
                pay.payment_status, pay.transaction_id, pay.payment_date
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            JOIN room_types rt ON b.room_type_id = rt.id
            LEFT JOIN property_images pi ON pi.property_id = p.id AND pi.is_main = 1
            LEFT JOIN payments pay ON pay.booking_id = b.id
            WHERE b.customer_id = ?
            ORDER BY b.created_at DESC
        `, [userId]);

        return NextResponse.json(bookings);
    } catch (err) {
        console.error('Lỗi khi lấy lịch sử đặt phòng:', err);
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
        const body = await req.json();
        const { property_id, room_type_id, check_in, check_out, number_of_rooms, total_price, special_requests, coupon_code } = body;

        if (!property_id || !room_type_id || !check_in || !check_out || !total_price) {
            return NextResponse.json({ message: 'Thiếu thông tin đặt phòng' }, { status: 400 });
        }

        let finalPrice = total_price;
        let couponId = null;

        // Kiểm tra và áp dụng coupon nếu có
        if (coupon_code) {
            const [coupons] = await db.execute(`
                SELECT * FROM coupons
                WHERE code = ?
                AND valid_from <= CURDATE()
                AND valid_until >= CURDATE()
                AND (max_uses IS NULL OR used_count < max_uses)
            `, [coupon_code]);

            if (coupons.length > 0) {
                const coupon = coupons[0];
                if (coupon.discount_type === 'percent') {
                    finalPrice = finalPrice - (finalPrice * coupon.discount_value / 100);
                } else {
                    finalPrice = finalPrice - coupon.discount_value;
                }

                // Cập nhật số lần sử dụng
                await db.execute('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [coupon.id]);
                couponId = coupon.id;
            }
        }

        // Tạo booking
        const [result] = await db.execute(
            `INSERT INTO bookings (customer_id, property_id, room_type_id, check_in, check_out, number_of_rooms, total_price, status, special_requests)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
            [userId, property_id, room_type_id, check_in, check_out, number_of_rooms || 1, finalPrice, special_requests || null]
        );

        const bookingId = result.insertId;

        // Tạo payment record (mặc định pending - chờ thanh toán)
        await db.execute(
            `INSERT INTO payments (booking_id, amount, payment_method, payment_status)
             VALUES (?, ?, 'momo', 'pending')`,
            [bookingId, finalPrice]
        );

        // Lưu coupon đã sử dụng
        if (couponId) {
            await db.execute(
                `INSERT INTO booking_coupons (booking_id, coupon_id, discount_amount) VALUES (?, ?, ?)`,
                [bookingId, couponId, total_price - finalPrice]
            );
        }

        // Lưu lịch sử trạng thái
        await db.execute(
            `INSERT INTO booking_status_history (booking_id, status, note, updated_by) VALUES (?, 'pending', 'Chờ xác nhận', ?)`,
            [bookingId, userId]
        );

        // Get property info to include in the notification
        const [propertyInfo] = await db.execute(
            `SELECT p.name as property_name, p.host_id FROM properties p WHERE p.id = ?`,
            [property_id]
        );

        // Emit Socket.IO event for new booking - notify admin
        if (global.io) {
            global.io.emit('newBooking', {
                bookingId,
                propertyId: property_id,
                propertyName: propertyInfo[0]?.property_name,
                hostId: propertyInfo[0]?.host_id,
                status: 'pending',
                checkIn: check_in,
                checkOut: check_out,
            });
        }

        return NextResponse.json({
            message: 'Đặt phòng thành công',
            booking_id: bookingId,
            final_price: finalPrice
        }, { status: 201 });
    } catch (err) {
        console.error('Lỗi khi tạo booking:', err);
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

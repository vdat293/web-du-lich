import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ message: 'Thiếu token xác nhận' }, { status: 400 });
        }

        // Query lấy thông tin booking từ guest_bookings
        const [bookings] = await db.execute(
            `SELECT
                gb.id,
                gb.email,
                gb.guest_name,
                gb.phone,
                gb.check_in,
                gb.check_out,
                gb.number_of_rooms,
                gb.total_price,
                gb.special_requests,
                gb.confirm_token,
                p.name AS property_name,
                p.address AS property_address,
                p.images AS property_images,
                rt.name AS room_type_name,
                rt.description AS room_type_description
            FROM guest_bookings gb
            JOIN properties p ON gb.property_id = p.id
            JOIN room_types rt ON gb.room_type_id = rt.id
            WHERE gb.confirm_token = ?`,
            [token]
        );

        if (bookings.length === 0) {
            return NextResponse.json({ message: 'Không tìm thấy thông tin đặt phòng' }, { status: 404 });
        }

        const booking = bookings[0];

        // Tính số đêm
        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        return NextResponse.json({
            id: booking.id,
            guest_name: booking.guest_name,
            email: booking.email,
            phone: booking.phone,
            check_in: booking.check_in,
            check_out: booking.check_out,
            nights: nights,
            number_of_rooms: booking.number_of_rooms,
            total_price: booking.total_price,
            special_requests: booking.special_requests,
            property: {
                name: booking.property_name,
                address: booking.property_address,
                images: booking.property_images
            },
            room_type: {
                name: booking.room_type_name,
                description: booking.room_type_description
            }
        }, { status: 200 });
    } catch (err) {
        console.error('Lỗi khi lấy thông tin booking:', err);
        return NextResponse.json({ message: 'Lỗi server!', error: String(err) }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}

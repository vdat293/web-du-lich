import { NextResponse } from 'next/server';
import { verifyAdmin } from '../../../../lib/auth';
import db from '../../../../lib/db';

export async function GET(req) {
    try {
        // Verify admin
        const authResult = await verifyAdmin(req);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        // Get total users
        const [usersResult] = await db.execute('SELECT COUNT(*) as total FROM users');

        // Get total bookings
        const [bookingsResult] = await db.execute('SELECT COUNT(*) as total FROM bookings');

        // Get total properties
        const [propertiesResult] = await db.execute('SELECT COUNT(*) as total FROM properties');

        // Get total revenue (completed bookings)
        const [revenueResult] = await db.execute(`
            SELECT COALESCE(SUM(total_price), 0) as total
            FROM bookings
            WHERE status = 'completed'
        `);

        // Get users by role
        const [usersByRole] = await db.execute(`
            SELECT role, COUNT(*) as count FROM users GROUP BY role
        `);

        // Get bookings by status
        const [bookingsByStatus] = await db.execute(`
            SELECT status, COUNT(*) as count FROM bookings GROUP BY status
        `);

        // Get recent bookings
        const [recentBookings] = await db.execute(`
            SELECT b.*, p.name as property_name, u.name as user_name
            FROM bookings b
            LEFT JOIN properties p ON b.property_id = p.id
            LEFT JOIN users u ON b.user_id = u.id
            ORDER BY b.created_at DESC
            LIMIT 5
        `);

        const stats = {
            totalUsers: usersResult[0].total,
            totalBookings: bookingsResult[0].total,
            totalProperties: propertiesResult[0].total,
            totalRevenue: revenueResult[0].total,
            usersByRole: usersByRole.reduce((acc, item) => {
                acc[item.role] = item.count;
                return acc;
            }, {}),
            bookingsByStatus: bookingsByStatus.reduce((acc, item) => {
                acc[item.status] = item.count;
                return acc;
            }, {}),
            recentBookings: recentBookings
        };

        return NextResponse.json(stats);
    } catch (err) {
        console.error('Lỗi khi lấy thống kê:', err);
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

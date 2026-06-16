import { NextResponse } from 'next/server';
import { verifyAdmin } from '../../../../../lib/auth';
import db from '../../../../../lib/db';
import { ensureNotificationTables } from '../../../../../lib/notifications';

export async function GET(req) {
    try {
        const authResult = await verifyAdmin(req);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        await ensureNotificationTables();
        const [campaigns] = await db.execute(`
            SELECT c.id, c.title, c.body, c.audience, c.status, c.sent_count, c.failed_count,
                   c.created_at, u.name AS created_by_name
            FROM notification_campaigns c
            LEFT JOIN users u ON c.created_by = u.id
            ORDER BY c.created_at DESC
            LIMIT 50
        `);

        return NextResponse.json({ campaigns });
    } catch (err) {
        return NextResponse.json({ message: 'Khong the tai lich su gui.', error: String(err) }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

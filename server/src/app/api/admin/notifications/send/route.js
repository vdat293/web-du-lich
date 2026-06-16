import { NextResponse } from 'next/server';
import { verifyAdmin } from '../../../../../lib/auth';
import { sendAdminNotification } from '../../../../../lib/notifications';

export async function POST(req) {
    try {
        const authResult = await verifyAdmin(req);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        const body = await req.json();
        const title = String(body.title || '').trim();
        const messageBody = String(body.body || '').trim();
        const audience = body.audience || 'all';
        const userIds = Array.isArray(body.userIds) ? body.userIds : [];

        if (!title || !messageBody) {
            return NextResponse.json({ message: 'Tieu de va noi dung la bat buoc.' }, { status: 400 });
        }

        if (audience === 'selected' && userIds.length === 0) {
            return NextResponse.json({ message: 'Hay chon it nhat mot nguoi nhan.' }, { status: 400 });
        }

        const result = await sendAdminNotification({
            title,
            body: messageBody,
            audience,
            userIds,
            sentBy: authResult.userId,
        });

        return NextResponse.json({ success: true, ...result });
    } catch (err) {
        console.error('Loi gui thong bao admin:', err);
        return NextResponse.json({ message: 'Khong the gui thong bao.', error: String(err) }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

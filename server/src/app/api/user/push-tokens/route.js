import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { registerPushToken, unregisterPushToken } from '../../../../lib/notifications';

async function verifyUser(req) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Khong co quyen truy cap', status: 401 };
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
        return { userId: decoded.user.id };
    } catch {
        return { error: 'Token khong hop le hoac da het han', status: 401 };
    }
}

export async function POST(req) {
    try {
        const auth = await verifyUser(req);
        if (auth.error) {
            return NextResponse.json({ message: auth.error }, { status: auth.status });
        }

        const body = await req.json();
        const token = await registerPushToken(auth.userId, body);
        return NextResponse.json({ success: true, token });
    } catch (err) {
        return NextResponse.json(
            { message: err.message || 'Khong the luu push token.' },
            { status: err.status || 500 }
        );
    }
}

export async function DELETE(req) {
    try {
        const auth = await verifyUser(req);
        if (auth.error) {
            return NextResponse.json({ message: auth.error }, { status: auth.status });
        }

        const body = await req.json().catch(() => ({}));
        await unregisterPushToken(auth.userId, body.expo_push_token || body.expoPushToken);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json(
            { message: err.message || 'Khong the tat push token.' },
            { status: err.status || 500 }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

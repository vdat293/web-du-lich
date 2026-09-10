import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

import db from '../../../../../lib/db';

function getAuthenticatedUserId(req) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    try {
        const decoded = jwt.verify(
            authHeader.slice('Bearer '.length),
            process.env.JWT_SECRET || 'your_jwt_secret_key_here'
        );
        return Number(decoded.user?.id) || null;
    } catch {
        return null;
    }
}

export async function POST(req) {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
        return NextResponse.json(
            { success: false, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const currentPassword = String(body.current_password || '');
        const newPassword = String(body.new_password || '');

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { success: false, message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới' },
                { status: 400 }
            );
        }
        if (newPassword.length < 8) {
            return NextResponse.json(
                { success: false, message: 'Mật khẩu mới phải có ít nhất 8 ký tự' },
                { status: 400 }
            );
        }
        if (currentPassword === newPassword) {
            return NextResponse.json(
                { success: false, message: 'Mật khẩu mới phải khác mật khẩu hiện tại' },
                { status: 400 }
            );
        }

        const [users] = await db.execute(
            'SELECT id, password FROM users WHERE id = ? LIMIT 1',
            [userId]
        );
        const user = users[0];
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Người dùng không tồn tại' },
                { status: 404 }
            );
        }

        const matches = await bcrypt.compare(currentPassword, user.password || '');
        if (!matches) {
            return NextResponse.json(
                { success: false, message: 'Mật khẩu hiện tại không chính xác' },
                { status: 400 }
            );
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await db.execute('UPDATE users SET password = ? WHERE id = ?', [passwordHash, userId]);

        return NextResponse.json({
            success: true,
            message: 'Mật khẩu đã được cập nhật thành công',
        });
    } catch (error) {
        console.error('[User Security Password] Error:', error);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật mật khẩu lúc này' },
            { status: 500 }
        );
    }
}

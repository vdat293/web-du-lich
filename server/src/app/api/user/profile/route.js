import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '../../../../lib/db';
import { uploadAvatar } from '../../../../lib/cloudinary';
import { toAbsoluteMediaUrl } from '../../../../lib/http';

function formatUser(req, user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: toAbsoluteMediaUrl(req, user.avatar),
        role: user.role,
        phone: user.phone,
        loyalty_points: Number(user.loyalty_points) || 0,
        membership_tier: user.membership_tier || 'classic'
    };
}

export async function GET(req) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(
                authHeader.split(' ')[1],
                process.env.JWT_SECRET || 'your_jwt_secret_key_here'
            );
        } catch {
            return NextResponse.json({ message: 'Token không hợp lệ hoặc đã hết hạn' }, { status: 401 });
        }

        const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [decoded.user.id]);

        if (!users[0]) {
            return NextResponse.json({ message: 'Người dùng không tồn tại' }, { status: 404 });
        }

        return NextResponse.json({ user: formatUser(req, users[0]) });
    } catch (err) {
        console.error('Lỗi khi lấy profile:', err);
        return NextResponse.json({ message: 'Lỗi server !' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const authHeader = req.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];

        // Xác thực token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
        } catch (error) {
            return NextResponse.json({ message: 'Token không hợp lệ hoặc đã hết hạn' }, { status: 401 });
        }

        const userId = decoded.user.id;

        // Lấy thông tin cập nhật từ body
        const body = await req.json();
        const { name, phone, avatarBase64 } = body;

        // Validation
        if (!name) {
            return NextResponse.json({ message: 'Tên không được để trống' }, { status: 400 });
        }

        let avatarUrl = null;
        if (avatarBase64 && avatarBase64.startsWith('data:image')) {
            try {
                avatarUrl = await uploadAvatar(avatarBase64, userId);
            } catch (error) {
                if (error.message === 'INVALID_IMAGE_TYPE') {
                    return NextResponse.json({ message: 'Chỉ hỗ trợ ảnh JPG, PNG, WebP, GIF hoặc AVIF' }, { status: 400 });
                }
                if (error.message === 'INVALID_IMAGE_SIZE') {
                    return NextResponse.json({ message: 'Ảnh phải nhỏ hơn 5 MB' }, { status: 400 });
                }
                throw error;
            }
        }

        // Cập nhật thông tin vào DB
        if (avatarUrl) {
            await db.execute('UPDATE users SET name = ?, phone = ?, avatar = ? WHERE id = ?', [name, phone || null, avatarUrl, userId]);
        } else {
            await db.execute('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone || null, userId]);
        }

        // Lấy lại thông tin user mới
        const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
        const user = users[0];

        if (!user) {
            return NextResponse.json({ message: 'Người dùng không tồn tại' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Cập nhật thông tin thành công',
            user: formatUser(req, user)
        });

    } catch (err) {
        console.error('Lỗi khi cập nhật profile:', err);
        return NextResponse.json({ message: 'Lỗi server !' }, { status: 500 });
    }
}

// CORS Preflight handler
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

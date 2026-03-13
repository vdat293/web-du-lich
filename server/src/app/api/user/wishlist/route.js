import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '../../../../lib/db';

// GET: Lấy danh sách yêu thích của user
// POST: Thêm property vào wishlist
// DELETE: Xóa property khỏi wishlist
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

        // Lấy danh sách wishlist với thông tin property
        const [wishlists] = await db.execute(`
            SELECT
                w.id as wishlist_id, w.created_at as added_at,
                p.id as property_id, p.name, p.type, p.location, p.price_display,
                pi.image_url as main_image,
                u.name as host_name
            FROM wishlists w
            JOIN properties p ON w.property_id = p.id
            LEFT JOIN property_images pi ON pi.property_id = p.id AND pi.is_main = 1
            LEFT JOIN users u ON p.host_id = u.id
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC
        `, [userId]);

        return NextResponse.json(wishlists);
    } catch (err) {
        console.error('Lỗi khi lấy wishlist:', err);
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
        const { property_id } = await req.json();

        if (!property_id) {
            return NextResponse.json({ message: 'Thiếu property_id' }, { status: 400 });
        }

        // Kiểm tra property có tồn tại không
        const [properties] = await db.execute('SELECT id FROM properties WHERE id = ?', [property_id]);
        if (properties.length === 0) {
            return NextResponse.json({ message: 'Property không tồn tại' }, { status: 404 });
        }

        // Kiểm tra đã có trong wishlist chưa
        const [existing] = await db.execute(
            'SELECT id FROM wishlists WHERE user_id = ? AND property_id = ?',
            [userId, property_id]
        );

        if (existing.length > 0) {
            return NextResponse.json({ message: 'Property đã có trong danh sách yêu thích' }, { status: 400 });
        }

        // Thêm vào wishlist
        await db.execute(
            'INSERT INTO wishlists (user_id, property_id) VALUES (?, ?)',
            [userId, property_id]
        );

        return NextResponse.json({ message: 'Đã thêm vào danh sách yêu thích' }, { status: 201 });
    } catch (err) {
        console.error('Lỗi khi thêm wishlist:', err);
        return NextResponse.json({ message: 'Lỗi server!', error: String(err) }, { status: 500 });
    }
}

export async function DELETE(req) {
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
        const { searchParams } = new URL(req.url);
        const property_id = searchParams.get('property_id');

        if (!property_id) {
            return NextResponse.json({ message: 'Thiếu property_id' }, { status: 400 });
        }

        await db.execute(
            'DELETE FROM wishlists WHERE user_id = ? AND property_id = ?',
            [userId, property_id]
        );

        return NextResponse.json({ message: 'Đã xóa khỏi danh sách yêu thích' }, { status: 200 });
    } catch (err) {
        console.error('Lỗi khi xóa wishlist:', err);
        return NextResponse.json({ message: 'Lỗi server!', error: String(err) }, { status: 500 });
    }
}

export async function OPTIONS() {
    return NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

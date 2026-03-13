import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '../../../../lib/db';

// GET: Lấy danh sách conversation của user
// POST: Gửi tin nhắn mới trong conversation
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
        const { searchParams } = new URL(req.url);
        const conversation_id = searchParams.get('conversation_id');

        // Lấy danh sách conversation của user
        if (!conversation_id) {
            const [conversations] = await db.execute(`
                SELECT
                    c.id, c.last_message_at, c.created_at,
                    p.name as property_name,
                    CASE
                        WHEN c.guest_id = ? THEN CONCAT('Host: ', hu.name)
                        ELSE CONCAT('Khách: ', gu.name)
                    END as display_name,
                    (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                    (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) as unread_count
                FROM conversations c
                LEFT JOIN properties p ON c.property_id = p.id
                LEFT JOIN users gu ON c.guest_id = gu.id
                LEFT JOIN users hu ON c.host_id = hu.id
                WHERE c.guest_id = ? OR c.host_id = ?
                ORDER BY c.last_message_at DESC
            `, [userId, userId, userId, userId]);

            return NextResponse.json(conversations);
        }

        // Lấy chi tiết conversation và tin nhắn
        const [conversations] = await db.execute(`
            SELECT
                c.*,
                p.name as property_name,
                gu.name as guest_name, gu.avatar as guest_avatar,
                hu.name as host_name, hu.avatar as host_avatar
            FROM conversations c
            LEFT JOIN properties p ON c.property_id = p.id
            LEFT JOIN users gu ON c.guest_id = gu.id
            LEFT JOIN users hu ON c.host_id = hu.id
            WHERE c.id = ? AND (c.guest_id = ? OR c.host_id = ?)
        `, [conversation_id, userId, userId]);

        if (conversations.length === 0) {
            return NextResponse.json({ message: 'Conversation không tồn tại' }, { status: 404 });
        }

        // Lấy tin nhắn
        const [messages] = await db.execute(`
            SELECT
                m.id, m.content, m.created_at, m.is_read,
                m.sender_id, u.name as sender_name, u.avatar as sender_avatar
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = ?
            ORDER BY m.created_at ASC
        `, [conversation_id]);

        // Đánh dấu đã đọc
        await db.execute(`
            UPDATE messages SET is_read = 1
            WHERE conversation_id = ? AND sender_id != ?
        `, [conversation_id, userId]);

        return NextResponse.json({
            conversation: conversations[0],
            messages
        });
    } catch (err) {
        console.error('Lỗi khi lấy tin nhắn:', err);
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
        const { conversation_id, host_id, property_id, message } = await req.json();

        let conversationId = conversation_id;

        // Tạo conversation mới nếu không có conversation_id
        if (!conversationId) {
            if (!host_id || !property_id) {
                return NextResponse.json({ message: 'Thiếu thông tin conversation' }, { status: 400 });
            }

            const [result] = await db.execute(`
                INSERT INTO conversations (guest_id, host_id, property_id)
                VALUES (?, ?, ?)
            `, [userId, host_id, property_id]);

            conversationId = result.insertId;
        }

        // Gửi tin nhắn
        const [msgResult] = await db.execute(`
            INSERT INTO messages (conversation_id, sender_id, content)
            VALUES (?, ?, ?)
        `, [conversationId, userId, message]);

        // Cập nhật last_message_at
        await db.execute(`
            UPDATE conversations SET last_message_at = NOW() WHERE id = ?
        `, [conversationId]);

        return NextResponse.json({
            message: 'Gửi tin nhắn thành công',
            message_id: msgResult.insertId,
            conversation_id: conversationId
        }, { status: 201 });
    } catch (err) {
        console.error('Lỗi khi gửi tin nhắn:', err);
        return NextResponse.json({ message: 'Lỗi server!', error: String(err) }, { status: 500 });
    }
}

export async function OPTIONS() {
    return NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

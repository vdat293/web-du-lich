import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '../../../../lib/db';

export async function POST(req) {
    try {
        const body = await req.json();
        const { firstName, lastName, email, password } = body;

        // Validation
        if (!firstName || !lastName || !email || !password) {
            return NextResponse.json({ message: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
        }

        // Check if user exists
        const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return NextResponse.json({ message: 'Email này đã được đăng ký' }, { status: 400 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Name and default values for user
        const fullName = `${firstName} ${lastName}`;
        const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; // Default unknown people avatar

        // Insert into users table
        const [userResult] = await db.execute(
            'INSERT INTO users (name, email, password, avatar, role) VALUES (?, ?, ?, ?, ?)',
            [fullName, email, passwordHash, defaultAvatar, 'customer']
        );

        return NextResponse.json({ message: 'Đăng ký thành công! Vui lòng đăng nhập.' }, { status: 201 });

    } catch (err) {
        console.error('Lỗi khi đăng ký:', err);
        return NextResponse.json({ message: 'Lỗi server !' }, { status: 500 });
    }
}

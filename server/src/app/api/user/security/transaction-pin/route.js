import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import db from '../../../../../lib/db';
import { sendVirtualSMS } from '../../../../../lib/sms';
import { sendVirtualEmail } from '../../../../../lib/email';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

function getUserId(req) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    try {
        const decoded = jwt.verify(
            authHeader.split(' ')[1],
            JWT_SECRET
        );
        return decoded.user.id;
    } catch {
        return null;
    }
}

function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

export async function POST(req) {
    const userId = getUserId(req);
    if (!userId) {
        return NextResponse.json({ message: 'Token không hợp lệ hoặc đã hết hạn' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { action } = body;

        // Fetch current user details
        const [users] = await db.execute('SELECT id, name, email, phone FROM users WHERE id = ?', [userId]);
        const user = users[0];
        if (!user) {
            return NextResponse.json({ message: 'Người dùng không tồn tại' }, { status: 404 });
        }

        // Action 1: Send OTP to configure PIN
        if (action === 'send_otp') {
            const identifier = user.email || user.phone;
            if (!identifier) {
                return NextResponse.json({ message: 'Người dùng không có thông tin email hoặc số điện thoại' }, { status: 400 });
            }

            const isEmail = identifier.includes('@');
            const otp = generateOTP();

            // Expire old setup OTPs
            await db.execute(
                "UPDATE verification_otps SET status = 'EXPIRED' WHERE identifier = ? AND status = 'PENDING'",
                [identifier]
            );

            // Insert new setup OTP
            await db.execute(
                "INSERT INTO verification_otps (identifier, otp_code, type) VALUES (?, ?, ?)",
                [identifier, otp, isEmail ? 'email' : 'sms']
            );

            if (isEmail) {
                const subject = '[Aoklevart] Thiết lập Mã PIN Giao dịch';
                const emailContent = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #333; text-align: center;">Thiết lập Mã PIN Giao dịch</h2>
                        <p>Chào ${user.name},</p>
                        <p>Bạn đang yêu cầu thiết lập hoặc thay đổi Mã PIN Giao dịch trên <b>Aoklevart</b>.</p>
                        <p>Mã OTP xác thực của bạn là:</p>
                        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1a73e8; margin: 20px 0; border-radius: 5px;">
                            ${otp}
                        </div>
                        <p>Mã này có hiệu lực trong <b>5 phút</b>. Tuyệt đối không chia sẻ mã này với bất kỳ ai.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #888; text-align: center;">Đây là email tự động, vui lòng không phản hồi.</p>
                    </div>
                `;
                await sendVirtualEmail(identifier, subject, emailContent);
            } else {
                const smsContent = `[Aoklevart] Ma OTP thiet lap PIN cua ban la ${otp}. Ma co hieu luc trong 5 phut. Khong chia se cho ai.`;
                await sendVirtualSMS(identifier, smsContent);
            }

            return NextResponse.json({
                success: true,
                message: `Mã OTP đã được gửi qua ${isEmail ? 'email' : 'số điện thoại'} đăng ký`,
                // In dev: return OTP for easy testing
                ...(process.env.NODE_ENV === 'development' && { dev_otp: otp })
            });
        }

        // Action 2: Verify Setup OTP
        if (action === 'verify_otp') {
            const { code } = body;
            const identifier = user.email || user.phone;
            if (!identifier || !code) {
                return NextResponse.json({ message: 'Thiếu thông tin xác thực' }, { status: 400 });
            }

            const [rows] = await db.execute(
                "SELECT * FROM verification_otps WHERE identifier = ? AND otp_code = ? AND status = 'PENDING' AND created_at > NOW() - INTERVAL 5 MINUTE",
                [identifier, code]
            );

            if (rows.length === 0) {
                return NextResponse.json({ message: 'Mã OTP không chính xác hoặc đã hết hạn' }, { status: 400 });
            }

            // Mark OTP as used
            await db.execute(
                "UPDATE verification_otps SET status = 'VERIFIED' WHERE id = ?",
                [rows[0].id]
            );

            // Generate temporary JWT token valid for 10 minutes to authorize setting the PIN
            const setupToken = jwt.sign(
                { userId, purpose: 'set_pin' },
                JWT_SECRET,
                { expiresIn: '10m' }
            );

            return NextResponse.json({
                success: true,
                setup_token: setupToken,
                message: 'Xác thực OTP thành công. Vui lòng thiết lập mã PIN.'
            });
        }

        // Action 3: Save new 6-digit Transaction PIN
        if (action === 'set_pin') {
            const { pin, setup_token: setupToken } = body;
            if (!pin || !setupToken) {
                return NextResponse.json({ message: 'Thiếu thông tin PIN hoặc mã xác thực' }, { status: 400 });
            }

            if (!/^[0-9]{6}$/.test(pin)) {
                return NextResponse.json({ message: 'Mã PIN phải bao gồm đúng 6 chữ số' }, { status: 400 });
            }

            // Verify the setup token
            let decoded;
            try {
                decoded = jwt.verify(setupToken, JWT_SECRET);
            } catch {
                return NextResponse.json({ message: 'Mã xác thực đã hết hạn hoặc không hợp lệ, vui lòng lấy mã OTP mới' }, { status: 400 });
            }

            if (decoded.userId !== userId || decoded.purpose !== 'set_pin') {
                return NextResponse.json({ message: 'Mã xác thực không hợp lệ' }, { status: 400 });
            }

            // Hash the PIN and save to DB
            const hashedPin = await bcryptjs.hash(pin, 10);
            await db.execute(
                'UPDATE users SET transaction_pin = ?, transaction_pin_enabled = TRUE WHERE id = ?',
                [hashedPin, userId]
            );

            return NextResponse.json({
                success: true,
                message: 'Thiết lập Mã PIN Giao dịch thành công!'
            });
        }

        return NextResponse.json({ message: 'Hành động không hợp lệ' }, { status: 400 });

    } catch (error) {
        console.error('[Transaction PIN API] Error:', error);
        return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
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

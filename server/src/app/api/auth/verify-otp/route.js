import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

export async function POST(req) {
    try {
        const body = await req.json();
        const { transaction_id, otp } = body;

        if (!transaction_id || !otp) {
            return NextResponse.json({ success: false, message: 'Vui lòng nhập mã OTP' }, { status: 400 });
        }

        // Tìm OTP log
        const [logs] = await db.execute(
            'SELECT * FROM sandbox_otp_logs WHERE transaction_id = ? AND status = ?',
            [transaction_id, 'PENDING']
        );

        if (logs.length === 0) {
            return NextResponse.json({ success: false, message: 'Mã OTP không hợp lệ hoặc đã hết hạn' }, { status: 400 });
        }

        const log = logs[0];

        // Kiểm tra OTP
        if (log.otp_code !== otp.trim()) {
            return NextResponse.json({ success: false, message: 'Mã OTP không chính xác' }, { status: 400 });
        }

        // Kiểm tra hết hạn (5 phút)
        const createdAt = new Date(log.created_at);
        const now = new Date();
        const diffMinutes = (now - createdAt) / (1000 * 60);
        if (diffMinutes > 5) {
            await db.execute('UPDATE sandbox_otp_logs SET status = ? WHERE id = ?', ['EXPIRED', log.id]);
            if (global.io) {
                global.io.emit('otpStatusChanged', { transaction_id, status: 'EXPIRED' });
            }
            return NextResponse.json({ success: false, message: 'Mã OTP đã hết hạn (5 phút). Vui lòng thử lại.' }, { status: 400 });
        }

        // OTP hợp lệ - chưa đánh dấu USED, chỉ xác nhận
        return NextResponse.json({
            success: true,
            message: 'Mã OTP chính xác! Vui lòng nhập mật khẩu mới.'
        });
    } catch (err) {
        console.error('[Verify OTP] Error:', err);
        return NextResponse.json({ success: false, message: 'Lỗi server', error: String(err) }, { status: 500 });
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

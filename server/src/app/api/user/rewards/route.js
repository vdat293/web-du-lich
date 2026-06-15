import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

import db from '../../../../lib/db';

function getUserId(req) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    try {
        const decoded = jwt.verify(
            authHeader.split(' ')[1],
            process.env.JWT_SECRET || 'your_jwt_secret_key_here'
        );
        return decoded.user.id;
    } catch {
        return null;
    }
}

async function listRedemptions(executor, userId) {
    const [redemptions] = await executor.execute(`
        SELECT rr.id, rr.reward_key, rr.points_spent, rr.created_at,
               c.code, c.discount_type, c.discount_value, c.min_order_amount,
               c.valid_until, c.used_count
        FROM reward_redemptions rr
        JOIN coupons c ON c.id = rr.coupon_id
        WHERE rr.user_id = ?
        ORDER BY rr.created_at DESC
    `, [userId]);
    return redemptions;
}

export async function GET(req) {
    const userId = getUserId(req);
    if (!userId) {
        return NextResponse.json({ message: 'Token không hợp lệ hoặc đã hết hạn' }, { status: 401 });
    }

    try {
        const [[users], [dbRewards], redemptions] = await Promise.all([
            db.execute('SELECT loyalty_points FROM users WHERE id = ?', [userId]),
            db.execute('SELECT * FROM rewards ORDER BY points ASC'),
            listRedemptions(db, userId),
        ]);
        if (!users[0]) {
            return NextResponse.json({ message: 'Người dùng không tồn tại' }, { status: 404 });
        }

        const formattedRewards = dbRewards.map(reward => ({
            key: reward.key,
            title: reward.title,
            description: reward.description,
            points: Number(reward.points),
            discount_type: reward.discount_type,
            discount_value: Number(reward.discount_value),
            min_order_amount: Number(reward.min_order_amount),
            category: reward.category,
            image_url: reward.image_url,
            partner_name: reward.partner_name,
        }));

        return NextResponse.json({
            loyalty_points: Number(users[0].loyalty_points) || 0,
            rewards: formattedRewards,
            redemptions,
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đổi thưởng:', error);
        return NextResponse.json({ message: 'Không thể tải danh sách đổi thưởng' }, { status: 500 });
    }
}

export async function POST(req) {
    const userId = getUserId(req);
    if (!userId) {
        return NextResponse.json({ message: 'Token không hợp lệ hoặc đã hết hạn' }, { status: 401 });
    }

    const { reward_key: rewardKey, pin } = await req.json();

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Fetch reward details from DB
        const [rewards] = await connection.execute(
            'SELECT * FROM rewards WHERE `key` = ?',
            [rewardKey]
        );
        const reward = rewards[0];
        if (!reward) {
            await connection.rollback();
            return NextResponse.json({ message: 'Phần thưởng không hợp lệ' }, { status: 400 });
        }

        const [users] = await connection.execute(
            'SELECT loyalty_points, transaction_pin, transaction_pin_enabled FROM users WHERE id = ? FOR UPDATE',
            [userId]
        );
        if (!users[0]) {
            await connection.rollback();
            return NextResponse.json({ message: 'Người dùng không tồn tại' }, { status: 404 });
        }

        const user = users[0];

        // Check PIN if enabled
        if (user.transaction_pin_enabled) {
            if (!pin) {
                await connection.rollback();
                return NextResponse.json({ message: 'Vui lòng nhập Mã PIN Giao dịch để xác thực' }, { status: 400 });
            }
            const pinMatches = await bcryptjs.compare(pin, user.transaction_pin);
            if (!pinMatches) {
                await connection.rollback();
                return NextResponse.json({ message: 'Mã PIN Giao dịch không chính xác' }, { status: 400 });
            }
        }

        const loyaltyPoints = Number(user.loyalty_points) || 0;
        if (loyaltyPoints < reward.points) {
            await connection.rollback();
            return NextResponse.json({ message: 'Bạn chưa đủ điểm để đổi phần thưởng này' }, { status: 400 });
        }

        const couponCode = `AOK-${randomBytes(4).toString('hex').toUpperCase()}`;
        const [couponResult] = await connection.execute(`
            INSERT INTO coupons
                (code, discount_type, discount_value, min_order_amount, max_uses, valid_from, valid_until, description)
            VALUES (?, ?, ?, ?, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 90 DAY), ?)
        `, [
            couponCode,
            reward.discount_type,
            reward.discount_value,
            reward.min_order_amount,
            `Đổi ${reward.points} điểm: ${reward.title}`,
        ]);

        await connection.execute(
            `INSERT INTO reward_redemptions (user_id, coupon_id, reward_key, points_spent)
             VALUES (?, ?, ?, ?)`,
            [userId, couponResult.insertId, reward.key, reward.points]
        );
        await connection.execute(
            'UPDATE users SET loyalty_points = loyalty_points - ? WHERE id = ?',
            [reward.points, userId]
        );
        await connection.commit();

        const remainingPoints = loyaltyPoints - reward.points;
        return NextResponse.json({
            message: 'Đổi thưởng thành công',
            loyalty_points: remainingPoints,
            coupon_code: couponCode,
        }, { status: 201 });
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi khi đổi thưởng:', error);
        return NextResponse.json({ message: 'Không thể đổi thưởng lúc này' }, { status: 500 });
    } finally {
        connection.release();
    }
}

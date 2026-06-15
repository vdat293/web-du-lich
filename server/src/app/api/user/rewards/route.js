import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

import db from '../../../../lib/db';

const REWARDS = [
    {
        key: 'voucher-vexere',
        title: 'Ưu đãi giảm 25% tối đa 50.000 VNĐ dành cho tất cả các khách hàng đặt xe khách trên website/app Vexere',
        description: 'Áp dụng cho tất cả các tuyến đường trên website và ứng dụng Vexere.',
        points: 1,
        discountType: 'percent',
        discountValue: 25,
        minOrderAmount: 10000,
        category: 'voucher',
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=60',
        partnerName: 'VEXERE',
    },
    {
        key: 'voucher-hol',
        title: '[HOUSE OF LUGGAGE x CGV] ĐỘC QUYỀN GIẢM 100K - SĂN VALI HÀNG HIỆU CHỈ VỚI 5 ĐIỂM CGV',
        description: 'Nâng tầm chuyến đi của bạn. Giảm giá trực tiếp 100.000đ cho các đơn hàng vali tại hol.com.vn.',
        points: 5,
        discountType: 'fixed',
        discountValue: 100000,
        minOrderAmount: 500000,
        category: 'voucher',
        imageUrl: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=500&auto=format&fit=crop&q=60',
        partnerName: 'HOUSE OF LUGGAGE',
    },
    {
        key: 'voucher-jump',
        title: '[JUMP ARENA x CGV] NHẬN NGAY VOUCHER GIẢM 50.000 VNĐ CHỈ VỚI 3 ĐIỂM TÍCH LŨY TẠI CGV!',
        description: 'Vui chơi thỏa thích tại Jump Arena. Áp dụng cho vé chơi tự do từ 60 phút trở lên.',
        points: 3,
        discountType: 'fixed',
        discountValue: 50000,
        minOrderAmount: 100000,
        category: 'voucher',
        imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&auto=format&fit=crop&q=60',
        partnerName: 'JUMP ARENA',
    },
    {
        key: 'voucher-klook',
        title: 'Voucher Klook giảm 10% tối đa 150.000đ cho mọi hoạt động du lịch trải nghiệm',
        description: 'Khám phá các điểm tham quan, tour du lịch độc đáo trên Klook với mức giá ưu đãi.',
        points: 8,
        discountType: 'percent',
        discountValue: 10,
        minOrderAmount: 300000,
        category: 'voucher',
        imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=60',
        partnerName: 'KLOOK',
    },
    {
        key: 'voucher-aoklevart',
        title: 'Voucher Aoklevart Hotel giảm thẳng 200.000 VNĐ cho đặt phòng nghỉ dưỡng tiếp theo',
        description: 'Áp dụng cho mọi chỗ nghỉ, villa và homestay trên hệ thống Aoklevart.',
        points: 15,
        discountType: 'fixed',
        discountValue: 200000,
        minOrderAmount: 800000,
        category: 'voucher',
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60',
        partnerName: 'AOKLEVART',
    },
    {
        key: 'shop-vali',
        title: 'Vali du lịch cao cấp Legend Walker size M - Đẳng cấp doanh nhân',
        description: 'Chất liệu polycarbonate bền bỉ, khóa TSA tiêu chuẩn Hoa Kỳ, bánh xe xoay 360 độ êm ái.',
        points: 100,
        discountType: 'fixed',
        discountValue: 0,
        minOrderAmount: 0,
        category: 'shopping',
        imageUrl: 'https://images.unsplash.com/photo-1581553674786-636eaa2f1a63?w=500&auto=format&fit=crop&q=60',
        partnerName: 'TRAVEL GEAR',
    },
    {
        key: 'shop-balo',
        title: 'Balo du lịch dã ngoại chống nước Naturehike 45L siêu nhẹ',
        description: 'Thiết kế thông minh, trợ lực tốt, phù hợp cho các chuyến leo núi, cắm trại ngắn ngày.',
        points: 50,
        discountType: 'fixed',
        discountValue: 0,
        minOrderAmount: 0,
        category: 'shopping',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
        partnerName: 'NATUREHIKE',
    },
    {
        key: 'shop-binh-nuoc',
        title: 'Bình giữ nhiệt inox LocknLock 500ml giữ nhiệt cực tốt 24 giờ',
        description: 'Vỏ thép không gỉ, nắp tiện dụng chống tràn, giữ nhiệt lạnh và nóng tối đa.',
        points: 20,
        discountType: 'fixed',
        discountValue: 0,
        minOrderAmount: 0,
        category: 'shopping',
        imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60',
        partnerName: 'LOCKNLOCK',
    },
    {
        key: 'shop-kinh-mat',
        title: 'Kính mát thời trang đi biển chống tia cực tím UV400 cao cấp',
        description: 'Tròng kính phân cực chống lóa, gọng kính titan siêu bền thời trang.',
        points: 30,
        discountType: 'fixed',
        discountValue: 0,
        minOrderAmount: 0,
        category: 'shopping',
        imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60',
        partnerName: 'AOKLEVART GEAR',
    },
    {
        key: 'shop-goi-co',
        title: 'Gối cổ du lịch cao su non êm ái chống mỏi vai gáy',
        description: 'Chất liệu cao su non đàn hồi tốt, bọc vải nhung mềm mại, dễ dàng mang đi du lịch.',
        points: 15,
        discountType: 'fixed',
        discountValue: 0,
        minOrderAmount: 0,
        category: 'shopping',
        imageUrl: 'https://images.unsplash.com/photo-1520038410233-7141be7e6f97?w=500&auto=format&fit=crop&q=60',
        partnerName: 'TRAVEL COMFORT',
    },
];

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

function formatReward(reward) {
    return {
        key: reward.key,
        title: reward.title,
        description: reward.description,
        points: reward.points,
        discount_type: reward.discountType,
        discount_value: reward.discountValue,
        min_order_amount: reward.minOrderAmount,
        category: reward.category,
        image_url: reward.imageUrl,
        partner_name: reward.partnerName,
    };
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
        const [[users], redemptions] = await Promise.all([
            db.execute('SELECT loyalty_points FROM users WHERE id = ?', [userId]),
            listRedemptions(db, userId),
        ]);
        if (!users[0]) {
            return NextResponse.json({ message: 'Người dùng không tồn tại' }, { status: 404 });
        }

        return NextResponse.json({
            loyalty_points: Number(users[0].loyalty_points) || 0,
            rewards: REWARDS.map(formatReward),
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

    const { reward_key: rewardKey } = await req.json();
    const reward = REWARDS.find((item) => item.key === rewardKey);
    if (!reward) {
        return NextResponse.json({ message: 'Phần thưởng không hợp lệ' }, { status: 400 });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [users] = await connection.execute(
            'SELECT loyalty_points FROM users WHERE id = ? FOR UPDATE',
            [userId]
        );
        if (!users[0]) {
            await connection.rollback();
            return NextResponse.json({ message: 'Người dùng không tồn tại' }, { status: 404 });
        }

        const loyaltyPoints = Number(users[0].loyalty_points) || 0;
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
            reward.discountType,
            reward.discountValue,
            reward.minOrderAmount,
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

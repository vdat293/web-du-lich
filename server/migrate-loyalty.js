const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateLoyalty() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL || {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
    });

    try {
        const [columns] = await connection.execute(
            `SELECT COLUMN_NAME
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'users'
               AND COLUMN_NAME IN ('loyalty_points', 'membership_tier')`
        );
        const existingColumns = new Set(columns.map((column) => column.COLUMN_NAME));

        if (!existingColumns.has('loyalty_points')) {
            await connection.execute(
                'ALTER TABLE users ADD COLUMN loyalty_points BIGINT UNSIGNED NOT NULL DEFAULT 0'
            );
        }
        if (!existingColumns.has('membership_tier')) {
            await connection.execute(
                "ALTER TABLE users ADD COLUMN membership_tier VARCHAR(20) NOT NULL DEFAULT 'classic'"
            );
        }
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS loyalty_transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                booking_id INT NOT NULL,
                points INT UNSIGNED NOT NULL,
                amount DECIMAL(15,0) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
                UNIQUE KEY uniq_loyalty_booking (booking_id)
            )
        `);
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS reward_redemptions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                coupon_id INT NOT NULL UNIQUE,
                reward_key VARCHAR(50) NOT NULL,
                points_spent INT UNSIGNED NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE
            )
        `);

        // Create rewards table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS rewards (
                id INT AUTO_INCREMENT PRIMARY KEY,
                \`key\` VARCHAR(50) NOT NULL UNIQUE,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                points INT UNSIGNED NOT NULL,
                discount_type VARCHAR(20) NOT NULL DEFAULT 'fixed',
                discount_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                min_order_amount DECIMAL(15,0) DEFAULT 0,
                category VARCHAR(50) NOT NULL DEFAULT 'voucher',
                image_url VARCHAR(500),
                partner_name VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Seed default rewards if empty
        const [existing] = await connection.execute('SELECT COUNT(*) as count FROM rewards');
        if (existing[0].count === 0) {
            const seedRewards = [
                [
                    'voucher-vexere',
                    'Ưu đãi giảm 25% tối đa 50.000 VNĐ dành cho tất cả các khách hàng đặt xe khách trên website/app Vexere',
                    'Áp dụng cho tất cả các tuyến đường trên website và ứng dụng Vexere.',
                    1,
                    'percent',
                    25.00,
                    10000,
                    'voucher',
                    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=60',
                    'VEXERE'
                ],
                [
                    'voucher-hol',
                    '[HOUSE OF LUGGAGE x CGV] ĐỘC QUYỀN GIẢM 100K - SĂN VALI HÀNG HIỆU CHỈ VỚI 5 ĐIỂM CGV',
                    'Nâng tầm chuyến đi của bạn. Giảm giá trực tiếp 100.000đ cho các đơn hàng vali tại hol.com.vn.',
                    5,
                    'fixed',
                    100000.00,
                    500000,
                    'voucher',
                    'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=500&auto=format&fit=crop&q=60',
                    'HOUSE OF LUGGAGE'
                ],
                [
                    'voucher-jump',
                    '[JUMP ARENA x CGV] NHẬN NGAY VOUCHER GIẢM 50.000 VNĐ CHỈ VỚI 3 ĐIỂM TÍCH LŨY TẠI CGV!',
                    'Vui chơi thỏa thích tại Jump Arena. Áp dụng cho vé chơi tự do từ 60 phút trở lên.',
                    3,
                    'fixed',
                    50000.00,
                    100000,
                    'voucher',
                    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&auto=format&fit=crop&q=60',
                    'JUMP ARENA'
                ],
                [
                    'voucher-klook',
                    'Voucher Klook giảm 10% tối đa 150.000đ cho mọi hoạt động du lịch trải nghiệm',
                    'Khám phá các điểm tham quan, tour du lịch độc đáo trên Klook với mức giá ưu đãi.',
                    8,
                    'percent',
                    10.00,
                    300000,
                    'voucher',
                    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=60',
                    'KLOOK'
                ],
                [
                    'voucher-aoklevart',
                    'Voucher Aoklevart Hotel giảm thẳng 200.000 VNĐ cho đặt phòng nghỉ dưỡng tiếp theo',
                    'Áp dụng cho mọi chỗ nghỉ, villa và homestay trên hệ thống Aoklevart.',
                    15,
                    'fixed',
                    200000.00,
                    800000,
                    'voucher',
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60',
                    'AOKLEVART'
                ],
                [
                    'shop-vali',
                    'Vali du lịch cao cấp Legend Walker size M - Đẳng cấp doanh nhân',
                    'Chất liệu polycarbonate bền bỉ, khóa TSA tiêu chuẩn Hoa Kỳ, bánh xe xoay 360 độ êm ái.',
                    100,
                    'fixed',
                    0.00,
                    0,
                    'shopping',
                    'https://images.unsplash.com/photo-1581553674786-636eaa2f1a63?w=500&auto=format&fit=crop&q=60',
                    'TRAVEL GEAR'
                ],
                [
                    'shop-balo',
                    'Balo du lịch dã ngoại chống nước Naturehike 45L siêu nhẹ',
                    'Thiết kế thông minh, trợ lực tốt, phù hợp cho các chuyến leo núi, cắm trại ngắn ngày.',
                    50,
                    'fixed',
                    0.00,
                    0,
                    'shopping',
                    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
                    'NATUREHIKE'
                ],
                [
                    'shop-binh-nuoc',
                    'Bình giữ nhiệt inox LocknLock 500ml giữ nhiệt cực tốt 24 giờ',
                    'Vỏ thép không gỉ, nắp tiện dụng chống tràn, giữ nhiệt lạnh and nóng tối đa.',
                    20,
                    'fixed',
                    0.00,
                    0,
                    'shopping',
                    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60',
                    'LOCKNLOCK'
                ],
                [
                    'shop-kinh-mat',
                    'Kính mát thời trang đi biển chống tia cực tím UV400 cao cấp',
                    'Tròng kính phân cực chống lóa, gọng kính titan siêu bền thời trang.',
                    30,
                    'fixed',
                    0.00,
                    0,
                    'shopping',
                    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60',
                    'AOKLEVART GEAR'
                ],
                [
                    'shop-goi-co',
                    'Gối cổ du lịch cao su non êm ái chống mỏi vai gáy',
                    'Chất liệu cao su non đàn hồi tốt, bọc vải nhung mềm mại, dễ dàng mang đi du lịch.',
                    15,
                    'fixed',
                    0.00,
                    0,
                    'shopping',
                    'https://images.unsplash.com/photo-1520038410233-7141be7e6f97?w=500&auto=format&fit=crop&q=60',
                    'TRAVEL COMFORT'
                ]
            ];

            for (const row of seedRewards) {
                await connection.execute(
                    `INSERT INTO rewards 
                        (\`key\`, title, description, points, discount_type, discount_value, min_order_amount, category, image_url, partner_name) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    row
                );
            }
            console.log('Đã nạp dữ liệu rewards mẫu vào database.');
        }

        console.log('Đã thêm cơ chế tích điểm và hạng thành viên.');
    } finally {
        await connection.end();
    }
}

migrateLoyalty().catch((error) => {
    console.error('Không thể migrate loyalty:', error);
    process.exit(1);
});

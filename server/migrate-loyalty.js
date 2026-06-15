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
        console.log('Đã thêm cơ chế tích điểm và hạng thành viên.');
    } finally {
        await connection.end();
    }
}

migrateLoyalty().catch((error) => {
    console.error('Không thể migrate loyalty:', error);
    process.exit(1);
});

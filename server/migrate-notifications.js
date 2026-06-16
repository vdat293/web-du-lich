const mysql = require('mysql2/promise');
require('dotenv').config();

const useUri = Boolean(process.env.DATABASE_URL);
const config = useUri ? {
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
} : {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'web_du_lich',
    ssl: { rejectUnauthorized: false },
};

async function migrate() {
    const connection = await mysql.createConnection(config);

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS push_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            expo_push_token VARCHAR(255) NOT NULL UNIQUE,
            platform VARCHAR(30),
            device_id VARCHAR(120),
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_push_tokens_user_active (user_id, is_active)
        )
    `);

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS notification_campaigns (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            audience VARCHAR(50) NOT NULL DEFAULT 'all',
            data_json TEXT,
            status VARCHAR(30) NOT NULL DEFAULT 'sent',
            created_by INT,
            sent_count INT NOT NULL DEFAULT 0,
            failed_count INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        )
    `);

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            campaign_id INT NULL,
            title VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            type VARCHAR(50) NOT NULL DEFAULT 'general',
            data_json TEXT,
            is_read BOOLEAN NOT NULL DEFAULT FALSE,
            sent_by INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (campaign_id) REFERENCES notification_campaigns(id) ON DELETE SET NULL,
            FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL,
            INDEX idx_notifications_user_created (user_id, created_at),
            INDEX idx_notifications_user_read (user_id, is_read)
        )
    `);

    await connection.end();
    console.log('Notification tables are ready.');
}

migrate().catch((err) => {
    console.error('Notification migration failed:', err);
    process.exit(1);
});

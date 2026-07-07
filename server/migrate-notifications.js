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

async function columnExists(connection, table, column) {
    const [rows] = await connection.execute(
        `SELECT 1
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND COLUMN_NAME = ?
         LIMIT 1`,
        [table, column]
    );
    return rows.length > 0;
}

async function indexExists(connection, table, indexName) {
    const [rows] = await connection.execute(
        `SELECT 1
         FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND INDEX_NAME = ?
         LIMIT 1`,
        [table, indexName]
    );
    return rows.length > 0;
}

async function addColumn(connection, table, column, definition) {
    if (await columnExists(connection, table, column)) return;
    await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
}

async function addIndex(connection, table, indexName, columns) {
    if (await indexExists(connection, table, indexName)) return;
    await connection.query(`ALTER TABLE \`${table}\` ADD INDEX \`${indexName}\` (${columns})`);
}

async function migrate() {
    const connection = await mysql.createConnection(config);

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS push_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            expo_push_token VARCHAR(255) NOT NULL UNIQUE,
            provider VARCHAR(30) NOT NULL DEFAULT 'expo',
            expo_project_id VARCHAR(120),
            platform VARCHAR(30),
            device_id VARCHAR(120),
            app_version VARCHAR(40),
            permission_status VARCHAR(30),
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            disabled_at TIMESTAMP NULL,
            last_error TEXT,
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
            delivered_count INT NOT NULL DEFAULT 0,
            opened_count INT NOT NULL DEFAULT 0,
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
            read_at TIMESTAMP NULL,
            opened_at TIMESTAMP NULL,
            deep_link VARCHAR(255),
            priority VARCHAR(20) NOT NULL DEFAULT 'normal',
            channel VARCHAR(50) NOT NULL DEFAULT 'default',
            sent_by INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (campaign_id) REFERENCES notification_campaigns(id) ON DELETE SET NULL,
            FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL,
            INDEX idx_notifications_user_created (user_id, created_at),
            INDEX idx_notifications_user_read (user_id, is_read)
        )
    `);

    await addColumn(connection, 'push_tokens', 'provider', "VARCHAR(30) NOT NULL DEFAULT 'expo' AFTER expo_push_token");
    await addColumn(connection, 'push_tokens', 'expo_project_id', 'VARCHAR(120) NULL AFTER provider');
    await addColumn(connection, 'push_tokens', 'app_version', 'VARCHAR(40) NULL AFTER device_id');
    await addColumn(connection, 'push_tokens', 'permission_status', 'VARCHAR(30) NULL AFTER app_version');
    await addColumn(connection, 'push_tokens', 'disabled_at', 'TIMESTAMP NULL AFTER is_active');
    await addColumn(connection, 'push_tokens', 'last_error', 'TEXT NULL AFTER disabled_at');

    await addColumn(connection, 'notification_campaigns', 'delivered_count', 'INT NOT NULL DEFAULT 0 AFTER failed_count');
    await addColumn(connection, 'notification_campaigns', 'opened_count', 'INT NOT NULL DEFAULT 0 AFTER delivered_count');

    await addColumn(connection, 'notifications', 'read_at', 'TIMESTAMP NULL AFTER is_read');
    await addColumn(connection, 'notifications', 'opened_at', 'TIMESTAMP NULL AFTER read_at');
    await addColumn(connection, 'notifications', 'deep_link', 'VARCHAR(255) NULL AFTER opened_at');
    await addColumn(connection, 'notifications', 'priority', "VARCHAR(20) NOT NULL DEFAULT 'normal' AFTER deep_link");
    await addColumn(connection, 'notifications', 'channel', "VARCHAR(50) NOT NULL DEFAULT 'default' AFTER priority");

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS notification_deliveries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            notification_id INT NOT NULL,
            push_token_id INT NULL,
            status VARCHAR(30) NOT NULL DEFAULT 'pending',
            expo_ticket_id VARCHAR(120),
            expo_receipt_id VARCHAR(120),
            error_code VARCHAR(120),
            error_message TEXT,
            sent_at TIMESTAMP NULL,
            received_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
            FOREIGN KEY (push_token_id) REFERENCES push_tokens(id) ON DELETE SET NULL,
            INDEX idx_notification_deliveries_notification (notification_id),
            INDEX idx_notification_deliveries_token_status (push_token_id, status),
            INDEX idx_notification_deliveries_ticket (expo_ticket_id)
        )
    `);

    await addIndex(connection, 'push_tokens', 'idx_push_tokens_user_active', 'user_id, is_active');
    await addIndex(connection, 'notifications', 'idx_notifications_user_created', 'user_id, created_at');
    await addIndex(connection, 'notifications', 'idx_notifications_user_read', 'user_id, is_read');
    await addIndex(connection, 'notification_deliveries', 'idx_notification_deliveries_notification', 'notification_id');
    await addIndex(connection, 'notification_deliveries', 'idx_notification_deliveries_token_status', 'push_token_id, status');
    await addIndex(connection, 'notification_deliveries', 'idx_notification_deliveries_ticket', 'expo_ticket_id');

    await connection.end();
    console.log('Notification tables are ready.');
}

migrate().catch((err) => {
    console.error('Notification migration failed:', err);
    process.exit(1);
});

const mysql = require('mysql2/promise');
require('dotenv').config();

async function migratePin() {
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
               AND COLUMN_NAME IN ('transaction_pin', 'transaction_pin_enabled')`
        );
        const existingColumns = new Set(columns.map((column) => column.COLUMN_NAME));

        if (!existingColumns.has('transaction_pin')) {
            await connection.execute(
                'ALTER TABLE users ADD COLUMN transaction_pin VARCHAR(255) NULL'
            );
            console.log('Added column transaction_pin to users table.');
        }
        if (!existingColumns.has('transaction_pin_enabled')) {
            await connection.execute(
                'ALTER TABLE users ADD COLUMN transaction_pin_enabled BOOLEAN NOT NULL DEFAULT FALSE'
            );
            console.log('Added column transaction_pin_enabled to users table.');
        }

        console.log('Database migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

migratePin().catch((error) => {
    console.error('Migration execution failed:', error);
    process.exit(1);
});

const mysql = require('mysql2/promise');
require('dotenv').config();

const config = process.env.DATABASE_URL
    ? { uri: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'web_du_lich',
    };

async function columnExists(connection, table, column) {
    const [rows] = await connection.execute(
        `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
        [table, column]
    );
    return rows.length > 0;
}

async function indexExists(connection, table, indexName) {
    const [rows] = await connection.execute(
        `SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ? LIMIT 1`,
        [table, indexName]
    );
    return rows.length > 0;
}

async function foreignKeyExists(connection, table, constraintName) {
    const [rows] = await connection.execute(
        `SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
         WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = ?
           AND CONSTRAINT_NAME = ? AND CONSTRAINT_TYPE = 'FOREIGN KEY' LIMIT 1`,
        [table, constraintName]
    );
    return rows.length > 0;
}

async function addColumn(connection, table, column, definition) {
    if (!(await columnExists(connection, table, column))) {
        await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    }
}

async function addIndex(connection, table, name, columns) {
    if (!(await indexExists(connection, table, name))) {
        await connection.query(`ALTER TABLE \`${table}\` ADD INDEX \`${name}\` (${columns})`);
    }
}

async function addForeignKey(connection, table, name, column, reference) {
    if (!(await foreignKeyExists(connection, table, name))) {
        await connection.query(
            `ALTER TABLE \`${table}\` ADD CONSTRAINT \`${name}\`
             FOREIGN KEY (\`${column}\`) REFERENCES ${reference}`
        );
    }
}

async function migrate() {
    const connection = await mysql.createConnection(config);
    try {
        await addColumn(connection, 'coupons', 'owner_id', 'INT NULL');
        await addColumn(connection, 'coupons', 'created_by', 'INT NULL');
        await addColumn(connection, 'coupons', 'scope_type', "VARCHAR(20) NOT NULL DEFAULT 'system'");
        await addColumn(connection, 'coupons', 'is_enabled', 'BOOLEAN NOT NULL DEFAULT TRUE');

        // Existing coupons are reward/platform coupons and therefore remain
        // system-wide. No coupon rows are deleted or rewritten otherwise.
        await connection.execute(
            "UPDATE coupons SET scope_type = 'system' WHERE scope_type IS NULL OR scope_type = ''"
        );
        await connection.execute('UPDATE coupons SET is_enabled = 1 WHERE is_enabled IS NULL');

        await addForeignKey(connection, 'coupons', 'fk_coupons_owner', 'owner_id', 'users(id) ON DELETE SET NULL');
        await addForeignKey(connection, 'coupons', 'fk_coupons_created_by', 'created_by', 'users(id) ON DELETE SET NULL');
        await addIndex(connection, 'coupons', 'idx_coupons_scope_owner', 'scope_type, owner_id');
        await addIndex(connection, 'coupons', 'idx_coupons_enabled_dates', 'is_enabled, valid_from, valid_until');

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS coupon_properties (
                coupon_id INT NOT NULL,
                property_id INT NOT NULL,
                PRIMARY KEY (coupon_id, property_id),
                FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
                FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
                INDEX idx_coupon_properties_property (property_id)
            )
        `);
        await addIndex(connection, 'coupon_properties', 'idx_coupon_properties_property', 'property_id');

        console.log('Coupon scope migration completed safely.');
    } finally {
        await connection.end();
    }
}

migrate().catch((error) => {
    console.error('Coupon migration failed:', error);
    process.exit(1);
});

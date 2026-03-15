const mysql = require('mysql2/promise');

async function main() {
    const db = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: '',
        database: 'web_du_lich'
    });

    await db.execute(`
        CREATE TABLE IF NOT EXISTS guest_bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            guest_name VARCHAR(255) NOT NULL,
            property_id INT NOT NULL,
            room_type_id INT NOT NULL,
            check_in DATE NOT NULL,
            check_out DATE NOT NULL,
            number_of_rooms INT DEFAULT 1,
            total_price DECIMAL(15,0) NOT NULL,
            special_requests TEXT,
            confirm_token VARCHAR(255) NOT NULL UNIQUE,
            is_confirmed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
            FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
        )
    `);

    console.log('Table guest_bookings created successfully!');
    await db.end();
}

main().catch(err => { console.error(err); process.exit(1); });

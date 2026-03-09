const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
    console.log("Connect DB...");
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    // Make sure we have mock data converted
    let rawContent = fs.readFileSync('../client/src/mockup_data/data.js', 'utf8');
    rawContent = rawContent.replace(/export const /g, 'exports.');
    fs.writeFileSync('./mockData.js', rawContent);
    const mockData = require('./mockData.js');

    console.log("Truncating tables...");
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE reviews');
    await connection.query('TRUNCATE TABLE bookings');
    await connection.query('TRUNCATE TABLE room_types');
    await connection.query('TRUNCATE TABLE property_amenities');
    await connection.query('TRUNCATE TABLE amenities');
    await connection.query('TRUNCATE TABLE property_images');
    await connection.query('TRUNCATE TABLE properties');
    await connection.query('TRUNCATE TABLE users');

    // Add a default customer user
    await connection.query(`INSERT INTO users (id, name, email, password, avatar, role, phone) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [1, 'Nguyễn Văn A', 'test@gmail.com', '$2b$10$0T9nMAyZy1Ip5WUQCBP0Z.8xvWRM6uemXXkBHmWHmayh9pD2zYdqq', 'https://cdn-icons-png.flaticon.com/512/149/149071.png', 'customer', '0123456789']
    );

    // Filter out users id 1 to avoid constraint errors if they overlap, but let's just insert all users and IGNORE
    console.log("Inserting users...");
    if (mockData.users && mockData.users.length > 0) {
        for (const user of mockData.users) {
            await connection.query(`INSERT IGNORE INTO users (id, name, email, password, avatar, role, phone) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [user.id, user.name, user.email, user.password, user.avatar || '', user.role, user.phone || '']
            );
        }
    }

    console.log("Inserting properties...");
    if (mockData.properties && mockData.properties.length > 0) {
        for (const prop of mockData.properties) {
            await connection.query(`INSERT INTO properties (id, host_id, name, type, location, price_display, description, map_image, map_embed, is_hot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [prop.id, prop.host_id, prop.name, prop.type, prop.location, prop.price_display, prop.description, prop.map_image, prop.map_embed, prop.is_hot]
            );
        }
    }

    console.log("Inserting property_images...");
    if (mockData.property_images && mockData.property_images.length > 0) {
        for (const img of mockData.property_images) {
            await connection.query(`INSERT INTO property_images (id, property_id, image_url, is_main) VALUES (?, ?, ?, ?)`,
                [img.id, img.property_id, img.image_url, img.is_main]
            );
        }
    }

    console.log("Inserting amenities...");
    if (mockData.amenities && mockData.amenities.length > 0) {
        for (const am of mockData.amenities) {
            await connection.query(`INSERT INTO amenities (id, name, icon, category) VALUES (?, ?, ?, ?)`,
                [am.id, am.name, am.icon, am.category]
            );
        }
    }

    console.log("Inserting property_amenities...");
    if (mockData.property_amenities && mockData.property_amenities.length > 0) {
        for (const pa of mockData.property_amenities) {
            await connection.query(`INSERT INTO property_amenities (property_id, amenity_id) VALUES (?, ?)`,
                [pa.property_id, pa.amenity_id]
            );
        }
    }

    console.log("Inserting room_types...");
    if (mockData.room_types && mockData.room_types.length > 0) {
        for (const room of mockData.room_types) {
            await connection.query(`INSERT INTO room_types (id, property_id, name, price, total_allotment, max_adults, max_children, room_size, bed_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [room.id, room.property_id, room.name, room.price, room.total_allotment, room.max_adults, room.max_children, room.room_size, room.bed_type]
            );
        }
    }

    console.log("Inserting bookings and reviews (Empty arrays handled)");

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log("Seed complete!");
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});

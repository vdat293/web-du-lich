const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const CONFIRM_FLAG = '--confirm-reset-bookings';
const COASTAL_PROPERTY_IDS = new Set([
    31, 32, 33, 34, 35, 41, 42, 43, 103, 104, 107, 108,
    113, 114, 115, 116, 117, 118, 119, 120,
]);

if (!process.argv.includes(CONFIRM_FLAG)) {
    console.error(`Refusing to reset demo data. Run with ${CONFIRM_FLAG}.`);
    process.exit(1);
}

const TYPE_OVERRIDES = new Map([
    [34, 'resort'],
    [52, 'resort'],
]);

const PROPERTY_OVERRIDES = new Map([
    [35, { bedrooms: 4, bathrooms: 4, maxGuests: 10, roomSize: 220 }],
    [41, { bedrooms: 5, bathrooms: 5, maxGuests: 12, roomSize: 280 }],
]);

const PRICE_OVERRIDES = new Map([
    [51, 1000000],
    [101, 1200000],
]);

const LOCATION_OVERRIDES = new Map([
    [52, 'TP. Huế, Việt Nam'],
    [53, 'TP. Huế, Việt Nam'],
    [54, 'TP. Huế, Việt Nam'],
    [55, 'TP. Huế, Việt Nam'],
    [101, 'TP. Huế, Việt Nam'],
    [103, 'TP. Đà Nẵng, Việt Nam'],
    [104, 'TP. Đà Nẵng, Việt Nam'],
    [118, 'TP. Hội An, Quảng Nam'],
]);

const AMENITIES = [
    ['Wifi miễn phí', 'wifi', 'Kết nối'],
    ['Máy lạnh', 'ac_unit', 'Tiện nghi phòng'],
    ['Lễ tân 24 giờ', 'support_agent', 'Dịch vụ'],
    ['Dọn phòng hằng ngày', 'cleaning_services', 'Dịch vụ'],
    ['Phòng không hút thuốc', 'smoke_free', 'Tiện nghi phòng'],
    ['Bãi đỗ xe', 'local_parking', 'Tiện nghi chung'],
    ['Nhà hàng', 'restaurant', 'Ẩm thực'],
    ['Bữa sáng', 'breakfast_dining', 'Ẩm thực'],
    ['Hồ bơi', 'pool', 'Giải trí'],
    ['Phòng gym', 'fitness_center', 'Giải trí'],
    ['Spa', 'spa', 'Chăm sóc sức khỏe'],
    ['Đưa đón sân bay', 'airport_shuttle', 'Vận chuyển'],
    ['Dịch vụ giặt ủi', 'local_laundry_service', 'Dịch vụ'],
    ['Phòng gia đình', 'family_restroom', 'Tiện nghi phòng'],
    ['Bếp riêng', 'kitchen', 'Tiện nghi villa'],
    ['Máy giặt', 'local_laundry_service', 'Tiện nghi villa'],
    ['Sân vườn', 'yard', 'Tiện nghi villa'],
    ['Bãi biển riêng', 'beach_access', 'Giải trí'],
];

const roundPrice = (value) => Math.max(100000, Math.round(value / 10000) * 10000);

const normalizeText = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

function makeSearchTags(property, normalizedType, location) {
    const text = normalizeText(`${property.name} ${location} ${normalizedType}`);
    const tags = new Set([normalizedType]);
    if (COASTAL_PROPERTY_IDS.has(Number(property.id)) || /bien|beach|mui ne|nha trang|phu quoc|ha long|quy nhon|vung tau|da nang|hoi an/.test(text)) {
        ['biển', 'bãi biển', 'ven biển', 'beach', 'coastal', 'nghỉ dưỡng biển'].forEach(tag => tags.add(tag));
    }
    if (/phu quoc|dao/.test(text)) ['đảo', 'đảo ngọc', 'island'].forEach(tag => tags.add(tag));
    if (/sapa|da lat|dalat/.test(text)) ['núi', 'cao nguyên', 'khí hậu mát', 'mountain'].forEach(tag => tags.add(tag));
    if (/ha noi|ho chi minh|can tho|hue|hoi an/.test(text)) ['thành phố', 'city break', 'văn hóa'].forEach(tag => tags.add(tag));
    if (normalizedType === 'resort') ['resort', 'nghỉ dưỡng', 'thư giãn'].forEach(tag => tags.add(tag));
    if (normalizedType === 'villa') ['villa', 'biệt thự', 'nguyên căn', 'gia đình', 'nhóm bạn'].forEach(tag => tags.add(tag));
    return [...tags].filter(Boolean);
}

function hotelInventory(basePrice) {
    if (basePrice >= 5000000) return [32, 18, 8];
    if (basePrice >= 2000000) return [28, 16, 7];
    if (basePrice >= 1000000) return [24, 14, 6];
    return [18, 10, 4];
}

function resortInventory(basePrice) {
    if (basePrice >= 5000000) return [36, 24, 12, 6];
    if (basePrice >= 2000000) return [30, 20, 10, 5];
    return [24, 16, 8, 4];
}

function makeRoomTypes(property, normalizedType, basePrice) {
    if (normalizedType === 'villa') {
        const details = PROPERTY_OVERRIDES.get(property.id) || {
            bedrooms: 4,
            bathrooms: 4,
            maxGuests: 10,
            roomSize: 220,
        };
        const kingBeds = Math.max(1, Math.floor(details.bedrooms / 2));
        const queenBeds = details.bedrooms - kingBeds;
        return [{
            name: 'Biệt thự nguyên căn',
            price: basePrice,
            totalAllotment: 1,
            maxAdults: details.maxGuests - 2,
            maxChildren: 2,
            roomSize: details.roomSize,
            bedType: `${kingBeds} giường King + ${queenBeds} giường Queen`,
            bedCount: details.bedrooms,
            bathroomCount: details.bathrooms,
            bedConfiguration: { king: kingBeds, queen: queenBeds },
        }];
    }

    if (normalizedType === 'resort') {
        const inventory = resortInventory(basePrice);
        return [
            ['Deluxe hướng vườn', 1, inventory[0], 2, 1, 38, '1 giường King', 1, 1, { king: 1 }],
            ['Deluxe hướng biển', 1.25, inventory[1], 2, 1, 42, '1 giường King', 1, 1, { king: 1 }],
            ['Family Suite', 1.65, inventory[2], 4, 2, 62, '2 giường Queen', 2, 2, { queen: 2 }],
            ['Pool Villa', 2.4, inventory[3], 4, 2, 95, '2 giường King', 2, 2, { king: 2 }],
        ].map(([name, multiplier, totalAllotment, maxAdults, maxChildren, roomSize, bedType, bedCount, bathroomCount, bedConfiguration]) => ({
            name,
            price: roundPrice(basePrice * multiplier),
            totalAllotment,
            maxAdults,
            maxChildren,
            roomSize,
            bedType,
            bedCount,
            bathroomCount,
            bedConfiguration,
        }));
    }

    const inventory = hotelInventory(basePrice);
    return [
        ['Superior', 1, inventory[0], 2, 1, 24, '1 giường Queen', 1, 1, { queen: 1 }],
        ['Deluxe', 1.3, inventory[1], 2, 1, 32, '1 giường King', 1, 1, { king: 1 }],
        ['Family Suite', 1.7, inventory[2], 4, 2, 46, '2 giường Queen', 2, 2, { queen: 2 }],
    ].map(([name, multiplier, totalAllotment, maxAdults, maxChildren, roomSize, bedType, bedCount, bathroomCount, bedConfiguration]) => ({
        name,
        price: roundPrice(basePrice * multiplier),
        totalAllotment,
        maxAdults,
        maxChildren,
        roomSize,
        bedType,
        bedCount,
        bathroomCount,
        bedConfiguration,
    }));
}

function amenityNamesFor(type, basePrice, isCoastal) {
    const common = [
        'Wifi miễn phí',
        'Máy lạnh',
        'Dọn phòng hằng ngày',
        'Phòng không hút thuốc',
        'Bãi đỗ xe',
    ];

    if (type === 'villa') {
        return [...common, 'Phòng gia đình', 'Bếp riêng', 'Máy giặt', 'Sân vườn', 'Hồ bơi'];
    }

    const hotel = [...common, 'Lễ tân 24 giờ', 'Nhà hàng', 'Bữa sáng', 'Dịch vụ giặt ủi'];
    if (type === 'resort') {
        const resortAmenities = [...hotel, 'Hồ bơi', 'Phòng gym', 'Spa', 'Đưa đón sân bay'];
        return isCoastal ? [...resortAmenities, 'Bãi biển riêng'] : resortAmenities;
    }
    if (basePrice >= 2000000) {
        return [...hotel, 'Hồ bơi', 'Phòng gym', 'Spa', 'Đưa đón sân bay'];
    }
    return hotel;
}

async function columnExists(connection, table, column) {
    const [rows] = await connection.execute(
        `SELECT 1 FROM information_schema.columns
         WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
        [table, column]
    );
    return rows.length > 0;
}

async function indexExists(connection, table, indexName) {
    const [rows] = await connection.execute(
        `SELECT 1 FROM information_schema.statistics
         WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?`,
        [table, indexName]
    );
    return rows.length > 0;
}

async function constraintExists(connection, table, constraintName) {
    const [rows] = await connection.execute(
        `SELECT 1 FROM information_schema.table_constraints
         WHERE table_schema = DATABASE() AND table_name = ? AND constraint_name = ?`,
        [table, constraintName]
    );
    return rows.length > 0;
}

async function ensureColumn(connection, table, column, definition) {
    if (!(await columnExists(connection, table, column))) {
        await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    }
}

async function ensureIndex(connection, table, indexName, columns, unique = false) {
    if (!(await indexExists(connection, table, indexName))) {
        await connection.query(
            `ALTER TABLE \`${table}\` ADD ${unique ? 'UNIQUE ' : ''}INDEX \`${indexName}\` (${columns})`
        );
    }
}

async function ensureCheck(connection, table, constraintName, expression) {
    if (!(await constraintExists(connection, table, constraintName))) {
        await connection.query(
            `ALTER TABLE \`${table}\` ADD CONSTRAINT \`${constraintName}\` CHECK (${expression})`
        );
    }
}

async function ensureSchema(connection) {
    await ensureColumn(connection, 'room_types', 'bed_count', 'INT NULL AFTER `bed_type`');
    await ensureColumn(connection, 'room_types', 'bathroom_count', 'INT NULL AFTER `bed_count`');
    await ensureColumn(connection, 'room_types', 'bed_configuration', 'JSON NULL AFTER `bathroom_count`');
    await ensureColumn(connection, 'room_types', 'is_active', 'TINYINT(1) NOT NULL DEFAULT 1 AFTER `bed_configuration`');
    await ensureColumn(connection, 'bookings', 'actual_check_out', 'DATE NULL AFTER `check_out`');
    await ensureColumn(connection, 'guest_bookings', 'payment_method', "VARCHAR(50) DEFAULT 'momo'");
    await ensureColumn(connection, 'guest_bookings', 'status', "VARCHAR(50) DEFAULT 'pending'");
    await ensureColumn(connection, 'properties', 'search_tags', 'JSON NULL AFTER `max_guests`');
}

async function addDataConstraints(connection) {
    await ensureIndex(connection, 'room_types', 'uniq_room_types_property_name', '`property_id`, `name`', true);
    await ensureIndex(connection, 'property_images', 'uniq_property_images_property_url', '`property_id`, `image_url`', true);
    await ensureIndex(connection, 'payments', 'uniq_payments_booking', '`booking_id`', true);
    await ensureCheck(connection, 'room_types', 'chk_room_types_price', '`price` > 0');
    await ensureCheck(connection, 'room_types', 'chk_room_types_allotment', '`total_allotment` > 0');
    await ensureCheck(connection, 'room_types', 'chk_room_types_capacity', '`max_adults` > 0 AND `max_children` >= 0');
    await ensureCheck(connection, 'room_types', 'chk_room_types_details', '`room_size` > 0 AND `bed_count` > 0 AND `bathroom_count` > 0');
    await ensureCheck(connection, 'bookings', 'chk_bookings_dates', '`check_out` > `check_in`');
    await ensureCheck(connection, 'bookings', 'chk_bookings_room_count', '`number_of_rooms` > 0');
    await ensureCheck(connection, 'bookings', 'chk_bookings_total_price', '`total_price` > 0');
}

async function resetAutoIncrement(connection, tables) {
    for (const table of tables) {
        await connection.query(`ALTER TABLE \`${table}\` AUTO_INCREMENT = 1`);
    }
}

async function cleanDemoDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
        multipleStatements: false,
    });

    try {
        await ensureSchema(connection);
        const [properties] = await connection.query(
            'SELECT id, name, type, location, price_display, description FROM properties ORDER BY id'
        );

        await connection.beginTransaction();
        try {
            const transientTables = [
                'booking_coupons',
                'booking_status_history',
                'reviews',
                'payments',
                'messages',
                'conversations',
                'guest_bookings',
                'bookings',
                'wishlists',
                'magic_links',
                'verification_otps',
                'system_emails',
                'system_sms',
                'sandbox_otp_logs',
                'activity_logs',
                'site_visits',
            ];

            for (const table of transientTables) {
                await connection.query(`DELETE FROM \`${table}\``);
            }

            await connection.query('DELETE FROM property_amenities');
            await connection.query('DELETE FROM amenities');
            await connection.query('DELETE FROM room_types');

            await connection.query(`
                DELETE duplicate_image
                FROM property_images duplicate_image
                JOIN property_images original_image
                  ON original_image.property_id = duplicate_image.property_id
                 AND original_image.image_url = duplicate_image.image_url
                 AND original_image.id < duplicate_image.id
            `);

            const [images] = await connection.query(
                'SELECT id, property_id, is_main FROM property_images ORDER BY property_id, is_main DESC, id'
            );
            const mainImageByProperty = new Map();
            for (const image of images) {
                if (!mainImageByProperty.has(image.property_id)) {
                    mainImageByProperty.set(image.property_id, image.id);
                }
            }
            await connection.query('UPDATE property_images SET is_main = 0');
            for (const imageId of mainImageByProperty.values()) {
                await connection.execute('UPDATE property_images SET is_main = 1 WHERE id = ?', [imageId]);
            }

            const amenityIdByName = new Map();
            for (const [index, [name, icon, category]] of AMENITIES.entries()) {
                const amenityId = index + 1;
                const [result] = await connection.execute(
                    'INSERT INTO amenities (id, name, icon, category) VALUES (?, ?, ?, ?)',
                    [amenityId, name, icon, category]
                );
                amenityIdByName.set(name, result.insertId || amenityId);
            }

            let insertedRooms = 0;
            for (const property of properties) {
                const normalizedType = TYPE_OVERRIDES.get(property.id) || property.type || 'hotel';
                const basePrice = roundPrice(
                    PRICE_OVERRIDES.get(property.id) || Number(property.price_display) || 1000000
                );
                const roomTypes = makeRoomTypes(property, normalizedType, basePrice);
                const maxRoomGuests = Math.max(...roomTypes.map(room => room.maxAdults + room.maxChildren));
                const maxBedCount = Math.max(...roomTypes.map(room => room.bedCount));
                const maxBathroomCount = Math.max(...roomTypes.map(room => room.bathroomCount));
                const villaDetails = PROPERTY_OVERRIDES.get(property.id);
                const bedrooms = villaDetails?.bedrooms || maxBedCount;
                const bathrooms = villaDetails?.bathrooms || maxBathroomCount;
                const maxGuests = villaDetails?.maxGuests || maxRoomGuests;
                const location = LOCATION_OVERRIDES.get(property.id) || property.location;
                const searchTags = makeSearchTags(property, normalizedType, location);
                const description = String(property.description || '').trim() ||
                    `${property.name} là lựa chọn lưu trú tại ${location}, phù hợp cho chuyến đi nghỉ dưỡng và công tác.`;

                await connection.execute(
                    `UPDATE properties
                     SET type = ?, location = ?, price_display = ?, description = ?,
                         bedrooms = ?, bathrooms = ?, max_guests = ?, search_tags = ?
                     WHERE id = ?`,
                    [
                        normalizedType, location, basePrice, description, bedrooms, bathrooms,
                        maxGuests, JSON.stringify(searchTags), property.id,
                    ]
                );

                for (const [roomIndex, room] of roomTypes.entries()) {
                    const roomTypeId = property.id * 10 + roomIndex + 1;
                    await connection.execute(
                        `INSERT INTO room_types
                         (id, property_id, name, price, total_allotment, max_adults, max_children,
                          room_size, bed_type, bed_count, bathroom_count, bed_configuration, is_active)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
                        [
                            roomTypeId,
                            property.id,
                            room.name,
                            room.price,
                            room.totalAllotment,
                            room.maxAdults,
                            room.maxChildren,
                            room.roomSize,
                            room.bedType,
                            room.bedCount,
                            room.bathroomCount,
                            JSON.stringify(room.bedConfiguration),
                        ]
                    );
                    insertedRooms++;
                }

                const isCoastal = searchTags.includes('biển');
                for (const amenityName of amenityNamesFor(normalizedType, basePrice, isCoastal)) {
                    await connection.execute(
                        'INSERT INTO property_amenities (property_id, amenity_id) VALUES (?, ?)',
                        [property.id, amenityIdByName.get(amenityName)]
                    );
                }
            }

            await connection.commit();
            console.log(`Reset ${properties.length} properties and inserted ${insertedRooms} deterministic room types.`);
        } catch (error) {
            await connection.rollback();
            throw error;
        }

        await resetAutoIncrement(connection, [
            'bookings',
            'reviews',
            'payments',
            'booking_status_history',
            'guest_bookings',
            'conversations',
            'messages',
            'room_types',
            'amenities',
            'magic_links',
            'verification_otps',
            'system_emails',
            'system_sms',
            'sandbox_otp_logs',
            'activity_logs',
            'site_visits',
        ]);
        await addDataConstraints(connection);

        const [summary] = await connection.query(`
            SELECT
                (SELECT COUNT(*) FROM properties) AS properties,
                (SELECT COUNT(*) FROM room_types) AS room_types,
                (SELECT COUNT(*) FROM amenities) AS amenities,
                (SELECT COUNT(*) FROM property_amenities) AS property_amenities,
                (SELECT COUNT(*) FROM bookings) AS bookings,
                (SELECT COUNT(*) FROM payments) AS payments
        `);
        console.log('Cleanup summary:', summary[0]);
    } finally {
        await connection.end();
    }
}

cleanDemoDatabase().catch(error => {
    console.error('Demo database cleanup failed:', error);
    process.exit(1);
});

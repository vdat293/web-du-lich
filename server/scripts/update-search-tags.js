const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const COASTAL_PROPERTY_IDS = new Set([
    31, 32, 33, 34, 35, 41, 42, 43, 103, 104, 107, 108,
    113, 114, 115, 116, 117, 118, 119, 120,
]);

const normalizeText = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

function buildTags(property) {
    const text = normalizeText(`${property.name} ${property.location} ${property.type}`);
    const tags = new Set([property.type]);
    if (COASTAL_PROPERTY_IDS.has(Number(property.id)) || /bien|beach|mui ne|nha trang|phu quoc|ha long|quy nhon|vung tau|da nang|hoi an/.test(text)) {
        ['biển', 'bãi biển', 'ven biển', 'beach', 'coastal', 'nghỉ dưỡng biển'].forEach(tag => tags.add(tag));
    }
    if (/phu quoc|dao/.test(text)) ['đảo', 'đảo ngọc', 'island'].forEach(tag => tags.add(tag));
    if (/sapa|da lat|dalat/.test(text)) ['núi', 'cao nguyên', 'khí hậu mát', 'mountain'].forEach(tag => tags.add(tag));
    if (/ha noi|ho chi minh|can tho|hue|hoi an/.test(text)) ['thành phố', 'city break', 'văn hóa'].forEach(tag => tags.add(tag));
    if (property.type === 'resort') ['resort', 'nghỉ dưỡng', 'thư giãn'].forEach(tag => tags.add(tag));
    if (property.type === 'villa') ['villa', 'biệt thự', 'nguyên căn', 'gia đình', 'nhóm bạn'].forEach(tag => tags.add(tag));
    return [...tags].filter(Boolean);
}

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
    });
    try {
        const [columns] = await connection.execute(`
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'properties' AND column_name = 'search_tags'
        `);
        if (columns.length === 0) {
            await connection.query('ALTER TABLE properties ADD COLUMN search_tags JSON NULL AFTER max_guests');
        }
        const [properties] = await connection.query('SELECT id, name, location, type FROM properties ORDER BY id');
        for (const property of properties) {
            await connection.execute(
                'UPDATE properties SET search_tags = ? WHERE id = ?',
                [JSON.stringify(buildTags(property)), property.id]
            );
        }
        const [beachAmenities] = await connection.execute(
            "SELECT id FROM amenities WHERE name = 'Bãi biển riêng' LIMIT 1"
        );
        if (beachAmenities.length > 0) {
            const coastalIds = [...COASTAL_PROPERTY_IDS];
            await connection.query(
                `DELETE FROM property_amenities
                 WHERE amenity_id = ? AND property_id NOT IN (${coastalIds.map(() => '?').join(',')})`,
                [beachAmenities[0].id, ...coastalIds]
            );
        }
        console.log(`Updated search tags for ${properties.length} properties.`);
    } finally {
        await connection.end();
    }
}

run().catch(error => {
    console.error('Search tag update failed:', error);
    process.exit(1);
});

import { NextResponse } from 'next/server';
import db from '../../../lib/db';

export async function GET(req) {
    try {
        const [properties] = await db.execute(`
            SELECT p.*, u.name as host_name, u.avatar as host_avatar, u.role as host_role
            FROM properties p
            LEFT JOIN users u ON p.host_id = u.id
        `);

        // Fetch other relations like images, amenities, room plans
        const propertiesWithDetails = await Promise.all(properties.map(async (p) => {
            const [images] = await db.execute('SELECT * FROM property_images WHERE property_id = ?', [p.id]);
            const [amenitiesResult] = await db.execute(`
                SELECT a.* 
                FROM amenities a
                JOIN property_amenities pa ON a.id = pa.amenity_id
                WHERE pa.property_id = ?
            `, [p.id]);
            const [rooms] = await db.execute('SELECT * FROM room_types WHERE property_id = ?', [p.id]);

            const mainImage = images.find(img => img.is_main) || images[0];
            const galleryImages = images.filter(img => !mainImage || img.id !== mainImage.id).map(img => img.image_url);

            return {
                id: p.id,
                name: p.name,
                type: p.type,
                location: p.location,
                price: p.price_display ? p.price_display.toLocaleString('vi-VN') + '₫' : 'Liên hệ',
                rating: 4.8,
                reviews: Math.floor(Math.random() * 500) + 50,
                host: {
                    name: p.host_name || 'Unknown',
                    avatar: p.host_avatar || '',
                    superhost: p.host_role === 'host',
                },
                bedrooms: 3, // mock data or we could calculate if needed
                bathrooms: 2, // mock data or we could calculate if needed
                maxGuests: rooms.length > 0 ? rooms[0].max_adults : 2,
                isHot: p.is_hot,
                description: p.description,
                images: {
                    main: mainImage ? mainImage.image_url : '',
                    gallery: galleryImages.length ? galleryImages : []
                },
                amenities: amenitiesResult,
                detailedAmenities: [],
                rooms: rooms,
                mapImage: p.map_image,
                mapEmbed: p.map_embed
            };
        }));

        return NextResponse.json(propertiesWithDetails);
    } catch (err) {
        console.error('Lỗi khi lấy properties:', err);
        return NextResponse.json({ message: 'Lỗi server !', error: String(err) }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

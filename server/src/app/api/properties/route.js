import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import { toAbsoluteMediaUrl } from '../../../lib/http';
import { parseSearchTags } from '../../../lib/search-tags';

const ACTIVE_BOOKING_STATUSES = ['pending', 'paid', 'confirmed', 'checked_in'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseOptionalNumber(value, name) {
    if (value == null || value === '') return null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error(`${name} khong hop le.`);
    }
    return parsed;
}

function toDateKey(value) {
    if (typeof value === 'string') return value.slice(0, 10);
    return new Date(value).toISOString().slice(0, 10);
}

function roomIsAvailable(room, bookings, checkIn, checkOut) {
    const occupancy = new Map();
    const rangeStart = new Date(`${checkIn}T00:00:00Z`);
    const rangeEnd = new Date(`${checkOut}T00:00:00Z`);

    for (const booking of bookings) {
        const bookingStart = new Date(`${toDateKey(booking.check_in)}T00:00:00Z`);
        const bookingEnd = new Date(`${toDateKey(booking.check_out)}T00:00:00Z`);
        const overlapStart = bookingStart > rangeStart ? bookingStart : rangeStart;
        const overlapEnd = bookingEnd < rangeEnd ? bookingEnd : rangeEnd;

        for (const day = new Date(overlapStart); day < overlapEnd; day.setUTCDate(day.getUTCDate() + 1)) {
            const key = day.toISOString().slice(0, 10);
            occupancy.set(key, (occupancy.get(key) || 0) + Number(booking.number_of_rooms));
        }
    }

    for (const day = new Date(rangeStart); day < rangeEnd; day.setUTCDate(day.getUTCDate() + 1)) {
        if ((occupancy.get(day.toISOString().slice(0, 10)) || 0) >= Number(room.total_allotment)) {
            return false;
        }
    }
    return true;
}

export async function GET(req) {
    try {
        const params = req.nextUrl.searchParams;
        const checkIn = params.get('check_in');
        const checkOut = params.get('check_out');
        const guests = parseOptionalNumber(params.get('guests'), 'So khach');
        const minPrice = parseOptionalNumber(params.get('min_price'), 'Gia toi thieu');
        const maxPrice = parseOptionalNumber(params.get('max_price'), 'Gia toi da');
        const type = params.get('type')?.trim() || '';
        const amenityIds = (params.get('amenities') || '')
            .split(',')
            .filter(Boolean)
            .map(Number);

        if ((checkIn || checkOut) && (!checkIn || !checkOut || !DATE_PATTERN.test(checkIn) || !DATE_PATTERN.test(checkOut) || checkOut <= checkIn)) {
            return NextResponse.json({ message: 'Khoang ngay khong hop le.' }, { status: 400 });
        }
        if (guests !== null && (!Number.isInteger(guests) || guests < 1)) {
            return NextResponse.json({ message: 'So khach phai la so nguyen lon hon 0.' }, { status: 400 });
        }
        if (amenityIds.some(id => !Number.isInteger(id) || id < 1)) {
            return NextResponse.json({ message: 'Tien nghi khong hop le.' }, { status: 400 });
        }
        if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
            return NextResponse.json({ message: 'Gia toi thieu khong duoc lon hon gia toi da.' }, { status: 400 });
        }

        const propertyWhere = ["p.status = 'active'"];
        const propertyValues = [];
        if (type) {
            propertyWhere.push('p.type = ?');
            propertyValues.push(type);
        }

        const [properties] = await db.execute(`
            SELECT p.*, u.name as host_name, u.avatar as host_avatar, u.role as host_role
            FROM properties p
            LEFT JOIN users u ON p.host_id = u.id
            WHERE ${propertyWhere.join(' AND ')}
            ORDER BY p.is_hot DESC, p.created_at DESC
        `, propertyValues);

        const detailedProperties = await Promise.all(properties.map(async (property) => {
            const [images] = await db.execute('SELECT * FROM property_images WHERE property_id = ?', [property.id]);
            const [amenities] = await db.execute(`
                SELECT a.*
                FROM amenities a
                JOIN property_amenities pa ON a.id = pa.amenity_id
                WHERE pa.property_id = ?
            `, [property.id]);

            if (amenityIds.length && !amenityIds.every(id => amenities.some(amenity => Number(amenity.id) === id))) {
                return null;
            }

            const roomWhere = ['property_id = ?', 'is_active = 1'];
            const roomValues = [property.id];
            if (guests !== null) {
                roomWhere.push('(max_adults + max_children) >= ?');
                roomValues.push(guests);
            }
            if (minPrice !== null) {
                roomWhere.push('price >= ?');
                roomValues.push(minPrice);
            }
            if (maxPrice !== null) {
                roomWhere.push('price <= ?');
                roomValues.push(maxPrice);
            }

            const [roomRows] = await db.execute(
                `SELECT * FROM room_types WHERE ${roomWhere.join(' AND ')} ORDER BY price ASC`,
                roomValues
            );
            let rooms = roomRows;

            if (checkIn && checkOut && rooms.length) {
                const roomIds = rooms.map(room => Number(room.id));
                const placeholders = roomIds.map(() => '?').join(',');
                const statuses = ACTIVE_BOOKING_STATUSES.map(() => '?').join(',');
                const bookingParams = [...roomIds, ...ACTIVE_BOOKING_STATUSES, checkOut, checkIn];
                const [bookings] = await db.execute(`
                    SELECT room_type_id, check_in, check_out, number_of_rooms
                    FROM bookings
                    WHERE room_type_id IN (${placeholders})
                      AND status IN (${statuses})
                      AND check_in < ? AND check_out > ?
                    UNION ALL
                    SELECT room_type_id, check_in, check_out, number_of_rooms
                    FROM guest_bookings
                    WHERE room_type_id IN (${placeholders})
                      AND status IN (${statuses})
                      AND check_in < ? AND check_out > ?
                `, [...bookingParams, ...bookingParams]);

                rooms = rooms.filter(room => roomIsAvailable(
                    room,
                    bookings.filter(booking => Number(booking.room_type_id) === Number(room.id)),
                    checkIn,
                    checkOut
                ));
            }

            if (!rooms.length) return null;

            const [reviewStats] = await db.execute(`
                SELECT COUNT(*) as total_reviews, COALESCE(AVG(rating), 0) as avg_rating
                FROM reviews WHERE property_id = ?
            `, [property.id]);

            const mainImage = images.find(image => image.is_main) || images[0];
            const galleryImages = images
                .filter(image => !mainImage || image.id !== mainImage.id)
                .map(image => toAbsoluteMediaUrl(req, image.image_url));
            const lowestRoomPrice = Number(rooms[0].price);
            const maxGuests = rooms.reduce(
                (max, room) => Math.max(max, Number(room.max_adults) + Number(room.max_children)),
                0
            );
            const maxBedrooms = rooms.reduce((max, room) => Math.max(max, Number(room.bed_count) || 0), 0);
            const maxBathrooms = rooms.reduce((max, room) => Math.max(max, Number(room.bathroom_count) || 0), 0);

            return {
                id: property.id,
                name: property.name,
                type: property.type,
                location: property.location,
                price: lowestRoomPrice.toLocaleString('vi-VN') + '₫',
                rating: parseFloat(Number(reviewStats[0].avg_rating).toFixed(1)),
                reviews: Number(reviewStats[0].total_reviews),
                host: {
                    name: property.host_name || 'Unknown',
                    avatar: toAbsoluteMediaUrl(req, property.host_avatar),
                    superhost: property.host_role === 'host',
                },
                bedrooms: Number(property.bedrooms) || maxBedrooms,
                bathrooms: Number(property.bathrooms) || maxBathrooms,
                maxGuests: maxGuests || Number(property.max_guests),
                isHot: property.is_hot,
                description: property.description,
                searchTags: parseSearchTags(property.search_tags),
                images: {
                    main: mainImage ? toAbsoluteMediaUrl(req, mainImage.image_url) : '',
                    gallery: galleryImages,
                },
                amenities,
                detailedAmenities: [],
                rooms: rooms.map(room => ({
                    id: room.id,
                    name: room.name,
                    price: Number(room.price),
                    total_allotment: room.total_allotment,
                    max_adults: room.max_adults,
                    max_children: room.max_children,
                    room_size: room.room_size,
                    bed_type: room.bed_type,
                    bed_count: room.bed_count,
                    bathroom_count: room.bathroom_count,
                    bed_configuration: room.bed_configuration,
                })),
                mapImage: toAbsoluteMediaUrl(req, property.map_image),
                mapEmbed: property.map_embed,
            };
        }));

        return NextResponse.json(detailedProperties.filter(Boolean));
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const isValidationError = message.endsWith('khong hop le.');
        console.error('Loi khi lay properties:', error);
        return NextResponse.json(
            { message: isValidationError ? message : 'Loi server!', error: message },
            { status: isValidationError ? 400 : 500 }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

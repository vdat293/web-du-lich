/**
 * Check room availability inside an existing transaction.
 */
export async function checkRoomAvailability(
    connection,
    roomTypeId,
    checkInDate,
    checkOutDate,
    numRoomsRequested = 1,
    expectedPropertyId = null
) {
    const requestedRooms = Number(numRoomsRequested);
    if (!Number.isInteger(requestedRooms) || requestedRooms < 1) {
        return { isAvailable: false, message: 'So luong phong phai la so nguyen lon hon 0.' };
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(checkInDate) || !datePattern.test(checkOutDate)) {
        return { isAvailable: false, message: 'Ngay nhan phong hoac tra phong khong hop le.' };
    }

    const startDate = new Date(`${checkInDate}T00:00:00Z`);
    const endDate = new Date(`${checkOutDate}T00:00:00Z`);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
        return { isAvailable: false, message: 'Ngay tra phong phai sau ngay nhan phong.' };
    }

    const [rooms] = await connection.execute(
        `SELECT id, property_id, name, price, total_allotment, is_active
         FROM room_types
         WHERE id = ?
         FOR UPDATE`,
        [roomTypeId]
    );

    if (rooms.length === 0) {
        return { isAvailable: false, message: 'Loai phong khong ton tai.' };
    }

    const roomType = rooms[0];
    const totalAllotment = Number(roomType.total_allotment);

    if (!roomType.is_active) {
        return { isAvailable: false, message: 'Loai phong nay hien khong mo ban.' };
    }

    if (expectedPropertyId !== null && Number(roomType.property_id) !== Number(expectedPropertyId)) {
        return { isAvailable: false, message: 'Loai phong khong thuoc cho nghi da chon.' };
    }

    if (requestedRooms > totalAllotment) {
        return {
            isAvailable: false,
            message: `Loai phong "${roomType.name}" chi co ${totalAllotment} phong.`,
        };
    }

    const [existingBookings] = await connection.execute(
        `SELECT check_in, check_out, number_of_rooms
         FROM bookings
         WHERE room_type_id = ?
           AND status IN ('pending', 'paid', 'confirmed', 'checked_in')
           AND check_in < ?
           AND check_out > ?
         UNION ALL
         SELECT check_in, check_out, number_of_rooms
         FROM guest_bookings
         WHERE room_type_id = ?
           AND status IN ('pending', 'paid', 'confirmed', 'checked_in')
           AND check_in < ?
           AND check_out > ?`,
        [roomTypeId, checkOutDate, checkInDate, roomTypeId, checkOutDate, checkInDate]
    );

    const occupancyMap = {};
    for (const booking of existingBookings) {
        const bookingStart = new Date(booking.check_in);
        const bookingEnd = new Date(booking.check_out);
        bookingStart.setUTCHours(0, 0, 0, 0);
        bookingEnd.setUTCHours(0, 0, 0, 0);

        const overlapStart = bookingStart > startDate ? bookingStart : startDate;
        const overlapEnd = bookingEnd < endDate ? bookingEnd : endDate;
        const currentDate = new Date(overlapStart);

        while (currentDate < overlapEnd) {
            const dateString = currentDate.toISOString().split('T')[0];
            occupancyMap[dateString] =
                (occupancyMap[dateString] || 0) + Number(booking.number_of_rooms);
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
    }

    const currentDate = new Date(startDate);
    while (currentDate < endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        const bookedSoFar = occupancyMap[dateString] || 0;
        if (bookedSoFar + requestedRooms > totalAllotment) {
            const [year, month, day] = dateString.split('-');
            return {
                isAvailable: false,
                message: `Ngay ${day}/${month}/${year} chi con ${totalAllotment - bookedSoFar} phong.`,
            };
        }
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return {
        isAvailable: true,
        nights: Math.round((endDate - startDate) / 86400000),
        roomType,
    };
}

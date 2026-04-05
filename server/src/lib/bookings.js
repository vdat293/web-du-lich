// server/src/lib/bookings.js

/**
 * Kiểm tra tính khả dụng của loại phòng theo từng ngày.
 * Hàm này PHẢI ĐƯỢC CHẠY BÊN TRONG MỘT TRANSACTION thông qua việc cung cấp 'connection'.
 *
 * @param {Object} connection - Đối tượng mysql2 connection đã beginTransaction()
 * @param {number} roomTypeId - ID của loại phòng cần kiểm tra
 * @param {string} checkInDate - Chuỗi ngày Check-in (YYYY-MM-DD)
 * @param {string} checkOutDate - Chuỗi ngày Check-out (YYYY-MM-DD)
 * @param {number} numRoomsRequested - Số lượng phòng khách hàng muốn đặt
 * @returns {Promise<{ isAvailable: boolean, message?: string }>} - Kết quả kiểm tra
 */
export async function checkRoomAvailability(connection, roomTypeId, checkInDate, checkOutDate, numRoomsRequested = 1) {
    try {
        // 1. Khóa hàng của room_types tương ứng (Row-Level Locking) để xử lý concurrency
        const [rooms] = await connection.execute(
            'SELECT name, total_allotment FROM room_types WHERE id = ? FOR UPDATE',
            [roomTypeId]
        );

        if (rooms.length === 0) {
            return { isAvailable: false, message: 'Loại phòng không tồn tại.' };
        }

        const roomType = rooms[0];
        const totalAllotment = roomType.total_allotment;

        // Nếu bản thân số lượng yêu cầu lớn hơn tổng khả năng chứa thì từ chối ngay.
        if (numRoomsRequested > totalAllotment) {
            return { isAvailable: false, message: `Loại phòng "${roomType.name}" chỉ có tổng cộng ${totalAllotment} phòng. Bạn không thể đặt ${numRoomsRequested} phòng.` };
        }

        // 2. Lấy tất cả các booking đang chiếm phòng giao thoa với khoảng thời gian yêu cầu
        // Tức là: booking có check_in < checkOutDate VÀ check_out > checkInDate
        // Tính cả booking đã confirmed, completed, và pending (đang chờ duyệt/thanh toán)
        const [existingBookings] = await connection.execute(
            `SELECT check_in, check_out, number_of_rooms 
             FROM bookings 
             WHERE room_type_id = ? 
             AND status IN ('pending', 'confirmed', 'completed')
             AND check_in < ? 
             AND check_out > ?`,
            [roomTypeId, checkOutDate, checkInDate]
        );

        // 3. Logic ngày tháng (Tính theo từng ngày một)
        // Chuyển đối số sang object Date, đảm bảo midnight giờ UTC
        const startDate = new Date(checkInDate + 'T00:00:00Z');
        const endDate = new Date(checkOutDate + 'T00:00:00Z');
        
        // Tạo một map để đếm số phòng đã đặt cho từng ngày
        const occupancyMap = {};

        // Đếm từ existing bookings
        for (const booking of existingBookings) {
            const bCheckIn = new Date(booking.check_in);
            const bCheckOut = new Date(booking.check_out);
            
            // Reset giờ về midnight để so sánh chính xác theo ngày
            bCheckIn.setUTCHours(0,0,0,0);
            bCheckOut.setUTCHours(0,0,0,0);

            // Tìm khoảng giao nhau
            const startOverlap = bCheckIn > startDate ? bCheckIn : startDate;
            const endOverlap = bCheckOut < endDate ? bCheckOut : endDate;

            // Chạy qua từng ngày trong khoảng giao thoa
            let currentDate = new Date(startOverlap);
            while (currentDate < endOverlap) {
                const dateString = currentDate.toISOString().split('T')[0];
                occupancyMap[dateString] = (occupancyMap[dateString] || 0) + booking.number_of_rooms;
                
                // Tăng 1 ngày
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        // 4. Kiểm tra sức chứa cho từng ngày
        let currentDate = new Date(startDate);
        while (currentDate < endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            const bookedSoFar = occupancyMap[dateString] || 0;
            
            if (bookedSoFar + numRoomsRequested > totalAllotment) {
                // Chuyển đổi date string (YYYY-MM-DD) về mảng [YYYY, MM, DD] để hiển thị
                const parts = dateString.split('-');
                const displayDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
                
                return { 
                    isAvailable: false, 
                    message: `Ngày ${displayDate} phòng "${roomType.name}" đã hết (chỉ còn ${totalAllotment - bookedSoFar} phòng trống).` 
                };
            }
            // Tăng 1 ngày
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Tất cả các ngày đều hợp lệ
        return { isAvailable: true };

    } catch (error) {
        console.error('Lỗi khi kiểm tra tính khả dụng:', error);
        throw error;
    }
}

# 🗄️ Database Tutorial — Project Web Du Lịch

> Hướng dẫn chi tiết về cơ sở dữ liệu, cách vận hành, và các query mẫu trong project.

---

## 📑 Mục lục

- [Tổng quan](#-tổng-quan)
- [Cấu hình kết nối](#-cấu-hình-kết-nối)
- [Các lệnh quản lý DB](#-các-lệnh-quản-lý-database)
- [Cấu trúc bảng](#-cấu-trúc-các-bảng)
- [Sơ đồ quan hệ (ERD)](#-sơ-đồ-quan-hệ-erd)
- [API Endpoints & Query mẫu](#-api-endpoints--query-mẫu)
- [Flow nghiệp vụ](#-flow-nghiệp-vụ)
- [Ghi chú kỹ thuật](#-ghi-chú-kỹ-thuật)

---

## 🔍 Tổng quan

Project sử dụng **MySQL** làm cơ sở dữ liệu chính, kết nối qua thư viện `mysql2/promise` với **Connection Pool**.

- **Database mặc định**: `web_du_lich`
- **Connection Pool**: Tối đa 10 kết nối đồng thời
- **Hot Reload Safe**: Dùng `global.mysqlPool` trong dev mode để tránh tràn kết nối khi Next.js hot reload

---

## ⚙️ Cấu hình kết nối

### File `.env` (server/)

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=web_du_lich
JWT_SECRET=your_jwt_secret_key_here
```

### File `src/lib/db.js`

```javascript
const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'web_du_lich',
    waitForConnections: true,
    connectionLimit: 10,    // Tối đa 10 connection cùng lúc
    queueLimit: 0           // Không giới hạn queue
};

// Dev mode: dùng global var để tránh tràn pool khi hot reload
let pool;
if (process.env.NODE_ENV === 'production') {
    pool = mysql.createPool(dbConfig);
} else {
    if (!global.mysqlPool) {
        global.mysqlPool = mysql.createPool(dbConfig);
    }
    pool = global.mysqlPool;
}
```

### Sử dụng trong API Route

```javascript
import db from '../../../../lib/db';

// SELECT
const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);

// INSERT
const [result] = await db.execute(
    'INSERT INTO bookings (customer_id, property_id) VALUES (?, ?)',
    [userId, propertyId]
);
const newId = result.insertId;

// UPDATE
await db.execute('UPDATE users SET name = ? WHERE id = ?', [name, userId]);

// DELETE
await db.execute('DELETE FROM wishlists WHERE user_id = ? AND property_id = ?', [userId, propertyId]);
```

---

## 🛠️ Các lệnh quản lý Database

> ⚠️ **Bật MySQL trong XAMPP/WAMP trước khi chạy các lệnh!**

| Lệnh | Mô tả | Khi nào dùng |
|-------|--------|--------------|
| `npm run db:init` | Tạo bảng từ `schema.sql` | Lần đầu setup, hoặc muốn reset schema |
| `npm run db:import` | Nhập data từ `database-dump.sql` | Khi pull code mới từ Git |
| `npm run db:export` | Xuất toàn bộ DB → `database-dump.sql` | Sau khi thêm/sửa data, trước khi push |

### Flow đồng bộ data giữa các thành viên

```
Người thay đổi data            Thành viên khác
─────────────────               ──────────────
npm run db:export               git pull
git add database-dump.sql       npm run db:import
git commit -m "data mới"        ✅ Data đã đồng bộ
git push
```

---

## 📊 Cấu trúc các bảng

### 1. `users` — Người dùng

Lưu tất cả người dùng: khách hàng, chủ nhà (host), quản trị viên (admin).

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| `id` | INT | PK, AUTO_INCREMENT | ID tự động tăng |
| `name` | VARCHAR(255) | NOT NULL | Họ tên |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Email (duy nhất) |
| `password` | VARCHAR(255) | NOT NULL | Mật khẩu đã mã hoá bcrypt |
| `avatar` | VARCHAR(255) | DEFAULT | URL ảnh đại diện |
| `role` | VARCHAR(50) | DEFAULT 'customer' | Vai trò: `customer`, `host`, `admin` |
| `phone` | VARCHAR(20) | NULL | Số điện thoại |
| `created_at` | TIMESTAMP | DEFAULT NOW | Thời gian tạo |

---

### 2. `properties` — Bất động sản / Khách sạn

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| `id` | INT | PK, AUTO_INCREMENT | |
| `host_id` | INT | FK → `users.id`, CASCADE | Chủ property |
| `name` | VARCHAR(255) | NOT NULL | Tên hiển thị |
| `type` | VARCHAR(50) | | Loại: hotel, villa, apartment, resort... |
| `location` | VARCHAR(255) | NOT NULL | Địa chỉ |
| `price_display` | DECIMAL(15,0) | | Giá hiển thị (VNĐ) |
| `description` | TEXT | | Mô tả chi tiết |
| `map_image` | VARCHAR(255) | | URL ảnh bản đồ |
| `map_embed` | TEXT | | Embed code Google Maps |
| `is_hot` | BOOLEAN | DEFAULT FALSE | Đánh dấu nổi bật |
| `created_at` | TIMESTAMP | DEFAULT NOW | |

**Quan hệ**: 1 Property → nhiều Images, Room Types, Amenities, Reviews, Rules

---

### 3. `property_images` — Hình ảnh Property

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| `id` | INT | PK | |
| `property_id` | INT | FK → `properties.id`, CASCADE | |
| `image_url` | VARCHAR(255) | NOT NULL | URL ảnh |
| `is_main` | BOOLEAN | DEFAULT FALSE | Ảnh chính (thumbnail) |

---

### 4. `amenities` — Tiện nghi

Danh sách master tiện nghi (wifi, pool, parking, spa...).

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| `id` | INT | PK | |
| `name` | VARCHAR(100) | NOT NULL | Tên tiện nghi |
| `icon` | VARCHAR(50) | | Icon name |
| `category` | VARCHAR(100) | | Phân loại (cơ bản, cao cấp...) |

---

### 5. `property_amenities` — Liên kết Property ↔ Amenities

Bảng trung gian **many-to-many**.

| Column | Type | Constraint |
|--------|------|------------|
| `property_id` | INT | FK → `properties.id`, CASCADE |
| `amenity_id` | INT | FK → `amenities.id`, CASCADE |

> **Primary Key kép**: (property_id, amenity_id)

---

### 6. `room_types` — Loại phòng

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| `id` | INT | PK | |
| `property_id` | INT | FK → `properties.id`, CASCADE | |
| `name` | VARCHAR(255) | NOT NULL | Tên loại phòng |
| `price` | DECIMAL(15,0) | NOT NULL | Giá phòng / đêm (VNĐ) |
| `total_allotment` | INT | NOT NULL | Tổng số phòng có |
| `max_adults` | INT | DEFAULT 2 | Số người lớn tối đa |
| `max_children` | INT | DEFAULT 1 | Số trẻ em tối đa |
| `room_size` | INT | | Diện tích (m²) |
| `bed_type` | VARCHAR(100) | | Loại giường |
| `created_at` | TIMESTAMP | DEFAULT NOW | |

---

### 7. `bookings` — Đặt phòng

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| `id` | INT | PK | |
| `customer_id` | INT | FK → `users.id`, CASCADE | Người đặt |
| `property_id` | INT | FK → `properties.id`, CASCADE | |
| `room_type_id` | INT | FK → `room_types.id`, CASCADE | |
| `check_in` | DATE | NOT NULL | Ngày nhận phòng |
| `check_out` | DATE | NOT NULL | Ngày trả phòng |
| `number_of_rooms` | INT | DEFAULT 1 | Số phòng |
| `total_price` | DECIMAL(15,0) | NOT NULL | Tổng tiền (VNĐ) |
| `status` | VARCHAR(50) | DEFAULT 'pending' | Trạng thái (xem bên dưới) |
| `special_requests` | TEXT | | Yêu cầu đặc biệt |
| `created_at` | TIMESTAMP | DEFAULT NOW | |
| `updated_at` | TIMESTAMP | ON UPDATE NOW | |

**Các trạng thái booking**:

| Status | Ý nghĩa |
|--------|---------|
| `pending` | Chờ xác nhận |
| `confirmed` | Đã xác nhận |
| `paid` | Đã thanh toán |
| `cancelled` | Đã huỷ |
| `completed` | Hoàn thành |

---

### 8. `reviews` — Đánh giá

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| `id` | INT | PK | |
| `customer_id` | INT | FK → `users.id`, CASCADE | Người đánh giá |
| `property_id` | INT | FK → `properties.id`, CASCADE | |
| `booking_id` | INT | FK → `bookings.id`, CASCADE, **UNIQUE** | Mỗi booking chỉ được 1 review |
| `rating` | INT | NOT NULL | Điểm (1–5) |
| `comment` | TEXT | | Nhận xét |
| `created_at` | TIMESTAMP | DEFAULT NOW | |

---

### 9. `payments` — Thanh toán

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| `id` | INT | PK | |
| `booking_id` | INT | FK → `bookings.id`, CASCADE | |
| `amount` | DECIMAL(15,0) | NOT NULL | Số tiền |
| `payment_method` | VARCHAR(50) | NOT NULL | `momo`, `vnpay`, `credit_card`, `bank_transfer`, `guest` |
| `payment_status` | VARCHAR(50) | DEFAULT 'pending' | `pending`, `completed`, `failed`, `refunded` |
| `transaction_id` | VARCHAR(255) | | ID giao dịch |
| `payment_date` | TIMESTAMP | DEFAULT NOW | |
| `notes` | TEXT | | Ghi chú |

---

### 10. `wishlists` — Yêu thích

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| `id` | INT | PK | |
| `user_id` | INT | FK → `users.id`, CASCADE | |
| `property_id` | INT | FK → `properties.id`, CASCADE | |
| `created_at` | TIMESTAMP | DEFAULT NOW | |

> **UNIQUE KEY**: (user_id, property_id) — Mỗi user chỉ yêu thích 1 property 1 lần

---

### 11. `conversations` — Cuộc trò chuyện

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| `id` | INT | PK | |
| `booking_id` | INT | FK → `bookings.id`, SET NULL | Liên kết booking (optional) |
| `guest_id` | INT | FK → `users.id`, CASCADE | Khách hàng |
| `host_id` | INT | FK → `users.id`, CASCADE | Chủ nhà |
| `property_id` | INT | FK → `properties.id`, SET NULL | Property liên quan (optional) |
| `last_message_at` | TIMESTAMP | DEFAULT NOW | Tin nhắn cuối |
| `created_at` | TIMESTAMP | DEFAULT NOW | |

---

### 12. `messages` — Tin nhắn

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| `id` | INT | PK | |
| `conversation_id` | INT | FK → `conversations.id`, CASCADE | |
| `sender_id` | INT | FK → `users.id`, CASCADE | Người gửi |
| `content` | TEXT | NOT NULL | Nội dung |
| `is_read` | BOOLEAN | DEFAULT FALSE | Đã đọc chưa |
| `created_at` | TIMESTAMP | DEFAULT NOW | |

---

### 13. `coupons` — Mã giảm giá

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| `id` | INT | PK | |
| `code` | VARCHAR(50) | NOT NULL, UNIQUE | Mã giảm giá |
| `discount_type` | VARCHAR(20) | NOT NULL | `percent` (%) hoặc `fixed` (tiền) |
| `discount_value` | DECIMAL(10,2) | NOT NULL | Giá trị giảm |
| `min_order_amount` | DECIMAL(15,0) | | Đơn tối thiểu |
| `max_uses` | INT | | Số lần dùng tối đa |
| `used_count` | INT | DEFAULT 0 | Đã dùng bao nhiêu lần |
| `valid_from` | DATE | | Ngày bắt đầu |
| `valid_until` | DATE | | Ngày hết hạn |
| `description` | TEXT | | Mô tả |
| `created_at` | TIMESTAMP | DEFAULT NOW | |

---

### 14. `booking_coupons` — Coupon đã áp dụng

Bảng trung gian lưu coupon nào đã dùng cho booking nào.

| Column | Type | Constraint |
|--------|------|------------|
| `booking_id` | INT | FK → `bookings.id`, CASCADE |
| `coupon_id` | INT | FK → `coupons.id`, CASCADE |
| `discount_amount` | DECIMAL(15,0) | Số tiền được giảm |

> **Primary Key kép**: (booking_id, coupon_id)

---

### 15. `booking_status_history` — Lịch sử trạng thái

Theo dõi mọi thay đổi trạng thái của booking (audit trail).

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| `id` | INT | PK | |
| `booking_id` | INT | FK → `bookings.id`, CASCADE | |
| `status` | VARCHAR(50) | NOT NULL | Trạng thái mới |
| `note` | TEXT | | Ghi chú |
| `updated_by` | INT | FK → `users.id`, SET NULL | Ai cập nhật |
| `created_at` | TIMESTAMP | DEFAULT NOW | |

---

### 16. `property_rules` — Nội quy Property

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| `id` | INT | PK | |
| `property_id` | INT | FK → `properties.id`, CASCADE | |
| `rule_type` | VARCHAR(100) | NOT NULL | Loại quy định |
| `rule_content` | TEXT | NOT NULL | Nội dung |
| `is_allowed` | BOOLEAN | DEFAULT TRUE | Cho phép hay không |

---

### 17. `guest_bookings` — Booking tạm (khách vãng lai)

Dành cho khách chưa có tài khoản, đặt phòng qua Guest Checkout.

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| `id` | INT | PK | |
| `email` | VARCHAR(255) | NOT NULL | Email khách |
| `phone` | VARCHAR(20) | NOT NULL | SĐT |
| `guest_name` | VARCHAR(255) | NOT NULL | Tên khách |
| `property_id` | INT | FK → `properties.id`, CASCADE | |
| `room_type_id` | INT | FK → `room_types.id`, CASCADE | |
| `check_in` | DATE | NOT NULL | |
| `check_out` | DATE | NOT NULL | |
| `number_of_rooms` | INT | DEFAULT 1 | |
| `total_price` | DECIMAL(15,0) | NOT NULL | |
| `special_requests` | TEXT | | |
| `confirm_token` | VARCHAR(255) | NOT NULL, UNIQUE | Token xác nhận |
| `is_confirmed` | BOOLEAN | DEFAULT FALSE | Đã xác nhận chưa |
| `created_at` | TIMESTAMP | DEFAULT NOW | |

---

## 🔗 Sơ đồ quan hệ (ERD)

```
                              ┌─────────────────┐
                              │     users        │
                              ├─────────────────┤
                              │ id (PK)          │
                              │ name             │
                              │ email (UNIQUE)   │
                              │ password         │
                              │ role             │
                              └────────┬─────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │ (host_id)              │ (customer_id)          │ (user_id)
              ▼                        ▼                        ▼
    ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
    │   properties    │      │    bookings      │      │   wishlists     │
    ├─────────────────┤      ├─────────────────┤      ├─────────────────┤
    │ id (PK)         │◄─────│ property_id (FK) │      │ user_id (FK)    │
    │ host_id (FK)    │      │ customer_id (FK) │      │ property_id (FK)│
    │ name            │      │ room_type_id (FK)│      └─────────────────┘
    │ type            │      │ check_in/out     │
    │ location        │      │ total_price      │
    │ is_hot          │      │ status           │
    └────────┬────────┘      └───────┬──────────┘
             │                       │
     ┌───────┼───────┬───────┐       ├──────────────┬──────────────┐
     ▼       ▼       ▼       ▼       ▼              ▼              ▼
  ┌──────┐┌──────┐┌──────┐┌──────┐┌──────────┐┌──────────┐┌──────────────┐
  │images││rooms ││ameni-││rules ││ payments ││ reviews  ││booking_      │
  │      ││types ││ties  ││      ││          ││          ││coupons       │
  └──────┘└──────┘└──────┘└──────┘└──────────┘└──────────┘└──────┬───────┘
                                                                  │
                                                                  ▼
                                                          ┌──────────────┐
                                                          │   coupons    │
                                                          └──────────────┘

  === MESSAGING (Realtime qua Socket.IO) ===

  ┌─────────────────┐         ┌─────────────────┐
  │  conversations  │────────►│    messages      │
  ├─────────────────┤         ├─────────────────┤
  │ guest_id (FK)   │         │ conversation_id  │
  │ host_id (FK)    │         │ sender_id (FK)   │
  │ property_id     │         │ content          │
  │ booking_id      │         │ is_read          │
  └─────────────────┘         └─────────────────┘

  === GUEST CHECKOUT ===

  ┌─────────────────┐
  │ guest_bookings  │  (booking tạm, chưa có account)
  ├─────────────────┤
  │ email, phone    │
  │ guest_name      │
  │ confirm_token   │  → Xác nhận → Chuyển thành booking thật
  │ is_confirmed    │
  └─────────────────┘
```

---

## 📡 API Endpoints & Query mẫu

### 🔐 Authentication

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/auth/register` | Đăng ký tài khoản |
| `POST` | `/api/auth/login` | Đăng nhập → JWT token |

```sql
-- Login: tìm user theo email
SELECT * FROM users WHERE email = ?;

-- Register: thêm user mới (password đã hash bcrypt)
INSERT INTO users (name, email, password) VALUES (?, ?, ?);
```

---

### 🏨 Properties

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/properties` | Danh sách property đầy đủ |

```sql
-- Lấy property kèm thông tin host
SELECT p.*, u.name as host_name, u.avatar as host_avatar
FROM properties p
LEFT JOIN users u ON p.host_id = u.id;

-- Lấy hình ảnh
SELECT * FROM property_images WHERE property_id = ?;

-- Lấy tiện nghi
SELECT a.* FROM amenities a
JOIN property_amenities pa ON a.id = pa.amenity_id
WHERE pa.property_id = ?;

-- Lấy loại phòng
SELECT * FROM room_types WHERE property_id = ?;
```

---

### ⭐ Reviews

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/reviews?property_id=` | Danh sách review của property |
| `POST` | `/api/reviews` | Tạo review mới (JWT) |

```sql
-- Lấy reviews kèm thông tin user
SELECT r.*, u.name, u.avatar FROM reviews r
JOIN users u ON r.customer_id = u.id
WHERE r.property_id = ?
ORDER BY r.created_at DESC;

-- Tạo review (mỗi booking chỉ 1 review — UNIQUE constraint)
INSERT INTO reviews (customer_id, property_id, booking_id, rating, comment)
VALUES (?, ?, ?, ?, ?);
```

---

### 🎫 Coupons

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/coupons` | Kiểm tra & áp dụng mã giảm giá |

```sql
-- Kiểm tra coupon còn hiệu lực
SELECT * FROM coupons
WHERE code = ?
AND valid_from <= CURDATE()
AND valid_until >= CURDATE()
AND (max_uses IS NULL OR used_count < max_uses);

-- Tính giá sau giảm
-- percent: finalPrice = totalPrice - (totalPrice * discount_value / 100)
-- fixed:   finalPrice = totalPrice - discount_value
```

---

### 📋 User Bookings (JWT required)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/user/bookings` | Lịch sử booking |
| `POST` | `/api/user/bookings` | Tạo booking mới (hỗ trợ coupon) |

```sql
-- Lấy booking kèm thông tin thanh toán
SELECT
    b.*, p.name as property_name, p.location,
    rt.name as room_type_name, rt.price as room_type_price,
    pi.image_url as property_image,
    pay.payment_status, pay.payment_method, pay.transaction_id
FROM bookings b
JOIN properties p ON b.property_id = p.id
JOIN room_types rt ON b.room_type_id = rt.id
LEFT JOIN property_images pi ON pi.property_id = p.id AND pi.is_main = 1
LEFT JOIN payments pay ON pay.booking_id = b.id
WHERE b.customer_id = ?
ORDER BY b.created_at DESC;
```

---

### ❤️ Wishlist (JWT required)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/user/wishlist` | Danh sách yêu thích |
| `POST` | `/api/user/wishlist` | Thêm vào yêu thích |
| `DELETE` | `/api/user/wishlist?property_id=` | Bỏ yêu thích |

```sql
-- Thêm vào wishlist
INSERT INTO wishlists (user_id, property_id) VALUES (?, ?);

-- Xoá khỏi wishlist
DELETE FROM wishlists WHERE user_id = ? AND property_id = ?;

-- Kiểm tra đã yêu thích chưa
SELECT * FROM wishlists WHERE user_id = ? AND property_id = ?;
```

---

### 💬 Messages (JWT + Socket.IO)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/user/messages` | Lấy danh sách conversation |
| `GET` | `/api/user/messages?conversation_id=` | Lấy tin nhắn trong conversation |
| `POST` | `/api/user/messages` | Gửi tin nhắn mới |

```sql
-- Lấy conversations của user
SELECT c.*, u.name as other_name, u.avatar as other_avatar
FROM conversations c
JOIN users u ON u.id = IF(c.guest_id = ?, c.host_id, c.guest_id)
WHERE c.guest_id = ? OR c.host_id = ?
ORDER BY c.last_message_at DESC;

-- Lấy messages trong conversation
SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
FROM messages m
JOIN users u ON m.sender_id = u.id
WHERE m.conversation_id = ?
ORDER BY m.created_at ASC;
```

**Socket.IO Events:**
```javascript
// Client → Server
socket.emit('joinUserRoom', userId);     // Join room của user

// Server → Client
io.to(`user_${userId}`).emit('newMessage', messageData);   // Tin nhắn mới
io.emit('newBooking', bookingData);                         // Booking mới (notify admin)
```

---

### 💳 Payments (JWT required)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/user/payments` | Lịch sử thanh toán |

```sql
-- Lấy thanh toán kèm thông tin booking
SELECT pay.*, b.check_in, b.check_out, p.name as property_name
FROM payments pay
JOIN bookings b ON pay.booking_id = b.id
JOIN properties p ON b.property_id = p.id
WHERE b.customer_id = ?
ORDER BY pay.payment_date DESC;
```

---

### 👤 Profile (JWT required)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/user/profile` | Lấy thông tin profile |
| `PUT` | `/api/user/profile` | Cập nhật profile |

```sql
-- Cập nhật profile
UPDATE users SET name = ?, phone = ?, avatar = ? WHERE id = ?;
```

---

### 🏡 Host Bookings (JWT required)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/host/bookings` | Danh sách booking trên property của host |

```sql
SELECT b.*, u.name as customer_name, u.email, u.phone,
       p.name as property_name, rt.name as room_type_name
FROM bookings b
JOIN users u ON b.customer_id = u.id
JOIN properties p ON b.property_id = p.id
JOIN room_types rt ON b.room_type_id = rt.id
WHERE p.host_id = ?
ORDER BY b.created_at DESC;
```

---

### 🚶 Guest Checkout (không cần tài khoản)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/guest/bookings` | Đặt phòng cho khách vãng lai |
| `GET` | `/api/guest/booking-details` | Xem chi tiết booking (qua token) |
| `POST` | `/api/guest/confirm` | Xác nhận booking + tạo account |

```sql
-- Tạo guest booking + token xác nhận
INSERT INTO guest_bookings
    (email, phone, guest_name, property_id, room_type_id, check_in, check_out,
     number_of_rooms, total_price, special_requests, confirm_token)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Xác nhận: chuyển guest_booking → booking thật + tạo user account
-- 1. Tạo user mới
INSERT INTO users (name, email, password) VALUES (?, ?, ?);
-- 2. Tạo booking thật
INSERT INTO bookings (...) VALUES (...);
-- 3. Cập nhật is_confirmed = true
UPDATE guest_bookings SET is_confirmed = TRUE WHERE confirm_token = ?;
```

---

### 🛡️ Admin (JWT + role admin)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/admin/stats` | Thống kê tổng quan |
| `GET/POST` | `/api/admin/users` | Danh sách & tạo user |
| `PUT/DELETE` | `/api/admin/users/[id]` | Sửa & xoá user |
| `GET/POST` | `/api/admin/properties` | Danh sách & tạo property |
| `PUT/DELETE` | `/api/admin/properties/[id]` | Sửa & xoá property |
| `GET` | `/api/admin/bookings` | Danh sách booking |
| `PUT` | `/api/admin/bookings/[id]` | Cập nhật trạng thái booking |

```sql
-- Thống kê tổng quan
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_properties FROM properties;
SELECT COUNT(*) as total_bookings FROM bookings;
SELECT COALESCE(SUM(total_price), 0) as total_revenue FROM bookings WHERE status = 'completed';
```

---

## 🔄 Flow nghiệp vụ

### Flow 1: Đặt phòng (User đã đăng nhập)

```
1. User chọn property → xem Details
2. Chọn room_type, ngày check-in/out, số phòng
3. Nhập mã coupon (optional) → API kiểm tra coupon
4. Bấm "Thanh toán" → POST /api/user/bookings
   └─ Server:
      ├─ Kiểm tra & áp dụng coupon (nếu có)
      ├─ INSERT bookings (status: pending)
      ├─ INSERT payments (status: pending)
      ├─ INSERT booking_coupons (nếu dùng coupon)
      ├─ INSERT booking_status_history
      └─ Socket.IO: emit('newBooking') → notify admin
5. Admin xác nhận → status: confirmed → paid → completed
```

### Flow 2: Guest Checkout (chưa có tài khoản)

```
1. User nhập email, SĐT, tên
2. POST /api/guest/bookings
   ├─ Email ĐÃ tồn tại trong users?
   │   └─ YES → Tạo booking trực tiếp cho user đó
   └─ NO → Lưu vào guest_bookings + tạo confirm_token
3. Redirect sang trang AlertEmail → User đặt mật khẩu
4. POST /api/guest/confirm (kèm token + password)
   └─ Server:
      ├─ Tạo user mới (bcrypt password)
      ├─ Chuyển guest_booking → booking thật
      └─ Trả JWT token → User đã đăng nhập
```

### Flow 3: Review sau booking

```
1. User có booking status = 'completed'
2. Vào trang Details → form đánh giá hiện ra
3. POST /api/reviews (rating + comment)
   └─ Constraint: UNIQUE(booking_id) → mỗi booking chỉ 1 review
```

---

## 📝 Ghi chú kỹ thuật

| Chủ đề | Chi tiết |
|--------|----------|
| **Password** | Mã hoá bằng `bcryptjs` với salt round = 10 |
| **Authentication** | JWT token, thời hạn 1 ngày (`expiresIn: '1d'`) |
| **Connection Pool** | `mysql2/promise` pool, tối đa 10 kết nối |
| **Hot Reload** | Dùng `global.mysqlPool` trong dev để không tạo pool mới mỗi lần hot reload |
| **CORS** | Cho phép tất cả origin (`origin: '*'`) |
| **Realtime** | Socket.IO chạy trên custom `server.js`, tích hợp cùng Next.js |
| **Thanh toán** | Hiện tại **simulate** (giả lập) — cần tích hợp MoMo/VNPay API thực tế |
| **Prepared Statement** | Tất cả query đều dùng `?` placeholder → chống SQL Injection |
| **Cascade Delete** | Xoá user/property → tự động xoá các bản ghi liên quan |

---

<p align="center">
  <b>Team 8386</b> — Lập trình Web · BDU · 2026
</p>

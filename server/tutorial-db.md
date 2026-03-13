# Database Tutorial - Project Web Du Lịch

## Tổng Quan

Project sử dụng **MySQL** làm cơ sở dữ liệu chính, kết nối qua `mysql2/promise`. Database có tên mặc định là `web_du_lich`.

### Cấu Hình Kết Nối

File cấu hình: `src/lib/db.js`

```javascript
const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'web_du_lich',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
```

### Biến Môi Trường (file `.env`)

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=web_du_lich
JWT_SECRET=your_jwt_secret_key_here
```

---

## Cấu Trúc Các Bảng (Tables)

### 1. Users - Người Dùng

Lưu trữ thông tin tất cả người dùng (khách hàng và host).

| Column | Type | Mô Tả |
|--------|------|-------|
| id | INT (PK) | ID tự động tăng |
| name | VARCHAR(255) | Họ tên đầy đủ |
| email | VARCHAR(255) | Email (UNIQUE) |
| password | VARCHAR(255) | Mật khẩu đã mã hóa bcrypt |
| avatar | VARCHAR(255) | URL ảnh đại diện |
| role | VARCHAR(50) | 'customer' hoặc 'host' |
| phone | VARCHAR(20) | Số điện thoại |
| created_at | TIMESTAMP | Thời gian tạo |

**Vai trò (role):**
- `customer`: Khách hàng thuê phòng
- `host`: Chủ nhà/đối tác cho thuê

---

### 2. Properties - Bất Động Sản/Phòng Cho Thuê

Lưu trữ thông tin các bất động sản cho thuê.

| Column | Type | Mô Tả |
|--------|------|-------|
| id | INT (PK) | ID tự động tăng |
| host_id | INT (FK) | Liên kết với users.id |
| name | VARCHAR(255) | Tên property |
| type | VARCHAR(50) | Loại (hotel, villa, apartment...) |
| location | VARCHAR(255) | Địa chỉ |
| price_display | DECIMAL(15,0) | Giá hiển thị |
| description | TEXT | Mô tả chi tiết |
| map_image | VARCHAR(255) | URL ảnh bản đồ |
| map_embed | TEXT | Embed code Google Maps |
| is_hot | BOOLEAN | Đánh dấu property nổi bật |
| created_at | TIMESTAMP | Thời gian tạo |

**Quan hệ:**
- Một Property thuộc về một Host (users)
- Một Property có nhiều Images, Room Types, Reviews

---

### 3. Property_Images - Hình Ảnh Property

Lưu trữ hình ảnh của các property.

| Column | Type | Mô Tả |
|--------|------|-------|
| id | INT (PK) | ID tự động tăng |
| property_id | INT (FK) | Liên kết với properties.id |
| image_url | VARCHAR(255) | URL hình ảnh |
| is_main | BOOLEAN | Đánh dấu là ảnh chính |

---

### 4. Amenities - Tiện Nghi

Danh sách các tiện nghi có sẵn (wifi, pool, parking...).

| Column | Type | Mô Tả |
|--------|------|-------|
| id | INT (PK) | ID tự động tăng |
| name | VARCHAR(100) | Tên tiện nghi |
| icon | VARCHAR(50) | Icon name (font-icon) |
| category | VARCHAR(100) | Phân loại |

---

### 5. Property_Amenities - Liên Kết Property-Amenities

Bảng trung gian nhiều-nhiều giữa properties và amenities.

| Column | Type | Mô Tả |
|--------|------|-------|
| property_id | INT (FK) | Liên kết với properties.id |
| amenity_id | INT (FK) | Liên kết với amenities.id |

**(Primary Key kép: property_id + amenity_id)**

---

### 6. Room_Types - Loại Phòng

Các loại phòng trong một property.

| Column | Type | Mô Tả |
|--------|------|-------|
| id | INT (PK) | ID tự động tăng |
| property_id | INT (FK) | Liên kết với properties.id |
| name | VARCHAR(255) | Tên loại phòng |
| price | DECIMAL(15,0) | Giá phòng |
| total_allotment | INT | Tổng số phòng |
| max_adults | INT | Số người lớn tối đa |
| max_children | INT | Số trẻ em tối đa |
| room_size | INT | Diện tích phòng (m²) |
| bed_type | VARCHAR(100) | Loại giường |
| created_at | TIMESTAMP | Thời gian tạo |

---

### 7. Bookings - Đặt Phòng

Lưu trữ thông tin đặt phòng.

| Column | Type | Mô Tả |
|--------|------|-------|
| id | INT (PK) | ID tự động tăng |
| customer_id | INT (FK) | Liên kết với users.id (người đặt) |
| property_id | INT (FK) | Liên kết với properties.id |
| room_type_id | INT (FK) | Liên kết với room_types.id |
| check_in | DATE | Ngày nhận phòng |
| check_out | DATE | Ngày trả phòng |
| number_of_rooms | INT | Số phòng đặt |
| total_price | DECIMAL(15,0) | Tổng giá tiền |
| status | VARCHAR(50) | Trạng thái: 'pending', 'confirmed', 'paid', 'cancelled', 'completed' |
| special_requests | TEXT | Yêu cầu đặc biệt |
| created_at | TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | Thời gian cập nhật |

---

### 8. Reviews - Đánh Giá

Lưu trữ đánh giá của khách hàng sau khi booking.

| Column | Type | Mô Tả |
|--------|------|-------|
| id | INT (PK) | ID tự động tăng |
| customer_id | INT (FK) | Liên kết với users.id |
| property_id | INT (FK) | Liên kết với properties.id |
| booking_id | INT (FK) | Liên kết với bookings.id (UNIQUE - mỗi booking 1 review) |
| rating | INT | Điểm đánh giá (1-5) |
| comment | TEXT | Nhận xét |
| created_at | TIMESTAMP | Thời gian tạo |

---

## Các Bảng Mới: Thanh Toán & Tương Tác User

### 9. Payments - Thanh Toán

Lưu trữ thông tin thanh toán cho các booking.

| Column | Type | Mô Tả |
|--------|------|-------|
| id | INT (PK) | ID tự động tăng |
| booking_id | INT (FK) | Liên kết với bookings.id |
| amount | DECIMAL(15,0) | Số tiền thanh toán |
| payment_method | VARCHAR(50) | Phương thức: 'momo', 'vnpay', 'credit_card', 'bank_transfer' |
| payment_status | VARCHAR(50) | Trạng thái: 'pending', 'completed', 'failed', 'refunded' |
| transaction_id | VARCHAR(255) | ID giao dịch từ cổng thanh toán |
| payment_date | TIMESTAMP | Ngày thanh toán |
| notes | TEXT | Ghi chú thêm |

---

### 10. Wishlists - Danh Sách Yêu Thích

Lưu trữ các property mà user đã lưu/yêu thích.

| Column | Type | Mô Tả |
|--------|------|-------|
| id | INT (PK) | ID tự động tăng |
| user_id | INT (FK) | Liên kết với users.id |
| property_id | INT (FK) | Liên kết với properties.id |
| created_at | TIMESTAMP | Thời gian thêm |

**(UNIQUE: user_id + property_id - không trùng lặp)**

---

### 11. Conversations - Cuộc Trò Chuyện

Quản lý các cuộc trò chuyện giữa khách và host.

| Column | Type | Mô Tả |
|--------|------|-------|
| id | INT (PK) | ID tự động tăng |
| booking_id | INT (FK) | Liên kết với bookings.id (có thể null) |
| guest_id | INT (FK) | Liên kết với users.id (khách) |
| host_id | INT (FK) | Liên kết với users.id (chủ nhà) |
| property_id | INT (FK) | Liên kết với properties.id (có thể null) |
| last_message_at | TIMESTAMP | Tin nhắn cuối cùng |
| created_at | TIMESTAMP | Thời gian tạo |

---

### 12. Messages - Tin Nhắn

Lưu trữ các tin nhắn trong cuộc trò chuyện.

| Column | Type | Mô Tả |
|--------|------|-------|
| id | INT (PK) | ID tự động tăng |
| conversation_id | INT (FK) | Liên kết với conversations.id |
| sender_id | INT (FK) | Liên kết với users.id (người gửi) |
| content | TEXT | Nội dung tin nhắn |
| is_read | BOOLEAN | Đánh dấu đã đọc |
| created_at | TIMESTAMP | Thời gian gửi |

---

### 13. Coupons - Mã Giảm Giá

Quản lý các mã khuyến mãi/giảm giá.

| Column | Type | Mô Tả |
|--------|------|-------|
| id | INT (PK) | ID tự động tăng |
| code | VARCHAR(50) | Mã giảm giá (UNIQUE) |
| discount_type | VARCHAR(20) | Loại: 'percent' (%), 'fixed' (tiền) |
| discount_value | DECIMAL(10,2) | Giá trị giảm |
| min_order_amount | DECIMAL(15,0) | Đơn tối thiểu để áp dụng |
| max_uses | INT | Số lần sử dụng tối đa |
| used_count | INT | Số lần đã sử dụng |
| valid_from | DATE | Ngày bắt đầu hiệu lực |
| valid_until | DATE | Ngày hết hiệu lực |
| description | TEXT | Mô tả khuyến mãi |
| created_at | TIMESTAMP | Thời gian tạo |

---

### 14. Booking_Coupons - Coupon Đã Sử Dụng

Bảng trung gian lưu coupon đã áp dụng cho booking.

| Column | Type | Mô Tả |
|--------|------|-------|
| booking_id | INT (FK) | Liên kết với bookings.id |
| coupon_id | INT (FK) | Liên kết với coupons.id |
| discount_amount | DECIMAL(15,0) | Số tiền được giảm |

---

### 15. Booking_Status_History - Lịch Sử Trạng Thái

Theo dõi lịch sử thay đổi trạng thái của booking.

| Column | Type | Mô Tả |
|--------|------|-------|
| id | INT (PK) | ID tự động tăng |
| booking_id | INT (FK) | Liên kết với bookings.id |
| status | VARCHAR(50) | Trạng thái mới |
| note | TEXT | Ghi chú thay đổi |
| updated_by | INT (FK) | Người cập nhật (users.id) |
| created_at | TIMESTAMP | Thời gian thay đổi |

---

### 16. Property_Rules - Nội Quy Property

Lưu trữ các nội quy của property (hút thuốc, pet, giờ giấc...).

| Column | Type | Mô Tả |
|--------|------|-------|
| id | INT (PK) | ID tự động tăng |
| property_id | INT (FK) | Liên kết với properties.id |
| rule_type | VARCHAR(100) | Loại quy định |
| rule_content | TEXT | Nội dung quy định |
| is_allowed | BOOLEAN | Cho phép hay không |

---

## Sơ Đồ Quan Hệ (ERD)

```
┌──────────────┐       ┌──────────────┐
│    users     │       │  properties  │
├──────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)      │
│ name         │  │    │ host_id (FK) │──┐
│ email        │  └───►│ name         │  │
│ password     │       │ location     │  │
│ role         │       │ ...          │  │
│ ...          │       └──────────────┘  │
└──────────────┘              │           │
        │                     │           │
        │                ┌────┴────┐       │
        │                │         │       │
        ▼                ▼         ▼       ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   bookings   │  │property_images│ │  room_types  │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ id (PK)      │  │ id (PK)      │  │ id (PK)      │
│ customer_id  │  │ property_id  │  │ property_id  │
│ property_id   │  │ image_url    │  │ name         │
│ room_type_id │  │ is_main      │  │ price        │
│ check_in     │  └──────────────┘  │ ...          │
│ check_out    │                    └──────────────┘
│ status       │
└──────────────┘
        │
        │         ┌──────────────┐
        │         │  payments    │
        │         ├──────────────┤
        ├────────►│ booking_id   │
        │         │ amount       │
        │         │ payment_method│
        │         │ payment_status│
        │         └──────────────┘
        │
        │         ┌──────────────┐
        │         │   coupons    │
        │         ├──────────────┤
        └────────►│ id (PK)      │
        │         │ code         │
        │         │ discount_type│
        │         └──────────────┘
        │
        ▼
┌──────────────┐
│   reviews    │
├──────────────┤
│ booking_id   │── UNIQUE
│ rating       │
│ comment      │
└──────────────┘

=== TƯƠNG TÁC USER ===

┌──────────────┐       ┌──────────────┐
│  wishlists   │       │conversations │
├──────────────┤       ├──────────────┤
│ user_id      │       │ guest_id     │
│ property_id  │       │ host_id      │
└──────────────┘       └──────┬───────┘
                              │
                              ▼
                     ┌──────────────┐
                     │   messages   │
                     ├──────────────┤
                     │ conversation │
                     │ sender_id    │
                     │ content      │
                     │ is_read      │
                     └──────────────┘
```

---

## Các API Endpoints

### Authentication

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký tài khoản mới |
| POST | `/api/auth/login` | Đăng nhập, trả về JWT token |

### Properties

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| GET | `/api/properties` | Lấy danh sách tất cả properties |

### User

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| GET | `/api/user/profile` | Lấy thông tin profile user |

### Bookings

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| GET | `/api/user/bookings` | Xem danh sách booking của user |
| POST | `/api/user/bookings` | Tạo booking mới (có hỗ trợ coupon) |

### Payments (THANH TOÁN)

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| GET | `/api/user/payments` | Lấy danh sách thanh toán của user |
| POST | `/api/user/payments` | Xử lý thanh toán (simulate) |

### Wishlist (YÊU THÍCH)

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| GET | `/api/user/wishlist` | Lấy danh sách yêu thích |
| POST | `/api/user/wishlist` | Thêm property vào wishlist |
| DELETE | `/api/user/wishlist?property_id=1` | Xóa khỏi wishlist |

### Messages (TIN NHẮN)

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| GET | `/api/user/messages` | Lấy danh sách conversation |
| GET | `/api/user/messages?conversation_id=1` | Lấy tin nhắn trong conversation |
| POST | `/api/user/messages` | Gửi tin nhắn mới |

### Coupons (KHUYẾN MÃI)

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| GET | `/api/coupons` | Lấy danh sách coupon |
| GET | `/api/coupons?code=XYZ` | Kiểm tra mã giảm giá |
| POST | `/api/coupons` | Tạo coupon mới (admin) |

---

## Cách Sử Dụng Database

### 1. Import database

Chạy file schema để tạo các bảng:

```bash
mysql -u root -p web_du_lich < schema.sql
```

### 2. Khởi tạo dữ liệu mẫu

```bash
node init-db.js
```

### 3. Export/Import data

```bash
# Export database
node export-db.js

# Import database
node import-db.js
```

---

## Ví Dụ Query

### Lấy property với đầy đủ thông tin:

```sql
SELECT
    p.*,
    u.name as host_name,
    u.avatar as host_avatar
FROM properties p
LEFT JOIN users u ON p.host_id = u.id;

-- Lấy hình ảnh
SELECT * FROM property_images WHERE property_id = 1;

-- Lấy tiện nghi
SELECT a.*
FROM amenities a
JOIN property_amenities pa ON a.id = pa.amenity_id
WHERE pa.property_id = 1;

-- Lấy loại phòng
SELECT * FROM room_types WHERE property_id = 1;
```

### Lấy booking với thông tin thanh toán:

```sql
SELECT
    b.*,
    p.name as property_name,
    pay.payment_status,
    pay.transaction_id
FROM bookings b
LEFT JOIN payments pay ON b.id = pay.booking_id
JOIN properties p ON b.property_id = p.id
WHERE b.customer_id = 1;
```

### Kiểm tra coupon:

```sql
SELECT * FROM coupons
WHERE code = 'SUMMER2024'
AND valid_from <= CURDATE()
AND valid_until >= CURDATE()
AND (max_uses IS NULL OR used_count < max_uses);
```

---

## Ghi Chú

1. **Password**: Được mã hóa bằng `bcrypt` với salt = 10
2. **Authentication**: Sử dụng JWT với thời hạn 1 ngày
3. **Connection Pool**: Sử dụng connection pool để quản lý kết nối hiệu quả
4. **CORS**: Tất cả API đều hỗ trợ CORS với origin '*'
5. **Thanh toán**: Hiện tại đang simulate (giả lập) - cần tích hợp MoMo/VNPay API thực tế

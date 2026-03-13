# Web Du Lịch - Server

Project backend cho website đặt phòng du lịch, sử dụng **Next.js API Routes** kết nối với **MySQL Database**.

## 🚀 Công Nghệ Sử Dụng

- **Runtime**: Node.js
- **Framework**: Next.js 14 (App Router)
- **Database**: MySQL
- **ORM/Driver**: mysql2/promise
- **Authentication**: JWT (jsonwebtoken)
- **Password**: bcryptjs

---

## 📋 Yêu Cầu Hệ Thống

- Node.js 18+
- MySQL 8.0+
- npm hoặc yarn

---

## ⚡ Cài Đặt

### 1. Clone project và cài đặt dependencies

```bash
cd server
npm install
```

### 2. Cấu hình Database

#### Tạo database trong MySQL:

```sql
CREATE DATABASE web_du_lich CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Cấu hình biến môi trường:

Tạo file `.env` trong thư mục `server/`:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=web_du_lich
JWT_SECRET=your_jwt_secret_key
```

### 3. Import cấu trúc database

```bash
# Cách 1: Sử dụng MySQL command line
mysql -u root -p web_du_lich < schema.sql

# Cách 2: Sử dụng MySQL Workbench
# Import file schema.sql vào database
```

### 4. Khởi động server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: **http://localhost:3000**

---

## 📁 Cấu Trúc Thư Mục

```
server/
├── .env                    # Biến môi trường
├── schema.sql              # Cấu trúc database
├── tutorial-db.md         # Tài liệu database
├── package.json
├── next.config.js
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.js      # Đăng nhập
│   │       │   └── register/route.js   # Đăng ký
│   │       ├── user/
│   │       │   ├── bookings/route.js    # Đặt phòng
│   │       │   ├── payments/route.js   # Thanh toán
│   │       │   ├── wishlist/route.js   # Yêu thích
│   │       │   ├── messages/route.js    # Tin nhắn
│   │       │   └── profile/route.js     # Profile
│   │       ├── host/
│   │       │   └── bookings/route.js    # Quản lý booking (host)
│   │       ├── properties/route.js     # Danh sách property
│   │       └── coupons/route.js         # Mã giảm giá
│   └── lib/
│       └── db.js              # Kết nối MySQL
├── public/
│   └── uploads/               # File upload
└── database-dump.sql         # Dữ liệu mẫu
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |

### Properties

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| GET | `/api/properties` | Lấy danh sách property |

### User (Cần JWT Token)

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| GET | `/api/user/profile` | Lấy thông tin user |
| GET | `/api/user/bookings` | Danh sách booking |
| POST | `/api/user/bookings` | Tạo booking mới |
| GET | `/api/user/payments` | Lịch sử thanh toán |
| POST | `/api/user/payments` | Xử lý thanh toán |
| GET | `/api/user/wishlist` | Danh sách yêu thích |
| POST | `/api/user/wishlist` | Thêm yêu thích |
| DELETE | `/api/user/wishlist` | Xóa yêu thích |
| GET | `/api/user/messages` | Tin nhắn |
| POST | `/api/user/messages` | Gửi tin nhắn |

### Coupons

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| GET | `/api/coupons` | Danh sách coupon |
| GET | `/api/coupons?code=XYZ` | Kiểm tra mã |
| POST | `/api/coupons` | Tạo coupon mới |

---

## 🔐 Authentication

### Đăng nhập

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

### Sử dụng Token

Gửi token trong header của các request cần xác thực:

```bash
Authorization: Bearer <token>
```

---

## 💳 Luồng Thanh Toán

### 1. Tạo Booking (có coupon)

```bash
POST /api/user/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "property_id": 1,
  "room_type_id": 1,
  "check_in": "2024-12-01",
  "check_out": "2024-12-05",
  "number_of_rooms": 1,
  "total_price": 5000000,
  "coupon_code": "SUMMER2024",
  "special_requests": "Cần cầu thang"
}
```

### 2. Thanh toán

```bash
POST /api/user/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking_id": 1,
  "payment_method": "momo"
}
```

**Hiện tại**: Thanh toán đang simulate (giả lập) - cần tích hợp API MoMo/VNPay thực tế.

---

## 📝 Database Tables

Xem chi tiết trong file `tutorial-db.md`

### Bảng chính:
- `users` - Người dùng
- `properties` - Property cho thuê
- `property_images` - Hình ảnh
- `amenities` - Tiện nghi
- `room_types` - Loại phòng
- `bookings` - Đặt phòng
- `reviews` - Đánh giá
- `payments` - Thanh toán
- `wishlists` - Yêu thích
- `conversations` - Cuộc trò chuyện
- `messages` - Tin nhắn
- `coupons` - Mã giảm giá

---

## 🔧 Scripts

```bash
# Khởi động development server
npm run dev

# Build và chạy production
npm run build
npm start

# Export database
node export-db.js

# Import database
node import-db.js
```

---

## ⚠️ Lưu Ý

1. **CORS**: API cho phép tất cả origins (`*`)
2. **JWT Secret**: Đổi `JWT_SECRET` trong `.env` khi deploy
3. **Password**: Mật khẩu được mã hóa bcrypt
4. **Thanh toán**: Hiện tại đang simulate - cần tích hợp payment gateway thực tế
5. **Upload**: File upload được lưu trong `public/uploads/`

---

## 📞 Hỗ Trợ

Nếu gặp lỗi, kiểm tra:
1. MySQL đang chạy
2. File `.env` đã được cấu hình đúng
3. Database đã được import
4. Port 3306 không bị chặn

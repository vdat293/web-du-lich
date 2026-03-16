# 🏨 Aoklevart — Luxury Stays

> Hệ thống đặt phòng khách sạn & du lịch Fullstack hiện đại — Đồ án Lập trình Web · BDU · 2026

| Layer | Công nghệ |
|-------|-----------|
| **Frontend** | React 19 · Vite 8 · React Router 7 · Socket.IO Client |
| **Backend API** | Next.js 16 API Routes · JWT Auth · Socket.IO |
| **Database** | MySQL (XAMPP / WAMP Local) |

---

## 📑 Mục lục

- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt nhanh](#-cài-đặt-nhanh)
- [Đồng bộ dữ liệu](#-đồng-bộ-dữ-liệu-giữa-các-thành-viên)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Tính năng](#-tính-năng)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Tài khoản test](#-tài-khoản-test)

---

## 💻 Yêu cầu hệ thống

| Phần mềm | Phiên bản | Ghi chú |
|----------|-----------|---------|
| **Node.js** | 18.x trở lên | [Download](https://nodejs.org/) |
| **Git** | Bất kỳ | [Download](https://git-scm.com/) |
| **XAMPP / WAMP** | Bất kỳ | Cần module **MySQL** đang chạy |

---

## 🚀 Cài đặt nhanh

### Bước 1 — Clone dự án

```bash
git clone git@github.com:vdat293/web-du-lich.git
cd web-du-lich
```

### Bước 2 — Thiết lập Backend + Database

> ⚠️ Bật MySQL trong XAMPP/WAMP trước khi tiếp tục!

```bash
cd server
npm install
```

Tạo file `server/.env`:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=web_du_lich
JWT_SECRET=your_jwt_secret_key_here
```

Khởi tạo database **(chỉ lần đầu)**:

```bash
# Khuyến nghị — import data mới nhất từ Git
npm run db:import

# Hoặc tạo mới từ schema (chỉ có cấu trúc, không có data)
npm run db:init
```

Chạy server:

```bash
npm run dev
```

✅ Backend chạy tại **`http://localhost:3000`**

### Bước 3 — Chạy Frontend

Mở terminal mới (giữ nguyên terminal backend):

```bash
cd client
npm install
npm run dev
```

✅ Frontend chạy tại **`http://localhost:5173`**

---

## 🔄 Đồng bộ dữ liệu giữa các thành viên

Mỗi người dùng MySQL local riêng → dùng export/import qua Git để đồng bộ.

### 📤 Người có data mới → Export

```bash
cd server
npm run db:export        # Xuất DB → database-dump.sql
git add database-dump.sql
git commit -m "Cập nhật data mới nhất"
git push
```

### 📥 Thành viên khác → Import

```bash
git pull
cd server
npm run db:import        # Nhập data vào MySQL local
```

### Bảng lệnh

| Lệnh | Mô tả |
|-------|--------|
| `npm run db:export` | Xuất toàn bộ DB → `database-dump.sql` |
| `npm run db:import` | Nhập `database-dump.sql` → DB local |
| `npm run db:init` | Khởi tạo DB lần đầu (chỉ schema) |
| `npm run dev` | Chạy server (backend) |

---

## 📁 Cấu trúc dự án

```
web-du-lich/
├── client/                          # Frontend (React + Vite)
│   ├── index.html
│   └── src/
│       ├── App.jsx                  # Router chính
│       ├── main.jsx                 # Entry point
│       ├── index.css                # Global styles
│       ├── pages/
│       │   ├── Home.jsx             # Trang chủ — carousel, điểm đến, khách sạn nổi bật
│       │   ├── Search.jsx           # Tìm kiếm & lọc theo vị trí, giá, loại hình
│       │   ├── Details.jsx          # Chi tiết property — gallery, tiện nghi, phòng, review, bản đồ
│       │   ├── Payment.jsx          # Thanh toán — chọn phòng, mã giảm giá, guest checkout
│       │   ├── Profile.jsx          # Quản lý thông tin cá nhân
│       │   ├── BookingHistory.jsx   # Lịch sử đặt phòng (user & host)
│       │   └── Admin.jsx            # Trang quản trị — thống kê, CRUD users/properties/bookings
│       ├── components/
│       │   └── Header.jsx           # Header, Navigation, Auth Modal (Login/Register)
│       └── utils/                   # Hàm tiện ích
│
├── server/                          # Backend (Next.js API Routes)
│   ├── server.js                    # Custom server (Express + Socket.IO)
│   ├── next.config.js               # Cấu hình Next.js
│   ├── src/app/api/
│   │   ├── auth/
│   │   │   ├── login/               # POST — Đăng nhập → JWT
│   │   │   └── register/            # POST — Đăng ký tài khoản
│   │   ├── properties/              # GET — Danh sách & chi tiết property
│   │   ├── reviews/                 # GET/POST — Đánh giá property
│   │   ├── coupons/                 # POST — Kiểm tra & áp dụng mã giảm giá
│   │   ├── user/
│   │   │   ├── profile/             # GET/PUT — Xem & cập nhật profile
│   │   │   ├── bookings/            # GET/POST — Lịch sử & tạo booking
│   │   │   ├── wishlist/            # GET/POST/DELETE — Danh sách yêu thích
│   │   │   ├── payments/            # GET — Lịch sử thanh toán
│   │   │   └── messages/            # GET/POST — Tin nhắn
│   │   ├── host/
│   │   │   └── bookings/            # GET — Danh sách booking trên property của host
│   │   ├── guest/
│   │   │   ├── bookings/            # POST — Đặt phòng không cần tài khoản
│   │   │   ├── booking-details/     # GET — Xem chi tiết booking (guest)
│   │   │   └── confirm/             # POST — Xác nhận booking qua token
│   │   └── admin/
│   │       ├── stats/               # GET — Thống kê tổng quan
│   │       ├── users/               # GET/POST/PUT/DELETE — Quản lý users
│   │       ├── properties/          # GET/POST/PUT/DELETE — Quản lý properties
│   │       └── bookings/            # GET/PUT — Quản lý bookings
│   ├── src/lib/
│   │   └── db.js                    # MySQL Connection Pool
│   ├── schema.sql                   # Cấu trúc bảng (DDL)
│   ├── database-dump.sql            # Data đồng bộ giữa các thành viên
│   ├── export-db.js                 # Script xuất DB
│   ├── import-db.js                 # Script nhập DB
│   ├── init-db.js                   # Tạo schema lần đầu
│   └── .env                         # Cấu hình DB (không commit)
│
└── README.md
```

---

## ✨ Tính năng

### 🏠 Khách hàng (Customer)

| Tính năng | Mô tả |
|-----------|--------|
| **Trang chủ** | Carousel ảnh, điểm đến phổ biến, khách sạn nổi bật |
| **Tìm kiếm** | Lọc theo địa điểm, loại hình lưu trú, khoảng giá |
| **Chi tiết property** | Gallery ảnh, tiện nghi, danh sách phòng, bản đồ, đánh giá |
| **Đặt phòng** | Chọn ngày check-in/out, loại phòng, số lượng, yêu cầu đặc biệt |
| **Mã giảm giá** | Nhập mã coupon để được giảm giá khi thanh toán |
| **Guest Checkout** | Đặt phòng không cần tài khoản — chỉ cần email, SĐT, tên |
| **Đánh giá** | Viết review & chấm điểm sau khi hoàn thành booking |
| **Yêu thích** | Lưu property vào danh sách yêu thích (cần đăng nhập) |
| **Lịch sử đặt phòng** | Xem danh sách booking đã đặt & trạng thái |
| **Profile** | Cập nhật tên, SĐT, upload avatar |
| **Tin nhắn** | Nhắn tin realtime với host qua Socket.IO |

### 🏡 Chủ nhà (Host)

| Tính năng | Mô tả |
|-----------|--------|
| **Quản lý booking** | Xem danh sách khách đặt phòng trên property của mình |
| **Tin nhắn** | Nhắn tin realtime với khách hàng |

### 🛡️ Quản trị viên (Admin)

| Tính năng | Mô tả |
|-----------|--------|
| **Dashboard** | Thống kê tổng quan (users, properties, bookings, doanh thu) |
| **Quản lý Users** | CRUD người dùng, phân quyền |
| **Quản lý Properties** | CRUD khách sạn / homestay |
| **Quản lý Bookings** | Xem & cập nhật trạng thái booking |

### 🔐 Xác thực (Auth)

- Đăng ký / Đăng nhập bằng JWT Token
- Modal login/register responsive
- Dropdown menu + mobile menu
- Phân quyền: `customer`, `host`, `admin`

---

## 📡 API Endpoints

### Auth

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `POST` | `/api/auth/login` | Đăng nhập → trả JWT token |
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới |

### Properties

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `GET` | `/api/properties` | Danh sách property (kèm rooms, amenities, images) |

### Reviews

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `GET` | `/api/reviews?property_id=` | Lấy danh sách review của property |
| `POST` | `/api/reviews` | Tạo review mới (yêu cầu JWT) |

### Coupons

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `POST` | `/api/coupons` | Kiểm tra & áp dụng mã giảm giá |

### User (yêu cầu JWT)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `GET` | `/api/user/profile` | Lấy thông tin profile |
| `PUT` | `/api/user/profile` | Cập nhật tên, SĐT, avatar |
| `GET` | `/api/user/bookings` | Lịch sử đặt phòng |
| `POST` | `/api/user/bookings` | Tạo booking mới |
| `GET/POST/DELETE` | `/api/user/wishlist` | Quản lý danh sách yêu thích |
| `GET` | `/api/user/payments` | Lịch sử thanh toán |
| `GET/POST` | `/api/user/messages` | Tin nhắn |

### Host (yêu cầu JWT)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `GET` | `/api/host/bookings` | Danh sách booking trên property của host |

### Guest (không cần tài khoản)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `POST` | `/api/guest/bookings` | Tạo booking tạm cho khách vãng lai |
| `GET` | `/api/guest/booking-details` | Xem chi tiết booking (qua token) |
| `POST` | `/api/guest/confirm` | Xác nhận booking qua email token |

### Admin (yêu cầu JWT + role admin)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `GET` | `/api/admin/stats` | Thống kê tổng quan |
| `GET/POST` | `/api/admin/users` | Danh sách & tạo user |
| `PUT/DELETE` | `/api/admin/users/[id]` | Sửa & xoá user |
| `GET/POST` | `/api/admin/properties` | Danh sách & tạo property |
| `PUT/DELETE` | `/api/admin/properties/[id]` | Sửa & xoá property |
| `GET` | `/api/admin/bookings` | Danh sách booking |
| `PUT` | `/api/admin/bookings/[id]` | Cập nhật trạng thái booking |

---

## 🗄️ Database Schema

```
users                  properties              property_images
├── id (PK)            ├── id (PK)             ├── id (PK)
├── name               ├── host_id (FK→users)  ├── property_id (FK)
├── email (UNIQUE)     ├── name                ├── image_url
├── password           ├── type                └── is_main
├── avatar             ├── location
├── role               ├── price_display       amenities
├── phone              ├── description         ├── id (PK)
└── created_at         ├── map_image           ├── name
                       ├── map_embed           ├── icon
room_types             ├── is_hot              └── category
├── id (PK)            └── created_at
├── property_id (FK)                           property_amenities
├── name               bookings                ├── property_id (FK)
├── price              ├── id (PK)             └── amenity_id (FK)
├── total_allotment    ├── customer_id (FK)
├── max_adults         ├── property_id (FK)    reviews
├── max_children       ├── room_type_id (FK)   ├── id (PK)
├── room_size          ├── check_in            ├── customer_id (FK)
└── bed_type           ├── check_out           ├── property_id (FK)
                       ├── number_of_rooms     ├── booking_id (FK, UNIQUE)
wishlists              ├── total_price         ├── rating
├── id (PK)            ├── status              ├── comment
├── user_id (FK)       ├── special_requests    └── created_at
├── property_id (FK)   └── created_at
└── created_at                                 coupons
                       payments                ├── id (PK)
guest_bookings         ├── id (PK)             ├── code (UNIQUE)
├── id (PK)            ├── booking_id (FK)     ├── discount_type
├── email              ├── amount              ├── discount_value
├── phone              ├── payment_method      ├── min_order_amount
├── guest_name         ├── payment_status      ├── max_uses
├── property_id (FK)   ├── transaction_id      ├── used_count
├── room_type_id (FK)  └── payment_date        ├── valid_from
├── check_in/out                               ├── valid_until
├── total_price        conversations           └── description
├── confirm_token      ├── id (PK)
└── is_confirmed       ├── booking_id (FK)     messages
                       ├── guest_id (FK)       ├── id (PK)
                       ├── host_id (FK)        ├── conversation_id (FK)
                       └── property_id (FK)    ├── sender_id (FK)
                                               ├── content
                                               └── is_read
```

---

## 🧪 Tài khoản test

| Email | Mật khẩu | Vai trò |
|-------|----------|---------|
| `test@gmail.com` | `123` | Customer |

---

## 🛠️ Tech Stack chi tiết

### Frontend
- **React 19** — UI Library
- **Vite 8** — Build tool siêu nhanh
- **React Router 7** — Client-side routing
- **Socket.IO Client** — Realtime messaging
- **Vanilla CSS** — Styling

### Backend
- **Next.js 16** — API Routes (serverless-style)
- **Custom Server** — Express wrapper cho Socket.IO
- **JWT (jsonwebtoken)** — Xác thực token-based
- **bcryptjs** — Mã hoá mật khẩu
- **mysql2** — MySQL driver với connection pooling
- **Socket.IO** — WebSocket cho tin nhắn realtime
- **dotenv** — Quản lý biến môi trường

---

<p align="center">
  <b>Team 8386</b> — Lập trình Web · BDU · 2026 a
</p>

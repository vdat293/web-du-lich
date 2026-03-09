# Aoklevart — Luxury Stays

Hệ thống đặt phòng khách sạn & du lịch Fullstack hiện đại.

| Layer | Công nghệ |
|-------|-----------|
| **Frontend** | React 19 · Vite · TailwindCSS |
| **Backend API** | Next.js 16 API Routes · JWT Auth |
| **Database** | MySQL (XAMPP / WAMP Local) |

---

## Mục lục

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt nhanh](#cài-đặt-nhanh)
- [Đồng bộ dữ liệu](#đồng-bộ-dữ-liệu-giữa-các-thành-viên)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [API Endpoints](#api-endpoints)
- [Tài khoản test](#tài-khoản-test)
- [Tính năng](#tính-năng)

---

## Yêu cầu hệ thống

| Phần mềm | Phiên bản | Ghi chú |
|----------|-----------|---------|
| **Node.js** | 18.x trở lên | [Download](https://nodejs.org/) |
| **Git** | Bất kỳ | [Download](https://git-scm.com/) |
| **XAMPP / WAMP** | Bất kỳ | Cần module **MySQL** đang chạy |

---

## Cài đặt nhanh

### Bước 1 — Clone dự án

```bash
git clone git@github.com:vdat293/web-du-lich.git
cd web-du-lich
```

### Bước 2 — Thiết lập Backend + Database

> Bật MySQL trong XAMPP/WAMP trước khi tiếp tục!

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

# Hoặc tạo mới từ schema
npm run db:init
```

Chạy server:

```bash
npm run dev
```

Backend chạy tại **`http://localhost:3000`**

### Bước 3 — Chạy Frontend

Mở terminal mới (giữ nguyên terminal backend):

```bash
cd client
npm install
npm run dev
```

Frontend chạy tại **`http://localhost:5173`**

---

## Đồng bộ dữ liệu giữa các thành viên

Mỗi người dùng MySQL local riêng → dùng export/import qua Git để đồng bộ.

### Người có data mới → Export

```bash
cd server
npm run db:export        # Xuất DB → database-dump.sql
git add server/database-dump.sql
git commit -m "Cập nhật data mới nhất"
git push
```

### Thành viên khác → Import

```bash
git pull
cd server
npm run db:import        # Nhập data vào MySQL local
```

### Bảng lệnh

| Lệnh | Mô tả |
|------|-------|
| `npm run db:export` | Xuất toàn bộ DB → `database-dump.sql` |
| `npm run db:import` | Nhập `database-dump.sql` → DB local |
| `npm run db:init` | Khởi tạo DB lần đầu (schema) |
| `npm run dev` | Chạy server backend |

---

## Cấu trúc dự án

```
web-du-lich/
├── client/                     # Frontend (React + Vite)
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx        # Trang chủ
│       │   ├── Search.jsx      # Tìm kiếm
│       │   ├── Details.jsx     # Chi tiết khách sạn
│       │   ├── Payment.jsx     # Thanh toán
│       │   ├── Profile.jsx     # Thông tin cá nhân
│       │   └── BookingHistory.jsx  # Lịch sử đặt phòng
│       └── components/
│           └── Header.jsx      # Header / Nav / Auth modal
│
├── server/                     # Backend (Next.js API Routes)
│   ├── src/app/api/
│   │   ├── auth/               # Đăng nhập, Đăng ký
│   │   ├── properties/         # Danh sách & chi tiết khách sạn
│   │   ├── user/
│   │   │   ├── profile/        # Xem & cập nhật profile
│   │   │   └── bookings/       # Lịch sử đặt phòng (user)
│   │   └── host/
│   │       └── bookings/       # Lịch sử phòng được đặt (host)
│   ├── src/lib/
│   │   └── db.js               # Kết nối MySQL Pool
│   ├── schema.sql              # Cấu trúc bảng
│   ├── database-dump.sql       # Data đồng bộ
│   ├── export-db.js            # Script xuất DB
│   ├── import-db.js            # Script nhập DB
│   ├── init-db.js              # Tạo schema
│   └── .env                    # Cấu hình DB (không commit)
│
└── README.md
```

---

## API Endpoints

### Auth

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/auth/login` | Đăng nhập → trả JWT token |
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới |

### Properties

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/properties` | Danh sách khách sạn (kèm rooms, amenities, images) |

### User (yêu cầu JWT)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `PUT` | `/api/user/profile` | Cập nhật tên, SĐT, avatar |
| `GET` | `/api/user/bookings` | Lịch sử đặt phòng của user |
| `POST` | `/api/user/bookings` | Tạo booking mới sau thanh toán |

### Host (yêu cầu JWT)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/host/bookings` | Danh sách phòng được đặt trên property của host |

---

## Tài khoản test

| Email | Mật khẩu | Vai trò |
|-------|----------|---------|
| `test@gmail.com` | `123` | Customer |

---

## Tính năng

- **Trang chủ** — Khách sạn nổi bật, điểm đến phổ biến
- **Tìm kiếm** — Lọc theo địa điểm, loại hình, giá
- **Chi tiết** — Ảnh gallery, tiện nghi, loại phòng, bản đồ
- **Đặt phòng** — Chọn ngày (có validation), loại phòng, mã giảm giá, thanh toán
- **Lịch sử đặt phòng** — User xem lịch sử đã đặt, Host xem danh sách khách đặt phòng
- **Profile** — Đổi tên, SĐT, upload avatar
- **Auth** — Đăng ký / Đăng nhập JWT, dropdown menu, mobile menu

---

<p align="center">
  <b>Team 8386</b> — Lập trình Web · BDU · 2026
</p>

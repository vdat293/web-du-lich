# Aoklevart - Luxury Stays

Chào mừng bạn đến với dự án web du lịch **Aoklevart**! Đây là một hệ thống Fullstack hiện đại đã được thiết kế lại với kiến trúc database relatioinal rõ ràng và chặt chẽ.

🔹 **Frontend**: Xây dựng bằng ReactJS / Vite với TailwindCSS.
🔹 **Backend (API)**: Xây dựng bằng Next.js API Routes, có tính năng xác thực và lưu trữ.
🔹 **Database (CSDL)**: MySQL (Sử dụng XAMPP/WAMP Local).

Dưới đây là hướng dẫn cài đặt từ A-Z để bạn cloning dự án và chạy lên máy tính cá nhân.

---

## 🛠 Yêu cầu hệ thống

Hãy chắc chắn máy tính của bạn đã cài đặt các phần mềm cốt lõi sau:
- Môi trường Node.js (từ 18.x trở lên)
- Git
- XAMPP / WAMP / MySQL Server (để chạy Database nội bộ trên máy)

---

## 🚀 Hướng Dẫn Cài Đặt Chi Tiết Dành Cho Thành Viên Nhóm

### Bước 1: Clone dự án về máy
Mở Terminal / Command Prompt hoặc VSCode Terminal và chạy lệnh:
```bash
git clone git@github.com:vdat293/web-du-lich.git
cd web-du-lich
```

---

### Bước 2: Thiết lập Database MySQL (Local) và Backend Server

Backend của hệ thống nằm ở thư mục `server`. Bạn cần cài đặt các thư viện cũng như khởi tạo cấu trúc CSDL trực tiếp trên MySQL cục bộ.

1. **Khởi chạy MySQL trên XAMPP/WAMP (Rất quan trọng)**
   Mở phần mềm XAMPP Control Panel và nhấn "Start" bên cạnh MySQL.

2. **Cài thư viện cho Server**:
    ```bash
    cd server
    npm install
    ```

3. **Cấu hình file môi trường**:
    - Tạo một tệp tên là `.env` nằm bên trong thư mục `server/`.
    - Dán nội dung sau vào (Cấu hình mặc định dành cho XAMPP, mật khẩu để trống):
    ```env
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=web_du_lich
    JWT_SECRET=your_jwt_secret_key_here
    ```

4. **Tạo và Nạp Dữ Liệu cho Database (Seed Data)**:
    - Chạy các lệnh dưới đây để code tự động tạo Schema `web_du_lich` và đổ toàn bộ dữ liệu mẫu ban đầu từ bảng Mockup vào trong đó.
    ```bash
    node init-db.js
    node seed.js
    ```

5. **Chạy Server Backend khởi động API**:
    ```bash
    npm run dev
    ```
    👉 *API Backend sẽ chạy và luôn lắng nghe ở địa chỉ **`http://localhost:3000`***

---

### Bước 3: Cấu hình và Chạy Frontend (React/Vite)

Giữ nguyên cửa sổ Terminal của Backend. Mở một cửa sổ Terminal mới thứ hai, và trỏ nó vào thư mục `client`.

1. **Đi vào Frontend và Cài thư viện**:
    ```bash
    cd client
    npm install
    ```

2. **Khởi động Giao diện Web Du Lịch**:
    ```bash
    npm run dev
    ```
    👉 *Trang web của Khách sẽ lên sóng tại **`http://localhost:5173`***.

---

## 🔄 Đồng Bộ Dữ Liệu Cho Các Thành Viên

Khi một thành viên thêm/sửa dữ liệu trong database và muốn chia sẻ cho cả nhóm:

### 🅰️ Người có data mới (EXPORT)
```bash
cd server
npm run db:export
```
Script sẽ xuất toàn bộ database ra file `server/database-dump.sql`. Sau đó push lên Git:
```bash
git add server/database-dump.sql
git commit -m "Cập nhật data mới nhất"
git push
```

### 🅱️ Các thành viên khác (IMPORT)
```bash
git pull
cd server
npm run db:import
```
Script sẽ hỏi xác nhận, sau đó tự động nạp toàn bộ dữ liệu mới nhất vào MySQL local của bạn.

### ⚡ Lệnh tắt
| Lệnh              | Mô tả                                                        |
|--------------------|---------------------------------------------------------------|
| `npm run db:export`| Xuất database → file `database-dump.sql`                     |
| `npm run db:import`| Nhập file `database-dump.sql` → database local               |
| `npm run db:init`  | Khởi tạo database lần đầu (schema + seed data)              |

---

## 🎉 Hướng dẫn Trải Nghiệm & Tính năng
Bây giờ mọi thành viên trong team chỉ việc bật 2 môi trường (`client` cổng 5173 và `server` cổng 3000) cùng với máy chủ XAMPP MySQL.

**Tính năng nổi bật:**
1. **Lấy Dữ Liệu Thực (Mockup Seeded)**: Toàn bộ UI bây giờ đã được kết nối với Model Local thay vì các file tĩnh Array thuần.
2. **Đăng nhập & Đăng ký**:
    - Tài khoản gốc để test cho nhóm: Email `test@gmail.com` | Pass `123`
3. **Cập nhật Profile**: Đổi tên và số điện thoại theo thời gian thực nhờ State React Hook.
4. **Thay Đổi Ảnh Đại Diện (Avatar)**: Có thể tự úp Ảnh từ dưới máy tính cá nhân. App sẽ tự động quy đổi ra Base64 / File Server vật lý.

Chúc Team 8386 hoàn thành xuất sắc đồ án!

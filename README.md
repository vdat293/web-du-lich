# Aoklevart - Luxury Stays

Chào mừng bạn đến với dự án web du lịch **Aoklevart**! Đây là một hệ thống Fullstack hiện đại đã được làm lại với kiến trúc mạnh mẽ cho phép làm việc nhóm hiệu quả qua Internet.

🔹 **Frontend**: Xây dựng bằng ReactJS / Vite với TailwindCSS.
🔹 **Backend (API)**: Xây dựng bằng Next.js API Routes, có tính năng xác thực và lưu trữ file ảnh Local.
🔹 **Database (CSDL)**: Lưu trữ đồng bộ dữ liệu đám mây với **Aiven MySQL** trực tuyến, đảm bảo cả nhóm có chung một nguồn dữ liệu khi code mà không cần tự cài CSDL offline cồng kềnh.

Dưới đây là hướng dẫn cài đặt từ A-Z để bạn cloning dự án và chạy lên máy tính cá nhân.

---

## 🛠 Yêu cầu hệ thống (Prerequisites)

Hãy chắc chắn máy tính của bạn đã cài đặt các phần mềm cốt lõi sau:
- [Node.js](https://nodejs.org/) (Khuyên dùng bản LTS từ 18.x trở lên)
- [Git](https://git-scm.com/)

*(Chú ý: Hiện nay dự án dùng Database dùng chung do trưởng nhóm setup trên nền tảng Cloud Aiven, do đó các thành viên clone về **KHÔNG CẦN CHẠY XAMPP hay cài MySQL Server trên máy** nữa!)*

---

## 🚀 Hướng Dẫn Cài Đặt Chi Tiết Dành Cho Thành Viên Nhóm

### Bước 1: Clone dự án về máy
Mở Terminal / Command Prompt hoặc VSCode Terminal và chạy lệnh:
```bash
git clone git@github.com:vdat293/web-du-lich.git
cd web-du-lich
```

---

### Bước 2: Thiết lập Backend Server (Next.js)

Backend của hệ thống bây giờ nằm gọn trong thư mục `server`. Bạn cần cài và điền đúng mã khoá để kết nối chung CSDL đám mây với các bạn trong nhóm.

1. **Di chuyển vào thư mục server và cài thư viện**:
    ```bash
    cd server
    npm install
    ```

2. **Cấu hình file môi trường kết nối Aiven Cloud**: 
    - Tạo một tệp tên là `.env` nằm bên trong thư mục `server/`.
    - Dán nội dung sau vào (Hãy liên hệ trưởng nhóm/coder chính để xin mật khẩu thật sự vào ô `DB_PASSWORD` dưới đây):
    ```env
    DB_HOST=mysql-123cdb40-aoklevart.d.aivencloud.com
    DB_PORT=22669
    DB_USER=avnadmin
    DB_PASSWORD=YOUR_SECRET_PASSWORD_HERE
    DB_NAME=defaultdb
    JWT_SECRET=your_jwt_secret_key_here
    ```

3. **Tạo dữ liệu cho DB lần đầu (Chỉ người dùng khởi tạo Server, các mem khác có thể bỏ qua)**:
    - Nếu CSDL trên Cloud Aiven là mới tinh, bạn gõ lệnh dưới đây. Code sẽ tự chuyển CSDL `schema.sql` lên đám mây và đưa sẵn tài khoản test `test@gmail.com` / `123`.
    ```bash
    npm run init-db
    node init-db.js
    ```

4. **Chạy Server Backend khởi động API**:
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

2. **Khởi động Giao diện Cửa hàng Du Lịch**:
    ```bash
    npm run dev
    ```
    👉 *Trang web của Khách sẽ lên sóng tại **`http://localhost:5173`***.

---

## 🎉 Hướng dẫn Trải Nghiệm & Tính năng
Bây giờ mọi thành viên trong team chỉ việc bật 2 môi trường (`client` cổng 5173 và `server` cổng 3000) cùng lúc.

**Tính năng nổi bật đang hoạt động (Đồng Bộ Trên Aiven CSDL):**
1. **Đăng nhập & Đăng ký**: Dùng chung DB Cloud, ai lập nick bên máy nấy sẽ lập tức nhảy vào DB chung.
    - Tài khoản gốc để test cho nhóm: Email `test@gmail.com` | Pass `123`
2. **Cập nhật Profile**: Đổi tên và số điện thoại theo thời gian thực nhờ State React Hook.
3. **Thay Đổi Ảnh Đại Diện (Avatar)**: Có thể tự úp Ảnh từ dưới máy tính cá nhân. App sẽ tự động thu nhỏ độ phân giải (Compress Canvas) ra dạng Base64 và đẩy lên Server vật lý (lưu tại `server/public/uploads` tự động) rồi lưu link vào CSDL siêu mượt mà. Đảm bảo trải nghiệm UX siêu nhanh!

Chúc Team 8386 hoàn thành xuất sắc đồ án! Nếu lúc cài đặt backend dính lỗi "Unauthorized" hay "Connection Drop", hãy chắc chắn rằng port 3000 không hề bị đụng và mật khẩu CSDL ở `.env` là hoàn toàn chính xác.

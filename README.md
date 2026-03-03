# Aoklevart - Luxury Stays

Chào mừng bạn đến với dự án web du lịch **Aoklevart**! Dự án này bao gồm hai phần:
1. **Frontend**: Xây dựng bằng ReactJS / Vite
2. **Backend**: Xây dựng bằng Next.js API Routes kết hợp hệ quản trị cơ sở dữ liệu MySQL

Dưới đây là hướng dẫn cài đặt từ A-Z để bạn có thể chạy dự án trên máy cá nhân.

---

## 🛠 Yêu cầu hệ thống (Prerequisites)

Hãy chắc chắn máy tính của bạn đã cài đặt các phần mềm sau:
- [Node.js](https://nodejs.org/) (Khuyên dùng bản LTS từ 18.x trở lên)
- [Git](https://git-scm.com/)
- Hệ quản trị CSDL MySQL (bạn có thể dùng [XAMPP](https://www.apachefriends.org/index.html) hoặc [MAMP](https://www.mamp.info/))

---

## 🚀 Hướng Dẫn Cài Đặt Chi Tiết

### Bước 1: Clone dự án về máy
Mở Terminal / Command Prompt và chạy lệnh:
```bash
git clone git@github.com:vdat293/web-du-lich.git
cd web-du-lich
```

### Bước 2: Thiết lập Cơ Sở Dữ Liệu (Database MySQL)
1. Mở XAMPP (hoặc phần mềm quản lý MySQL tương tự) và **Start** dịch vụ MySQL.
2. Truy cập vào trang quản trị cơ sở dữ liệu trên trình duyệt, ví dụ: `http://localhost/phpmyadmin`
3. Tạo một Database mới có tên là: `aoklevart_db`.
4. Mở tab **SQL**, copy toàn bộ nội dung của file `server/schema.sql` có trong dự án, dán vào và bấm **Go** (Thực thi) để tạo bảng và nạp dữ liệu mẫu ban đầu.

*[Tài khoản test mặc định có sẵn sẽ là `test@gmail.com` | Mật khẩu: `123`]*

### Bước 3: Cấu hình và Chạy Backend (Next.js API)
Mở một cửa sổ Terminal mới, đi vào thư mục `server`:
```bash
cd server
```

1. **Cài đặt thư viện**:
```bash
npm install
```

2. **Cấu hình biến môi trường**: 
Đổi tên tệp `.env.example` thành `.env` (hoặc tạo file `.env` nếu nó không có sẵn) và điền các thông tin kết nối MySQL của bạn (nếu MySQL của bạn không có pass thì để trống phần `DB_PASSWORD=`).
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=aoklevart_db
JWT_SECRET=your_secret_key_here
```

3. **Chạy Server Backend**:
```bash
npm run dev
```
👉 *API Backend sẽ chạy trên địa chỉ **`http://localhost:3000`***

### Bước 4: Cấu hình và Chạy Frontend (React/Vite)
Mở một cửa sổ Terminal khác, đi vào thư mục `client` (từ thư mục gốc):
```bash
cd client
```

1. **Cài đặt thư viện**:
```bash
npm install
```

2. **Chạy Frontend**:
```bash
npm run dev
```
👉 *Trang web Frontend sẽ chạy trên địa chỉ mặc định (ví dụ: **`http://localhost:5173`***).

---

## 🎉 Hoàn tất!
Bây giờ bạn có thể mở đường dẫn của Frontend cung cấp (thường là http://localhost:5173/) ở trên trình duyệt.

- Trang chủ và danh sách tour đã hoạt động.
- Nút **Đăng nhập / Đăng ký** sẽ tự động gọi xác thực với Backend Database mà bạn vừa thiết lập.

Chúc bạn thành công! Nếu gặp lỗi khi kết nối database, hãy kiểm tra kỹ cấu hình cổng MySQL và file `.env` ở Backend nhé.

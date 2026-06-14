# Aoklevart Mobile

Ứng dụng React Native + Expo dùng chung backend với website Aoklevart.

## Chạy ứng dụng

```bash
cd server
npm run dev
```

Mở terminal khác:

```bash
cd mobile
npm install
npm start
```

Quét QR bằng Expo Go. Điện thoại và máy tính cần cùng mạng Wi-Fi.

Expo thường tự lấy IP máy phát triển. Nếu API không kết nối được, tạo `mobile/.env.local` từ `.env.example`, thay địa chỉ bằng IPv4 LAN của máy rồi khởi động lại Expo.

## Luồng đã nối backend

- Tải và tìm kiếm chỗ nghỉ từ `/api/properties`.
- Kiểm tra phòng trống trước khi thanh toán.
- Đăng nhập JWT và lưu token bằng Secure Store.
- Thanh toán thẻ sandbox với OTP hoặc đặt trước, trả tại chỗ nghỉ.
- Tạo booking cho tài khoản hoặc khách chưa đăng nhập.
- Xem booking trong tab Chuyến đi.

Backend chạy trên `0.0.0.0:3000`. API trả về URL ảnh Cloudinary tuyệt đối để thiết bị mobile tải ảnh trực tiếp từ CDN, không phụ thuộc `client/public/assets`.

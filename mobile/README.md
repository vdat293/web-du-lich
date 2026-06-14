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

Mobile mặc định sử dụng backend Render tại `https://web-du-lich-4pjb.onrender.com`. Có thể ghi đè `EXPO_PUBLIC_API_URL` trong `mobile/.env` khi cần dùng backend khác.

## Luồng đã nối backend

- Tải và tìm kiếm chỗ nghỉ từ `/api/properties`.
- Kiểm tra phòng trống trước khi thanh toán.
- Đăng nhập JWT và lưu token bằng Secure Store.
- Thanh toán thẻ sandbox với OTP hoặc đặt trước, trả tại chỗ nghỉ.
- Tạo booking cho tài khoản hoặc khách chưa đăng nhập.
- Xem booking trong tab Chuyến đi.

API trả về URL ảnh Cloudinary tuyệt đối để thiết bị mobile tải ảnh trực tiếp từ CDN, không phụ thuộc `client/public/assets`.

# Design System - Aoklevart

Tài liệu này tổng hợp các quy tắc thiết kế được rút ra từ frontend hiện tại của dự án booking Aoklevart. Mục tiêu là giữ nhất quán khi mở rộng sang app mobile, tránh tạo UI lệch khỏi ngôn ngữ hiện có.

## 1. Định hướng giao diện

- Phong cách tổng thể: premium travel, sang, ấm, nhiều khoảng thở.
- Cảm giác sản phẩm: editorial, cao cấp, tin cậy, không “techy” lạnh.
- Ưu tiên card, ảnh lớn, bo góc mềm, shadow nhẹ, overlay mờ.
- Tránh layout quá phẳng, quá công sở, hoặc màu sắc neon/sặc sỡ.

## 2. Brand tokens

Các token màu hiện có được khai báo trong `client/index.html` và đang là nền tảng của UI:

- `primary`: `#1a3a3a` - xanh teal đậm, màu thương hiệu chính.
- `primary-light`: `#2d5a5a` - biến thể nhạt hơn cho hover/gradient.
- `accent`: `#c9a962` - vàng ánh kim, dùng làm điểm nhấn.
- `accent-light`: `#e8d5a3` - vàng nhạt cho highlight.
- `cream`: `#faf8f5` - nền sáng ấm.
- `charcoal`: `#1c1c1c` - màu chữ chính.
- `warm-gray`: `#6b6b6b` - màu chữ phụ.
- `light-border`: `rgba(0,0,0,0.06)` - viền rất nhẹ.

### Quy tắc dùng màu

- Dùng `primary` cho CTA chính, trạng thái active, progress, link quan trọng.
- Dùng `accent` cho badge, điểm nhấn, icon nổi bật, đường nhấn.
- Dùng `cream` làm nền trang hoặc nền section nhẹ.
- Dùng `charcoal` cho tiêu đề và nội dung chính.
- Không lạm dụng quá nhiều màu mạnh trên cùng một màn hình.
- Không đổi sang palette tím/xanh dương mặc định của UI kit khác nếu không có lý do rõ ràng.

## 3. Typography

Frontend hiện dùng 2 font chính:

- `font-display`: `Playfair Display`
- `font-body`: `DM Sans`

### Quy tắc chữ

- Tiêu đề lớn dùng `font-display` để tạo cảm giác sang và có điểm nhấn.
- Nội dung, form, label, metadata dùng `font-body` để dễ đọc.
- Hero title có thể dùng cỡ rất lớn, nhưng phải giữ line-height thoáng.
- Label và caption nên ngắn, rõ, không nhồi nhiều chữ.
- Tránh dùng nhiều kiểu font khác ngoài 2 font chính.

## 4. Bố cục và nhịp điệu

### Nguyên tắc layout

- Màn hình mobile ưu tiên một cột.
- Desktop có thể chia 2 cột hoặc sidebar + content, nhưng mobile phải gom lại theo thứ tự hành vi.
- Content quan trọng phải nằm trên fold trên mobile.
- Khoảng cách giữa các block nên rộng hơn mức “dashboard” thông thường.

### Container và spacing

- Dùng container rộng vừa phải, có padding ngang rõ ràng.
- Mật độ nội dung nên thưa hơn ở section marketing, dày hơn ở form/booking.
- Card cần padding đủ lớn để không bị “chật”.
- Tránh nhồi quá nhiều control vào một hàng trên mobile.

## 5. Surfaces và card

### Card style

- Card mặc định nền trắng, bo góc lớn: `rounded-2xl` hoặc `rounded-3xl`.
- Shadow nên mềm, ưu tiên cảm giác nổi nhẹ hơn là đổ bóng mạnh.
- Card content nên có header, body, footer rõ ràng nếu có nhiều thông tin.
- Card ảnh nên dùng ratio ổn định, cropping đẹp, không để layout nhảy.

### Hover và active

- Hover chủ yếu là nâng nhẹ (`translateY`) và tăng shadow.
- Active nên rõ nhưng tinh tế, không giật.
- Với mobile, ưu tiên trạng thái pressed/scale nhẹ thay vì hover.

## 6. Hình ảnh và media

- Ảnh là thành phần chủ đạo của trải nghiệm booking.
- Ảnh hero và property card nên chiếm diện tích lớn.
- Dùng overlay gradient để đảm bảo chữ đọc được trên ảnh.
- Dùng `image-zoom` hoặc scale nhẹ khi hover trên desktop.
- Mobile phải đảm bảo ảnh không làm card quá cao hoặc quá nặng.

## 7. Button system

### Nút chính

- Nút chính dùng nền `primary`, chữ trắng, bo góc vừa lớn.
- CTA nên rõ hành động: `Tìm kiếm`, `Đặt ngay`, `Thanh toán`, `Lưu thay đổi`.
- Có thể thêm shadow nhẹ để tạo cảm giác nổi.

### Nút phụ

- Nút phụ thường là outline, text button, hoặc nền trắng.
- Chỉ dùng một nút chính nổi bật trong một nhóm hành động.
- Không nên để quá nhiều màu nút khác nhau trên cùng màn hình.

### Quy tắc trạng thái

- Disabled phải nhìn thấy được bằng opacity và cursor.
- Loading nên có spinner hoặc progress rõ ràng.
- Nút trong modal cần đủ lớn để chạm dễ trên mobile.

## 8. Form và input

- Input bo góc mềm, viền sáng, background nhẹ.
- Focus state phải rõ với ring màu `primary` hoặc `accent`.
- Label đặt phía trên input, font nhỏ vừa phải, không quá nhiều chữ.
- OTP input, date input, select nên dễ chạm bằng một tay.
- Trên mobile, input nên cao tối thiểu tương đương 44px.

### Quy tắc form mobile

- Không đặt quá 2 field ngang hàng nếu không thật cần.
- Các nhóm thông tin nên chia theo section ngắn.
- Khi có lỗi, hiển thị ngay dưới field hoặc đầu form.
- Nội dung helper text nên rất ngắn.

## 9. Modal và overlay

- Overlay dùng nền đen mờ + blur nhẹ.
- Modal có bo góc lớn, shadow sâu hơn card thông thường.
- Modal không nên full-screen trên desktop trừ khi là luồng quan trọng.
- Trên mobile, modal có thể chuyển sang sheet bottom hoặc full-height nếu nhiều step.
- Đóng modal phải dễ thấy, thường đặt góc phải trên.

## 10. Loading, skeleton, feedback

- Dùng top progress bar cho điều hướng toàn cục.
- Dùng skeleton card cho list khi tải dữ liệu.
- Dùng spinner nhỏ cho submit action.
- Full page loader chỉ dùng khi chặn luồng quan trọng.
- Thành công/thất bại nên hiển thị bằng toast, banner, hoặc modal rõ ràng.

## 11. Motion

Motion hiện tại là nhẹ, mượt, có chiều sâu:

- Fade in up cho section và modal.
- Scale in cho trạng thái thành công.
- Hover lift cho card và button.
- Spinner quay mềm, không gắt.

### Quy tắc motion

- Motion chỉ để dẫn hướng và tạo cảm giác premium.
- Không dùng animation quá nhanh, quá nhiều, hoặc kiểu “game UI”.
- Ưu tiên easing mềm, duration vừa phải.
- Trên mobile, tránh animation gây lag hoặc quá nhiều lớp blur.

## 12. Icon và glyph

- Icon chủ đạo là `Material Symbols Outlined`.
- Icon nên mảnh, rõ, đồng bộ theo một style.
- Khi icon là trạng thái active hoặc favorite, có thể bật fill.
- Không trộn quá nhiều bộ icon khác nhau trong cùng một trải nghiệm.

## 13. Pattern theo màn hình

### Home

- Hero lớn, mang tính cảm hứng.
- Search bar là tâm điểm.
- Featured properties và destination cards là nội dung chính.
- CTA đối tác cần nổi bật nhưng không lấn át booking flow.

### Details

- Ảnh, mô tả, tiện ích, đánh giá và booking summary phải rõ thứ tự ưu tiên.
- Mobile nên có booking bar cố định hoặc bottom action.
- Giá và CTA đặt phòng phải luôn dễ tìm.

### Search

- Filter sidebar trên desktop, filter sheet hoặc accordion trên mobile.
- Kết quả phải ưu tiên scan nhanh: ảnh, tên, location, giá, rating.
- Nên có empty state rõ ràng khi không có kết quả.

### Payment

- Chia luồng thanh toán thành bước rõ ràng.
- Hiển thị tổng tiền và breakdown trước hành động xác nhận.
- Nếu có OTP, mỗi bước cần progress indicator.

### Profile / Booking / Admin

- Dùng card, bảng, sidebar tùy mức độ phức tạp.
- Dù là công cụ quản trị, vẫn phải giữ cùng hệ màu và cảm giác thương hiệu.

## 14. Mobile-first rules

Đây là phần quan trọng nếu chuyển web booking sang app mobile:

- Mỗi màn hình chỉ nên có một hành động chính rõ ràng.
- Thanh điều hướng nên đặt thấp, dễ với tay.
- Không để các block quan trọng bị dồn quá sát mép.
- Ưu tiên bottom sheet, segmented control, tab bar, sticky action.
- Hạn chế hover-only affordance vì mobile không có hover.
- Chữ tiêu đề nên giữ mạnh, nhưng không quá lớn làm vỡ layout.
- Ảnh và card phải được tối ưu cho scroll dọc dài.

## 15. Không nên làm

- Không dùng palette tím hoặc neon mặc định.
- Không dùng border quá đậm, radius nhỏ, hoặc shadow cứng.
- Không nhồi quá nhiều control trên một hàng.
- Không dùng micro-interaction quá ồn ào.
- Không đổi hệ typography sang system font nếu chưa có lý do.
- Không phá vỡ cảm giác “premium travel” đã có.

## 16. Checklist khi thiết kế màn hình mới

- Có một primary CTA rõ ràng chưa?
- Có dùng đúng màu `primary`, `accent`, `cream`, `charcoal` chưa?
- Khoảng cách giữa các section có đủ thoáng chưa?
- Card và ảnh có giữ cảm giác premium chưa?
- Mobile có đọc được theo thứ tự hợp lý không?
- Loading / empty / error state đã được nghĩ tới chưa?
- Motion có vừa đủ để tạo cảm giác mượt, không rối không?

## 17. Nguồn tham chiếu từ codebase

Các quy tắc trên được rút ra từ:

- [`client/index.html`](./client/index.html)
- [`client/src/index.css`](./client/src/index.css)
- [`client/src/components/Header.jsx`](./client/src/components/Header.jsx)
- [`client/src/pages/Home.jsx`](./client/src/pages/Home.jsx)
- [`client/src/pages/Details.jsx`](./client/src/pages/Details.jsx)
- [`client/src/pages/Search.jsx`](./client/src/pages/Search.jsx)
- [`client/src/pages/Payment.jsx`](./client/src/pages/Payment.jsx)
- [`client/src/pages/Profile.jsx`](./client/src/pages/Profile.jsx)
- [`client/src/components/Loader.jsx`](./client/src/components/Loader.jsx)


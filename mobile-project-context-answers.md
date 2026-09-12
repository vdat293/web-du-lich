# Bộ trả lời form ngữ cảnh dự án Aoklevart — phạm vi Mobile

Ngày kiểm tra: 2026-09-10  
Phạm vi chính: mobile và backend dùng chung trong server.  
client chỉ được nhắc như web app cũ làm nền tảng định hướng; không đánh giá chi tiết client.

## 0. Cách đọc và mức độ tin cậy

- [CODE]: đọc trực tiếp từ mã nguồn, manifest, schema hoặc cấu hình trong repository.
- [DERIVED]: suy ra hợp lý từ chức năng đã có; có thể dùng làm ví dụ nhưng nên ghi là phân tích của nhóm.
- [MISSING]: không có bằng chứng trong repository; không tự điền.
- [PRIVATE]: câu hỏi về cá nhân/kiến thức/cảm nhận/đóng góp riêng; không trả lời thay người dùng.
- [OUT]: ngoài phạm vi hiện tại vì câu hỏi chỉ dành cho client/web app cũ.
- [RISK]: phát hiện cần kiểm tra thêm trước khi mô tả là hoàn thiện.

### Ba lượt kiểm tra

1. Find: quét cây thư mục, screen mobile, API service, route backend, package manifest, schema SQL, README và test.
2. Confirm: đối chiếu các kết luận với ít nhất hai nguồn trong repository; loại bỏ những chi tiết chỉ có trong suy đoán.
3. Double-check: rà toàn bộ mã câu hỏi A–AH, đánh dấu thiếu dữ liệu/cá nhân/ngoài phạm vi và kiểm tra build/typecheck/test.

### Kết quả kiểm tra kỹ thuật

- Mobile có 20 screen file, gồm Explore, Search, Details, Payment, Trips, Favorites, Profile, Security, Rewards, Notifications và Admin.
- Backend có 59 route file API và dùng chung cho web app cũ và mobile.
- server/schema.sql định nghĩa 32 bảng.
- mobile typecheck pass, mobile lint pass, 2 test suite/7 test pass.
- server next build pass.
- client chỉ được ghi nhận ở mức nền tảng cũ: build pass nhưng lint còn 58 lỗi và 23 cảnh báo; không dùng kết quả đó để đánh giá mobile.
- Runtime check: database Aiven thực tế đã kết nối được và có phone_number ở cả sandbox_cards và sandbox_otp_logs. Vì vậy đây là schema drift: server/schema.sql hiện cũ hơn database runtime; các database mới dựng chỉ từ schema.sql vẫn có nguy cơ thiếu hai cột.
- Runtime check bổ sung: GET https://web-du-lich-4pjb.onrender.com/api/properties trả HTTP 200, trả 37 property và có các field property/host/images/rooms/rating. Đây là kiểm tra read-only; chưa thực hiện booking/payment trên production.

Nguồn chính: README.md, mobile/package.json, mobile/src/api/services.ts, mobile/src/navigation/AppNavigator.tsx, server/package.json và server/schema.sql.

---

## A. Thông tin học phần và yêu cầu báo cáo

- A1 [USER-PROVIDED]: **Lập trình trên thiết bị di động**.
- A2 [USER-PROVIDED]: báo cáo/dự án nhóm 3 thành viên; hình thức cá nhân hay nhóm của bài nộp cuối vẫn cần đối chiếu mẫu báo cáo nếu có.
- A3 [USER-PROVIDED]: PO là **ThS. Nguyễn Thanh Sơn**; PM là **ThS. Dương Anh Tuấn**.
- A4 [USER-PROVIDED/DERIVED]: PO phụ trách định hướng/yêu cầu/nghiệm thu; PM hỗ trợ điều phối và quản lý tiến độ dự án. Chi tiết feedback cụ thể chưa được cung cấp.
- A5 [USER-PROVIDED]: học kỳ 3, năm học 2025–2026.
- A6 [USER-PROVIDED]: hạn nộp 13/9; tạm hiểu là 13/09/2026 theo năm học hiện tại, cần sửa nếu giảng viên ghi năm khác.
- A7 [MISSING]: chưa có giới hạn số trang.
- A8 [USER-PROVIDED]: rubric đã có trong context; tài liệu này không chép nguyên văn rubric và không làm nổi bật các tiêu chí ngoài mức cần thiết.
- A9 [PARTIAL]: đã có rubric trong context; chưa có thêm quy định trình bày/trích dẫn/checklist khác được cung cấp.
- A10–A13 [MISSING]: chưa có yêu cầu tài liệu tham khảo, chuẩn trích dẫn, Turnitin hoặc chính sách AI riêng.
- A14 [MISSING]: chưa có chỉ dẫn ngôi viết.
- A15 [PRIVATE]: lựa chọn văn phong của người dùng; không tự chọn thay.

## B. Nhận diện dự án

- B1 [CODE]: Aoklevart — Luxury Stays.
- B2 [CODE]: tên tiếng Anh đang dùng là Aoklevart — Luxury Stays.
- B3 [CODE/DERIVED]: nền tảng đặt phòng lưu trú và du lịch.
- B4 [DERIVED]: Aoklevart Mobile là ứng dụng đặt phòng lưu trú cho phép khám phá chỗ nghỉ, tìm kiếm theo điểm đến/ngày/khách/bộ lọc, xem chi tiết và tạo booking. Ứng dụng dùng chung backend với hệ thống cũ và bổ sung trải nghiệm native trên thiết bị di động.
- B5 [CODE]: sản phẩm hiện tại là mobile app React Native + Expo, kết nối backend chung; web app cũ chỉ là nền tảng tham chiếu.
- B6–B7 [MISSING]: không có đề bài gốc hoặc bằng chứng dự án xuất phát từ PO/doanh nghiệp/nhóm tự đề xuất.
- B8 [DERIVED]: giải quyết việc tìm kiếm, so sánh, lưu và đặt chỗ nghỉ trên mobile trong một luồng thống nhất.
- B9–B10 [MISSING]: repository không mô tả cách người dùng xử lý trước đây hoặc nhược điểm của quy trình cũ.
- B11 [DERIVED]: số hóa giúp người dùng thao tác ngoài desktop, nhận thông báo, lưu phiên đăng nhập và truy cập booking thuận tiện hơn.
- B12 [DERIVED]: giá trị chính là rút ngắn luồng từ khám phá đến đặt phòng, đồng thời quản lý chuyến đi/tài khoản trên mobile.
- B13 [CODE/DERIVED]: trực tiếp là khách hàng/người đặt phòng; người dùng chưa đăng nhập cũng có luồng guest booking.
- B14 [DERIVED]: host và admin hưởng lợi gián tiếp qua các API quản lý property, booking, user và coupon; mức độ sử dụng thực tế chưa xác nhận.
- B15 [MISSING]: không có danh sách sản phẩm tham khảo hoặc link benchmark.

## C. Người dùng và bên liên quan

- C1 [CODE]: customer, host, admin, guest chưa đăng nhập và các dịch vụ hệ thống như MySQL, Cloudinary, Expo Push, sandbox payment.
- C2 [CODE]:
  - Guest: xem/tìm property, kiểm tra availability, tạo booking không cần tài khoản.
  - Customer: login/OTP, profile, wishlist, booking, payment, review, rewards, notification, đổi password/PIN, biometric lock.
  - Host: quản lý property/room, xem và xử lý booking, walk-in booking, gia hạn checkout.
  - Admin mobile hiện có UI cho Dashboard, Users và Promotions; backend còn expose property/room, booking, thẻ sandbox/OTP, email/SMS/log/notification campaign nhưng chưa có mobile screen tương ứng trong navigation hiện tại.
- C3 [MISSING]: không có tài liệu ưu tiên actor; có thể phân tích customer là actor trung tâm vì mobile navigation xoay quanh Explore, Saved, Trips, Rewards, Notifications và Profile.
- C4 [CODE]: có phân quyền ở backend theo JWT và role.
- C5 [CODE]: verifyAdmin yêu cầu role=admin, verifyHost yêu cầu role=host; route user yêu cầu token hợp lệ. Backend mới là nơi kiểm tra quyền.
- C6–C10 [MISSING]: chưa có stakeholder ngoài code, PO/người nghiệm thu, lịch sử thay đổi requirement hoặc feedback. Không tự bịa ngữ cảnh.

## D. Mục tiêu dự án

- D1 [DERIVED]: chuyển trải nghiệm đặt phòng từ web app cũ sang mobile native, dùng backend chung và cung cấp luồng booking/account hoàn chỉnh trên thiết bị di động.
- D2 [CODE]: khám phá property; search/filter; details/availability; authentication; booking; payment; trips; wishlist; profile/security; rewards; notifications; admin.
- D3 [CODE]: 13 nhóm chức năng quan trọng: login password, login OTP, register/reset password, tìm kiếm/lọc, xem chi tiết, kiểm tra phòng trống, booking customer/guest, sandbox card OTP/cash, xem/hủy booking, wishlist, rewards/coupon, notification/push và quản trị mobile.
- D4 [DERIVED]: MVP nên gồm Explore → Search → Details → Availability → Booking/Payment → Trips, cùng authentication tối thiểu.
- D5 [CODE]: wishlist, rewards/membership, push notification, biometric app lock, transaction PIN, change password, admin mobile và coupon management.
- D6 [CODE]: ưu tiên một thao tác chính mỗi màn hình, bottom tab dễ chạm, card/ảnh lớn, loading/error/empty state và modal/sheet cho luồng nhiều bước.
- D7 [CODE]: mobile portrait là hướng chính; app.json cấu hình portrait và hỗ trợ tablet iOS. Chưa có bằng chứng nghiệm thu nhiều kích thước thiết bị.
- D8 [MISSING]: không có SLA về thời gian tải, throughput hoặc số người dùng; API client có timeout mặc định 15 giây.
- D9 [CODE/RISK]: JWT, bcryptjs, Secure Store, role check, input validation, parameterized SQL, timeout/error handling. Hạn chế: CORS mở *, không thấy rate limiting và có fallback JWT secret mặc định.
- D10 [DERIVED]: có khả năng mở rộng theo module/service route và connection pool; chưa có mục tiêu scale chính thức.
- D11 [CODE]: tiêu chí kiểm tra được: mobile typecheck/lint/test pass, server build pass và route chính tồn tại. Acceptance thực tế của PO chưa có bằng chứng.
- D12 [MISSING]: không có acceptance criteria chính thức từ PO.

## E. Phạm vi và giới hạn

- E1 [CODE]: discovery, search, details, booking/payment, trips, favorites, profile, security, rewards, notifications, help và admin dashboard/users/promotions.
- E2–E3 [MISSING]: không có backlog ban đầu hoặc lý do loại bỏ chức năng.
- E4 [CODE]: sandbox card + OTP payment, MoMo demo/simulated flow và virtual SMS/email là vùng demo, không phải payment/SMS/email production.
- E5 [CODE]: reward seed trong schema, dữ liệu sandbox, notification/push và một số nội dung UI mẫu; property data thật phụ thuộc DB.
- E6 [RISK]: mobile đã gọi nhiều API thật theo services.ts nhưng chưa thể khẳng định mọi endpoint chạy production. Runtime Aiven đã có card.phone_number và sandbox_otp_logs.phone_number, nhưng server/schema.sql chưa khai báo chúng; cần đồng bộ DDL/migration để môi trường mới không lỗi. Guest booking cũng có điểm lệch trạng thái: khi finalStatus là confirmed, route vẫn ghi booking_status_history là pending và một nhánh vẫn trả response status pending; cần sửa hoặc xác minh trước khi mô tả flow nhất quán.
- E7 [CODE]: Cloudinary cho media/avatar; Expo Notifications/Push; backend Render được mobile README cấu hình mặc định; payment/email/SMS là sandbox/virtual.
- E8 [CODE/RISK]: phụ thuộc backend chung; API response chưa thống nhất; chưa có ORM/migration framework tổng quát; schema/runtime có dấu hiệu lệch.
- E9 [CODE]: dữ liệu property/room/booking phụ thuộc DB; repository có schema nhưng không có database dump hiện tại. README còn tham chiếu seed script không còn trong cây file hiện tại.
- E10 [CODE/RISK]: secret dựa trên .env nhưng có fallback secret; CORS *; chưa có security test/rate limit; sandbox schema cần đối chiếu.
- E11 [MISSING]: chưa có load test, performance benchmark hoặc số người dùng đồng thời.
- E12 [MISSING]: chưa có lịch học kỳ để kết luận giới hạn thời gian.
- E13 [DERIVED]: production payment gateway, migration chuẩn, push deep-link, E2E, monitoring, bảo mật, cache/search pagination, offline-friendly UX và app release.

## F. Thông tin nhóm và vai trò cá nhân

- F1 [USER-PROVIDED]: 3 thành viên.
- F2 [USER-PROVIDED/PARTIAL]: Phạm Hoàng Lộc, Nguyễn Vũ Đạt và Thuận; MSSV chưa cung cấp.
- F3 [USER-PROVIDED]: Phạm Hoàng Lộc — Frontend + Scrum Master; Nguyễn Vũ Đạt — Backend; Thuận — Database.
- F4 [USER-PROVIDED]: Backend và Database kế thừa/phát triển từ dự án trước; Nguyễn Vũ Đạt nắm context Frontend và Database do liên quan nền tảng cũ, nhưng vai trò chính hiện tại vẫn là Backend.
- F5–F17 [PRIVATE/MISSING]: chưa xác định người viết báo cáo là thành viên nào và chưa có bằng chứng riêng về màn hình/API/database/deploy/Git/Jira/kiểm thử của từng người; không tự gán ownership cá nhân từ code.
- F18–F21 [PRIVATE/MISSING]: chưa có danh sách đóng góp riêng, phần thể hiện năng lực, việc vượt nhiệm vụ hoặc vấn đề cá nhân giải quyết.
- F22 [USER-PROVIDED]: đánh giá định tính: Phạm Hoàng Lộc và Nguyễn Vũ Đạt đóng góp tương đương nhau; Thuận đóng góp ít hơn. Không quy đổi thành phần trăm nếu chưa có bảng task/commit làm chứng.

## G. WIL — Work-Integrated Learning

- G1 [MISSING]: chưa có định nghĩa WIL chính thức từ giảng viên.
- G2–G3 [DERIVED/USER-PROVIDED]: dự án mô phỏng môi trường phát triển có PO, PM, Scrum Master và Development Team; vai trò chính thức của nhà trường chưa có tài liệu.
- G4 [USER-PROVIDED]: PO là ThS. Nguyễn Thanh Sơn; PM là ThS. Dương Anh Tuấn.
- G5 [USER-PROVIDED]: sinh viên đảm nhiệm Frontend/Scrum Master, Backend và Database trong nhóm 3 người.
- G6 [MISSING]: chưa có doanh nghiệp thực tế được xác nhận.
- G7 [MISSING]: không có tên doanh nghiệp/người phụ trách/yêu cầu doanh nghiệp.
- G8–G13 [MISSING]: không có kênh nhận requirement, lịch báo cáo, feedback PO hoặc thay đổi sau feedback.
- G14–G16 [PRIVATE/MISSING]: không tự trả lời cảm nhận, kỹ năng và tình huống làm việc thật.

## H. Scrum và quy trình phát triển

- H1 [USER-PROVIDED]: Có sử dụng Scrum.
- H2 [USER-PROVIDED]: PO là ThS. Nguyễn Thanh Sơn.
- H3 [USER-PROVIDED]: Scrum Master là Phạm Hoàng Lộc.
- H4 [USER-PROVIDED]: Development Team gồm Phạm Hoàng Lộc, Nguyễn Vũ Đạt và Thuận.
- H5 [MISSING]: chưa có ngày bắt đầu/kết thúc dự án.
- H6 [USER-PROVIDED]: 3 Sprint.
- H7 [USER-PROVIDED]: mỗi Sprint kéo dài 4 tuần.
- H8–H12 [PENDING]: mục tiêu và nội dung Sprint 1–3 sẽ bổ sung sau.
- H13 [USER-PROVIDED]: có Sprint Planning.
- H14 [PENDING]: cách Planning cụ thể sẽ bổ sung sau.
- H15–H17 [PENDING]: chưa có thông tin Daily Scrum, chu kỳ họp, thời lượng và nội dung báo cáo.
- H18 [USER-PROVIDED]: có Sprint Review.
- H19–H20 [PENDING]: chưa có danh sách người tham gia và feedback từng Review.
- H21 [USER-PROVIDED]: có Sprint Retrospective.
- H22 [PENDING]: kết quả cải tiến sau từng Retro sẽ bổ sung sau.
- H23–H25 [MISSING]: không có dữ liệu Sprint không đạt/carry-over.
- H26–H28 [MISSING]: không thấy cách estimate, ưu tiên task hoặc Definition of Done.

## I. Jira / quản lý công việc

- I1 [USER-PROVIDED]: nhóm sử dụng Jira.
- I2 [MISSING]: chưa có link Jira Board.
- I3 [USER-PROVIDED]: board theo mô hình Scrum.
- I4–I18 [PENDING]: trạng thái task, backlog, ticket, Epic, User Story, bug, burndown, số task Done, task trễ và cách xử lý sẽ bổ sung sau. Git history không thay thế được bằng chứng Jira.

## J. User Story và yêu cầu chức năng

- J1–J2 [PENDING]: chưa có tài liệu User Story riêng trong workspace; nhóm sẽ bổ sung sau.
- J3–J5 [DERIVED]: user story có thể dựng từ code:

| Actor | User story | Lợi ích |
|---|---|---|
| Guest | Tìm chỗ nghỉ theo điểm đến, ngày, số khách và bộ lọc | Tìm lựa chọn phù hợp trước khi login |
| Guest | Đặt phòng không cần tài khoản | Giảm rào cản cho booking nhanh |
| Customer | Login bằng password hoặc OTP | Chọn phương thức xác thực thuận tiện |
| Customer | Xem details, room, rating, amenity và availability | Có thông tin trước khi quyết định |
| Customer | Booking và chọn card OTP/cash/flow payment | Hoàn tất booking trên mobile |
| Customer | Xem/hủy chuyến đi và lưu property | Quản lý hành trình cá nhân |
| Customer | Đổi thưởng bằng điểm/coupon | Tăng giá trị sau booking |
| Customer | Nhận/xem/mở notification và bật push | Không bỏ lỡ trạng thái |
| Customer | Đổi password/PIN và bật biometric lock | Tăng bảo vệ tài khoản/giao dịch |
| Admin | Xem stats, quản lý user và coupon | Điều hành hệ thống trên mobile |
| Host | Quản lý property, room và booking | Vận hành nguồn cung |

- J6 [MISSING]: chưa có acceptance criteria chính thức.
- J7 [CODE]: Authentication; Discovery/Search; Property/Room; Booking; Payment; User/Profile/Security; Wishlist; Rewards/Coupon; Notifications; Admin/Host.
- J8 [CODE]: password login, OTP login, register, forgot/reset password, magic link/setup password.
- J9 [CODE]: profile/avatar/phone, bookings, wishlist, payments, messages, rewards, notifications, push token, password/PIN và biometric local lock.
- J10 [CODE/PARTIAL]: mobile admin UI có stats/dashboard, users CRUD và coupons/promotions CRUD; backend admin API còn có property/room CRUD, bookings/status, sandbox cards/OTP, emails, notification campaigns/send và logs nhưng chưa phải toàn bộ mobile UI.
- J11 [CODE]: availability/occupancy, booking/coupon/loyalty, sandbox payment OTP, push notification và host operation.
- J12 [DERIVED]: booking end-to-end là nghiệp vụ phức tạp nhất vì liên quan room availability, guest/customer, coupon, payment, status history, magic link và notification.
- J13 [CODE/DERIVED]: chọn room/date/guest → check availability → tính giá/coupon → customer booking hoặc guest booking → chọn payment/cash → sandbox card initiate OTP rồi confirm → cập nhật payment/status history → mobile hiển thị Trips; lỗi trả HTTP error và màn hình hiển thị retry/error.
- J14 [CODE]: có tương tác nhiều actor/hệ thống: Guest/Customer, Host/Admin, backend, database, payment sandbox và notification.

## K. Luồng nghiệp vụ và Use Case

- K1–K2 [MISSING]: chưa có Use Case Diagram file.
- K3 [DERIVED]: Guest, Customer, Host, Admin, Backend/System, sandbox payment, Expo Push và Cloudinary.
- K4 [DERIVED/PARTIAL]: 10 luồng có thể dùng làm nội dung sơ đồ. Danh sách dưới đây là bản tóm tắt; khi đưa vào báo cáo cần mở rộng từng luồng theo đúng các cột “actor bắt đầu, tiền điều kiện, bước, kết quả, lỗi, phản hồi hệ thống”:

1. UC-01 Khám phá/tìm kiếm: Explore → nhập điểm đến → Search → chọn ngày/khách/giá/type/amenity → gọi /api/properties → list hoặc empty/error.
2. UC-02 Details/availability: Details → chọn ngày/room/guest → gọi /api/check-availability → nếu còn phòng thì đi Payment.
3. UC-03 Login: nhập email/phone+password hoặc yêu cầu OTP → backend xác minh → JWT → Secure Store → trở lại luồng.
4. UC-04 Booking: nhập guest info → chọn coupon/payment → create customer/guest booking → backend ghi booking/payment/status history.
5. UC-05 Card sandbox: initiate → server tạo transaction/OTP → confirm OTP → trừ balance/đánh dấu USED. Cần kiểm tra schema phone_number trước demo.
6. UC-06 Trips: mở Trips → GET /api/user/bookings → xem status → cancel qua PATCH status.
7. UC-07 Wishlist: favorite → POST wishlist → Saved GET → DELETE khi bỏ lưu.
8. UC-08 Rewards: xem điểm → redeem → kiểm tra điểm/PIN → tạo coupon/redemption → dùng coupon.
9. UC-09 Notification: đăng ký Expo token → admin send campaign → server lưu notification/gửi push → mobile list/open/mark read.
10. UC-10 Admin: admin login → dashboard stats → CRUD user/coupon; service gọi admin API với authenticated token.

- K5 [DERIVED]: UC-01 → UC-02 → UC-04/UC-05 là luồng cốt lõi.
- K6–K10 [MISSING]: chưa có Sequence, Activity, Flowchart, State Diagram hoặc danh sách sơ đồ bắt buộc. Các luồng trên là cơ sở để tự dựng.

## L. UI/UX và thiết kế Mobile

- L1–L2 [MISSING]: không có file/link Figma.
- L3 [MISSING/PRIVATE]: chưa có bằng chứng ai thiết kế UI/UX.
- L4 [CODE]: có theme.ts và component dùng lại như PropertyCard, ScreenState, BrandLogo, LanguageSwitcher, LoginForm; chưa có design-system package.
- L5 [CODE]: primary #012425, primary container #1a3a3a, secondary #745b1c, accent #e8d5a3, surface #fcf9f8, text #1b1b1b, error #ba1a1a, success #28663f.
- L6 [CODE]: DM Sans qua @expo-google-fonts/dm-sans.
- L7 [CODE]: có shared component và Auth/Favorites context.
- L8 [CODE]: Explore, Search, Details, Payment, Trips, Saved, Profile, Security, Rewards, Notifications, Login và Admin.
- L9 [OUT]: screenshot website cũ không thuộc phạm vi; nên chụp screen mobile tương đương.
- L10 [CODE]: mobile dùng native layout, không có CSS responsive kiểu website.
- L11 [CODE]: portrait; iOS supportsTablet; chưa có device matrix.
- L12 [CODE]: app config light; chưa có dark mode toggle.
- L13 [CODE]: validation ngày, giá, required field, OTP/PIN, password, coupon/payment.
- L14 [CODE]: ActivityIndicator, loading state và PropertyCardSkeleton.
- L15 [CODE]: error state, retry, ApiError và unauthorized listener.
- L16 [CODE]: EmptyState và empty list cho Saved, Trips, Notifications, Search, Promotions, Users.
- L17 [CODE]: React Native Alert, inline error, success message, notification inbox; không thấy thư viện toast riêng.
- L18 [CODE]: admin users có pagination; public property service có limit nhưng chưa có pagination đầy đủ.
- L19 [CODE]: search/filter/sort nghiệp vụ có trong Search và Admin Promotions/Users; filter gồm date, guests, price, type, amenities.
- L20 [MISSING]: chưa có accessibility audit hoặc test screen reader/font scaling.
- L21 [DERIVED]: quyết định quan trọng là bottom-tab navigation, một primary action, booking/payment chia step/modal và giữ nhận diện từ web app cũ qua shared tokens.

## M. Kiến trúc hệ thống

- M1 [CODE/DERIVED]: client–server: React Native/Expo mobile → HTTP JSON API → Next.js route handlers → MySQL; thêm Cloudinary, Expo Push và Socket.IO/virtual services.
- M2 [CODE]: mobile và server tách riêng; backend dùng chung với web app cũ.
- M3 [CODE]: MySQL qua mysql2/promise connection pool; vị trí deploy cụ thể chưa xác minh.
- M4 [CODE]: HTTP JSON REST-style API với fetch, không thấy GraphQL.
- M5 [CODE]: login/OTP trả JWT; mobile gắn Bearer token; server verify JWT rồi đọc user từ DB.
- M6 [CODE]: authorization theo role ở server; mobile chỉ hỗ trợ UX/điều hướng.
- M7 [CODE]: có jsonwebtoken.
- M8 [CODE]: không thấy refresh token; login token expiresIn 30d, magic link có route dùng 24h.
- M9 [CODE]: không có middleware file chung; có helper verifyUser/verifyHost/verifyAdmin và route-level checks.
- M10 [CODE]: không có Repository Pattern chuẩn; route gọi db.execute trực tiếp.
- M11 [CODE]: có helper/service layer nhẹ trong server/src/lib: bookings, coupons, loyalty, notifications, cloudinary, email, sms.
- M12 [CODE]: không có DTO class/schema package; TypeScript types chỉ ở mobile.
- M13 [CODE]: không có mapper layer riêng; có format/normalize functions.
- M14 [CODE]: validation inline trong route/service và mobile; chưa có validation framework chung.
- M15 [MISSING]: không thấy cache layer; media route có Cache-Control nhưng không phải application cache.
- M16 [CODE]: upload avatar dạng data URI/base64.
- M17 [CODE]: avatar mới upload Cloudinary; media cũ có route đọc public media và URL resolver.
- M18 [CODE]: Cloudinary, Expo Push, fonts, Render; email/SMS/payment là virtual/sandbox.
- M19 [CODE]: virtual email lưu system_emails và phát Socket.IO, chưa phải SMTP/provider thật.
- M20 [CODE]: sandbox card OTP và payment method cash/MoMo flow; README server ghi payment simulate, chưa có MoMo/VNPay thật.
- M21 [CODE]: custom server có Socket.IO/event cho booking/OTP/email/SMS; mobile hiện chủ yếu dùng HTTP/push.
- M22 [MISSING]: chưa có architecture diagram file.
- M23 [DERIVED]: chọn kiến trúc này để mobile dùng lại nghiệp vụ/DB/API của web cũ, giảm trùng lặp; đổi lại backend route-level cần chuẩn hóa thêm.

Architecture diagram đề xuất:

    Mobile Expo React Native
             |
             | HTTPS JSON + Bearer JWT
             v
    Next.js App Router API
       |        |        |        |
       v        v        v        v
    MySQL  Cloudinary  Expo Push  Sandbox/Virtual services
             ^
             |
        Web app cũ dùng chung backend

## N. Công nghệ và môi trường

- N1 [CODE]: TypeScript, React Native, Expo, React Navigation và native Expo modules.
- N2 [CODE]: Expo ~54.0.37, React Native 0.81.5, React 19.1.0, TypeScript ~5.9.2.
- N3 [CODE]: React Navigation, Secure Store, Local Authentication, Notifications, Image Picker, Linear Gradient, i18next/react-i18next, Expo Fonts, Jest/Testing Library.
- N4 [CODE]: Node.js + Next.js App Router/custom HTTP server.
- N5 [CODE]: Next ^16.1.6, React ^19.2.4; README server còn ghi Next 14 nên README cũ hơn manifest.
- N6 [CODE]: MySQL.
- N7 [MISSING]: README yêu cầu MySQL 8.0+, nhưng version DB runtime chưa xác minh.
- N8 [CODE]: không dùng ORM; dùng mysql2/promise.
- N9 [CODE]: jsonwebtoken, bcryptjs; mobile lưu token bằng expo-secure-store native.
- N10 [CODE]: mobile không dùng CSS framework; dùng StyleSheet và theme tokens.
- N11 [CODE]: AuthContext, FavoritesContext và local screen state; không có Redux/Zustand.
- N12 [CODE]: native fetch qua apiRequest wrapper.
- N13 [MISSING]: IDE/editor không suy ra từ source.
- N14 [MISSING]: hệ điều hành phát triển không ghi trong project; CI dùng Ubuntu.
- N15 [CODE]: npm; Android dùng Gradle.
- N16 [CODE]: Jest; chưa có Postman/Insomnia/Swagger collection.
- N17 [MISSING]: không có Swagger/OpenAPI.
- N18 [CODE]: không thấy Docker; có GitHub Actions mobile CI.
- N19 [DERIVED]: mobile-native/Expo, Secure Store, push notification, biometric lock, Android build/notification delivery và shared API integration là các mảng mở rộng từ web sang mobile; mức độ học mới của từng thành viên không suy ra.
- N20 [DERIVED]: Expo/React Native cho đa nền tảng; shared REST backend giảm trùng nghiệp vụ; Secure Store/local auth/push phù hợp mobile; TypeScript hỗ trợ kiểm soát kiểu.
- N21 [MISSING]: không có tài liệu công nghệ khác đã cân nhắc.

## O. Frontend / Mobile client hiện tại

- O1 [CODE]: mobile gồm App.tsx/index.ts; src/api, components, context, navigation, notifications, screens, utils, storage, theme, i18n; android chứa native Android project.
- O2 [CODE]: api gọi backend; components dùng lại UI; context giữ auth/favorites; navigation định nghĩa Stack/Tab; screens chứa màn hình; notifications xử lý Expo push; utils chứa date/media/search; storage bọc Secure Store/localStorage.
- O3 [CODE]: AppErrorBoundary, PropertyCard, PropertyCardSkeleton, ScreenState, BrandLogo, LanguageSwitcher, LoginForm, AuthPlaceholder và các context/provider.
- O4 [CODE]: có component tái sử dụng và hai custom context hooks là useAuth/useFavorites.
- O5 [CODE]: layout chung ở AppNavigator/NavigationContainer, bottom tabs, native stack, SafeAreaView và theme tokens; không có web layout component riêng.
- O6 [CODE]: React Navigation native stack kết hợp bottom tabs; Tabs gồm Explore, Saved, Trips, Rewards, Notifications, Profile; Stack gồm Search, Details, Payment, PersonalInfo, Security, ChangePassword, SetupPin, HelpCenter, AdminDashboard, Login, Unlock.
- O7 [CODE/PARTIAL]: không có ProtectedRoute component riêng; screen-level checks/AuthContext chặn thao tác cần login, còn backend là lớp bảo vệ chính.
- O8 [CODE]: admin mobile kiểm tra user.role === admin ở AdminDashboardScreen; user/host/admin authorization tiếp tục được kiểm tra tại backend.
- O9 [CODE]: native fetch qua apiRequest; services.ts tách property, auth, booking, payment, user, notification, rewards, security, coupon và admin.
- O10 [CODE]: native dùng expo-secure-store với key aoklevart_token/aoklevart_user; web fallback của mobile dùng localStorage.
- O11 [CODE]: form dùng controlled TextInput/React state; không có React Hook Form/Formik.
- O12 [CODE]: validation inline cho required field, ngày, giá, password, OTP, PIN, coupon và payment.
- O13 [CODE]: AuthContext/FavoritesContext + local useState/useMemo/useCallback/useEffect; không dùng Redux/Zustand.
- O14 [CODE]: có useAuth và useFavorites; chưa có thư mục custom hooks riêng.
- O15 [CODE]: có normalization media, timeout/abort, optimistic favorite update và cleanup; chưa thấy code splitting/lazy screen hoặc cache data layer.
- O16 [CODE]: native StyleSheet/theme, ScrollView/FlatList, SafeAreaView và portrait orientation; chưa có device test matrix.
- O17–O18 [DERIVED/RISK]: phần khó là đồng bộ mobile auth/booking/payment/notification với shared backend và xử lý loading/error/offline; giải pháp là apiRequest wrapper, typed services, AuthContext, Secure Store, retry/error state và CI checks.
- O19 [DERIVED]: nên chọn apiRequest.ts, AuthContext.tsx, services.ts, DetailsScreen/PaymentScreen và AdminDashboardScreen làm code fragment; client web cũ chỉ nêu ở phần nền tảng tham chiếu.

## P. Backend và API dùng chung

- P1 [CODE]: server/src/app/api chứa route theo domain auth, user, admin, host, guest, bookings, properties, reviews, coupons, sandbox, media, tracking; server/src/lib chứa helper/service.
- P2 [CODE]: không chia Controller/Service/Repository chặt; route handler đảm nhiệm controller + một phần nghiệp vụ, lib là service/helper, db là driver.
- P3 [DERIVED]: route nhận request, validate, auth, gọi SQL/service và trả NextResponse.
- P4 [CODE]: lib xử lý booking, coupon, loyalty, notifications, media, email, SMS; một số nghiệp vụ vẫn nằm trong route.
- P5 [CODE]: không có repository riêng; SQL nằm trong route/lib.
- P6–P8 [CODE/PARTIAL]: inventory endpoint hiện có, bỏ qua OPTIONS preflight khi liệt kê method:
  - Auth: POST /api/auth/login, register, magic-login, otp-login, send-login-otp, forgot-password, reset-password, setup-password, sms-otp, update-password, verify-otp; GET /api/auth/resolve-link.
  - Public/booking: GET /api/properties; POST /api/check-availability, /api/guest/bookings, /api/guest/confirm, /api/reviews, /api/sandbox/payment; GET/PATCH /api/bookings/[id]/status; POST /api/bookings/[id]/extend; GET /api/guest/booking-details, /api/guest/bookings/pending; GET/POST /api/coupons; GET/POST /api/reviews.
  - User: GET/POST /api/user/bookings; GET/POST /api/user/messages; GET/PATCH /api/user/notifications; POST /api/user/notifications/opened; GET/POST /api/user/payments; GET/PUT /api/user/profile; GET/POST/DELETE /api/user/wishlist; GET/POST /api/user/rewards; POST /api/user/security/password; POST /api/user/security/transaction-pin; POST/DELETE /api/user/push-tokens.
  - Host: GET /api/host/bookings; GET/POST /api/host/properties; PATCH/DELETE /api/host/properties/[id]; GET/POST/PUT/DELETE /api/host/properties/[id]/rooms; POST /api/host/bookings/walk-in.
  - Admin: GET /api/admin/stats, users, users/[id], bookings, bookings/[id], properties, properties/[id], properties/[id]/rooms, cards, cards/[id], coupons, emails, logs, otps, notifications/campaigns; POST /api/admin/users, cards, coupons, notifications/send; PUT/DELETE các resource có route [id].
  - System/media: GET /api/media/[...path], /api/sms; PATCH /api/sms; POST /api/tracking/visit.
  - Không có Swagger/Postman collection; danh sách trên là nhóm endpoint phục vụ mobile/backend, đầy đủ path chi tiết nằm trong server/src/app/api.
- P9–P10 [DERIVED]: create booking/availability/payment là API phức tạp nhất. User booking mở DB transaction, kiểm tra room availability, khóa/kiểm tra coupon, tính final price, INSERT booking/payment/status history/coupon, commit, sau đó xử lý loyalty, magic link, notification và virtual email/SMS. Guest booking cũng kiểm tra availability và transaction nhưng hiện link/tạo users rồi ghi vào bảng bookings; không nên mô tả là luôn ghi guest_bookings.
- P11 [CODE]: có try/catch ở route nhưng không thấy global exception handler chuẩn thống nhất.
- P12 [CODE/RISK]: response chưa thống nhất: array trực tiếp, user, success, message, data; mobile wrapper đọc message/error.
- P13 [CODE]: dùng 201/204/400/401/403/404/500 ở nhiều route; chưa có contract audit toàn bộ.
- P14 [CODE]: validation inline cho required field, ngày, số, price, role, OTP, password, coupon.
- P15 [CODE]: bcryptjs.
- P16 [CODE]: RBAC admin/host và authenticated user checks.
- P17 [MISSING/RISK]: không thấy rate limiting.
- P18 [CODE]: console logs và activity_logs; notification/payment/booking có event log.
- P19 [CODE]: có transaction ở user booking, guest booking, rewards/loyalty; không phải mọi route đều transaction.
- P20 [CODE]: admin users/bookings/properties/logs/OTPs có pagination; public properties có limit/filter/availability.
- P21–P22 [DERIVED/RISK]: khó khăn chính là booking/availability, nhiều client dùng chung, payment sandbox, notifications và schema tiến hóa; runtime đã có phone_number nhưng schema.sql chưa theo kịp nên cần đồng bộ DDL/migration. Ngoài ra guest booking có nhánh finalStatus=confirmed nhưng history/response vẫn có thể ghi/trả pending.
- P23 [DERIVED]: nên đưa vào báo cáo: mobile/src/api/client.ts; server/src/lib/auth.js; server/src/app/api/properties/route.js; server/src/app/api/user/bookings/route.js; server/src/lib/notifications.js.

## Q. Database

- Q1 [CODE]: MySQL.
- Q2 [MISSING]: chưa có ERD file; ERD bên dưới là bản đề xuất từ schema.
- Q3 [CODE]: 32 bảng.
- Q4–Q5 [CODE]:

| Bảng | Vai trò |
|---|---|
| users | tài khoản, role, loyalty, PIN |
| properties | chỗ nghỉ, host, location, trạng thái |
| property_images | ảnh property |
| amenities | danh mục tiện nghi |
| property_amenities | liên kết property–amenity |
| room_types | hạng phòng, giá, allotment, capacity |
| bookings | booking của user |
| guest_bookings | booking tạm của guest |
| payments | thanh toán gắn booking |
| booking_status_history | lịch sử trạng thái |
| booking_coupons | coupon áp dụng booking |
| coupons | mã giảm giá |
| reviews | đánh giá property |
| wishlists | property yêu thích |
| conversations | cuộc trò chuyện guest–host |
| messages | tin nhắn |
| property_rules | quy định property |
| loyalty_transactions | điểm phát sinh từ booking |
| rewards | phần thưởng |
| reward_redemptions | lịch sử đổi thưởng |
| push_tokens | Expo token |
| notification_campaigns | campaign admin |
| notifications | notification theo user |
| notification_deliveries | trạng thái push delivery |
| verification_otps | OTP xác minh |
| magic_links | magic link |
| sandbox_cards | thẻ giả lập |
| sandbox_otp_logs | OTP giao dịch sandbox |
| system_emails | email ảo |
| system_sms | SMS ảo |
| site_visits | lượt truy cập |
| activity_logs | log hoạt động |

- Q6 [CODE]: entity table có id AUTO_INCREMENT PRIMARY KEY; property_amenities(property_id, amenity_id) và booking_coupons(booking_id, coupon_id) dùng khóa ghép.
- Q7 [CODE]: property→users(host); images/rooms/rules→properties; property_amenities→properties/amenities; bookings→users/properties/rooms; payments/status/reviews/loyalty→booking; booking_coupons→booking/coupons; wishlist→users/properties; conversations→booking/users/property; messages→conversation/users; notifications/push→users; notifications→campaigns; notification_deliveries→notifications/push_tokens; guest_bookings→properties/rooms; logs→users.
- Q8 [DERIVED]: 1–N user–bookings, host–properties, property–rooms, property–images, booking–payments, booking–status history, conversation–messages, user–notifications, user–push_tokens. N–N property–amenities và booking–coupons. Gần 1–1 booking–review và booking–loyalty được giới hạn bằng unique. guest_bookings riêng liên kết property/room; POST guest hiện tại lại tạo/liên kết users rồi ghi bookings.
- Q9 [CODE]: property_amenities và booking_coupons.
- Q10 [CODE]: unique email/phone, Expo token, image property+URL, room name property, loyalty booking, review booking, wishlist user+property, coupon code, reward key, redemption coupon, guest token, magic code, card number, OTP transaction id.
- Q11 [CODE]: index push token, notification, delivery; primary/unique index tự sinh.
- Q12 [CODE]: CASCADE cho dữ liệu phụ thuộc; SET NULL cho campaign creator/sent_by, conversation booking/property, status updater, visits/log user.
- Q13 [CODE]: không có soft delete chuẩn; có status, is_active, is_confirmed, is_read.
- Q14 [CODE]: hầu hết có created_at; bookings có updated_at; notification_deliveries có created_at/updated_at.
- Q15 [CODE]: có activity_logs nhưng chưa chứng minh audit đầy đủ.
- Q16 [CODE]: có migrate loyalty/notifications/assets/search tags và init/import/export; chưa có migration framework/version table tổng quát.
- Q17 [CODE/RISK]: rewards có INSERT seed; README tham chiếu seed room/card nhưng script tương ứng không có trong cây file hiện tại.
- Q18 [DERIVED]: quan hệ chính được chuẩn hóa; search_tags, bed_configuration, data_json là các trường JSON linh hoạt.
- Q19 [DERIVED]: tách room type để kiểm tra allotment; junction cho amenities/coupon; status history; push delivery theo device.
- Q20 [CODE/MISSING]: có dấu hiệu schema mở rộng theo loyalty/notifications/search; lịch sử trước–sau đầy đủ không có.
- Q21 [DERIVED]: bookings và nhóm room_types/guest_bookings phức tạp nhất.
- Q22 [MISSING/RISK]: chưa có EXPLAIN/load test; có nguy cơ N+1 ở properties.

ERD đề xuất rút gọn:

    USERS 1---N PROPERTIES
    USERS 1---N BOOKINGS
    PROPERTIES 1---N ROOM_TYPES
    PROPERTIES 1---N PROPERTY_IMAGES
    PROPERTIES N---N AMENITIES (property_amenities)
    ROOM_TYPES 1---N BOOKINGS
    PROPERTIES 1---N GUEST_BOOKINGS
    ROOM_TYPES 1---N GUEST_BOOKINGS
    BOOKINGS 1---N PAYMENTS
    BOOKINGS 1---N BOOKING_STATUS_HISTORY
    BOOKINGS 1---0..1 REVIEWS
    USERS 1---N WISHLISTS N---1 PROPERTIES
    USERS 1---N NOTIFICATIONS
    NOTIFICATION_CAMPAIGNS 1---N NOTIFICATIONS 1---N NOTIFICATION_DELIVERIES
    USERS 1---N PUSH_TOKENS
    CONVERSATIONS 1---N MESSAGES
    BOOKINGS N---N COUPONS (booking_coupons)

Ghi chú: payments không unique theo booking_id nên quan hệ schema là 1–N; coupons không FK trực tiếp tới bookings; guest_bookings là bảng riêng trong schema nhưng endpoint guest POST hiện tại chủ yếu tạo/liên kết users rồi ghi bookings.

## R. Bảo mật

- R1 [CODE]: có login password và OTP.
- R2 [CODE]: có register.
- R3 [CODE/MISSING]: có OTP virtual SMS/email; không có cột email_verified hoặc flow email verification độc lập.
- R4 [CODE]: forgot password, verify OTP, reset password.
- R5 [CODE]: bcryptjs; mobile không lưu password, native lưu token/user bằng Secure Store.
- R6 [CODE]: JWT Bearer, không thấy session server-side.
- R7 [CODE]: login JWT 30 ngày; một số magic link 24 giờ.
- R8 [CODE]: role customer, host, admin.
- R9 [CODE]: backend helper/route kiểm tra JWT và role.
- R10 [CODE]: AuthContext xử lý session/unauthorized và UX; không thay backend security.
- R11 [CODE]: có validation input.
- R12 [CODE]: đa số SQL dùng placeholder ?; dynamic clause cần review thêm.
- R13 [RISK]: chưa có security audit; không nên khẳng định chống XSS toàn hệ thống.
- R14 [CODE]: CORS * ở next config/OPTIONS.
- R15–R16 [CODE/RISK]: secret/API key đọc từ .env nhưng JWT code có fallback your_jwt_secret_key_here; cần bỏ fallback production.
- R17 [CODE]: email/phone, password hash, JWT, OTP, avatar, card sandbox, booking/payment.
- R18 [CODE]: bcrypt, HTTPS theo URL deploy, Secure Store, JWT, role checks, parameterized SQL; chưa đủ security hardening production.
- R19 [MISSING]: không có penetration/security test.
- R20 [RISK]: CORS mở, fallback secret, không rate limit, sandbox schema chưa đồng bộ, chưa có refresh/revocation/monitoring.

## S. Git và GitHub

- S1 [CODE]: README dùng repository https://github.com/vdat293/web-du-lich; không đưa remote URL có credential vào báo cáo.
- S2 [MISSING]: public/private chưa xác minh.
- S3–S7 [MISSING]: không có branch/commit convention chính thức; local có main và localization-sync nhưng không đủ suy ra quy trình.
- S8–S10 [MISSING]: có merge commit nhưng thiếu dữ liệu reviewer/code review bắt buộc.
- S11–S14 [MISSING]: không tự dựng ví dụ conflict/PR/commit quan trọng.
- S15 [MISSING]: chưa thấy GitHub Issues data.
- S16 [CODE]: có .github/workflows/mobile-ci.yml chạy mobile quality/doctor và Android debug build trên push/PR.
- S17 [CODE]: có README root/mobile/server.
- S18 [CODE/RECOMMENDED]: README hướng dẫn .env không commit; cần secret scan trước nộp.
- S19–S20 [PRIVATE/MISSING]: không gán đóng góp repo/module cho cá nhân và không tự tạo screenshot Git graph.

## T. Kiểm thử và chất lượng

- T1 [CODE]: automated test mobile cho API client/date; quality script gồm typecheck/lint/test; CI có doctor và Android debug build. Server build pass là kiểm tra độc lập trong lượt audit, không phải job trong mobile CI.
- T2 [CODE]: Jest, typecheck, lint, build; chưa có integration/API/E2E/manual test report đầy đủ.
- T3–T4 [MISSING]: không có Test Case document.
- T5 [CODE]: hiện có 7 test trong 2 suite; đây không phải tổng test nghiệp vụ.
- T6–T7 [CODE]: lượt chạy hiện tại 7 pass, 0 fail.
- T8 [CODE]: API client auth/error/401 và date utility được test trực tiếp.
- T9 [PARTIAL]: source có login/register/role/CRUD/search/filter/upload/workflow nhưng chưa có automated test chứng minh tất cả.
- T10–T11 [CODE/PARTIAL]: có kiểm tra ngày ngược, số/giá, thiếu token, OTP/PIN; coverage chưa đầy đủ.
- T12–T13 [CODE]: Jest với jest-expo; chưa có coverage report.
- T14 [MISSING]: không có bug tracker riêng.
- T15–T17 [MISSING/PRIVATE]: không tự bịa danh sách bug, nguyên nhân hoặc bug do cá nhân sửa; chỉ ghi nhận mismatch schema/payment là phát hiện static cần xác minh runtime.
- T18–T22 [MISSING]: chưa có multi-device, responsive/device matrix, performance, Lighthouse hoặc acceptance report.

## U. Deploy / môi trường chạy thực tế

- U1 [PARTIAL]: mobile README có backend Render mặc định và hướng dẫn Expo; chưa có bằng chứng app release/store.
- U2 [MISSING]: chưa có link app production.
- U3 [OUT]: frontend client cũ không thuộc phạm vi.
- U4 [CODE/RUNTIME]: mobile mặc định gọi https://web-du-lich-4pjb.onrender.com; GET /api/properties đã trả HTTP 200 và 37 property trong lượt kiểm tra read-only.
- U5 [MISSING]: DB host/deploy chưa xác định; code hỗ trợ DATABASE_URL hoặc DB_* env.
- U6–U7 [MISSING]: domain riêng/SSL toàn hệ thống chưa có bằng chứng; URL Render dùng HTTPS.
- U8 [CODE]: Render được nhắc cho backend; Android build dùng Gradle.
- U9–U10 [PARTIAL]: CI chạy quality và Android debug build; chưa có workflow release/deploy mobile.
- U11–U13 [MISSING]: không thấy Docker/Nginx/reverse proxy.
- U14–U15 [CODE]: environment qua .env, EXPO_PUBLIC_API_URL, EXPO_PUBLIC_EAS_PROJECT_ID, Cloudinary/JWT/DB env; không đưa secret thật vào báo cáo.
- U16–U18 [MISSING/RISK]: không có deployment incident log; schema/payment mismatch cần xử lý.
- U19 [PARTIAL]: có console/DB/activity log/notification delivery; chưa có monitoring production chuẩn.
- U20 [MISSING]: chưa kết luận app đã production; kế hoạch: staging backend+DB migration → EAS development build → test device → release build → monitoring/rollback.

## V. Quản lý tiến độ và kỷ luật

- V1–V23 [MISSING/PRIVATE]: không có lịch họp, kênh giao tiếp, biên bản, deadline, blocker, xung đột, hỗ trợ chéo hoặc cách bắt buộc cập nhật Jira/Git. Không trả lời thay trải nghiệm cá nhân/nhóm.

## W. Khó khăn và giải quyết

- W1 [CODE/DERIVED]: chuyển nghiệp vụ web sang native mobile; auth/session; availability/booking; payment sandbox OTP; push notification; media URL; role/admin; schema tiến hóa; nhiều môi trường API.
- W2–W9 [PENDING/PRIVATE]: khó khăn lớn nhất, phương án đã thử, phương án cuối, kết quả hoặc thất bại sẽ bổ sung sau từ nhật ký thật.
- W10–W16 [PENDING/PRIVATE]: khó khăn về giao tiếp, chia việc, deadline, requirement, công nghệ mới, Git và DB sẽ bổ sung sau.
- W17 [DERIVED]: mobile phải tái tạo booking, date picker, loading/error/empty state và giữ nhận diện từ web cũ.
- W18 [DERIVED]: backend phục vụ hai client, đồng bộ auth/role/booking/payment/notification.
- W19–W20 [PENDING/RISK]: deploy/testing thực tế chưa có log; schema sandbox đã được kiểm tra runtime nhưng DDL cần đồng bộ.
- W21–W23 [PRIVATE/PENDING]: vấn đề cá nhân, cách tự giải quyết hoặc tài liệu cá nhân đã dùng sẽ bổ sung nếu người dùng cung cấp.

## X. Kết quả dự án

- X1 [MISSING]: không tính phần trăm hoàn thành từ số file.
- X2 [CODE]: đã có implementation cho navigation, auth, search/property, details/availability, booking/payment service, trips, favorites, profile/security, rewards, notifications và admin users/promotions/stats.
- X3 [PARTIAL/RISK]: push phụ thuộc development/standalone build; payment gateway thật chưa có; backend flow cần schema/runtime validation; message/host có API nhưng chưa thấy UI mobile hoàn chỉnh trong navigation chính; guest booking còn điểm lệch finalStatus/history/response.
- X4 [MISSING]: chưa có backlog để xác định danh sách chưa hoàn thành.
- X5 [DERIVED]: production-grade payment, acceptance, E2E, security và monitoring chưa hoàn tất vì source chỉ cho thấy sandbox/virtual integration.
- X6 [MISSING]: không quy đổi % nếu chưa có baseline/acceptance.
- X7–X12 [MISSING]: chưa có nghiệm thu PO, feedback cuối, điểm demo, user test hoặc user feedback.
- X13 [CODE]: 20 mobile screen files, 59 API route files, 32 schema tables, 2 test suites/7 tests pass, server build pass, mobile typecheck/lint pass.
- X14 [DERIVED]: shared backend, auth đa phương thức, booking/payment/rewards/notifications và admin trong mobile.
- X15 [RISK]: thiếu E2E/performance/security evidence; payment sandbox/schema mismatch; chưa có payment gateway production và refresh/revocation.
- X16 [DERIVED]: đưa trải nghiệm premium travel/booking từ web app cũ sang native mobile, thêm Secure Store, biometric lock, push và mobile admin.

## Y. Bài học kỹ thuật

- Y1–Y2 [PRIVATE/MISSING]: kiến thức trước dự án và công nghệ mỗi người học mới không thể suy ra.
- Y3 [DERIVED]: native navigation, state, forms, loading/error/empty UX, date/booking flow và device layout.
- Y4 [DERIVED]: API integration, JWT, role checks, transaction booking và shared backend.
- Y5 [DERIVED]: property–room–booking–payment–coupon–loyalty–notification, FK, cascade, index và schema evolution.
- Y6 [CODE]: apiRequest có timeout, error normalization, bearer token và unauthorized event; services tách domain.
- Y7–Y9 [PRIVATE/MISSING]: kỹ năng Git/deploy/testing cá nhân không suy ra; artifact kỹ thuật gồm CI, Jest, typecheck/lint/build.
- Y10 [DERIVED]: mobile là client tách biệt, backend API dùng chung; route/helper đã module hóa nhưng chưa phải clean architecture đầy đủ.
- Y11 [PRIVATE]: không trả lời thay quan điểm kỹ thuật cá nhân.
- Y12 [DERIVED]: chốt API/schema migration trước; thêm E2E/device test từ đầu; tách validation/service/repository và security config production sớm.

## Z. Bài học kỹ năng mềm / WIL

- Z1–Z13 [PRIVATE/MISSING]: không trả lời thay trải nghiệm nhóm về teamwork, giao tiếp, tiến độ, deadline, feedback, code review, xung đột, PO, requirement change, năng lực nghề nghiệp hoặc mức độ sẵn sàng.

## AA. Định hướng phát triển

- AA1 [DERIVED]: ưu tiên booking + payment/availability end-to-end trên staging, gồm sửa mismatch schema và E2E.
- AA2 [DERIVED]: accessibility, loading/empty/error nhất quán, notification deep link, offline/retry, device matrix, form một tay.
- AA3 [DERIVED]: bỏ fallback JWT secret, khóa CORS, rate limit OTP/login, refresh/revocation, secret rotation, không expose dữ liệu thẻ, security test.
- AA4 [DERIVED]: giảm N+1 property query, pagination/filter server-side, cache phù hợp, image compression, profiling native.
- AA5 [DERIVED]: migration versioning, index/EXPLAIN, schema consistency, audit log, transaction payment/booking chặt.
- AA6 [CODE]: mobile app đã là hướng phát triển hiện tại dựa trên web app cũ; không ghi là kế hoạch tương lai.
- AA7 [MISSING/OPTIONAL]: chưa có AI; có thể cân nhắc gợi ý điểm đến/tìm kiếm ngôn ngữ tự nhiên sau khi có dữ liệu.
- AA8 [DERIVED]: payment gateway, email/SMS provider, maps/deep links, analytics/crash reporting, push production.
- AA9 [MISSING]: chưa có kế hoạch rollout người dùng thật.
- AA10 [DERIVED]: marketplace lưu trú: customer tìm/đặt; host quản lý nguồn cung; platform vận hành hoa hồng, loyalty/coupon và admin.

## AB. Minh chứng

- AB1 [CODE]: có source mobile/server, README, schema SQL, API route code, test code, Git history, GitHub Actions, manifests, CI output. Không thấy: Jira export, Figma, ERD/Use Case/Sequence/Activity/Architecture file, Swagger/Postman, Test Case document, meeting minutes, Sprint report, Burndown, PO feedback, video demo, rubric.
- AB2 [CODE]: có thể cung cấp các file repository và output test/build ở đầu tài liệu.
- AB3 [MISSING]: không có quy định tài liệu bị cấm.
- AB4 [RECOMMENDED]: che API key, JWT secret, DB password, Cloudinary secret, Expo token, email/phone thật, dữ liệu user/booking và card data.
- AB5 [PENDING]: cần chụp trong app thật: Explore, Search filter, Details availability, Payment OTP/cash, Trips, Profile/Security, Notifications, Rewards và Admin. Không thể tạo ảnh trung thực chỉ từ source; workspace hiện chưa có simulator/device mobile đang chạy và Expo web local không bind được.
- AB6 [DERIVED]: nên chọn apiRequest, AuthContext/Secure Store, property/availability service, PaymentScreen flow, notification service và backend booking transaction.
- AB7 [DERIVED]: nên dựng Architecture, ERD, Use Case booking, Sequence login/booking/payment, Activity payment và booking state diagram.

## AC. Tài liệu tham khảo

- AC1 [MISSING]: chưa có bibliography.
- AC2 [RECOMMENDED]: dùng documentation chính thức của Expo, React Native, React Navigation, Secure Store, Notifications, Next.js, MySQL, mysql2, jsonwebtoken, bcryptjs, Cloudinary và GitHub Actions.
- AC3–AC6 [MISSING]: chưa có quy định ngôn ngữ, năm xuất bản, nguồn học thuật hoặc cho phép documentation.
- AC7 [MISSING]: chưa có yêu cầu chủ động tìm nguồn; nếu viết báo cáo, bổ sung nguồn chính thức cho mobile architecture, REST/API, authentication, secure storage, push, Scrum/WIL nếu cần.
- AC8 [CHOICE]: phù hợp nhất là vừa đủ học thuật, gắn trực tiếp từng quyết định mobile.

## AD. Cá nhân hóa

- AD1–AD12 [PRIVATE]: không trả lời thay thành tựu cá nhân, thời gian, khoảnh khắc lo dự án thất bại, đề xuất riêng, cải tiến riêng, năng lực thay đổi, đóng góp khi vấn đáp, quyết định kiến trúc theo góc nhìn cá nhân, điểm yếu hoặc câu chuyện thực tế. Dùng các phần CODE/DERIVED làm khung rồi tự điền sự kiện thật.

## AE. Cấu trúc báo cáo

- AE1 [MISSING/CHOICE]: chưa biết có phải bám 100% mẫu.
- AE2 [MISSING/CHOICE]: chưa có số trang mục tiêu.
- AE3 [DERIVED]: nên có bảng actor/use case, functional/non-functional requirements, mobile screen, API service, database, test evidence, risk/limitation và roadmap.
- AE4 [DERIVED]: đặt screenshot mobile sau phần mô tả screen/flow; đặt sơ đồ trước phần phân tích.
- AE5 [DERIVED]: caption nên có đối tượng và mục đích, ví dụ “Hình x.x. Luồng tìm kiếm và lọc chỗ nghỉ trên Aoklevart Mobile”.
- AE6 [MISSING/CHOICE]: chưa biết quy tắc đánh số của trường.
- AE7 [DERIVED]: nên có dẫn nhập/kết chương nếu mẫu cho phép.
- AE8 [DERIVED]: mô tả code ở mức cân bằng, tập trung quyết định và evidence.
- AE9 [DERIVED]: chỉ phân tích Scrum/WIL khi có minh chứng, không khẳng định đã áp dụng nếu không có artifact.
- AE10 [CHOICE]: nên ưu tiên cân bằng kỹ thuật, mobile UX, backend integration, minh chứng và giới hạn.

## AF. File/dữ liệu cần xem

- AF1 [CODE]: source code mobile/server và Git history có trong workspace.
- AF2–AF4 [MISSING]: chưa có requirement/PO brief, Jira export/screenshot hoặc Figma.
- AF5 [CODE/PARTIAL]: có SQL schema, chưa có ERD hình.
- AF6 [CODE/PARTIAL]: có route code và services.ts, chưa có Swagger/Postman.
- AF7–AF10 [MISSING]: chưa có diagram, test case document, biên bản họp, sprint report.
- AF11 [PENDING]: chưa có screenshot sản phẩm; sẽ lấy trực tiếp từ app mobile khi chạy trên thiết bị/Expo Go/development build.
- AF12 [PARTIAL]: có backend URL mặc định trong mobile README; chưa có app release link.
- AF13–AF17 [MISSING]: chưa có báo cáo dở, rubric, nhận xét giảng viên, slide demo hoặc tài liệu nhóm khác.

## AG. 10 câu hỏi chốt

- AG1 [DERIVED]: cần tồn tại để đưa booking/trip/account từ web app cũ lên trải nghiệm native mobile và dùng tính năng thiết bị.
- AG2 [DERIVED]: chọn Expo/React Native để tái sử dụng backend/API và nhận diện cũ, giảm trùng nghiệp vụ.
- AG3 [MISSING]: không có record phương án khác đã cân nhắc.
- AG4 [DERIVED]: quyết định quan trọng là giữ shared backend/API và xây mobile service layer typed thay vì backend riêng.
- AG5 [RISK]: chưa có lịch sử quyết định sai; schema sandbox và route payment hiện chưa đồng bộ là điểm cần sửa/confirm.
- AG6 [DERIVED]: khó khăn là đồng bộ booking/payment/auth/notification với backend chung; cơ sở xử lý là route/service code, transaction SQL, AuthContext và automated checks.
- AG7 [CODE/PARTIAL]: build/typecheck/lint/test/CI và số lượng screen/API/table là evidence; chưa có user acceptance, performance hoặc production metrics.
- AG8 [MISSING]: chưa có artifact chứng minh WIL/Scrum tác động cách làm việc.
- AG9 [PRIVATE]: giá trị đóng góp cá nhân không suy ra từ code ownership.
- AG10 [DERIVED]: nếu làm lại: chốt API/schema migration trước; thêm E2E/device test từ đầu; tách backend validation/service/repository và security config production sớm.

## AH. Tự đánh giá độ đầy đủ ngữ cảnh

Chấm theo mức độ có bằng chứng trong repository, không phải điểm chất lượng sản phẩm:

| Hạng mục | Điểm | Lý do |
|---|---:|---|
| Thông tin đề bài/rubric | 7/10 | đã có học phần, PO, PM, học kỳ, hạn nộp và rubric; còn thiếu giới hạn trang/quy định chi tiết |
| Bối cảnh bài toán | 7/10 | domain, flow và bối cảnh phát triển từ web cũ đã rõ hơn |
| Requirement/User Story | 5/10 | dựng được từ API/screen, chưa có tài liệu chính thức |
| WIL/Scrum | 5/10 | đã biết dùng Scrum, 3 Sprint x 4 tuần, Planning/Review/Retro; còn thiếu biên bản |
| Jira/Quản lý công việc | 2/10 | đã xác nhận dùng Jira/Scrum; còn thiếu link, ticket, burndown và số liệu |
| Mobile UX/UI | 7/10 | có screen, theme, state và navigation |
| Backend/API | 8/10 | route/service khá đầy đủ, thiếu contract/runtime evidence |
| Database | 8/10 | schema 32 bảng, quan hệ rõ; chưa có ERD/runtime dump |
| Git/GitHub | 5/10 | có history/CI, thiếu convention/PR evidence |
| Testing | 4/10 | 7 test pass và quality checks; thiếu E2E/manual/performance |
| Deploy | 3/10 | có Render URL/CI, thiếu release/monitoring evidence |
| Minh chứng hình ảnh/tài liệu | 2/10 | chưa có screenshot/diagram/rubric |
| Đóng góp cá nhân | 4/10 | đã có vai trò và đánh giá định tính; còn thiếu ownership màn hình/API/DB và phần cá nhân |
| Khó khăn & giải pháp | 4/10 | phân tích được từ code, nội dung khó khăn thật sẽ bổ sung sau |
| Bài học kinh nghiệm | 3/10 | có thể đề xuất kỹ thuật, thiếu trải nghiệm cá nhân |

## Kết luận dùng cho báo cáo

Có thể viết chắc chắn rằng đây là ứng dụng mobile Aoklevart phát triển trên nền tảng nghiệp vụ và nhận diện của web app cũ, dùng chung backend Next.js–MySQL. Luồng mobile chính là khám phá, tìm kiếm, details, availability, booking/payment, trips, wishlist, profile/security, rewards, notifications và admin. Không nên khẳng định PO/Scrum, đóng góp cá nhân, nghiệm thu, phần trăm hoàn thành, user feedback, deploy production hoặc test nghiệp vụ nếu chưa bổ sung minh chứng.

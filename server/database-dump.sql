-- ===================================================
-- DATABASE DUMP - Web Du Lịch (Aoklevart)
-- Exported at: 14:24:36 15/6/2026
-- Database: defaultdb
-- ===================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------
-- Bảng: users
-- ---------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE "users" (
  "id" int NOT NULL AUTO_INCREMENT,
  "name" varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  "email" varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  "password" varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  "avatar" varchar(255) COLLATE utf8mb4_general_ci DEFAULT 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  "role" varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'customer',
  "phone" varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "email" ("email"),
  UNIQUE KEY "unique_phone" ("phone")
);

-- Data cho bảng users (29 dòng)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `avatar`, `role`, `phone`, `created_at`) VALUES
(1, 'Nguyễn Văn A', 'test@gmail.com', '$2b$10$0T9nMAyZy1Ip5WUQCBP0Z.8xvWRM6uemXXkBHmWHmayh9pD2zYdqq', 'https://cdn-icons-png.flaticon.com/512/149/149071.png', 'admin', '01234567891', '2026-03-08 11:49:22'),
(2, 'Chủ nhà Elegant Hue', 'host2@example.com', 'password123', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbDd5vtbsKwJGeyNSm7Sm9j2C87ZmCv3K7nZN9x7grZ92SEyjJayM0DqBo6ijsH5APv74UOzhbPrp5p9h3f3hHuibjI8Sw7MGt3AFz_i0w2C2EnOyePYf-OJ8ZA1L6EWtCQc1KZrwPUAesUgxgHINnM-wqMBKKI2ICARLxqPy_zuQYe9vIijtntVH6EsHmWc25wfxYwg1WY', 'host', '01234567892', '2026-03-08 11:49:22'),
(3, 'Ban quản lý Kobi Onsen', 'host3@example.com', 'password123', '', 'host', '01234567893', '2026-03-08 11:49:22'),
(4, 'Chủ nhà Kly Luxury', 'host4@example.com', 'password123', 'assets/id_54/avatar.jpeg', 'host', '01234567894', '2026-03-08 11:49:22'),
(5, 'Trần Minh Tuấn', 'tuan.tran@gmail.com', '$2b$10$0T9nMAyZy1Ip5WUQCBP0Z.8xvWRM6uemXXkBHmWHmayh9pD2zYdqq', 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png', 'customer', '0987654321', '2026-01-14 18:00:00'),
(6, 'Lê Thị Hương', 'huong.le@gmail.com', '$2b$10$0T9nMAyZy1Ip5WUQCBP0Z.8xvWRM6uemXXkBHmWHmayh9pD2zYdqq', 'https://cdn-icons-png.flaticon.com/512/4140/4140047.png', 'customer', '0912345678', '2026-01-19 19:00:00'),
(7, 'Phạm Đức Huy', 'huy.pham@gmail.com', '$2b$10$0T9nMAyZy1Ip5WUQCBP0Z.8xvWRM6uemXXkBHmWHmayh9pD2zYdqq', 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', 'customer', '0933456789', '2026-01-31 20:00:00'),
(8, 'Nguyễn Thị Mai', 'mai.nguyen@gmail.com', '$2b$10$0T9nMAyZy1Ip5WUQCBP0Z.8xvWRM6uemXXkBHmWHmayh9pD2zYdqq', 'https://cdn-icons-png.flaticon.com/512/4140/4140061.png', 'customer', '0944567890', '2026-02-04 21:00:00'),
(9, 'Võ Hoàng Nam', 'nam.vo@gmail.com', '$2b$10$0T9nMAyZy1Ip5WUQCBP0Z.8xvWRM6uemXXkBHmWHmayh9pD2zYdqq', 'https://cdn-icons-png.flaticon.com/512/4140/4140037.png', 'customer', '0955678901', '2026-02-09 22:00:00'),
(10, 'Đặng Thanh Thảo', 'thao.dang@gmail.com', '$2b$10$0T9nMAyZy1Ip5WUQCBP0Z.8xvWRM6uemXXkBHmWHmayh9pD2zYdqq', 'https://cdn-icons-png.flaticon.com/512/4140/4140051.png', 'customer', '0966789012', '2026-02-14 23:00:00'),
(11, 'Bùi Quốc Khánh', 'khanh.bui@gmail.com', '$2b$10$0T9nMAyZy1Ip5WUQCBP0Z.8xvWRM6uemXXkBHmWHmayh9pD2zYdqq', 'https://cdn-icons-png.flaticon.com/512/3135/3135823.png', 'customer', '0977890123', '2026-02-20 00:00:00'),
(12, 'Nguyễn Vũ Đạt', 'nor@gmail.com', '$2b$10$YbruY7fydkIJ/hVQ0ACgSeYrPsIfPIzNwg602jYttq.B470nU8pFq', 'https://theselfishmeme.co.uk/wp-content/uploads/2025/10/meme-do-mixi-hai-5.webp', 'admin', '0902677189', '2026-03-14 23:33:12'),
(13, 'Admin vip pro', 'admin@vip.pro', '$2b$10$5euhJ9cyVvd0IMLE86hH.OTXkbkhqjpOW1uyi3BtV21vKldVJ3w36', 'https://cdn-icons-png.flaticon.com/512/149/149071.png', 'admin', NULL, '2026-03-15 04:17:12'),
(14, 'Host Ngô Quyền', 'host1@example.com', '$2b$10$kCGlCz/BnP6Cf12lD2IsuetVHY4PicU16VgxeN7GN9FlrsSexj7Ge', 'https://cdn-icons-png.flaticon.com/512/149/149071.png', 'host', NULL, '2026-04-12 17:23:44'),
(15, 'Khách vãng lai', 'walkin@system.com', '$2b$10$COXNCcGQBwDHU8QTPU5kUex.OkBg/zR3IUW0Zp1FartSd691QSEym', 'https://cdn-icons-png.flaticon.com/512/149/149071.png', 'customer', NULL, '2026-04-13 20:37:23'),
(18, 'Nguyễn Vũ Đạt', 'haha@gmail.com', '$2b$10$1A0kzGnhGemyeGvfV/BvfuqdMYIfK7rkdVvkE1dBeWRBpk3dhy/te', 'https://cdn-icons-png.flaticon.com/512/149/149071.png', 'customer', '0908453459', '2026-05-02 10:49:56'),
(19, 'abc', '0908453455@phone.system', '$2b$10$mxBHMkFZDuXBMQo6cqfe9eVjCY0fuvutq93nUw3uD4xnR5SdHHekG', 'https://cdn-icons-png.flaticon.com/512/149/149071.png', 'customer', '0908453455', '2026-05-02 10:56:29'),
(20, 'Rons', 'mamagunny99@gmail.com', '$2b$10$kcXsPi/.28uQljJ1brKXtOi7H7Ck2eaV4.Ef./YhcJFp1nBqPjNgC', 'https://cdn-icons-png.flaticon.com/512/149/149071.png', 'customer', '1234567890', '2026-05-02 11:04:17'),
(21, 'hahah', '0908453458@phone.system', '$2b$10$QPceN7OhE0zCAsX2SR/P/edxipD8PVlrRZPrkO1nZcxEI5AmJcDWa', 'https://cdn-icons-png.flaticon.com/512/149/149071.png', 'customer', '0908453458', '2026-05-02 11:17:08'),
(22, 'Nguyen Vu Dat', 'ngvip@gmail.com', '$2b$10$IqrUv0G0Y8BP63fJ8N0xCOpRpq6OCc3RVi9HS4QW6yTDLAm7Y6xw.', 'https://cdn-icons-png.flaticon.com/512/149/149071.png', 'customer', '0908453444', '2026-05-02 12:07:08'),
(23, 'hihihihih', '12345@gmail.com', '$2b$10$tAwltlB/Mh6RsSksb2mjCeL4HD0ecD4/0SZh47RYTyYes.RsTM5.q', 'https://cdn-icons-png.flaticon.com/512/149/149071.png', 'customer', '0908455459', '2026-05-02 21:57:17'),
(25, 'abc', '123@gmail.com', '$2b$10$iP7oHDD8TfwocPg9Os5Uk.Tn7WykePzOLhvBMMWB4AmQ8gyry.Ek2', 'https://cdn-icons-png.flaticon.com/512/149/149071.png', 'customer', '09084212333', '2026-05-02 22:40:32'),
(26, 'Nguyễn Vũ Đạt', 'nanana@gmail.com', '$2b$10$cNHpADUnyCpMllKDcs5wJO7XmtVi9OpieO7u9VUSWgAd5zvgJA.ry', 'https://cdn-icons-png.flaticon.com/512/149/149071.png', 'customer', '0123456789', '2026-05-02 22:49:29'),
(27, 'Nguyen Ngoc Bao Kim', 'baokim1122@gmail.com', '$2b$10$x6LKQqd2C8tvYqVOo5nZgeafx3jW2qK8AQBg8bIqnrdg7jLxV7eJ2', 'https://cdn-icons-png.flaticon.com/512/149/149071.png', 'customer', '0902677111', '2026-05-12 14:22:11'),
(28, 'sdfgd xc', '22@gmail.com', '$2b$10$SF/82NwGyHyX43GkgRGXC.ktWFfguzVHswhFS23Oa3hu.WmmqfdrK', 'https://cdn-icons-png.flaticon.com/512/149/149071.png', 'customer', NULL, '2026-05-15 00:49:12'),
(29, 'Pham Hoang Loc', '0111111111@phone.system', '$2b$10$aHkzmaPwRD6O1OgqoZyQCOwcgF3CYVXsukBhslQ6ZbJI.t2P.j8Vu', 'https://cdn-icons-png.flaticon.com/512/149/149071.png', 'customer', '0111111111', '2026-05-15 06:24:40'),
(30, 'nguyen van loc', '0123456788@phone.system', '$2b$10$P79x5muN3Vuxzz6KvefK3.ev0lw35xGFrtolA6tNPnaOS1Wg22KZ6', 'https://cdn-icons-png.flaticon.com/512/149/149071.png', 'customer', '0123456788', '2026-05-15 06:43:22'),
(31, 'nguyen van ba', '0234556789@phone.system', '$2b$10$Sy0GoAzfaEdHYOjdtbUIDeLjj5KnfRutKyLqqOXbeTa7aNwTLhYFu', 'https://cdn-icons-png.flaticon.com/512/149/149071.png', 'customer', '0234556789', '2026-05-15 06:45:04'),
(32, 'Nguyễn Vũ Đạt', '0908459455@phone.system', '$2b$10$ma2bMVsyJ2zUc2./tCFaw.N8NYvT33/Qxcs/EBXIQ3ueEs34IKOoS', 'https://cdn-icons-png.flaticon.com/512/149/149071.png', 'customer', '0908459455', '2026-05-15 06:56:53');

-- ---------------------------------------------------
-- Bảng: properties
-- ---------------------------------------------------
DROP TABLE IF EXISTS `properties`;
CREATE TABLE "properties" (
  "id" int NOT NULL AUTO_INCREMENT,
  "host_id" int NOT NULL,
  "name" varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  "type" varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  "location" varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  "price_display" decimal(15,0) DEFAULT NULL,
  "description" text COLLATE utf8mb4_general_ci,
  "map_image" varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  "map_embed" text COLLATE utf8mb4_general_ci,
  "is_hot" tinyint(1) DEFAULT '0',
  "status" varchar(20) COLLATE utf8mb4_general_ci DEFAULT 'active',
  "status_reason" text COLLATE utf8mb4_general_ci,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "bedrooms" int DEFAULT '0',
  "bathrooms" int DEFAULT '0',
  "max_guests" int DEFAULT '0',
  "search_tags" json DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "host_id" ("host_id"),
  CONSTRAINT "properties_ibfk_1" FOREIGN KEY ("host_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- Data cho bảng properties (37 dòng)
INSERT INTO `properties` (`id`, `host_id`, `name`, `type`, `location`, `price_display`, `description`, `map_image`, `map_embed`, `is_hot`, `status`, `status_reason`, `created_at`, `bedrooms`, `bathrooms`, `max_guests`, `search_tags`) VALUES
(1, 3, 'Khách sạn Sân bay Havana', 'hotel', 'TP. Hồ Chí Minh, Việt Nam', '2500000', 'Khách sạn này là sự lựa chọn hoàn hảo cho các cặp đôi đang tìm kiếm một kỳ nghỉ lãng mạn hoặc một nơi nghỉ trăng mật. Tận hưởng những đêm đáng nhớ nhất với người yêu của bạn bằng cách ở tại Havana Airport Hotel.\n\nHavana Airport Hotel là một khách sạn gần Sân bay, một nơi ở lý tưởng trong khi chờ chuyến bay tiếp theo của bạn. Tận hưởng một nơi nghỉ ngơi thoải mái trong quá trình di chuyển của bạn.\n\nTừ sự kiện kinh doanh đến các cuộc họp công ty, Havana Airport Hotel cung cấp các dịch vụ và tiện nghi hoàn chỉnh mà bạn và đồng nghiệp của bạn cần.\n\nHãy vui vẻ với nhiều tiện nghi giải trí khác nhau dành cho bạn và cả gia đình tại Havana Airport Hotel, một nơi ở tuyệt vời cho kỳ nghỉ gia đình của bạn.\n\nNếu bạn dự định có một kỳ nghỉ dài hạn, việc ở tại Havana Airport Hotel là sự lựa chọn phù hợp với bạn. Cung cấp nhiều loại tiện nghi và chất lượng dịch vụ tuyệt vời, chỗ ở này chắc chắn sẽ khiến bạn cảm thấy như ở nhà.\n\nTrong khi đi du lịch với bạn bè có thể rất vui, thì việc đi du lịch một mình lại có những đặc quyền riêng. Đối với chỗ ở, Havana Airport Hotel phù hợp với những người coi trọng sự riêng tư trong thời gian lưu trú.\n\nDịch vụ tuyệt vời cùng với nhiều tiện nghi được cung cấp sẽ khiến bạn không phàn nàn trong thời gian lưu trú tại Havana Airport Hotel.\n\nWi-Fi có sẵn trong các khu vực công cộng của khách sạn để giúp bạn giữ liên lạc với gia đình và bạn bè.\n\nVới tất cả các tiện nghi được cung cấp, Havana Airport Hotel là nơi thích hợp để ở.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrvgMY2AVYnyzdxJ39yFL_WbpvtD1wm0CaNoF8o7h3Il4noOJCeeVcPI7wi5PRMfL1btdG8pqW25RGjR-SonElWR2VukmexroNqQagpynpDmh6PqZEfU9CD1Qaav3NM3O0xgXzec-bjdBA5VR9A523HSotNrPoV3f6tPvChAYEHYQn_da2dQJjOs8d-GLGh5vh9vIiVmivt', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.003571913024!2d106.66654419999999!3d10.8110377!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529e0d1745e63%3A0x4fd96c21d1427f08!2sHavana%20Airport%20Hotel!5e0!3m2!1svi!2s!4v1764412109071!5m2!1svi!2s', 0, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,thành phố,city break,văn hóa'),
(31, 14, 'Khách sạn Muong Thanh Holiday Mui Ne', 'hotel', 'Mũi Né, TP. Phan Thiết, Bình Thuận', '1100000', 'Khách sạn này là lựa chọn hoàn hảo cho các kỳ nghỉ mát lãng mạn hay tuần trăng mật của các cặp đôi. Quý khách hãy tận hưởng những đêm đáng nhớ nhất cùng người thương của mình tại Muong Thanh Holiday Mui Ne Hotel.\n\nMuong Thanh Holiday Mui Ne Hotel là lựa chọn sáng giá dành cho những ai đang tìm kiếm một trải nghiệm xa hoa đầy thú vị trong kỳ nghỉ của mình. Lưu trú tại đây cũng là cách để quý khách chiều chuộng bản thân với những dịch vụ xuất sắc nhất và khiến kỳ nghỉ của mình trở nên thật đáng nhớ.\n\nTừ sự kiện doanh nghiệp đến họp mặt công ty, Muong Thanh Holiday Mui Ne Hotel cung cấp đầy đủ các dịch vụ và tiện nghi đáp ứng mọi nhu cầu của quý khách và đồng nghiệp.\n\nHãy tận hưởng thời gian vui vẻ cùng cả gia đình với hàng loạt tiện nghi giải trí tại Muong Thanh Holiday Mui Ne Hotel, một khách sạn tuyệt vời phù hợp cho mọi kỳ nghỉ bên người thân.\n\nHãy sẵn sàng đón nhận trải nghiệm khó quên bằng dịch vụ độc đáo và hoàn hảo của khách sạn cùng các tiện nghi đầy đủ, đáp ứng mọi nhu cầu của quý khách.\n\nQuầy tiếp tân 24 giờ luôn sẵn sàng phục vụ quý khách từ thủ tục nhận phòng đến trả phòng hay bất kỳ yêu cầu nào. Nếu cần giúp đỡ xin hãy liên hệ đội ngũ tiếp tân, chúng tôi luôn sẵn sàng hỗ trợ quý khách.\n\nTận hưởng những món ăn yêu thích với phong cách ẩm thực đặc biệt từ Muong Thanh Holiday Mui Ne Hotel chỉ dành riêng cho quý khách.\n\nSóng WiFi phủ khắp các khu vực chung của khách sạn cho phép quý khách luôn kết nối với gia đình và bè bạn.\n\nMuong Thanh Holiday Mui Ne Hotel là khách sạn sở hữu đầy đủ tiện nghi và dịch vụ xuất sắc theo nhận định của hầu hết khách lưu trú.\n\nHãy sẵn sàng đón nhận những giây phút vô giá khó phai trong suốt kỳ nghỉ của quý khách tại Muong Thanh Holiday Mui Ne Hotel.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDS0KIlSsN6dJIYuXVnex_-8DaJKtQBg5UAQea5dbOBBa_Evp7fTc60n9s4dWfX2y_rPXywBCnDE5JjwjgqSQ8cx1TkzipPkffG59yVVhzSDhLyp3Ka0RoZ0Ch-ILdXuF11r77qjlKXTjqho0CQgG18oqDWFdYWjLFDF1yFR3tVSBFzKuObXkOCKf6pCPEpNHSf18Ao4CZPu', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d177337.39921157522!2d108.31133615161234!3d10.838843507692536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31768fe64bcdc76f%3A0x75da7e615cb2bb6f!2sM%C6%B0%E1%BB%9Dng%20Thanh%20Holiday%20Mui%20Ne%20Hotel!5e0!3m2!1svi!2s!4v1764508208910!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển'),
(32, 14, 'The Anam Mui Ne', 'hotel', 'Phường Mũi Né, TP. Phan Thiết, Bình Thuận', '4500000', 'Từ sự kiện doanh nghiệp đến họp mặt công ty, The Anam Mui Ne cung cấp đầy đủ các dịch vụ và tiện nghi đáp ứng mọi nhu cầu của quý khách và đồng nghiệp.\nKhách sạn này là lựa chọn hoàn hảo cho các kỳ nghỉ mát lãng mạn hay tuần trăng mật của các cặp đôi. Quý khách hãy tận hưởng những đêm đáng nhớ nhất cùng người thương của mình tại The Anam Mui Ne\nNếu dự định có một kỳ nghỉ dài, thì The Anam Mui Ne chính là lựa chọn dành cho quý khách. Với đầy đủ tiện nghi với chất lượng dịch vụ tuyệt vời, The Anam Mui Ne sẽ khiến quý khách cảm thấy thoải mái như đang ở nhà vậy.\nThe Anam Mui Ne là lựa chọn sáng giá dành cho những ai đang tìm kiếm một trải nghiệm xa hoa đầy thú vị trong kỳ nghỉ của mình. Lưu trú tại đây cũng là cách để quý khách chiều chuộng bản thân với những dịch vụ xuất sắc nhất và khiến kỳ nghỉ của mình trở nên thật đáng nhớ.\nKhách sạn này là nơi tốt nhất dành cho những ai mong muốn một nơi thanh bình, thư thái để ẩn mình khỏi đám đông ồn ã, xô bồ.\nDịch vụ thượng hạng song hành với hàng loạt tiện nghi phong phú sẽ đem đến cho quý khách trải nghiệm của một kỳ nghỉ viên mãn nhất.\nTrung tâm thể dục của nơi nghỉ là một trong những tiện nghi không thể bỏ qua khi lưu trú tại đây.\nNhận ưu đãi đặc biệt dành cho các liệu pháp spa tinh tuý nhất giúp thư giãn tinh thần và làm tươi trẻ cơ thể.\nQuầy tiếp tân 24 giờ luôn sẵn sàng phục vụ quý khách từ thủ tục nhận phòng đến trả phòng hay bất kỳ yêu cầu nào. Nếu cần giúp đỡ xin hãy liên hệ đội ngũ tiếp tân, chúng tôi luôn sẵn sàng hỗ trợ quý khách.\nTận hưởng những món ăn yêu thích với phong cách ẩm thực đặc biệt từ The Anam Mui Ne chỉ dành riêng cho quý khách.\nSóng WiFi phủ khắp các khu vực chung của nơi nghỉ cho phép quý khách luôn kết nối với gia đình và bè bạn.\nThe Anam Mui Ne là nơi nghỉ sở hữu đầy đủ tiện nghi và dịch vụ xuất sắc theo nhận định của hầu hết khách lưu trú.\nHãy sẵn sàng đón nhận những giây phút vô giá khó phai trong suốt kỳ nghỉ của quý khách tại The Anam Mui Ne.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvC4g-ucPNpf1l1ZYbPyNYJ9bhFTjfbxuOn5OQGuA4TwMBoFukthwEr5pPwtlExWEkXViZgAuXBYKS7bOnGJHjmur5VGjPPnrwYYeLU8Tlf2gAh0_MkDZnmwYd6XuPJWA3Nx5Tg7VA-1-afX3wWDgfaTI9tjOUg0XD44bZZZTzmfhOmlAceUVKMmaEuKf53Ycrrgxer8e_2', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3917.266061967311!2d108.1943945!3d10.943263499999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31768560fadd3569%3A0x377cd94d4e5dcf23!2sThe%20Anam%20Mui%20Ne!5e0!3m2!1svi!2s!4v1764509888380!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển'),
(33, 14, 'Amana Hotel Phan Thiet', 'hotel', 'Phường Phú Thủy, TP. Phan Thiết, Bình Thuận', '650000', 'Dịch vụ tuyệt vời, cơ sở vật chất hoàn chỉnh và các tiện nghi khách sạn cung cấp sẽ khiến quý khách không thể phàn nàn trong suốt kỳ lưu trú tại Amana Hotel Phan Thiet.\nQuầy tiếp tân 24 giờ luôn sẵn sàng phục vụ quý khách từ thủ tục nhận phòng đến trả phòng hay bất kỳ yêu cầu nào. Nếu cần giúp đỡ xin hãy liên hệ đội ngũ tiếp tân, chúng tôi luôn sẵn sàng hỗ trợ quý khách.\nSóng WiFi phủ khắp các khu vực chung của khách sạn cho phép quý khách luôn kết nối với gia đình và bè bạn.\nAmana Hotel Phan Thiet là khách sạn sở hữu đầy đủ tiện nghi và dịch vụ xuất sắc theo nhận định của hầu hết khách lưu trú.\nVới những tiện nghi sẵn có Amana Hotel Phan Thiet thực sự là một nơi lưu trú hoàn hảo.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvC4g-ucPNpf1l1ZYbPyNYJ9bhFTjfbxuOn5OQGuA4TwMBoFukthwEr5pPwtlExWEkXViZgAuXBYKS7bOnGJHjmur5VGjPPnrwYYeLU8Tlf2gAh0_MkDZnmwYd6XuPJWA3Nx5Tg7VA-1-afX3wWDgfaTI9tjOUg0XD44bZZZTzmfhOmlAceUVKMmaEuKf53Ycrrgxer8e_2', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3917.4442669558703!2d108.11885679999999!3d10.9297747!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317683e2e7d63a85%3A0x7f8bd20c2114d6b7!2sAMANA%20Hotel%20Phan%20Thiet!5e0!3m2!1svi!2s!4v1764511587374!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển'),
(34, 3, 'Le\' VIVA Resort Mui Ne', 'resort', 'TP. Phan Thiết, Bình Thuận', '1150000', 'Dù quý khách muốn tổ chức một sự kiện hay các dịp kỷ niệm đặc biệt khác, Le\' VIVA Resort Mui Ne là lựa chọn tuyệt vời cho quý khách với phòng chức năng rộng lớn, được trang bị đầy đủ để sẵn sàng đáp ứng mọi yêu cầu.\nKhách sạn này là lựa chọn hoàn hảo cho các kỳ nghỉ mát lãng mạn hay tuần trăng mật của các cặp đôi. Quý khách hãy tận hưởng những đêm đáng nhớ nhất cùng người thương của mình tại Le\' VIVA Resort Mui Ne\nLe\' VIVA Resort Mui Ne là lựa chọn sáng giá dành cho những ai đang tìm kiếm một trải nghiệm xa hoa đầy thú vị trong kỳ nghỉ của mình. Lưu trú tại đây cũng là cách để quý khách chiều chuộng bản thân với những dịch vụ xuất sắc nhất và khiến kỳ nghỉ của mình trở nên thật đáng nhớ.\nMột trong những đặc điểm chính của khách sạn này là các liệu pháp spa đa dạng. Hãy nâng niu bản thân bằng các liệu pháp thư giãn, phục hồi giúp quý khách tươi trẻ thân, tâm.\nTừ sự kiện doanh nghiệp đến họp mặt công ty, Le\' VIVA Resort Mui Ne cung cấp đầy đủ các dịch vụ và tiện nghi đáp ứng mọi nhu cầu của quý khách và đồng nghiệp.\nHãy tận hưởng thời gian vui vẻ cùng cả gia đình với hàng loạt tiện nghi giải trí tại Le\' VIVA Resort Mui Ne, một nơi nghỉ tuyệt vời phù hợp cho mọi kỳ nghỉ bên người thân.\nNếu dự định có một kỳ nghỉ dài, thì Le\' VIVA Resort Mui Ne chính là lựa chọn dành cho quý khách. Với đầy đủ tiện nghi với chất lượng dịch vụ tuyệt vời, Le\' VIVA Resort Mui Ne sẽ khiến quý khách cảm thấy thoải mái như đang ở nhà vậy.\nDu lịch một mình cũng không hề kém phần thú vị và Le\' VIVA Resort Mui Ne là nơi thích hợp dành riêng cho những ai đề cao sự riêng tư trong kỳ lưu trú.\nKhách sạn này là nơi tốt nhất dành cho những ai mong muốn một nơi thanh bình, thư thái để ẩn mình khỏi đám đông ồn ã, xô bồ.\nHãy sẵn sàng đón nhận trải nghiệm khó quên bằng dịch vụ độc đáo và hoàn hảo của nơi nghỉ cùng các tiện nghi đầy đủ, đáp ứng mọi nhu cầu của quý khách.\nTrung tâm thể dục của nơi nghỉ là một trong những tiện nghi không thể bỏ qua khi lưu trú tại đây.\nHưởng thụ một ngày thư thái đầy thú vị tại hồ bơi dù quý khách đang du lịch một mình hay cùng người thân.\nNhận ưu đãi đặc biệt dành cho các liệu pháp spa tinh tuý nhất giúp thư giãn tinh thần và làm tươi trẻ cơ thể.\nQuầy tiếp tân 24 giờ luôn sẵn sàng phục vụ quý khách từ thủ tục nhận phòng đến trả phòng hay bất kỳ yêu cầu nào. Nếu cần giúp đỡ xin hãy liên hệ đội ngũ tiếp tân, chúng tôi luôn sẵn sàng hỗ trợ quý khách.\nTận hưởng những món ăn yêu thích với phong cách ẩm thực đặc biệt từ Le\' VIVA Resort Mui Ne chỉ dành riêng cho quý khách.\nSóng WiFi phủ khắp các khu vực chung của nơi nghỉ cho phép quý khách luôn kết nối với gia đình và bè bạn.\nLe\' VIVA Resort Mui Ne là nơi nghỉ sở hữu đầy đủ tiện nghi và dịch vụ xuất sắc theo nhận định của hầu hết khách lưu trú.\nHãy sẵn sàng đón nhận những giây phút vô giá khó phai trong suốt kỳ nghỉ của quý khách tại Le\' VIVA Resort Mui Ne.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvC4g-ucPNpf1l1ZYbPyNYJ9bhFTjfbxuOn5OQGuA4TwMBoFukthwEr5pPwtlExWEkXViZgAuXBYKS7bOnGJHjmur5VGjPPnrwYYeLU8Tlf2gAh0_MkDZnmwYd6XuPJWA3Nx5Tg7VA-1-afX3wWDgfaTI9tjOUg0XD44bZZZTzmfhOmlAceUVKMmaEuKf53Ycrrgxer8e_2', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3917.157915314395!2d108.2545907!3d10.951441400000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31768f1c7bcc76a1%3A0xc5869e2b9375e30a!2sLe%20VIVA%20Resort%20Mui%20Ne!5e0!3m2!1svi!2s!4v1764512328577!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'resort,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển,nghỉ dưỡng,thư giãn'),
(35, 3, 'Biệt thự MyGarden Phan Thiết Beachfront', 'villa', 'Xã Tiến Thành, TP. Phan Thiết, Bình Thuận', '7650000', 'Có một ngày vui vẻ và thư giãn tại hồ bơi, cho dù bạn đi du lịch một mình hay với những người thân yêu của mình.\nQuầy lễ tân 24 giờ luôn sẵn sàng phục vụ bạn, từ nhận phòng đến trả phòng hoặc bất kỳ sự hỗ trợ nào bạn cần. Nếu bạn muốn biết thêm, đừng ngần ngại hỏi quầy lễ tân, chúng tôi luôn sẵn sàng phục vụ bạn.\nNghỉ tại MyGarden Villa Phan Thiet Beachfront chắc chắn sẽ làm bạn hài lòng với sự hiếu khách tuyệt vời và giá cả phải chăng.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvC4g-ucPNpf1l1ZYbPyNYJ9bhFTjfbxuOn5OQGuA4TwMBoFukthwEr5pPwtlExWEkXViZgAuXBYKS7bOnGJHjmur5VGjPPnrwYYeLU8Tlf2gAh0_MkDZnmwYd6XuPJWA3Nx5Tg7VA-1-afX3wWDgfaTI9tjOUg0XD44bZZZTzmfhOmlAceUVKMmaEuKf53Ycrrgxer8e_2', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.0608236353105!2d108.02905899999999!3d10.806653599999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31742b85766c8ea5%3A0xbbcd964f72420aef!2sMyGarden%20Villa%20Phan%20Thiet%20Beachfront!5e0!3m2!1svi!2s!4v1764513059788!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 4, 4, 10, 'villa,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển,biệt thự,nguyên căn,gia đình,nhóm bạn'),
(41, 2, 'Ylang Garden Villa', 'villa', 'TP. Hội An, Quảng Nam', '8850000', 'Dịch vụ tuyệt vời, cơ sở vật chất hoàn chỉnh và các tiện nghi khách sạn cung cấp sẽ khiến quý khách không thể phàn nàn trong suốt kỳ lưu trú tại Ylang Garden Villa.\nHưởng thụ một ngày thư thái đầy thú vị tại hồ bơi dù quý khách đang du lịch một mình hay cùng người thân.\nQuầy tiếp tân 24 giờ luôn sẵn sàng phục vụ quý khách từ thủ tục nhận phòng đến trả phòng hay bất kỳ yêu cầu nào. Nếu cần giúp đỡ xin hãy liên hệ đội ngũ tiếp tân, chúng tôi luôn sẵn sàng hỗ trợ quý khách.\nYlang Garden Villa là khách sạn sở hữu đầy đủ tiện nghi và dịch vụ xuất sắc theo nhận định của hầu hết khách lưu trú.\nVới những tiện nghi sẵn có Ylang Garden Villa thực sự là một nơi lưu trú hoàn hảo.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvC4g-ucPNpf1l1ZYbPyNYJ9bhFTjfbxuOn5OQGuA4TwMBoFukthwEr5pPwtlExWEkXViZgAuXBYKS7bOnGJHjmur5VGjPPnrwYYeLU8Tlf2gAh0_MkDZnmwYd6XuPJWA3Nx5Tg7VA-1-afX3wWDgfaTI9tjOUg0XD44bZZZTzmfhOmlAceUVKMmaEuKf53Ycrrgxer8e_2', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3837.494300516853!2d108.35251520000001!3d15.883154299999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31420dc882573fe1%3A0x8c4436fcc55f339a!2sYlang%20Garden%20Villa!5e0!3m2!1svi!2s!4v1764513759793!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 5, 5, 12, 'villa,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển,thành phố,city break,văn hóa,biệt thự,nguyên căn,gia đình,nhóm bạn'),
(42, 3, 'Hotel Royal Hoi An - Gallery', 'hotel', 'TP. Hội An, Quảng Nam', '2000000', 'Khi lưu trú tại khách sạn thì nội thất và kiến trúc hẳn là hai yếu tố quan trọng khiến quý khách mãn nhãn. Với thiết kế độc đáo, Hotel Royal Hoi An - Gallery mang đến không gian lưu trú làm hài lòng quý khách.\nTừ sự kiện doanh nghiệp đến họp mặt công ty, Hotel Royal Hoi An - Gallery cung cấp đầy đủ các dịch vụ và tiện nghi đáp ứng mọi nhu cầu của quý khách và đồng nghiệp.\nDù quý khách muốn tổ chức một sự kiện hay các dịp kỷ niệm đặc biệt khác, Hotel Royal Hoi An - Gallery là lựa chọn tuyệt vời cho quý khách với phòng chức năng rộng lớn, được trang bị đầy đủ để sẵn sàng đáp ứng mọi yêu cầu.\nHãy tận hưởng thời gian vui vẻ cùng cả gia đình với hàng loạt tiện nghi giải trí tại Hotel Royal Hoi An - Gallery, một khách sạn tuyệt vời phù hợp cho mọi kỳ nghỉ bên người thân.\nHãy tận hưởng trải nghiệm lưu trú có một không hai tại toà nhà mang đậm dấu ấn lịch sử của Hotel Royal Hoi An - Gallery, điều quý khách khó có thể tìm thấy tại bất kỳ đâu.\nKhách sạn này là lựa chọn hoàn hảo cho các kỳ nghỉ mát lãng mạn hay tuần trăng mật của các cặp đôi. Quý khách hãy tận hưởng những đêm đáng nhớ nhất cùng người thương của mình tại Hotel Royal Hoi An - Gallery\nNếu dự định có một kỳ nghỉ dài, thì Hotel Royal Hoi An - Gallery chính là lựa chọn dành cho quý khách. Với đầy đủ tiện nghi với chất lượng dịch vụ tuyệt vời, Hotel Royal Hoi An - Gallery sẽ khiến quý khách cảm thấy thoải mái như đang ở nhà vậy.\nHotel Royal Hoi An - Gallery là lựa chọn sáng giá dành cho những ai đang tìm kiếm một trải nghiệm xa hoa đầy thú vị trong kỳ nghỉ của mình. Lưu trú tại đây cũng là cách để quý khách chiều chuộng bản thân với những dịch vụ xuất sắc nhất và khiến kỳ nghỉ của mình trở nên thật đáng nhớ.\nMột trong những đặc điểm chính của khách sạn này là các liệu pháp spa đa dạng. Hãy nâng niu bản thân bằng các liệu pháp thư giãn, phục hồi giúp quý khách tươi trẻ thân, tâm.\nDịch vụ thượng hạng song hành với hàng loạt tiện nghi phong phú sẽ đem đến cho quý khách trải nghiệm của một kỳ nghỉ viên mãn nhất.\nTrung tâm thể dục của khách sạn là một trong những tiện nghi không thể bỏ qua khi lưu trú tại đây.\nNhận ưu đãi đặc biệt dành cho các liệu pháp spa tinh tuý nhất giúp thư giãn tinh thần và làm tươi trẻ cơ thể.\nQuầy tiếp tân 24 giờ luôn sẵn sàng phục vụ quý khách từ thủ tục nhận phòng đến trả phòng hay bất kỳ yêu cầu nào. Nếu cần giúp đỡ xin hãy liên hệ đội ngũ tiếp tân, chúng tôi luôn sẵn sàng hỗ trợ quý khách.\nTận hưởng những món ăn yêu thích với phong cách ẩm thực đặc biệt từ Hotel Royal Hoi An - Gallery chỉ dành riêng cho quý khách.\nSóng WiFi phủ khắp các khu vực chung của khách sạn cho phép quý khách luôn kết nối với gia đình và bè bạn.\nHotel Royal Hoi An - Gallery là khách sạn sở hữu đầy đủ tiện nghi và dịch vụ xuất sắc theo nhận định của hầu hết khách lưu trú.\nTận hưởng trải nghiệm lưu trú xa hoa đầy thú vị không đâu sánh bằng tại Hotel Royal Hoi An - Gallery.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvC4g-ucPNpf1l1ZYbPyNYJ9bhFTjfbxuOn5OQGuA4TwMBoFukthwEr5pPwtlExWEkXViZgAuXBYKS7bOnGJHjmur5VGjPPnrwYYeLU8Tlf2gAh0_MkDZnmwYd6XuPJWA3Nx5Tg7VA-1-afX3wWDgfaTI9tjOUg0XD44bZZZTzmfhOmlAceUVKMmaEuKf53Ycrrgxer8e_2', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3837.617826285548!2d108.3198424!3d15.8766713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31420e62d212ad4b%3A0x1971389a5808ddb6!2sHotel%20Royal%20Hoi%20An%20Gallery!5e0!3m2!1svi!2s!4v1764514447158!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển,thành phố,city break,văn hóa'),
(43, 2, 'Reu Boutique Hotel', 'hotel', 'TP. Hội An, Quảng Nam', '1500000', 'Không chỉ sở hữu vị trí giúp quý khách dễ dàng ghé thăm những địa điểm lý thú trong chuyến hành trình, Reu Boutique Hotel cũng sẽ mang đến cho quý khách trải nghiệm lưu trú mỹ mãn.\nReu Boutique Hotel là đề xuất hàng đầu dành cho những tín đồ du lịch "bụi" mong muốn được nghỉ tại một khách sạn vừa thoải mái lại hợp túi tiền.\nKhi lưu trú tại khách sạn thì nội thất và kiến trúc hẳn là hai yếu tố quan trọng khiến quý khách mãn nhãn. Với thiết kế độc đáo, Reu Boutique Hotel mang đến không gian lưu trú làm hài lòng quý khách.\nTừ sự kiện doanh nghiệp đến họp mặt công ty, Reu Boutique Hotel cung cấp đầy đủ các dịch vụ và tiện nghi đáp ứng mọi nhu cầu của quý khách và đồng nghiệp.\nHãy tận hưởng thời gian vui vẻ cùng cả gia đình với hàng loạt tiện nghi giải trí tại Reu Boutique Hotel, một khách sạn tuyệt vời phù hợp cho mọi kỳ nghỉ bên người thân.\nKhách sạn này là lựa chọn lý tưởng cho cả du khách chơi golf nghiệp dư lẫn chuyên nghiệp.\nHãy tận hưởng trải nghiệm lưu trú có một không hai tại toà nhà mang đậm dấu ấn lịch sử của Reu Boutique Hotel, điều quý khách khó có thể tìm thấy tại bất kỳ đâu.\nKhách sạn này là lựa chọn hoàn hảo cho các kỳ nghỉ mát lãng mạn hay tuần trăng mật của các cặp đôi. Quý khách hãy tận hưởng những đêm đáng nhớ nhất cùng người thương của mình tại Reu Boutique Hotel\nNếu dự định có một kỳ nghỉ dài, thì Reu Boutique Hotel chính là lựa chọn dành cho quý khách. Với đầy đủ tiện nghi với chất lượng dịch vụ tuyệt vời, Reu Boutique Hotel sẽ khiến quý khách cảm thấy thoải mái như đang ở nhà vậy.\nReu Boutique Hotel là lựa chọn sáng giá dành cho những ai đang tìm kiếm một trải nghiệm xa hoa đầy thú vị trong kỳ nghỉ của mình. Lưu trú tại đây cũng là cách để quý khách chiều chuộng bản thân với những dịch vụ xuất sắc nhất và khiến kỳ nghỉ của mình trở nên thật đáng nhớ.\nDu lịch một mình cũng không hề kém phần thú vị và Reu Boutique Hotel là nơi thích hợp dành riêng cho những ai đề cao sự riêng tư trong kỳ lưu trú.\nMột trong những đặc điểm chính của khách sạn này là các liệu pháp spa đa dạng. Hãy nâng niu bản thân bằng các liệu pháp thư giãn, phục hồi giúp quý khách tươi trẻ thân, tâm.\nHãy sẵn sàng đón nhận trải nghiệm khó quên bằng dịch vụ độc đáo và hoàn hảo của khách sạn cùng các tiện nghi đầy đủ, đáp ứng mọi nhu cầu của quý khách.\nTrung tâm thể dục của khách sạn là một trong những tiện nghi không thể bỏ qua khi lưu trú tại đây.\nHưởng thụ một ngày thư thái đầy thú vị tại hồ bơi dù quý khách đang du lịch một mình hay cùng người thân.\nNhận ưu đãi đặc biệt dành cho các liệu pháp spa tinh tuý nhất giúp thư giãn tinh thần và làm tươi trẻ cơ thể.\nQuầy tiếp tân 24 giờ luôn sẵn sàng phục vụ quý khách từ thủ tục nhận phòng đến trả phòng hay bất kỳ yêu cầu nào. Nếu cần giúp đỡ xin hãy liên hệ đội ngũ tiếp tân, chúng tôi luôn sẵn sàng hỗ trợ quý khách.\nTận hưởng những món ăn yêu thích với phong cách ẩm thực đặc biệt từ Reu Boutique Hotel chỉ dành riêng cho quý khách.\nSóng WiFi phủ khắp các khu vực chung của khách sạn cho phép quý khách luôn kết nối với gia đình và bè bạn.\nReu Boutique Hotel là khách sạn sở hữu đầy đủ tiện nghi và dịch vụ xuất sắc theo nhận định của hầu hết khách lưu trú.\nHãy sẵn sàng đón nhận những giây phút vô giá khó phai trong suốt kỳ nghỉ của quý khách tại Reu Boutique Hotel.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvC4g-ucPNpf1l1ZYbPyNYJ9bhFTjfbxuOn5OQGuA4TwMBoFukthwEr5pPwtlExWEkXViZgAuXBYKS7bOnGJHjmur5VGjPPnrwYYeLU8Tlf2gAh0_MkDZnmwYd6XuPJWA3Nx5Tg7VA-1-afX3wWDgfaTI9tjOUg0XD44bZZZTzmfhOmlAceUVKMmaEuKf53Ycrrgxer8e_2', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3837.4081902222565!2d108.3354004!3d15.887672100000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31420d00150fb86d%3A0x2a7b388c71f99f9c!2sR%C3%AAu%20H%E1%BB%99i%20An%20Boutique%20Hotel!5e0!3m2!1svi!2s!4v1764514865951!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển,thành phố,city break,văn hóa'),
(51, 2, 'Elegant Hue Hotel', 'hotel', 'Huế, Việt Nam', '1000000', 'Elegant Hue Hotel là lựa chọn lưu trú tại Huế, Việt Nam, phù hợp cho chuyến đi nghỉ dưỡng và công tác.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbDd5vtbsKwJGeyNSm7Sm9j2C87ZmCv3K7nZN9x7grZ92SEyjJayM0DqBo6ijsH5APv74UOzhbPrp5p9h3f3hHuibjI8Sw7MGt3AFz_i0w2C2EnOyePYf-OJ8ZA1L6EWtCQc1KZrwPUAesUgxgHINnM-wqMBKKI2ICARLxqPy_zuQYe9vIijtntVH6EsHmWc25wfxYwg1WY', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30609.527456118005!2d107.5561338743164!3d16.465867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a1ae6f9a5513%3A0x5874651d64409fa4!2sElegant%20Hue%20Hotel!5e0!3m2!1svi!2s!4v1764573866803!5m2!1svi!2s', 0, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,thành phố,city break,văn hóa'),
(52, 14, 'Kobi Onsen Resort Hue, Affiliated by Melia', 'resort', 'TP. Huế, Việt Nam', '1300000', 'Kawara My An Onsen Resort – một khu phức hợp nghỉ dưỡng sức khỏe theo tiêu chuẩn onsen truyền thống của Nhật Bản, một trong những dự án tiêu biểu của BBGroup tại miền Trung Việt Nam.\n\nVới sứ mệnh là người tiên phong trong việc tạo ra các biểu tượng, BB Group đến với Huế với mong muốn chân thành để phát triển và tạo ra những ấn tượng du lịch mới lạ cho cố đô này. Nhờ sự chuyển giao công nghệ và kinh nghiệm vận hành từ Kawara Resort - một trong những thương hiệu khu nghỉ dưỡng suối nước nóng truyền thống nổi tiếng tại Nhật Bản, chúng tôi hy vọng sẽ mang đến cho du khách trải nghiệm về một khu phức hợp nghỉ dưỡng cao cấp, đặc biệt là dịch vụ onsen theo tiêu chuẩn Nhật Bản đáng chú ý và trên hết là sự giao lưu văn hóa giữa Đất nước Mặt trời mọc và Kinh thành Huế.\n\nTọa lạc cách Chợ No khoảng 2km và Chợ Đông Ba 8 km, resort còn cách Cầu Tràng Tiền 7 km. Khách có thể thưởng thức đồ uống tại quầy bar hoặc dùng bữa tại nhà hàng.\n\nBữa sáng tự chọn có thể được thưởng thức tại chỗ nghỉ.\n\nKhách có thể sử dụng trung tâm thể dục.\n\nNhân viên tại quầy lễ tân có thể giúp đỡ suốt ngày đêm với những lời khuyên về khu vực.\n\nHồ Tịnh Tâm cách resort 11 km, trong khi Bảo tàng Cổ vật Hoàng gia cách đó 11 km. Sân bay gần nhất là Sân bay Phú Bài, cách resort 25 km.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbDd5vtbsKwJGeyNSm7Sm9j2C87ZmCv3K7nZN9x7grZ92SEyjJayM0DqBo6ijsH5APv74UOzhbPrp5p9h3f3hHuibjI8Sw7MGt3AFz_i0w2C2EnOyePYf-OJ8ZA1L6EWtCQc1KZrwPUAesUgxgHINnM-wqMBKKI2ICARLxqPy_zuQYe9vIijtntVH6EsHmWc24', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.0987013433414!2d107.61347699999999!3d16.521114!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a10df33a083b%3A0x10306f98274eb769!2sKobi%20Onsen%20Resort%20Hue%2C%20Affiliated%20by%20Melia!5e0!3m2!1svi!2s!4v1764600401556!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'resort,thành phố,city break,văn hóa,nghỉ dưỡng,thư giãn'),
(53, 3, 'Muong Thanh Holiday Hue Hotel', 'hotel', 'TP. Huế, Việt Nam', '1000000', 'Từ sự kiện doanh nghiệp đến họp mặt công ty, Muong Thanh Holiday Hue Hotel cung cấp đầy đủ các dịch vụ và tiện nghi đáp ứng mọi nhu cầu của quý khách và đồng nghiệp.\n\nDù quý khách muốn tổ chức một sự kiện hay các dịp kỷ niệm đặc biệt khác, Muong Thanh Holiday Hue Hotel là lựa chọn tuyệt vời cho quý khách với phòng chức năng rộng lớn, được trang bị đầy đủ để sẵn sàng đáp ứng mọi yêu cầu.\n\nKhách sạn này là lựa chọn hoàn hảo cho các kỳ nghỉ mát lãng mạn hay tuần trăng mật của các cặp đôi. Quý khách hãy tận hưởng những đêm đáng nhớ nhất cùng người thương của mình tại Muong Thanh Holiday Hue Hotel.\n\nMuong Thanh Holiday Hue Hotel là lựa chọn sáng giá dành cho những ai đang tìm kiếm một trải nghiệm xa hoa đầy thú vị trong kỳ nghỉ của mình. Lưu trú tại đây cũng là cách để quý khách chiều chuộng bản thân với những dịch vụ xuất sắc nhất và khiến kỳ nghỉ của mình trở nên thật đáng nhớ.\n\nHãy sẵn sàng đón nhận trải nghiệm khó quên bằng dịch vụ độc đáo và hoàn hảo của khách sạn cùng các tiện nghi đầy đủ, đáp ứng mọi nhu cầu của quý khách.\n\nTrung tâm thể dục của khách sạn là một trong những tiện nghi không thể bỏ qua khi lưu trú tại đây.\n\nHưởng thụ một ngày thư thái đầy thú vị tại hồ bơi dù quý khách đang du lịch một mình hay cùng người thân.\n\nNhận ưu đãi đặc biệt dành cho các liệu pháp spa tinh tuý nhất giúp thư giãn tinh thần và làm tươi trẻ cơ thể.\n\nQuầy tiếp tân 24 giờ luôn sẵn sàng phục vụ quý khách từ thủ tục nhận phòng đến trả phòng hay bất kỳ yêu cầu nào. Nếu cần giúp đỡ xin hãy liên hệ đội ngũ tiếp tân, chúng tôi luôn sẵn sàng hỗ trợ quý khách.\n\nTận hưởng những món ăn yêu thích với phong cách ẩm thực đặc biệt từ Muong Thanh Holiday Hue Hotel chỉ dành riêng cho quý khách.\n\nSóng WiFi phủ khắp các khu vực chung của khách sạn cho phép quý khách luôn kết nối với gia đình và bè bạn.\n\nMuong Thanh Holiday Hue Hotel là khách sạn sở hữu đầy đủ tiện nghi và dịch vụ xuất sắc theo nhận định của hầu hết khách lưu trú.\n\nTận hưởng trải nghiệm lưu trú xa hoa đầy thú vị không đâu sánh bằng tại Muong Thanh Holiday Hue Hotel.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrvgMY2AVYnyzdxJ39yFL_WbpvtD1wm0CaNoF8o7h3Il4noOJCeeVcPI7wi5PRMfL1btdG8pqW25RGjR-SonElWR2VukmexroNqQagpynpDmh6PqZEfU9CD1Qaav3NM3O0xgXzec-bjdBA5VR9A523HSotNrPoV3f6tPvChAYEHYQn_da2dQJjOs8d-GLGh5vh9vIiVmivt', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.1212346610696!2d107.5934473!3d16.4693978!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a13cb6ac8431%3A0x4b9904d7eb09b194!2zS2jDoWNoIFPhuqFuIE3GsOG7nW5nIFRoYW5oIEhvbGlkYXkgSHXhur8!5e0!3m2!1svi!2s!4v1764600583652!5m2!1svi!2s', 0, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,thành phố,city break,văn hóa'),
(54, 2, 'Kly Luxury Hotel', 'hotel', 'TP. Huế, Việt Nam', '500000', 'Dành cho những du khách muốn du lịch thoải mái cùng ngân sách tiết kiệm, Kly Luxury Hotel sẽ là lựa chọn lưu trú hoàn hảo, nơi cung cấp các tiện nghi chất lượng và dịch vụ tuyệt vời.\n\nHãy tận hưởng thời gian vui vẻ cùng cả gia đình với hàng loạt tiện nghi giải trí tại Kly Luxury Hotel , một khách sạn tuyệt vời phù hợp cho mọi kỳ nghỉ bên người thân.\n\nKly Luxury Hotel là lựa chọn sáng giá dành cho những ai đang tìm kiếm một trải nghiệm xa hoa đầy thú vị trong kỳ nghỉ của mình. Lưu trú tại đây cũng là cách để quý khách chiều chuộng bản thân với những dịch vụ xuất sắc nhất và khiến kỳ nghỉ của mình trở nên thật đáng nhớ.\n\nDu lịch một mình cũng không hề kém phần thú vị và Kly Luxury Hotel là nơi thích hợp dành riêng cho những ai đề cao sự riêng tư trong kỳ lưu trú.\n\nQuầy tiếp tân 24 giờ luôn sẵn sàng phục vụ quý khách từ thủ tục nhận phòng đến trả phòng hay bất kỳ yêu cầu nào. Nếu cần giúp đỡ xin hãy liên hệ đội ngũ tiếp tân, chúng tôi luôn sẵn sàng hỗ trợ quý khách.\n\nSóng WiFi phủ khắp các khu vực chung của khách sạn cho phép quý khách luôn kết nối với gia đình và bè bạn.\n\nKly Luxury Hotel là khách sạn sở hữu đầy đủ tiện nghi và dịch vụ xuất sắc theo nhận định của hầu hết khách lưu trú.\n\nKly Luxury Hotel là lựa chọn lý tưởng cho những ai đang tìm kiếm một phòng nghỉ thoải mái với giá thành hợp lý.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrvgMY2AVYnyzdxJ39yFL_WbpvtD1wm0CaNoF8o7h3Il4noOJCeeVcPI7wi5PRMfL1btdG8pqW25RGjR-SonElWR2VukmexroNqQagpynpDmh6PqZEfU9CD1Qaav3NM3O0xgXzec-bjdBA5VR9A523HSotNrPoV3f6tPvChAYEHYQn_da2dQJjOs8d-GLGh5vh9vIiVmivt', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.214104750274!2d107.59013727471914!3d16.464692928730518!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a186361d9b9b%3A0xb067aa238fb07ee9!2sKLY%20LUXURY%20HOTEL%20HUE!5e0!3m2!1svi!2s!4v1764600835638!5m2!1svi!2s', 0, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,thành phố,city break,văn hóa'),
(55, 3, 'Moonlight Hotel Hue', 'hotel', 'TP. Huế, Việt Nam', '600000', 'Không chỉ sở hữu vị trí giúp quý khách dễ dàng ghé thăm những địa điểm lý thú trong chuyến hành trình, Moonlight Hotel Hue cũng sẽ mang đến cho quý khách trải nghiệm lưu trú mỹ mãn.\n\nMoonlight Hotel Hue là đề xuất hàng đầu dành cho những tín đồ du lịch "bụi" mong muốn được nghỉ tại một khách sạn vừa thoải mái lại hợp túi tiền.\n\nKhi lưu trú tại khách sạn thì nội thất và kiến trúc hẳn là hai yếu tố quan trọng khiến quý khách mãn nhãn. Với thiết kế độc đáo, Moonlight Hotel Hue mang đến không gian lưu trú làm hài lòng quý khách.\n\nDành cho những du khách muốn du lịch thoải mái cùng ngân sách tiết kiệm, Moonlight Hotel Hue sẽ là lựa chọn lưu trú hoàn hảo, nơi cung cấp các tiện nghi chất lượng và dịch vụ tuyệt vời.\n\nTừ sự kiện doanh nghiệp đến họp mặt công ty, Moonlight Hotel Hue cung cấp đầy đủ các dịch vụ và tiện nghi đáp ứng mọi nhu cầu của quý khách và đồng nghiệp.\n\nDù quý khách muốn tổ chức một sự kiện hay các dịp kỷ niệm đặc biệt khác, Moonlight Hotel Hue là lựa chọn tuyệt vời cho quý khách với phòng chức năng rộng lớn, được trang bị đầy đủ để sẵn sàng đáp ứng mọi yêu cầu.\n\nHãy tận hưởng thời gian vui vẻ cùng cả gia đình với hàng loạt tiện nghi giải trí tại Moonlight Hotel Hue, một khách sạn tuyệt vời phù hợp cho mọi kỳ nghỉ bên người thân.\n\nKhách sạn này là lựa chọn hoàn hảo cho các kỳ nghỉ mát lãng mạn hay tuần trăng mật của các cặp đôi. Quý khách hãy tận hưởng những đêm đáng nhớ nhất cùng người thương của mình tại Moonlight Hotel Hue.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrvgMY2AVYnyzdxJ39yFL_WbpvtD1wm0CaNoF8o7h3Il4noOJCeeVcPI7wi5PRMfL1btdG8pqW25RGjR-SonElWR2VukmexroNqQagpynpDmh6PqZEfU9CD1Qaav3NM3O0xgXzec-bjdBA5VR9A523HSotNrPoV3f6tPvChAYEHYQn_da2dQJjOs8d-GLGh5vh9vIiVmivt', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.1218446845064!2d107.5942676!3d16.469366900000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a13cd1fb6a3d%3A0xb69ec59e61660f7a!2sMoonlight%20Hotel%20Hue!5e0!3m2!1svi!2s!4v1764600925247!5m2!1svi!2s', 0, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,thành phố,city break,văn hóa'),
(101, 2, 'Goldient Boutique Hotel', 'hotel', 'TP. Huế, Việt Nam', '1200000', 'Không chỉ sở hữu vị trí giúp quý khách dễ dàng ghé thăm những địa điểm lý thú trong chuyến hành trình, Goldient Boutique Hotel cũng sẽ mang đến cho quý khách trải nghiệm lưu trú mỹ mãn.\n\nTọa lạc gần sân bay, Goldient Boutique Hotel là nơi nghỉ ngơi lý tưởng trong lúc quý khách đang chờ chuyến bay kế tiếp. Quý khách có thể tận hưởng không gian nghỉ dưỡng vừa ý nơi đây trong quá trình quá cảnh.\n\nKhi lưu trú tại khách sạn thì nội thất và kiến trúc hẳn là hai yếu tố quan trọng khiến quý khách mãn nhãn. Với thiết kế độc đáo, Goldient Boutique Hotel mang đến không gian lưu trú làm hài lòng quý khách.\n\nTừ sự kiện doanh nghiệp đến họp mặt công ty, Goldient Boutique Hotel cung cấp đầy đủ các dịch vụ và tiện nghi đáp ứng mọi nhu cầu của quý khách và đồng nghiệp.\n\nDù quý khách muốn tổ chức một sự kiện hay các dịp kỷ niệm đặc biệt khác, Goldient Boutique Hotel là lựa chọn tuyệt vời cho quý khách với phòng chức năng rộng lớn, được trang bị đầy đủ để sẵn sàng đáp ứng mọi yêu cầu.\n\nHãy tận hưởng thời gian vui vẻ cùng cả gia đình với hàng loạt tiện nghi giải trí tại Goldient Boutique Hotel, một khách sạn tuyệt vời phù hợp cho mọi kỳ nghỉ bên người thân.\n\nKhách sạn này là lựa chọn lý tưởng cho cả du khách chơi golf nghiệp dư lẫn chuyên nghiệp.\n\nHãy tận hưởng trải nghiệm lưu trú có một không hai tại toà nhà mang đậm dấu ấn lịch sử của Goldient Boutique Hotel, điều quý khách khó có thể tìm thấy tại bất kỳ đâu.\n\nKhách sạn này là lựa chọn hoàn hảo cho các kỳ nghỉ mát lãng mạn hay tuần trăng mật của các cặp đôi. Quý khách hãy tận hưởng những đêm đáng nhớ nhất cùng người thương của mình tại Goldient Boutique Hotel\n\nNếu dự định có một kỳ nghỉ dài, thì Goldient Boutique Hotel chính là lựa chọn dành cho quý khách. Với đầy đủ tiện nghi với chất lượng dịch vụ tuyệt vời, Goldient Boutique Hotel sẽ khiến quý khách cảm thấy thoải mái như đang ở nhà vậy.\n\nGoldient Boutique Hotel là lựa chọn sáng giá dành cho những ai đang tìm kiếm một trải nghiệm xa hoa đầy thú vị trong kỳ nghỉ của mình. Lưu trú tại đây cũng là cách để quý khách chiều chuộng bản thân với những dịch vụ xuất sắc nhất và khiến kỳ nghỉ của mình trở nên thật đáng nhớ.\n\nBạn có phải là tín đồ mua sắm? Lưu trú tại Goldient Boutique Hotel chắc chắn sẽ thoả mãn bạn với hàng loạt các trung tâm mua sắm kề cận.\n\nDu lịch một mình cũng không hề kém phần thú vị và Goldient Boutique Hotel là nơi thích hợp dành riêng cho những ai đề cao sự riêng tư trong kỳ lưu trú.\n\nHãy sẵn sàng đón nhận trải nghiệm khó quên bằng dịch vụ độc đáo và hoàn hảo của khách sạn cùng các tiện nghi đầy đủ, đáp ứng mọi nhu cầu của quý khách.\n\nHưởng thụ một ngày thư thái đầy thú vị tại hồ bơi dù quý khách đang du lịch một mình hay cùng người thân.\n\nQuầy tiếp tân 24 giờ luôn sẵn sàng phục vụ quý khách từ thủ tục nhận phòng đến trả phòng hay bất kỳ yêu cầu nào. Nếu cần giúp đỡ xin hãy liên hệ đội ngũ tiếp tân, chúng tôi luôn sẵn sàng hỗ trợ quý khách.\n\nTận hưởng những món ăn yêu thích với phong cách ẩm thực đặc biệt từ Goldient Boutique Hotel chỉ dành riêng cho quý khách.\n\nSóng WiFi phủ khắp các khu vực chung của khách sạn cho phép quý khách luôn kết nối với gia đình và bè bạn.\n\nGoldient Boutique Hotel là khách sạn sở hữu đầy đủ tiện nghi và dịch vụ xuất sắc theo nhận định của hầu hết khách lưu trú.\n\nTận hưởng trải nghiệm lưu trú xa hoa đầy thú vị không đâu sánh bằng tại Goldient Boutique Hotel.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrvgMY2AVYnyzdxJ39yFL_WbpvtD1wm0CaNoF8o7h3Il4noOJCeeVcPI7wi5PRMfL1btdG8pqW25RGjR-SonElWR2VukmexroNqQagpynpDmh6PqZEfU9CD1Qaav3NM3O0xgXzec-bjdBA5VR9A523HSotNrPoV3f6tPvChAYEHYQn_da2dQJjOs8d-GLGh5vh9vIiVmivt', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3903.6646599249693!2d108.4457707!3d11.928409499999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3171137eddaf9c99%3A0x2b2768f9f5a7920d!2sGoldient%20Boutique%20Hotel%20(C%C3%B4ng%20Ty%20TNHH%20XD%20Tu%E1%BA%A5n%20Gia%20Ph%C3%A1t)!5e0!3m2!1svi!2s!4v1764610267373!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,thành phố,city break,văn hóa'),
(102, 3, 'Khách sạn MerPerle Dalat', 'hotel', 'Đà Lạt, Lâm Đồng', '1800000', 'Khách sạn MerPerle Đà Lạt là một khách sạn gần Sân bay, một nơi ở lý tưởng trong khi chờ chuyến bay tiếp theo của bạn. Tận hưởng một nơi nghỉ ngơi thoải mái trong quá trình di chuyển của bạn.\n\nKhách sạn MerPerle Đà Lạt rất được khuyến khích cho những người đi ba lô, những người muốn có một kỳ nghỉ giá cả phải chăng nhưng đồng thời vẫn thoải mái.\n\nTừ sự kiện kinh doanh đến các cuộc họp công ty, Khách sạn MerPerle Đà Lạt cung cấp các dịch vụ và tiện nghi đầy đủ mà bạn và đồng nghiệp của bạn cần.\n\nCho dù bạn đang lên kế hoạch cho một sự kiện hay những dịp đặc biệt khác, Khách sạn MerPerle Đà Lạt là một lựa chọn tuyệt vời cho bạn với một phòng chức năng lớn và được trang bị tốt để phù hợp với yêu cầu của bạn.\n\nHãy vui vẻ với nhiều tiện nghi giải trí khác nhau dành cho bạn và cả gia đình tại Khách sạn MerPerle Đà Lạt, một nơi ở tuyệt vời cho kỳ nghỉ của gia đình bạn.\n\nTrải nghiệm một kỳ nghỉ độc đáo tại tòa nhà lịch sử của Khách sạn MerPerle Đà Lạt, điều mà bạn hiếm khi tìm thấy ở những nơi khác.\n\nKhách sạn này là sự lựa chọn hoàn hảo cho các cặp đôi đang tìm kiếm một kỳ nghỉ lãng mạn hoặc một nơi nghỉ dưỡng trăng mật. Tận hưởng những đêm đáng nhớ nhất với người thân yêu của bạn bằng cách ở tại Khách sạn MerPerle Đà Lạt.\n\nNếu bạn dự định có một kỳ nghỉ dài hạn, việc ở tại Khách sạn MerPerle Đà Lạt là lựa chọn phù hợp với bạn. Cung cấp nhiều tiện nghi và chất lượng dịch vụ tuyệt vời, chỗ ở này chắc chắn sẽ khiến bạn cảm thấy như ở nhà.\n\nKhách sạn MerPerle Đà Lạt là sự lựa chọn tuyệt vời cho những ai đang tìm kiếm một kỳ nghỉ sang trọng. Hãy nuông chiều bản thân với những dịch vụ tuyệt vời nhất và làm cho kỳ nghỉ của bạn đáng nhớ bằng cách ở lại đây.\n\nBạn là một người nghiện mua sắm? Ở tại Khách sạn MerPerle Đà Lạt chắc chắn sẽ làm bạn thích thú với vô số trung tâm mua sắm gần đó.\n\nTrong khi đi du lịch với bạn bè có thể rất vui, thì việc đi du lịch một mình lại có những đặc quyền riêng. Đối với chỗ ở, Khách sạn MerPerle Đà Lạt phù hợp với những người coi trọng sự riêng tư trong thời gian lưu trú của bạn.\n\nLiệu pháp spa là một trong những tính năng chính của khách sạn. Hãy nuông chiều bản thân bằng liệu pháp thư giãn giúp bạn trẻ hóa.\n\nDịch vụ chất lượng cao nhất cùng với các tiện nghi phong phú sẽ giúp bạn có được trải nghiệm kỳ nghỉ tuyệt vời nhất.\n\nTrung tâm thể dục của khách sạn là một điều bạn phải thử trong thời gian bạn ở đây.\n\nCó một ngày vui vẻ và thư giãn tại hồ bơi, cho dù bạn đi du lịch một mình hay với những người thân yêu của bạn.\n\nNhận ưu đãi tốt nhất cho chất lượng tốt nhất của liệu pháp spa để thư giãn và trẻ hóa bản thân.\n\nQuầy lễ tân 24 giờ luôn sẵn sàng phục vụ bạn, từ nhận phòng đến trả phòng hoặc bất kỳ sự hỗ trợ nào bạn cần. Nếu bạn muốn nhiều hơn, đừng ngần ngại hỏi quầy lễ tân, chúng tôi luôn sẵn sàng phục vụ bạn.\n\nThưởng thức các món ăn yêu thích của bạn với các món ăn đặc biệt từ Khách sạn MerPerle Đà Lạt dành riêng cho bạn.\n\nWi-Fi có sẵn trong các khu vực công cộng của khách sạn để giúp bạn kết nối với gia đình và bạn bè.\n\nKhách sạn MerPerle Đà Lạt là một khách sạn có sự thoải mái tuyệt vời và dịch vụ tuyệt vời theo hầu hết khách của khách sạn.\n\nTận hưởng những món ăn sang trọng và trải nghiệm vô song bằng cách ở tại Khách sạn MerPerle Đà Lạt.', 'http://googleusercontent.com/profile/picture/41', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3903.481647297428!2d108.4583036!3d11.9411183!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3171132bd1dd7c6f%3A0x28989de80f2b7731!2sMerPerle%20Dalat%20Hotel!5e0!3m2!1svi!2s!4v1764610540444!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,núi,cao nguyên,khí hậu mát,mountain'),
(103, 3, 'Leaf Beachfront Hotel Da Nang', 'hotel', 'TP. Đà Nẵng, Việt Nam', '950000', 'Dành cho những du khách muốn du lịch thoải mái cùng ngân sách tiết kiệm, Leaf Beachfront Hotel Da Nang sẽ là lựa chọn lưu trú hoàn hảo, nơi cung cấp các tiện nghi chất lượng và dịch vụ tuyệt vời.\n\nKhách sạn này là lựa chọn hoàn hảo cho các kỳ nghỉ mát lãng mạn hay tuần trăng mật của các cặp đôi. Quý khách hãy tận hưởng những đêm đáng nhớ nhất cùng người thương của mình tại Leaf Beachfront Hotel Da Nang\n\nLeaf Beachfront Hotel Da Nang là lựa chọn sáng giá dành cho những ai đang tìm kiếm một trải nghiệm xa hoa đầy thú vị trong kỳ nghỉ của mình. Lưu trú tại đây cũng là cách để quý khách chiều chuộng bản thân với những dịch vụ xuất sắc nhất và khiến kỳ nghỉ của mình trở nên thật đáng nhớ.\n\nKhi lưu trú tại khách sạn thì nội thất và kiến trúc hẳn là hai yếu tố quan trọng khiến quý khách mãn nhãn. Với thiết kế độc đáo, Leaf Beachfront Hotel Da Nang mang đến không gian lưu trú làm hài lòng quý khách.\n\nHãy tận hưởng thời gian vui vẻ cùng cả gia đình với hàng loạt tiện nghi giải trí tại Leaf Beachfront Hotel Da Nang, một khách sạn tuyệt vời phù hợp cho mọi kỳ nghỉ bên người thân.\n\nNếu dự định có một kỳ nghỉ dài, thì Leaf Beachfront Hotel Da Nang chính là lựa chọn dành cho quý khách. Với đầy đủ tiện nghi với chất lượng dịch vụ tuyệt vời, Leaf Beachfront Hotel Da Nang sẽ khiến quý khách cảm thấy thoải mái như đang ở nhà vậy.\n\nHưởng thụ một ngày thư thái đầy thú vị tại hồ bơi dù quý khách đang du lịch một mình hay cùng người thân.\n\nQuầy tiếp tân 24 giờ luôn sẵn sàng phục vụ quý khách từ thủ tục nhận phòng đến trả phòng hay bất kỳ yêu cầu nào. Nếu cần giúp đỡ xin hãy liên hệ đội ngũ tiếp tân, chúng tôi luôn sẵn sàng hỗ trợ quý khách.\n\nTận hưởng những món ăn yêu thích với phong cách ẩm thực đặc biệt từ Leaf Beachfront Hotel Da Nang chỉ dành riêng cho quý khách.\n\nLeaf Beachfront Hotel Da Nang là khách sạn sở hữu đầy đủ tiện nghi và dịch vụ xuất sắc theo nhận định của hầu hết khách lưu trú.\n\nVới những tiện nghi sẵn có Leaf Beachfront Hotel Da Nang thực sự là một nơi lưu trú hoàn hảo.', 'http://googleusercontent.com/profile/picture/43', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.607479140029!2d108.24813879999999!3d16.0858461!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142173a22bf7925%3A0x1fa7d67836459fa8!2sLeaf%20Hotel!5e0!3m2!1svi!2s!4v1764610795410!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển'),
(104, 14, 'G8 Luxury Hotel And Spa Da Nang', 'hotel', 'TP. Đà Nẵng, Việt Nam', '700000', 'Khách sạn này là lựa chọn hoàn hảo cho các kỳ nghỉ mát lãng mạn hay tuần trăng mật của các cặp đôi. Quý khách hãy tận hưởng những đêm đáng nhớ nhất cùng người thương của mình tại G8 Luxury Hotel And Spa Da Nang\n\nG8 Luxury Hotel And Spa Da Nang là lựa chọn sáng giá dành cho những ai đang tìm kiếm một trải nghiệm xa hoa đầy thú vị trong kỳ nghỉ của mình. Lưu trú tại đây cũng là cách để quý khách chiều chuộng bản thân với những dịch vụ xuất sắc nhất và khiến kỳ nghỉ của mình trở nên thật đáng nhớ.\n\nBạn có phải là tín đồ mua sắm? Lưu trú tại G8 Luxury Hotel And Spa Da Nang chắc chắn sẽ thoả mãn bạn với hàng loạt các trung tâm mua sắm kề cận.\n\nKhi lưu trú tại khách sạn thì nội thất và kiến trúc hẳn là hai yếu tố quan trọng khiến quý khách mãn nhãn. Với thiết kế độc đáo, G8 Luxury Hotel And Spa Da Nang mang đến không gian lưu trú làm hài lòng quý khách.\n\nTừ sự kiện doanh nghiệp đến họp mặt công ty, G8 Luxury Hotel And Spa Da Nang cung cấp đầy đủ các dịch vụ và tiện nghi đáp ứng mọi nhu cầu của quý khách và đồng nghiệp.\n\nHãy tận hưởng thời gian vui vẻ cùng cả gia đình với hàng loạt tiện nghi giải trí tại G8 Luxury Hotel And Spa Da Nang, một khách sạn tuyệt vời phù hợp cho mọi kỳ nghỉ bên người thân.\n\nNếu dự định có một kỳ nghỉ dài, thì G8 Luxury Hotel And Spa Da Nang chính là lựa chọn dành cho quý khách. Với đầy đủ tiện nghi với chất lượng dịch vụ tuyệt vời, G8 Luxury Hotel And Spa Da Nang sẽ khiến quý khách cảm thấy thoải mái như đang ở nhà vậy.\n\nHãy sẵn sàng đón nhận trải nghiệm khó quên bằng dịch vụ độc đáo và hoàn hảo của khách sạn cùng các tiện nghi đầy đủ, đáp ứng mọi nhu cầu của quý khách.\n\nHưởng thụ một ngày thư thái đầy thú vị tại hồ bơi dù quý khách đang du lịch một mình hay cùng người thân.\n\nQuầy tiếp tân 24 giờ luôn sẵn sàng phục vụ quý khách từ thủ tục nhận phòng đến trả phòng hay bất kỳ yêu cầu nào. Nếu cần giúp đỡ xin hãy liên hệ đội ngũ tiếp tân, chúng tôi luôn sẵn sàng hỗ trợ quý khách.\n\nSóng WiFi phủ khắp các khu vực chung của khách sạn cho phép quý khách luôn kết nối với gia đình và bè bạn.\n\nG8 Luxury Hotel And Spa Da Nang là khách sạn sở hữu đầy đủ tiện nghi và dịch vụ xuất sắc theo nhận định của hầu hết khách lưu trú.\n\nTận hưởng trải nghiệm lưu trú xa hoa đầy thú vị không đâu sánh bằng tại G8 Luxury Hotel And Spa Da Nang.', 'http://googleusercontent.com/profile/picture/44', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.897091574162!2d108.21707819999999!3d16.0708291!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31421828f96d9b7b%3A0xb47c13a96e71ee54!2zS2jDoWNoIHPhuqFuIEc4IEx1eHVyeQ!5e0!3m2!1svi!2s!4v1764611132012!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển'),
(105, 3, 'DeLaSol Sapa Hotel', 'hotel', 'Sapa, Lào Cai', '900000', 'Khi lưu trú tại khách sạn thì nội thất và kiến trúc hẳn là hai yếu tố quan trọng khiến quý khách mãn nhãn. Với thiết kế độc đáo, DeLaSol Sapa Hotel mang đến không gian lưu trú làm hài lòng quý khách.\n\nTừ sự kiện doanh nghiệp đến họp mặt công ty, DeLaSol Sapa Hotel cung cấp đầy đủ các dịch vụ và tiện nghi đáp ứng mọi nhu cầu của quý khách và đồng nghiệp.\n\nDù quý khách muốn tổ chức một sự kiện hay các dịp kỷ niệm đặc biệt khác, DeLaSol Sapa Hotel là lựa chọn tuyệt vời cho quý khách với phòng chức năng rộng lớn, được trang bị đầy đủ để sẵn sàng đáp ứng mọi yêu cầu.\n\nHãy tận hưởng thời gian vui vẻ cùng cả gia đình với hàng loạt tiện nghi giải trí tại DeLaSol Sapa Hotel , một khách sạn tuyệt vời phù hợp cho mọi kỳ nghỉ bên người thân.\n\nKhách sạn này là lựa chọn hoàn hảo cho các kỳ nghỉ mát lãng mạn hay tuần trăng mật của các cặp đôi. Quý khách hãy tận hưởng những đêm đáng nhớ nhất cùng người thương của mình tại DeLaSol Sapa Hotel\n\nNếu dự định có một kỳ nghỉ dài, thì DeLaSol Sapa Hotel chính là lựa chọn dành cho quý khách. Với đầy đủ tiện nghi với chất lượng dịch vụ tuyệt vời, DeLaSol Sapa Hotel sẽ khiến quý khách cảm thấy thoải mái như đang ở nhà vậy.\n\nDeLaSol Sapa Hotel là lựa chọn sáng giá dành cho những ai đang tìm kiếm một trải nghiệm xa hoa đầy thú vị trong kỳ nghỉ của mình. Lưu trú tại đây cũng là cách để quý khách chiều chuộng bản thân với những dịch vụ xuất sắc nhất và khiến kỳ nghỉ của mình trở nên thật đáng nhớ.\n\nDu lịch một mình cũng không hề kém phần thú vị và DeLaSol Sapa Hotel là nơi thích hợp dành riêng cho những ai đề cao sự riêng tư trong kỳ lưu trú.\n\nHãy sẵn sàng đón nhận trải nghiệm khó quên bằng dịch vụ độc đáo và hoàn hảo của khách sạn cùng các tiện nghi đầy đủ, đáp ứng mọi nhu cầu của quý khách.\n\nQuầy tiếp tân 24 giờ luôn sẵn sàng phục vụ quý khách từ thủ tục nhận phòng đến trả phòng hay bất kỳ yêu cầu nào. Nếu cần giúp đỡ xin hãy liên hệ đội ngũ tiếp tân, chúng tôi luôn sẵn sàng hỗ trợ quý khách.\n\nTận hưởng những món ăn yêu thích với phong cách ẩm thực đặc biệt từ DeLaSol Sapa Hotel chỉ dành riêng cho quý khách.\n\nSóng WiFi phủ khắp các khu vực chung của khách sạn cho phép quý khách luôn kết nối với gia đình và bè bạn.\n\nDeLaSol Sapa Hotel là khách sạn sở hữu đầy đủ tiện nghi và dịch vụ xuất sắc theo nhận định của hầu hết khách lưu trú.\n\nTận hưởng trải nghiệm lưu trú xa hoa đầy thú vị không đâu sánh bằng tại DeLaSol Sapa Hotel .', 'http://googleusercontent.com/profile/picture/45', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3690.5629750357675!2d103.8435226!3d22.332362!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x36cd412db7a972dd%3A0x3c78e67b20dfeb8c!2sDeLaSol%20Sapa%20Hotel%20-%20Central%20Boutique%20Hotel!5e0!3m2!1svi!2s!4v1764611496116!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,núi,cao nguyên,khí hậu mát,mountain'),
(106, 14, 'Sapa Jade Hill Resort And Spa', 'resort', 'Sapa, Lào Cai', '1700000', 'Sở hữu vị trí thuận lợi ngay thung lũng Mường Hoa, từ Sapa Jade Hill Resort And Spa, du khách có thể dễ dàng đến các địa điểm du lịch nổi tiếng tại trung tâm thị trấn trong khoảng cách chỉ 2-3 km như Nhà thờ Đá, cáp treo Fansipan, bản Cát Cát và Tả Van, chợ Sapa…\n\nSapa Jade Hill Resort And Spa là mô hình biệt thự và bungalow nghỉ dưỡng, bao quanh bởi rừng nguyên sinh, thung lũng hoa và núi non trập trùng, mang đến những giây phút nghỉ ngơi, tận hưởng thiên nhiên trong lành ngay trung tâm phố núi. Lựa chọn nghỉ ngơi tại đây, du khách sẽ được trải nghiệm cảm giác thức dậy giữa khung cảnh thung lũng xanh trải dài ngút mắt, hướng mắt ra các thửa ruộng bậc thang uốn lượn, tận hưởng cảm giác mây và sương sà ngang tầm mắt.\n\nSapa Jade Hill Resort And Spa có hai dạng phòng chủ đạo là bungalow và villa.\n\nBungalow được thiết kế hoàn toàn bằng gỗ thông và cọ, vừa truyền thống, ấm áp, lại vẫn mang vẻ sang trọng của một khách sạn nghỉ dưỡng hàng đầu.\n\nBiệt thự mang mang phong cách chủ đạo kiểu Âu với ống khói và lò sưởi, kết hợp với hình ảnh nhà sàn đặc trưng của đồng bào dân tộc thiểu số vùng Tây Bắc. Trong các biệt thự còn có cả khu vực nhà bếp và lò sưởi. Đừng bỏ qua cơ hội tự tay nhóm bếp và nướng khoai ngay tại khung lò sưởi, thưởng thức củ khoai ấm nóng giản dị, những lại gợi về những kí ức khó quên.\n\nThiết kế nội thất tại Sapa Jade Hill Resort And Spa được chăm chút đến từng chi tiết, mang phong cách trang nhã, tinh tế. Các vật dụng được tô điểm với các họa tiết thổ cẩm, chất liệu mộc mạc, tô đậm nét văn hóa truyền thống địa phương.\n\nSapa Jade Hill Resort And Spa còn có nhà hàng Đồi Ngọc, phục vụ các món ăn mang hương vị ẩm thực dân dã vùng Tây Bắc và ẩm thực châu Âu tinh tế. Các món ăn được chế biến từ chính tay bếp trưởng người Pháp, kết hợp với những nguyên liệu tươi ngon nhất cũng vùng núi cao như cá hồi, rau củ, gà, lợn bản… mang đến trải nghiệm ẩm thực trọn vẹn và đa dạng nhất cho du khách.\n\nKhách sạn còn có hồ bơi, cùng hệ thống spa chuyên nghiệp nhất, là sự lựa chọn nghỉ ngơi tuyệt vời cho du khách sau một ngày tham quan mệt mỏi.', 'http://googleusercontent.com/profile/picture/46', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3690.7944251927624!2d103.8546327!3d22.323613200000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x36cd41235c963d7b%3A0xc41c3c35fdf8edc8!2zUmVzb3J0IG5naOG7iSBkxrDhu6FuZyAtIFNhcGEgSmFkZSBIaWxs!5e0!3m2!1svi!2s!4v1764611724363!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'resort,núi,cao nguyên,khí hậu mát,mountain,nghỉ dưỡng,thư giãn'),
(107, 3, 'Comodo Nha Trang Hotel', 'hotel', 'Nha Trang, Khánh Hòa', '1050000', 'Tọa lạc tại vị trí đắc địa trên con đường vàng Trần Phú, Comodo Nha Trang Hotel là điểm dừng chân lý tưởng để quý khách tận hưởng trọn vẹn vẻ đẹp của vịnh biển Nha Trang.\n\nSở hữu lối kiến trúc hiện đại và tinh tế, Comodo Nha Trang Hotel mang đến không gian nghỉ dưỡng sang trọng, đẳng cấp, đảm bảo sự thoải mái tuyệt đối cho quý khách dù là chuyến đi công tác hay nghỉ dưỡng.\n\nKhách sạn này là lựa chọn hoàn hảo cho các kỳ nghỉ mát lãng mạn. Quý khách hãy tận hưởng những đêm đáng nhớ nhất cùng người thương của mình trong không gian ấm cúng và tiện nghi tại Comodo Nha Trang Hotel.\n\nMột trong những điểm nhấn của khách sạn là hồ bơi vô cực trên tầng cao, nơi quý khách có thể đắm mình trong làn nước mát lạnh và ngắm nhìn toàn cảnh thành phố biển xinh đẹp.\n\nTừ sự kiện doanh nghiệp đến họp mặt công ty, Comodo Nha Trang Hotel cung cấp đầy đủ các dịch vụ và tiện nghi đáp ứng mọi nhu cầu của quý khách và đồng nghiệp với hệ thống phòng hội nghị trang bị hiện đại.\n\nNếu dự định có một kỳ nghỉ dài, thì Comodo Nha Trang Hotel chính là lựa chọn dành cho quý khách. Với đầy đủ tiện nghi cùng chất lượng dịch vụ tuyệt vời, nơi đây sẽ khiến quý khách cảm thấy thoải mái như đang ở nhà.\n\nQuầy tiếp tân 24 giờ luôn sẵn sàng phục vụ quý khách từ thủ tục nhận phòng đến trả phòng hay bất kỳ yêu cầu nào. Đội ngũ nhân viên chuyên nghiệp và thân thiện luôn sẵn sàng hỗ trợ để kỳ nghỉ của quý khách trở nên hoàn hảo.\n\nTận hưởng những món ăn yêu thích với phong cách ẩm thực đa dạng tại nhà hàng của khách sạn, từ các món đặc sản địa phương đến ẩm thực quốc tế.\n\nVới vị trí thuận lợi, từ khách sạn quý khách có thể dễ dàng tiếp cận các điểm tham quan nổi tiếng, trung tâm mua sắm và khu vui chơi giải trí sầm uất của Nha Trang.\n\nComodo Nha Trang Hotel là khách sạn sở hữu đầy đủ tiện nghi và dịch vụ xuất sắc, hứa hẹn mang đến cho quý khách trải nghiệm lưu trú khó quên.', 'http://googleusercontent.com/profile/picture/47', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3899.255885181542!2d109.1980756!3d12.2309457!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317067de00952ab5%3A0x3a2caca4f28a4c62!2sComodo%20Nha%20Trang%20Hotel!5e0!3m2!1svi!2s!4v1764612161415!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển'),
(108, 14, 'Muong Thanh Luxury Nha Trang Hotel', 'hotel', 'Nha Trang, Khánh Hòa', '1250000', 'Tọa lạc tại vị trí đắc địa số 60 Trần Phú, Muong Thanh Luxury Nha Trang Hotel nổi bật với chiều cao ấn tượng và tầm nhìn toàn cảnh ra vịnh Nha Trang xinh đẹp. Đây là điểm dừng chân lý tưởng cho du khách muốn trải nghiệm kỳ nghỉ dưỡng sang trọng ngay trung tâm phố biển.\n\nKhách sạn cung cấp hệ thống phòng nghỉ hiện đại, tiện nghi với không gian ấm cúng, trang nhã. Từ ban công phòng nghỉ, quý khách có thể đón bình minh trên biển hoặc ngắm nhìn thành phố lung linh về đêm.\n\nMuong Thanh Luxury Nha Trang Hotel là lựa chọn hoàn hảo cho các kỳ nghỉ mát lãng mạn hay tuần trăng mật. Hãy tận hưởng những giây phút ngọt ngào bên người thương trong không gian riêng tư và đẳng cấp.\n\nĐối với khách doanh nhân, khách sạn cung cấp các phòng hội nghị, hội thảo với trang thiết bị âm thanh, ánh sáng hiện đại, đáp ứng mọi nhu cầu tổ chức sự kiện chuyên nghiệp.\n\nHệ thống nhà hàng của khách sạn phục vụ đa dạng các món ăn từ đặc sản địa phương đậm đà hương vị biển đến các món Á - Âu tinh tế, được chế biến bởi đội ngũ đầu bếp tài hoa.\n\nSau một ngày dài khám phá, quý khách có thể thư giãn tại hồ bơi ngoài trời, tái tạo năng lượng với các liệu pháp massage tại spa hoặc rèn luyện sức khỏe tại phòng gym hiện đại.\n\nQuầy lễ tân 24 giờ luôn sẵn sàng hỗ trợ quý khách với sự chuyên nghiệp và thân thiện, đảm bảo mọi nhu cầu của quý khách đều được đáp ứng nhanh chóng.\n\nVới vị trí thuận lợi, dịch vụ đẳng cấp và tiện nghi đầy đủ, Muong Thanh Luxury Nha Trang Hotel hứa hẹn mang đến cho quý khách một kỳ nghỉ trọn vẹn và đáng nhớ tại thành phố biển Nha Trang.', 'http://googleusercontent.com/profile/picture/48', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3899.1731199514365!2d109.1964462!3d12.236554700000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3170677ae037716b%3A0x34f80a4db849a372!2sM%C6%B0%E1%BB%9Dng%20Thanh%20Luxury%20Nha%20Trang!5e0!3m2!1svi!2s!4v1764612377046!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển'),
(110, 14, 'Sofitel Legend Metropole Hanoi', 'hotel', 'Quận Hoàn Kiếm, Hà Nội', '8500000', 'Sofitel Legend Metropole Hanoi là khách sạn huyền thoại tọa lạc ngay tại trái tim phố cổ Hà Nội, mang đến trải nghiệm lưu trú đẳng cấp với hơn 120 năm lịch sử. Đây là điểm đến lý tưởng cho những ai yêu thích sự kết hợp hoàn hảo giữa kiến trúc Pháp cổ điển và văn hóa Việt Nam.\nKhách sạn này là sự lựa chọn hoàn hảo cho các cặp đôi đang tìm kiếm một kỳ nghỉ lãng mạn hoặc tuần trăng mật ngay giữa lòng Hà Nội. Tận hưởng những đêm đáng nhớ với người thương tại Metropole.\nVới các phòng hội nghị và tiện nghi sang trọng, Sofitel Legend Metropole Hanoi đáp ứng mọi nhu cầu từ sự kiện doanh nghiệp đến họp mặt công ty.\nHãy vui vẻ với các tiện nghi giải trí như spa, phòng gym và hồ bơi ngoài trời tại Sofitel Legend Metropole Hanoi, nơi lý tưởng cho kỳ nghỉ gia đình của quý khách.\nDịch vụ ẩm thực tại khách sạn mang đến những trải nghiệm ẩm thực Pháp và Việt Nam đặc sắc.\nWi-Fi miễn phí phủ khắp các khu vực công cộng giúp quý khách luôn kết nối trong suốt kỳ lưu trú.\nVới tất cả các tiện nghi xa hoa và dịch vụ chu đáo, Sofitel Legend Metropole Hanoi chắc chắn sẽ khiến quý khách không phàn nàn trong suốt kỳ lưu trú.', 'http://googleusercontent.com/profile/picture/110', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0968030898544!2d105.85756097466077!3d21.02808798023217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab4cd376479b%3A0xbc2e0b8e8d8f9a3!2sSofitel%20Legend%20Metropole%20Hanoi!5e0!3m2!1svi!2s!4v1764613000000!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,thành phố,city break,văn hóa'),
(111, 3, 'Hotel de l Opera Hanoi', 'hotel', 'Quận Hoàn Kiếm, Hà Nội', '3200000', 'Hotel de l Opera Hanoi là khách sạn boutique sang trọng tọa lạc ngay cạnh Nhà hát Lớn Hà Nội, mang đến tầm nhìn tuyệt đẹp ra khu vực trung tâm thủ đô. Khách sạn được thiết kế theo phong cách kiến trúc Pháp thuộc địa, mang lại cảm giác cổ điển và thanh lịch.\nĐây là lựa chọn hoàn hảo cho các cặp đôi tìm kiếm không gian lãng mạn ngay giữa lòng Hà Nội với dịch vụ đẳng cấp và không gian yên tĩnh.\nHotel de l Opera Hanoi cung cấp đầy đủ tiện nghi cho các sự kiện doanh nghiệp, hội nghị và tiệc riêng tư.\nWiFi miễn phí và các tiện nghi hiện đại giúp quý khách luôn kết nối và thoải mái trong suốt kỳ lưu trú.', 'http://googleusercontent.com/profile/picture/111', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0968030898544!2d105.85756097466077!3d21.02788798023217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab4cd376479b%3A0xa1b2c3d4e5f6g7h!2sHotel%20de%20l%20Opera%20Hanoi!5e0!3m2!1svi!2s!4v1764613001000!5m2!1svi!2s', 0, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,thành phố,city break,văn hóa'),
(112, 14, 'La Siesta Premium Hanoi', 'hotel', 'Quận Hoàn Kiếm, Hà Nội', '2100000', 'La Siesta Premium Hanoi là khách sạn boutique cao cấp tọa lạc ngay trong lòng phố cổ Hà Nội, cách Hồ Hoàn Kiếm chỉ vài bước chân. Khách sạn mang đến sự kết hợp hoàn hảo giữa tiện nghi hiện đại và nét đẹp truyền thống Việt Nam.\nVới vị trí chiến lược, La Siesta Premium Hanoi là điểm xuất phát lý tưởng để khám phá các danh lam thắng cảnh nổi tiếng của Hà Nội.\nKhách sạn cung cấp các dịch vụ đẳng cấp bao gồm spa, nhà hàng phục vụ ẩm thực Việt Nam đa dạng và phòng họp hiện đại.\nWi-Fi miễn phí trong toàn bộ khách sạn giúp quý khách luôn kết nối với gia đình và bạn bè.\nĐội ngũ nhân viên thân thiện và chu đáo luôn sẵn sàng hỗ trợ quý khách 24/7.', 'http://googleusercontent.com/profile/picture/112', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.1968030898544!2d105.84756097466077!3d21.02808798023217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab4cd376479b%3A0xb2c3d4e5f6g7h8!2sLa%20Siesta%20Premium%20Hanoi!5e0!3m2!1svi!2s!4v1764613002000!5m2!1svi!2s', 0, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,thành phố,city break,văn hóa'),
(113, 2, 'JW Marriott Phu Quoc Emerald Bay Resort', 'resort', 'Bãi Khem, Thành phố Phú Quốc, Kiên Giang', '12800000', 'JW Marriott Phu Quoc Emerald Bay Resort là khu nghỉ dưỡng sang trọng bậc nhất tại đảo ngọc Phú Quốc, tọa lạc tại bãi biển riêng biệt với tầm nhìn panorama ra vịnh Thái Lan. Khu nghỉ dưỡng được thiết kế bởi kiến trúc sư nổi tiếng Bill Bensley.\nĐây là điểm đến hoàn hảo cho các cặp đôi tìm kiếm kỳ nghỉ lãng mạn và tuần trăng mật với dịch vụ spa đẳng cấp và không gian riêng tư tuyệt đối.\nKhu nghỉ dưỡng sở hữu 5 nhà hàng và quầy bar với ẩm thực đa dạng từ quốc tế đến đặc sản địa phương.\nKhu nghỉ dưỡng cung cấp các hoạt động giải trí biển đỉnh cao bao gồm lặn biển, kayak, dù lượn và các môn thể thao nước khác.\nHồ bơi vô cực Infinity Edge rộng lớn nhìn ra biển là điểm nhấn ấn tượng của khu nghỉ dưỡng.\nWi-Fi miễn phí và các tiện nghi hiện đại giúp quý khách luôn kết nối trong suốt kỳ lưu trú.', 'http://googleusercontent.com/profile/picture/113', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31392.45678901234!2d103.9876543!3d10.1234567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x319d8a1b2c3d4e5f%3A0x1a2b3c4d5e6f7g8!2sJW%20Marriott%20Phu%20Quoc!5e0!3m2!1svi!2s!4v1764613003000!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'resort,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển,đảo,đảo ngọc,island,nghỉ dưỡng,thư giãn'),
(114, 3, 'Salinda Resort Phu Quoc Island', 'resort', 'Bãi Dài, Thành phố Phú Quốc, Kiên Giang', '6500000', 'Salinda Resort Phu Quoc Island là khu nghỉ dưỡng cao cấp tọa lạc tại bãi Dài nổi tiếng của Phú Quốc, cách sân bay quốc tế Phú Quốc chỉ 10 phút lái xe. Với thiết kế hiện đại mang đậm nét văn hóa Việt Nam, khu nghỉ dưỡng mang đến trải nghiệm lưu trú thoải mái và thư giãn.\nĐây là lựa chọn hoàn hảo cho các gia đình muốn tận hưởng kỳ nghỉ biển với nhiều tiện nghi giải trí phong phú dành cho trẻ em và người lớn.\nKhu nghỉ dưỡng sở hữu hồ bơi người lớn và hồ bơi trẻ em riêng biệt, cùng với bãi biển riêng tuyệt đẹp.\nẨm thực tại Salinda Resort bao gồm các món ăn Việt Nam và quốc tế, được chế biến từ nguyên liệu tươi sống.\nWi-Fi miễn phí và các tiện nghi hiện đại luôn đảm bảo quý khách thoải mái trong suốt kỳ lưu trú.', 'http://googleusercontent.com/profile/picture/114', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31392.45678901234!2d103.9765432!3d10.1334567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x319d8a1b2c3d4e5f%3A0x9a8b7c6d5e4f3g2!2sSalinda%20Resort%20Phu%20Quoc!5e0!3m2!1svi!2s!4v1764613004000!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'resort,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển,đảo,đảo ngọc,island,nghỉ dưỡng,thư giãn'),
(115, 3, 'Novotel Ha Long Bay Hotel', 'hotel', 'Thành phố Hạ Long, Quảng Ninh', '2800000', 'Novotel Ha Long Bay Hotel tọa lạc ngay bên bờ vịnh Hạ Long, một trong những kỳ quan thiên nhiên được UNESCO công nhận. Khách sạn mang đến tầm nhìn tuyệt đẹp ra hàng nghìn đảo đá vôi và làn nước xanh ngọc của vịnh.\nKhách sạn này là lựa chọn hoàn hảo cho các cặp đôi đang tìm kiếm một kỳ nghỉ lãng mạn với khung cảnh thiên nhiên ngoạn mục và dịch vụ đẳng cấp.\nKhu vực hồ bơi ngoài trời của khách sạn nhìn thẳng ra vịnh Hạ Long, mang đến trải nghiệm bơi lội độc đáo giữa thiên nhiên.\nWi-Fi miễn phí và các tiện nghi hiện đại giúp quý khách luôn kết nối trong suốt kỳ lưu trú.\nNovotel Ha Long Bay Hotel là điểm đến lý tưởng để khám phá vịnh Hạ Long và trải nghiệm vẻ đẹp kỳ vĩ của di sản thiên nhiên thế giới.', 'http://googleusercontent.com/profile/picture/115', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.67890123456!2d107.0823456!3d20.9101234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314a56a5b6c7d89f%3A0x1234567890abcdef!2sNovotel%20Ha%20Long%20Bay!5e0!3m2!1svi!2s!4v1764613005000!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển'),
(116, 2, 'Wyndham Haledon Ha Long Hotel', 'hotel', 'Thành phố Hạ Long, Quảng Ninh', '2200000', 'Wyndham Haledon Ha Long Hotel là khách sạn cao cấp tọa lạc tại trung tâm thành phố Hạ Long, cách bến tàu du lịch vịnh Hạ Long chỉ 5 phút lái xe. Khách sạn mang đến tầm nhìn đẹp ra vịnh và các đảo đá vôi hùng vĩ.\nVới vị trí thuận tiện, Wyndham Haledon Ha Long Hotel là điểm xuất phát lý tưởng để khám phá vịnh Hạ Long và các điểm du lịch nổi tiếng của Quảng Ninh.\nWiWifi miễn phí và các tiện nghi văn phòng đáp ứng tốt nhu cầu công tác của quý khách.', 'http://googleusercontent.com/profile/picture/116', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.67890123456!2d107.0823456!3d20.9201234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314a56a5b6c7d89f%3A0xabcdef1234567890!2sWyndham%20Haledon%20Ha%20Long!5e0!3m2!1svi!2s!4v1764613006000!5m2!1svi!2s', 0, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển'),
(117, 3, 'Avani Quy Nhon Resort', 'resort', 'Thành phố Quy Nhơn, Bình Định', '4800000', 'Avani Quy Nhon Resort tọa lạc tại bờ biển hoang sơ của Quy Nhơn, một trong những bãi biển đẹp nhất miền Trung Việt Nam. Khu nghỉ dưỡng mang đến sự kết hợp hoàn hảo giữa không gian thiên nhiên yên bình và tiện nghi hiện đại.\nĐây là điểm đến lý tưởng cho những ai muốn trốn khỏi sự ồn ào của thành phố và tận hưởng kỳ nghỉ biển thanh bình.\nKhu nghỉ dưỡng sở hữu bãi biển riêng dài và đẹp, hồ bơi vô cực nhìn ra biển và các villa riêng biệt với view tuyệt đẹp.\nAvani Quy Nhon cung cấp các dịch vụ spa và mát-xa chuyên nghiệp sử dụng các sản phẩm thiên nhiên địa phương.\nWi-Fi miễn phí và các tiện nghi hiện đại luôn đảm bảo quý khách thoải mái trong suốt kỳ lưu trú.', 'http://googleusercontent.com/profile/picture/117', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30745.12345678901!2d109.2234567!3d13.7761234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x316f90a1b2c3d4e5f%3A0x1234567890abcdef!2sAvani%20Quy%20Nhon%20Resort!5e0!3m2!1svi!2s!4v1764613007000!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'resort,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển,nghỉ dưỡng,thư giãn'),
(118, 3, 'Hoian Sincerity Hotel', 'hotel', 'TP. Hội An, Quảng Nam', '1600000', 'Hoian Sincerity Hotel là khách sạn 4 sao tọa lạc ngay bên bờ biển Quy Nhơn, cách bãi biển chỉ vài bước chân. Khách sạn mang đến sự kết hợp hoàn hảo giữa tiện nghi hiện đại và dịch vụ chu đáo của vùng biển miền Trung.\nVới vị trí thuận tiện, Hoian Sincerity Hotel là điểm xuất phát lý tưởng để khám phá các điểm du lịch nổi tiếng của Quy Nhơn như Eo Gió, Bảo tàng Chăm Pa và Tháp Đôi.\nHồ bơi ngoài trời và nhà hàng phục vụ ẩm thực địa phương là những điểm nhấn của khách sạn.\nWi-Fi miễn phí và dịch vụ lễ tân 24/7 đảm bảo quý khách luôn thoải mái trong suốt kỳ lưu trú.', 'http://googleusercontent.com/profile/picture/118', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30745.12345678901!2d109.2334567!3d13.7861234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x316f90a1b2c3d4e5f%3A0xabcdef1234567890!2sHoian%20Sincerity%20Hotel!5e0!3m2!1svi!2s!4v1764613008000!5m2!1svi!2s', 0, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển,thành phố,city break,văn hóa'),
(119, 3, 'The Capella by Fusion Vung Tau', 'resort', 'Thành phố Vũng Tàu, Bà Rịa - Vũng Tàu', '7200000', 'The Capella by Fusion Vung Tau là khu nghỉ dưỡng cao cấp tọa lạc trên một góc đồi view toàn cảnh bãi biển Vũng Tàu. Khách sạn mang đến trải nghiệm nghỉ dưỡng sang trọng với không gian riêng tư và dịch vụ cá nhân hóa theo tiêu chuẩn quốc tế.\nĐây là lựa chọn hoàn hảo cho các cặp đôi tìm kiếm kỳ nghỉ lãng mạn và riêng tư tại Vũng Tàu, với các villa riêng biệt có hồ bơi private.\nKhu nghỉ dưỡng sở hữu các tiện nghi đẳng cấp bao gồm spa, trung tâm thể dục, nhà hàng fine dining và quầy bar trên cao với tầm nhìn 360 độ ra biển.\nWi-Fi miễn phí và các tiện nghi hiện đại giúp quý khách luôn kết nối trong suốt kỳ lưu trú.', 'http://googleusercontent.com/profile/picture/119', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31393.12345678901!2d107.0834567!3d10.3434567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175166789a0bcab%3A0x1234567890abcdef!2sThe%20Capella%20by%20Fusion%20Vung%20Tau!5e0!3m2!1svi!2s!4v1764613009000!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'resort,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển,nghỉ dưỡng,thư giãn'),
(120, 2, 'Imperial Hotel Vung Tau', 'hotel', 'Thành phố Vũng Tàu, Bà Rịa - Vũng Tàu', '2400000', 'Imperial Hotel Vung Tau là khách sạn cao cấp tọa lạc ngay trung tâm thành phố Vũng Tàu, cách bãi biển và các điểm tham quan nổi tiếng chỉ vài phút đi bộ. Khách sạn mang đến sự kết hợp giữa tiện nghi hiện đại và dịch vụ chu đáo của vùng biển miền Nam.\nVới vị trí chiến lược, Imperial Hotel Vung Tau là điểm xuất phát lý tưởng để khám phá các điểm du lịch Vũng Tàu như Tượng Chúa Kitô Vua, Mũi Nghinh Phong và Bãi Sau.\nWi-Fi miễn phí và dịch vụ lễ tân 24/7 đảm bảo quý khách luôn thoải mái.', 'http://googleusercontent.com/profile/picture/120', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31393.12345678901!2d107.0834567!3d10.3534567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175166789a0bcab%3A0xabcdef1234567890!2sImperial%20Hotel%20Vung%20Tau!5e0!3m2!1svi!2s!4v1764613010000!5m2!1svi!2s', 0, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,biển,bãi biển,ven biển,beach,coastal,nghỉ dưỡng biển'),
(121, 2, 'Azerai Can Tho Hotel', 'hotel', 'Quận Ninh Kiều, Thành phố Cần Thơ', '3500000', 'Azerai Can Tho Hotel tọa lạc ngay bên bờ sông Hậu thơ mộng, mang đến tầm nhìn tuyệt đẹp ra dòng sông Mekong và là điểm xuất phát lý tưởng để khám phá chợ nổi Cái Răng nổi tiếng.\nĐây là lựa chọn hoàn hảo cho những ai muốn khám phá văn hóa miền Tây sông nước với các dịch vụ đẳng cấp và tiện nghi hiện đại.\nKhách sạn cung cấp các tour tham quan chợ nổi Cái Răng và các làng nghề truyền thống miền Tây.\nHồ bơi ngoài trời của khách sạn nhìn thẳng ra sông Hậu, mang đến trải nghiệm bơi lội độc đáo giữa thiên nhiên sông nước.\nWi-Fi miễn phí và các tiện nghi hiện đại giúp quý khách luôn kết nối trong suốt kỳ lưu trú.', 'http://googleusercontent.com/profile/picture/121', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31393.12345678901!2d105.7834567!3d10.0334567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313a30098a5e8f9f%3A0x1234567890abcdef!2sAzerai%20Can%20Tho!5e0!3m2!1svi!2s!4v1764613011000!5m2!1svi!2s', 1, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,thành phố,city break,văn hóa'),
(122, 3, 'Co Do Palace Hotel Can Tho', 'hotel', 'Quận Ninh Kiều, Thành phố Cần Thơ', '1800000', 'Co Do Palace Hotel Can Tho là khách sạn cao cấp tọa lạc ngay trung tâm quận Ninh Kiều, cách bến Ninh Kiều và sông Hậu chỉ vài bước chân. Khách sạn mang đến sự kết hợp giữa kiến trúc hiện đại và nét đẹp văn hóa miền Tây sông nước.\nVới vị trí thuận tiện, Co Do Palace Hotel là điểm xuất phát lý tưởng để khám phá chợ nổi Cái Răng, vườn trái cây và các làng nghề truyền thống miền Tây.\nWi-Fi miễn phí và dịch vụ lễ tân 24/7 đảm bảo quý khách luôn thoải mái trong suốt kỳ lưu trú.', 'http://googleusercontent.com/profile/picture/122', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31393.12345678901!2d105.7934567!3d10.0434567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313a30098a5e8f9f%3A0xabcdef1234567890!2sCo%20Do%20Palace%20Hotel%20Can%20Tho!5e0!3m2!1svi!2s!4v1764613012000!5m2!1svi!2s', 0, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,thành phố,city break,văn hóa'),
(123, 3, 'TTC Hotel - Crs Can Tho', 'hotel', 'Quận Ninh Kiều, Thành phố Cần Thơ', '1350000', 'TTC Hotel - Crs Can Tho là khách sạn tọa lạc ngay trung tâm thành phố Cần Thơ, cách bến Ninh Kiều và chợ nổi Cái Răng không xa. Khách sạn mang đến sự tiện lợi và thoải mái cho du khách với vị trí chiến lược và dịch vụ chu đáo.\nVới giá cả hợp lý và tiện nghi đầy đủ, TTC Hotel - Crs Can Tho là lựa chọn lý tưởng cho du khách muốn khám phá Cần Thơ và vùng đồng bằng sông Cửu Long.\nWi-Fi miễn phí và dịch vụ lễ tân nhiệt tình giúp quý khách luôn thoải mái trong suốt kỳ lưu trú.', 'http://googleusercontent.com/profile/picture/123', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31393.12345678901!2d105.7934567!3d10.0534567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313a30098a5e8f9f%3A0x1234567890abcdef!2sTTC%20Hotel%20Can%20Tho!5e0!3m2!1svi!2s!4v1764613013000!5m2!1svi!2s', 0, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,thành phố,city break,văn hóa'),
(124, 14, 'An Hotel Can Tho', 'hotel', 'Quận Cái Răng, Thành phố Cần Thơ', '900000', 'An Hotel Can Tho tọa lạc tại khu vực Hưng Phú, quận Cái Răng, thành phố Cần Thơ — cửa ngõ của vùng đồng bằng sông Cửu Long. Khách sạn mang đến không gian lưu trú tiện nghi và thoải mái cho du khách thập phương.\nAn Hotel Can Tho là lựa chọn lý tưởng cho những ai muốn khám phá vùng Tây Nam Bộ sông nước, đặc biệt là chợ nổi Cái Răng — một trong những chợ nổi lớn và nổi tiếng nhất miền Tây.\nDịch vụ lễ tân 24 giờ luôn sẵn sàng hỗ trợ quý khách từ thủ tục nhận phòng đến trả phòng hay bất kỳ yêu cầu nào.\nWi-Fi miễn phí phủ khắp các khu vực công cộng giúp quý khách luôn kết nối với gia đình và bạn bè.\nTừ khách sạn, quý khách có thể dễ dàng di chuyển đến các điểm tham quan nổi tiếng như Chợ nổi Cái Răng, Vườn trái cây Mỹ Khánh và Khu du lịch Phú Sa.\nAn Hotel Can Tho là sự lựa chọn tuyệt vời cho chuyến đi khám phá miền Tây sông nước.', 'http://googleusercontent.com/profile/picture/124', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31393.12345678901!2d105.7834567!3d10.0334567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313a30098a5e8f9f%3A0xabcdef1234567890!2sAn%20Hotel%20Can%20Tho!5e0!3m2!1svi!2s!4v1764613014000!5m2!1svi!2s', 0, 'active', NULL, '2026-03-08 11:49:23', 2, 2, 6, 'hotel,thành phố,city break,văn hóa');

-- ---------------------------------------------------
-- Bảng: property_images
-- ---------------------------------------------------
DROP TABLE IF EXISTS `property_images`;
CREATE TABLE "property_images" (
  "id" int NOT NULL AUTO_INCREMENT,
  "property_id" int NOT NULL,
  "image_url" varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  "is_main" tinyint(1) DEFAULT '0',
  PRIMARY KEY ("id"),
  UNIQUE KEY "uniq_property_images_property_url" ("property_id","image_url"),
  KEY "property_id" ("property_id"),
  CONSTRAINT "property_images_ibfk_1" FOREIGN KEY ("property_id") REFERENCES "properties" ("id") ON DELETE CASCADE
);

-- Data cho bảng property_images (234 dòng)
INSERT INTO `property_images` (`id`, `property_id`, `image_url`, `is_main`) VALUES
(1, 1, 'assets/id_1/main.jpeg', 1),
(2, 1, 'assets/id_1/anh1.jpeg', 0),
(3, 1, 'assets/id_1/anh2.jpeg', 0),
(4, 1, 'assets/id_1/anh3.jpeg', 0),
(5, 1, 'assets/id_1/anh4.jpeg', 0),
(6, 1, 'assets/id_1/anh5.jpeg', 0),
(7, 1, 'assets/id_1/anh6.jpeg', 0),
(8, 31, 'assets/id_31/anh1.jpeg', 1),
(9, 31, 'assets/id_31/anh2.jpeg', 0),
(10, 31, 'assets/id_31/anh3.jpeg', 0),
(11, 31, 'assets/id_31/anh4.jpeg', 0),
(12, 31, 'assets/id_31/anh5.jpeg', 0),
(13, 31, 'assets/id_31/anh6.jpeg', 0),
(14, 32, 'assets/id_32/anh1.jpeg', 1),
(15, 32, 'assets/id_32/anh2.jpeg', 0),
(16, 32, 'assets/id_32/anh3.jpeg', 0),
(17, 32, 'assets/id_32/anh4.jpeg', 0),
(18, 32, 'assets/id_32/anh5.jpg', 0),
(19, 32, 'assets/id_32/anh6.jpg', 0),
(20, 32, 'assets/id_32/anh7.jpg', 0),
(21, 32, 'assets/id_32/anh8.jpg', 0),
(22, 32, 'assets/id_32/anh9.jpg', 0),
(23, 32, 'assets/id_32/anh10.jpeg', 0),
(24, 33, 'assets/id_33/anh1.jpeg', 1),
(25, 33, 'assets/id_33/anh2.jpeg', 0),
(26, 33, 'assets/id_33/anh3.jpeg', 0),
(27, 33, 'assets/id_33/anh4.jpeg', 0),
(28, 33, 'assets/id_33/anh5.jpeg', 0),
(29, 33, 'assets/id_33/anh6.jpeg', 0),
(30, 34, 'assets/id_34/anh1.jpeg', 1),
(31, 34, 'assets/id_34/anh2.jpeg', 0),
(32, 34, 'assets/id_34/anh3.jpeg', 0),
(33, 34, 'assets/id_34/anh4.jpeg', 0),
(34, 34, 'assets/id_34/anh5.jpeg', 0),
(35, 34, 'assets/id_34/anh6.jpeg', 0),
(36, 35, 'assets/id_35/anh1.jpg', 1),
(37, 35, 'assets/id_35/anh2.jpg', 0),
(38, 35, 'assets/id_35/anh3.jpg', 0),
(39, 35, 'assets/id_35/anh4.jpg', 0),
(40, 35, 'assets/id_35/anh5.jpg', 0),
(41, 35, 'assets/id_35/anh6.jpg', 0),
(42, 41, 'assets/id_36/anh1.jpg', 1),
(43, 41, 'assets/id_36/anh2.jpg', 0),
(44, 41, 'assets/id_36/anh3.jpg', 0),
(45, 41, 'assets/id_36/anh4.jpg', 0),
(46, 41, 'assets/id_36/anh5.jpg', 0),
(47, 41, 'assets/id_36/anh6.jpg', 0),
(48, 42, 'assets/id_37/anh1.jpeg', 1),
(49, 42, 'assets/id_37/anh2.jpeg', 0),
(50, 42, 'assets/id_37/anh3.jpeg', 0);
INSERT INTO `property_images` (`id`, `property_id`, `image_url`, `is_main`) VALUES
(51, 42, 'assets/id_37/anh4.jpeg', 0),
(52, 42, 'assets/id_37/anh5.jpeg', 0),
(53, 42, 'assets/id_37/anh6.jpeg', 0),
(54, 43, 'assets/id_38/anh1.jpeg', 1),
(55, 43, 'assets/id_38/anh2.jpeg', 0),
(56, 43, 'assets/id_38/anh3.jpeg', 0),
(57, 43, 'assets/id_38/anh4.jpeg', 0),
(58, 43, 'assets/id_38/anh5.jpg', 0),
(59, 43, 'assets/id_38/anh6.jpeg', 0),
(60, 51, 'assets/id_51/main.jpeg', 1),
(61, 51, 'assets/id_51/anh1.jpeg', 0),
(62, 51, 'assets/id_51/anh2.jpeg', 0),
(63, 51, 'assets/id_51/anh3.jpeg', 0),
(64, 51, 'assets/id_51/anh4.jpeg', 0),
(65, 51, 'assets/id_51/anh5.jpeg', 0),
(66, 52, 'assets/id_52/main.jpeg', 1),
(67, 52, 'assets/id_52/anh1.jpeg', 0),
(68, 52, 'assets/id_52/anh2.jpeg', 0),
(69, 52, 'assets/id_52/anh3.jpeg', 0),
(70, 52, 'assets/id_52/anh4.jpeg', 0),
(71, 52, 'assets/id_52/anh5.jpeg', 0),
(72, 52, 'assets/id_52/anh6.jpeg', 0),
(73, 53, 'assets/id_21/main.jpeg', 1),
(74, 53, 'assets/id_21/anh1.jpeg', 0),
(75, 53, 'assets/id_21/anh2.jpeg', 0),
(76, 53, 'assets/id_21/anh3.jpeg', 0),
(77, 53, 'assets/id_21/anh4.jpeg', 0),
(78, 53, 'assets/id_21/anh5.jpeg', 0),
(79, 53, 'assets/id_21/anh6.jpeg', 0),
(80, 54, 'assets/id_54/main.jpeg', 1),
(81, 54, 'assets/id_54/anh1.jpeg', 0),
(82, 54, 'assets/id_54/anh2.jpeg', 0),
(83, 54, 'assets/id_54/anh3.jpeg', 0),
(84, 54, 'assets/id_54/anh4.jpeg', 0),
(85, 54, 'assets/id_54/anh5.jpeg', 0),
(86, 55, 'assets/id_21/main.jpeg', 1),
(87, 55, 'assets/id_21/anh1.jpeg', 0),
(88, 55, 'assets/id_21/anh2.jpeg', 0),
(89, 55, 'assets/id_21/anh3.jpeg', 0),
(90, 55, 'assets/id_21/anh4.jpeg', 0),
(91, 55, 'assets/id_21/anh5.jpeg', 0),
(92, 55, 'assets/id_21/anh6.jpeg', 0),
(93, 101, 'assets/id_101/main.jpeg', 1),
(94, 101, 'assets/id_101/anh1.jpeg', 0),
(95, 101, 'assets/id_101/anh2.jpeg', 0),
(96, 101, 'assets/id_101/anh3.jpeg', 0),
(97, 101, 'assets/id_101/anh4.jpeg', 0),
(98, 101, 'assets/id_101/anh5.jpeg', 0),
(99, 101, 'assets/id_101/anh6.jpeg', 0),
(100, 102, 'assets/id_102/main.jpeg', 1);
INSERT INTO `property_images` (`id`, `property_id`, `image_url`, `is_main`) VALUES
(101, 102, 'assets/id_102/anh1.jpeg', 0),
(102, 102, 'assets/id_102/anh2.jpeg', 0),
(103, 102, 'assets/id_102/anh3.jpeg', 0),
(104, 102, 'assets/id_102/anh4.jpeg', 0),
(105, 102, 'assets/id_102/anh5.jpeg', 0),
(106, 102, 'assets/id_102/anh6.jpeg', 0),
(107, 103, 'assets/id_103/main.jpeg', 1),
(108, 103, 'assets/id_103/anh1.jpeg', 0),
(109, 103, 'assets/id_103/anh2.jpeg', 0),
(110, 103, 'assets/id_103/anh3.jpeg', 0),
(111, 103, 'assets/id_103/anh4.jpeg', 0),
(112, 103, 'assets/id_103/anh5.jpeg', 0),
(113, 103, 'assets/id_103/anh6.jpeg', 0),
(114, 104, 'assets/id_104/main.jpeg', 1),
(115, 104, 'assets/id_104/anh1.jpeg', 0),
(116, 104, 'assets/id_104/anh2.jpeg', 0),
(117, 104, 'assets/id_104/anh3.jpeg', 0),
(118, 104, 'assets/id_104/anh4.jpeg', 0),
(119, 104, 'assets/id_104/anh5.jpeg', 0),
(120, 104, 'assets/id_104/anh6.jpeg', 0),
(121, 106, 'assets/id_106/main.jpeg', 1),
(122, 106, 'assets/id_106/anh1.jpeg', 0),
(123, 106, 'assets/id_106/anh2.jpeg', 0),
(124, 106, 'assets/id_106/anh3.jpeg', 0),
(125, 106, 'assets/id_106/anh4.jpeg', 0),
(126, 106, 'assets/id_106/anh5.jpeg', 0),
(127, 106, 'assets/id_106/anh6.jpeg', 0),
(128, 105, 'assets/id_105/main.jpeg', 1),
(129, 105, 'assets/id_105/anh1.jpeg', 0),
(130, 105, 'assets/id_105/anh2.jpeg', 0),
(131, 105, 'assets/id_105/anh3.jpeg', 0),
(132, 105, 'assets/id_105/anh4.jpeg', 0),
(133, 105, 'assets/id_105/anh5.jpeg', 0),
(134, 105, 'assets/id_105/anh6.jpeg', 0),
(135, 105, 'assets/id_105/anh7.jpeg', 0),
(136, 107, 'assets/id_107/main.jpeg', 1),
(137, 107, 'assets/id_107/anh1.jpeg', 0),
(138, 107, 'assets/id_107/anh2.jpeg', 0),
(139, 107, 'assets/id_107/anh3.jpeg', 0),
(140, 107, 'assets/id_107/anh4.jpeg', 0),
(141, 107, 'assets/id_107/anh5.jpeg', 0),
(142, 107, 'assets/id_107/anh6.jpeg', 0),
(143, 108, 'assets/id_108/main.jpeg', 1),
(144, 108, 'assets/id_108/anh1.jpeg', 0),
(145, 108, 'assets/id_108/anh2.jpeg', 0),
(146, 108, 'assets/id_108/anh3.jpeg', 0),
(147, 108, 'assets/id_108/anh4.jpeg', 0),
(148, 108, 'assets/id_108/anh5.jpeg', 0),
(149, 108, 'assets/id_108/anh6.jpeg', 0),
(150, 110, 'https://ik.imagekit.io/tvlk/apr-asset/rvN7CENfvyT2YVqT-7R6UjRIibYDnsWI+-nAv8mJ7GI=/36678/photos/90064088_XL.jpg', 1);
INSERT INTO `property_images` (`id`, `property_id`, `image_url`, `is_main`) VALUES
(151, 110, 'https://ik.imagekit.io/tvlk/apr-asset/rvN7CENfvyT2YVqT-7R6UjRIibYDnsWI+-nAv8mJ7GI=/36678/photos/99981318_XL.jpg', 0),
(152, 110, 'https://ik.imagekit.io/tvlk/apr-asset/rvN7CENfvyT2YVqT-7R6UjRIibYDnsWI+-nAv8mJ7GI=/36678/photos/87770194_XL.jpg', 0),
(153, 110, 'https://ik.imagekit.io/tvlk/apr-asset/rvN7CENfvyT2YVqT-7R6UjRIibYDnsWI+-nAv8mJ7GI=/36678/photos/99982546_XL.jpg', 0),
(154, 110, 'https://ik.imagekit.io/tvlk/apr-asset/rvN7CENfvyT2YVqT-7R6UjRIibYDnsWI+-nAv8mJ7GI=/36678/photos/99170153_XL.jpg', 0),
(155, 110, 'https://ik.imagekit.io/tvlk/apr-asset/rvN7CENfvyT2YVqT-7R6UjRIibYDnsWI+-nAv8mJ7GI=/36678/photos/99982620_XL.jpg', 0),
(156, 110, 'https://ik.imagekit.io/tvlk/apr-asset/rvN7CENfvyT2YVqT-7R6UjRIibYDnsWI+-nAv8mJ7GI=/36678/photos/87770132_XL.jpg', 0),
(157, 111, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/843031488.jpg', 1),
(158, 111, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/819873527.jpg', 0),
(159, 111, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/846269759.jpg', 0),
(160, 111, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/765772827.jpg', 0),
(161, 111, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/765772832.jpg', 0),
(162, 111, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/794971638.jpg', 0),
(164, 112, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/20054449-a0319e49057fd4c1b3216d032d5b702d.jpeg', 1),
(165, 112, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/20054449-311e800e1f772cc0cebe2aae9c8e8143.jpeg', 0),
(166, 112, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/20054449-8b1b15051caceaed29eab49d14d3231e.jpeg', 0),
(167, 112, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/20054449-18d490e85b2ac05c3d66ab9c359e655a.jpeg', 0),
(168, 112, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/20054449-e6b4296eab7f2ac89e7ce7921df1a3a3.jpeg', 0),
(169, 112, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/20054449-7e69c101e39e9710b2a322e11098129f.jpeg', 0),
(171, 113, 'https://ik.imagekit.io/tvlk/apr-asset/TzEv3ZUmG4-4Dz22hvmO9NUDzw1DGCIdWl4oPtKumOg=/lodging/18000000/17280000/17273100/17273008/dbd1ca68_z.jpg', 1),
(172, 113, 'https://ik.imagekit.io/tvlk/apr-asset/TzEv3ZUmG4-4Dz22hvmO9NUDzw1DGCIdWl4oPtKumOg=/lodging/18000000/17280000/17273100/17273008/f1c778ad_z.jpg', 0),
(173, 113, 'https://ik.imagekit.io/tvlk/apr-asset/TzEv3ZUmG4-4Dz22hvmO9NUDzw1DGCIdWl4oPtKumOg=/lodging/18000000/17280000/17273100/17273008/52f2701d_z.jpg', 0),
(174, 113, 'https://ik.imagekit.io/tvlk/apr-asset/TzEv3ZUmG4-4Dz22hvmO9NUDzw1DGCIdWl4oPtKumOg=/lodging/18000000/17280000/17273100/17273008/dede15eb_z.jpg', 0),
(175, 113, 'https://ik.imagekit.io/tvlk/generic-asset/TzEv3ZUmG4-4Dz22hvmO9NUDzw1DGCIdWl4oPtKumOg=/lodging/18000000/17280000/17273100/17273008/9fef011b_z.jpg', 0),
(176, 113, 'https://ik.imagekit.io/tvlk/generic-asset/TzEv3ZUmG4-4Dz22hvmO9NUDzw1DGCIdWl4oPtKumOg=/lodging/18000000/17280000/17273100/17273008/732c92cf_z.jpg', 0),
(177, 113, 'assets/id_113/anh6.jpeg', 0),
(178, 114, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10018152-461d9e6cae15936a48387e0381252c31.jpeg', 1),
(179, 114, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10018152-4096x2731-FIT_AND_TRIM-6a89940df9ebc9059667f3979855a4e4.jpeg', 0),
(180, 114, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10018152-4096x2731-FIT_AND_TRIM-b6ab662cca087964843c406d31966f5d.jpeg', 0),
(181, 114, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10018152-4096x2731-FIT_AND_TRIM-58150d795e960398cc84739ef9636b46.jpeg', 0),
(182, 114, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10018152-e10dc7c10c46e682b0a96268ac1a54b0.jpeg', 0),
(185, 115, 'https://ik.imagekit.io/tvlk/apr-asset/rvN7CENfvyT2YVqT-7R6UjRIibYDnsWI+-nAv8mJ7GI=/37810/photos/87216210_XL.jpg', 1),
(186, 115, 'https://ik.imagekit.io/tvlk/apr-asset/rvN7CENfvyT2YVqT-7R6UjRIibYDnsWI+-nAv8mJ7GI=/37810/photos/87216226_XL.jpg', 0),
(187, 115, 'https://ik.imagekit.io/tvlk/apr-asset/rvN7CENfvyT2YVqT-7R6UjRIibYDnsWI+-nAv8mJ7GI=/37810/photos/87216360_XL.jpg', 0),
(188, 115, 'https://ik.imagekit.io/tvlk/apr-asset/rvN7CENfvyT2YVqT-7R6UjRIibYDnsWI+-nAv8mJ7GI=/37810/photos/87216398_XL.jpg', 0),
(189, 115, 'https://ik.imagekit.io/tvlk/apr-asset/rvN7CENfvyT2YVqT-7R6UjRIibYDnsWI+-nAv8mJ7GI=/37810/photos/87216346_XL.jpg', 0),
(192, 116, 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10031693-3a0113fa07e16a18a7ed6b74564806db.jpeg', 1),
(193, 116, 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10031693-e50b06f78e7510b77229d093fa7d995c.jpeg', 0),
(194, 116, 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10031693-153b61f7c95404b0de42c29f03960e68.jpeg', 0),
(195, 116, 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10031693-625f1bc29e0daf877a0610bff2e648fe.jpeg', 0),
(196, 116, 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10031693-edc048d666026cb5516899a464919a73.jpeg', 0),
(199, 117, 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10020409-59a74a25d37adeb549daaf646c8d0994.jpeg', 1),
(200, 117, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10020409-1600x1065-FIT_AND_TRIM-1c31f5ccdb8cee484e8485510b9b41e3.jpeg', 0),
(201, 117, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10020409-c74ef73eafec1891b90d412b94df96d4.jpeg', 0),
(202, 117, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10020409-b191de8df234d4bf885aedd8dbe71f63.jpeg', 0),
(203, 117, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10020409-1211x768-FIT_AND_TRIM-41076af287ef45c9de56357e3670900b.jpeg', 0),
(204, 117, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10020409-1600x1065-FIT_AND_TRIM-48822ac1c30189ef20349d88beeda95c.jpeg', 0),
(205, 117, 'assets/id_117/anh6.jpeg', 0),
(206, 118, 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10025420-9de63ca47b318ac264767479f9cb48af.jpeg', 1),
(207, 118, 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10025420-236f170a1911284b98d893638a92a1ea.jpeg', 0),
(208, 118, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10025420-76508b78a17aed4b696882fa03a46007.jpeg', 0);
INSERT INTO `property_images` (`id`, `property_id`, `image_url`, `is_main`) VALUES
(209, 118, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10025420-dd451d6ff0db462dd6fd6862bb4ac010.jpeg', 0),
(210, 118, 'assets/id_118/anh4.jpeg', 0),
(211, 118, 'assets/id_118/anh5.jpeg', 0),
(212, 118, 'assets/id_118/anh6.jpeg', 0),
(213, 119, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/20034514-5fb21ca9cfd94081b723445886155b73.jpeg', 1),
(215, 119, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/20034514-ecc1f6615f93c7be7281fc0cf049f7c5.jpeg', 0),
(216, 119, 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/20034514-39cef15909119631b4c418a500a7c363.jpeg', 0),
(217, 119, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/20034514-612592126e853dc0555ee0ca6546430b.jpeg', 0),
(220, 120, 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10019885-6dba465809edf7d9bf3d0c7cf2308a33.jpeg', 1),
(222, 120, 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10019885-73a2e79cccc804796eb3f051f7917fd0.jpeg', 0),
(223, 120, 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10019885-18881d2dea2c69b20d65b941be728412.jpeg', 0),
(224, 120, 'https://ik.imagekit.io/tvlk/generic-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10019885-d7d0e19494db8dff1780f4abf2e8b3f5.jpeg', 0),
(225, 120, 'https://ik.imagekit.io/tvlk/generic-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10019885-c58f21ed173c419e78a8bab4be959210.jpeg', 0),
(227, 121, 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10027635-fda34a29c15746f16f1deab6ffc17ffe.jpeg', 1),
(228, 121, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10027635-1620x1080-FIT_AND_TRIM-f9d4c2cb1452f94551e5a2d2de5f945e.jpeg', 0),
(229, 121, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10027635-1440x1080-FIT_AND_TRIM-b6ccfb1071f245f528b062c8bef9d6a7.jpeg', 0),
(230, 121, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10027635-1850x1080-FIT_AND_TRIM-4a22fe44d455f5cb8be34bf4d6f0f8c7.jpeg', 0),
(231, 121, 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10027635-c3ef4e4e51681dbb8e9653da5b8fc5f5.jpeg', 0),
(232, 121, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10027635-2920x1947-FIT_AND_TRIM-c16348ef7ed79bcba7337de4d08e5233.jpeg', 0),
(234, 122, 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10027635-fda34a29c15746f16f1deab6ffc17ffe.jpeg', 1),
(235, 122, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10027635-1620x1080-FIT_AND_TRIM-f9d4c2cb1452f94551e5a2d2de5f945e.jpeg', 0),
(236, 122, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10027635-1440x1080-FIT_AND_TRIM-b6ccfb1071f245f528b062c8bef9d6a7.jpeg', 0),
(237, 122, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10027635-1850x1080-FIT_AND_TRIM-4a22fe44d455f5cb8be34bf4d6f0f8c7.jpeg', 0),
(238, 122, 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10027635-c3ef4e4e51681dbb8e9653da5b8fc5f5.jpeg', 0),
(239, 122, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10027635-2920x1947-FIT_AND_TRIM-c16348ef7ed79bcba7337de4d08e5233.jpeg', 0),
(241, 123, 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10027635-fda34a29c15746f16f1deab6ffc17ffe.jpeg', 1),
(243, 123, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10027635-1620x1080-FIT_AND_TRIM-f9d4c2cb1452f94551e5a2d2de5f945e.jpeg', 0),
(244, 123, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10027635-1440x1080-FIT_AND_TRIM-b6ccfb1071f245f528b062c8bef9d6a7.jpeg', 0),
(245, 123, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10027635-1850x1080-FIT_AND_TRIM-4a22fe44d455f5cb8be34bf4d6f0f8c7.jpeg', 0),
(246, 123, 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10027635-c3ef4e4e51681dbb8e9653da5b8fc5f5.jpeg', 0),
(247, 123, 'https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10027635-2920x1947-FIT_AND_TRIM-c16348ef7ed79bcba7337de4d08e5233.jpeg', 0),
(248, 124, 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/680040652-a8b87e8b54075161ddc2dce38b6a5f0d.jpeg?_src=imagekit&tr=c-at_max,h-720,q-80,w-1280', 1),
(249, 124, 'https://ik.imagekit.io/tvlk/generic-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/680040652-2390fbf2b8a5fe39ae7b9b244a05bd98.jpeg?_src=imagekit&tr=c-at_max,h-720,q-40,w-1280', 0),
(250, 124, 'https://ik.imagekit.io/tvlk/generic-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/680040652-b608270f9275b1446338527449169643.jpeg?_src=imagekit&tr=c-at_max,h-720,q-40,w-1280', 0);

-- ---------------------------------------------------
-- Bảng: amenities
-- ---------------------------------------------------
DROP TABLE IF EXISTS `amenities`;
CREATE TABLE "amenities" (
  "id" int NOT NULL AUTO_INCREMENT,
  "name" varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  "icon" varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  "category" varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY ("id")
);

-- Data cho bảng amenities (18 dòng)
INSERT INTO `amenities` (`id`, `name`, `icon`, `category`) VALUES
(1, 'Wifi miễn phí', 'wifi', 'Kết nối'),
(2, 'Máy lạnh', 'ac_unit', 'Tiện nghi phòng'),
(3, 'Lễ tân 24 giờ', 'support_agent', 'Dịch vụ'),
(4, 'Dọn phòng hằng ngày', 'cleaning_services', 'Dịch vụ'),
(5, 'Phòng không hút thuốc', 'smoke_free', 'Tiện nghi phòng'),
(6, 'Bãi đỗ xe', 'local_parking', 'Tiện nghi chung'),
(7, 'Nhà hàng', 'restaurant', 'Ẩm thực'),
(8, 'Bữa sáng', 'breakfast_dining', 'Ẩm thực'),
(9, 'Hồ bơi', 'pool', 'Giải trí'),
(10, 'Phòng gym', 'fitness_center', 'Giải trí'),
(11, 'Spa', 'spa', 'Chăm sóc sức khỏe'),
(12, 'Đưa đón sân bay', 'airport_shuttle', 'Vận chuyển'),
(13, 'Dịch vụ giặt ủi', 'local_laundry_service', 'Dịch vụ'),
(14, 'Phòng gia đình', 'family_restroom', 'Tiện nghi phòng'),
(15, 'Bếp riêng', 'kitchen', 'Tiện nghi villa'),
(16, 'Máy giặt', 'local_laundry_service', 'Tiện nghi villa'),
(17, 'Sân vườn', 'yard', 'Tiện nghi villa'),
(18, 'Bãi biển riêng', 'beach_access', 'Giải trí');

-- ---------------------------------------------------
-- Bảng: property_amenities
-- ---------------------------------------------------
DROP TABLE IF EXISTS `property_amenities`;
CREATE TABLE "property_amenities" (
  "property_id" int NOT NULL,
  "amenity_id" int NOT NULL,
  PRIMARY KEY ("property_id","amenity_id"),
  KEY "amenity_id" ("amenity_id"),
  CONSTRAINT "property_amenities_ibfk_1" FOREIGN KEY ("property_id") REFERENCES "properties" ("id") ON DELETE CASCADE,
  CONSTRAINT "property_amenities_ibfk_2" FOREIGN KEY ("amenity_id") REFERENCES "amenities" ("id") ON DELETE CASCADE
);

-- Data cho bảng property_amenities (408 dòng)
INSERT INTO `property_amenities` (`property_id`, `amenity_id`) VALUES
(1, 1),
(31, 1),
(32, 1),
(33, 1),
(34, 1),
(35, 1),
(41, 1),
(42, 1),
(43, 1),
(51, 1),
(52, 1),
(53, 1),
(54, 1),
(55, 1),
(101, 1),
(102, 1),
(103, 1),
(104, 1),
(105, 1),
(106, 1),
(107, 1),
(108, 1),
(110, 1),
(111, 1),
(112, 1),
(113, 1),
(114, 1),
(115, 1),
(116, 1),
(117, 1),
(118, 1),
(119, 1),
(120, 1),
(121, 1),
(122, 1),
(123, 1),
(124, 1),
(1, 2),
(31, 2),
(32, 2),
(33, 2),
(34, 2),
(35, 2),
(41, 2),
(42, 2),
(43, 2),
(51, 2),
(52, 2),
(53, 2),
(54, 2);
INSERT INTO `property_amenities` (`property_id`, `amenity_id`) VALUES
(55, 2),
(101, 2),
(102, 2),
(103, 2),
(104, 2),
(105, 2),
(106, 2),
(107, 2),
(108, 2),
(110, 2),
(111, 2),
(112, 2),
(113, 2),
(114, 2),
(115, 2),
(116, 2),
(117, 2),
(118, 2),
(119, 2),
(120, 2),
(121, 2),
(122, 2),
(123, 2),
(124, 2),
(1, 3),
(31, 3),
(32, 3),
(33, 3),
(34, 3),
(42, 3),
(43, 3),
(51, 3),
(52, 3),
(53, 3),
(54, 3),
(55, 3),
(101, 3),
(102, 3),
(103, 3),
(104, 3),
(105, 3),
(106, 3),
(107, 3),
(108, 3),
(110, 3),
(111, 3),
(112, 3),
(113, 3),
(114, 3),
(115, 3);
INSERT INTO `property_amenities` (`property_id`, `amenity_id`) VALUES
(116, 3),
(117, 3),
(118, 3),
(119, 3),
(120, 3),
(121, 3),
(122, 3),
(123, 3),
(124, 3),
(1, 4),
(31, 4),
(32, 4),
(33, 4),
(34, 4),
(35, 4),
(41, 4),
(42, 4),
(43, 4),
(51, 4),
(52, 4),
(53, 4),
(54, 4),
(55, 4),
(101, 4),
(102, 4),
(103, 4),
(104, 4),
(105, 4),
(106, 4),
(107, 4),
(108, 4),
(110, 4),
(111, 4),
(112, 4),
(113, 4),
(114, 4),
(115, 4),
(116, 4),
(117, 4),
(118, 4),
(119, 4),
(120, 4),
(121, 4),
(122, 4),
(123, 4),
(124, 4),
(1, 5),
(31, 5),
(32, 5),
(33, 5);
INSERT INTO `property_amenities` (`property_id`, `amenity_id`) VALUES
(34, 5),
(35, 5),
(41, 5),
(42, 5),
(43, 5),
(51, 5),
(52, 5),
(53, 5),
(54, 5),
(55, 5),
(101, 5),
(102, 5),
(103, 5),
(104, 5),
(105, 5),
(106, 5),
(107, 5),
(108, 5),
(110, 5),
(111, 5),
(112, 5),
(113, 5),
(114, 5),
(115, 5),
(116, 5),
(117, 5),
(118, 5),
(119, 5),
(120, 5),
(121, 5),
(122, 5),
(123, 5),
(124, 5),
(1, 6),
(31, 6),
(32, 6),
(33, 6),
(34, 6),
(35, 6),
(41, 6),
(42, 6),
(43, 6),
(51, 6),
(52, 6),
(53, 6),
(54, 6),
(55, 6),
(101, 6),
(102, 6),
(103, 6);
INSERT INTO `property_amenities` (`property_id`, `amenity_id`) VALUES
(104, 6),
(105, 6),
(106, 6),
(107, 6),
(108, 6),
(110, 6),
(111, 6),
(112, 6),
(113, 6),
(114, 6),
(115, 6),
(116, 6),
(117, 6),
(118, 6),
(119, 6),
(120, 6),
(121, 6),
(122, 6),
(123, 6),
(124, 6),
(1, 7),
(31, 7),
(32, 7),
(33, 7),
(34, 7),
(42, 7),
(43, 7),
(51, 7),
(52, 7),
(53, 7),
(54, 7),
(55, 7),
(101, 7),
(102, 7),
(103, 7),
(104, 7),
(105, 7),
(106, 7),
(107, 7),
(108, 7),
(110, 7),
(111, 7),
(112, 7),
(113, 7),
(114, 7),
(115, 7),
(116, 7),
(117, 7),
(118, 7),
(119, 7);
INSERT INTO `property_amenities` (`property_id`, `amenity_id`) VALUES
(120, 7),
(121, 7),
(122, 7),
(123, 7),
(124, 7),
(1, 8),
(31, 8),
(32, 8),
(33, 8),
(34, 8),
(42, 8),
(43, 8),
(51, 8),
(52, 8),
(53, 8),
(54, 8),
(55, 8),
(101, 8),
(102, 8),
(103, 8),
(104, 8),
(105, 8),
(106, 8),
(107, 8),
(108, 8),
(110, 8),
(111, 8),
(112, 8),
(113, 8),
(114, 8),
(115, 8),
(116, 8),
(117, 8),
(118, 8),
(119, 8),
(120, 8),
(121, 8),
(122, 8),
(123, 8),
(124, 8),
(1, 9),
(32, 9),
(34, 9),
(35, 9),
(41, 9),
(42, 9),
(52, 9),
(106, 9),
(110, 9),
(111, 9);
INSERT INTO `property_amenities` (`property_id`, `amenity_id`) VALUES
(112, 9),
(113, 9),
(114, 9),
(115, 9),
(116, 9),
(117, 9),
(119, 9),
(120, 9),
(121, 9),
(1, 10),
(32, 10),
(34, 10),
(42, 10),
(52, 10),
(106, 10),
(110, 10),
(111, 10),
(112, 10),
(113, 10),
(114, 10),
(115, 10),
(116, 10),
(117, 10),
(119, 10),
(120, 10),
(121, 10),
(1, 11),
(32, 11),
(34, 11),
(42, 11),
(52, 11),
(106, 11),
(110, 11),
(111, 11),
(112, 11),
(113, 11),
(114, 11),
(115, 11),
(116, 11),
(117, 11),
(119, 11),
(120, 11),
(121, 11),
(1, 12),
(32, 12),
(34, 12),
(42, 12),
(52, 12),
(106, 12),
(110, 12);
INSERT INTO `property_amenities` (`property_id`, `amenity_id`) VALUES
(111, 12),
(112, 12),
(113, 12),
(114, 12),
(115, 12),
(116, 12),
(117, 12),
(119, 12),
(120, 12),
(121, 12),
(1, 13),
(31, 13),
(32, 13),
(33, 13),
(34, 13),
(42, 13),
(43, 13),
(51, 13),
(52, 13),
(53, 13),
(54, 13),
(55, 13),
(101, 13),
(102, 13),
(103, 13),
(104, 13),
(105, 13),
(106, 13),
(107, 13),
(108, 13),
(110, 13),
(111, 13),
(112, 13),
(113, 13),
(114, 13),
(115, 13),
(116, 13),
(117, 13),
(118, 13),
(119, 13),
(120, 13),
(121, 13),
(122, 13),
(123, 13),
(124, 13),
(35, 14),
(41, 14),
(35, 15),
(41, 15),
(35, 16);
INSERT INTO `property_amenities` (`property_id`, `amenity_id`) VALUES
(41, 16),
(35, 17),
(41, 17),
(34, 18),
(113, 18),
(114, 18),
(117, 18),
(119, 18);

-- ---------------------------------------------------
-- Bảng: room_types
-- ---------------------------------------------------
DROP TABLE IF EXISTS `room_types`;
CREATE TABLE "room_types" (
  "id" int NOT NULL AUTO_INCREMENT,
  "property_id" int NOT NULL,
  "name" varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  "price" decimal(15,0) NOT NULL,
  "total_allotment" int NOT NULL,
  "max_adults" int DEFAULT '2',
  "max_children" int DEFAULT '1',
  "room_size" int DEFAULT NULL,
  "bed_type" varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  "bed_count" int DEFAULT NULL,
  "bathroom_count" int DEFAULT NULL,
  "bed_configuration" json DEFAULT NULL,
  "is_active" tinyint(1) NOT NULL DEFAULT '1',
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "uniq_room_types_property_name" ("property_id","name"),
  KEY "property_id" ("property_id"),
  CONSTRAINT "room_types_ibfk_1" FOREIGN KEY ("property_id") REFERENCES "properties" ("id") ON DELETE CASCADE,
  CONSTRAINT "chk_room_types_allotment" CHECK ((`total_allotment` > 0)),
  CONSTRAINT "chk_room_types_capacity" CHECK (((`max_adults` > 0) and (`max_children` >= 0))),
  CONSTRAINT "chk_room_types_details" CHECK (((`room_size` > 0) and (`bed_count` > 0) and (`bathroom_count` > 0))),
  CONSTRAINT "chk_room_types_price" CHECK ((`price` > 0))
);

-- Data cho bảng room_types (114 dòng)
INSERT INTO `room_types` (`id`, `property_id`, `name`, `price`, `total_allotment`, `max_adults`, `max_children`, `room_size`, `bed_type`, `bed_count`, `bathroom_count`, `bed_configuration`, `is_active`, `created_at`) VALUES
(11, 1, 'Superior', '2500000', 28, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:13:43'),
(12, 1, 'Deluxe', '3250000', 16, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:13:43'),
(13, 1, 'Family Suite', '4250000', 7, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:13:43'),
(311, 31, 'Superior', '1100000', 24, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:13:44'),
(312, 31, 'Deluxe', '1430000', 14, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:13:45'),
(313, 31, 'Family Suite', '1870000', 6, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:13:45'),
(321, 32, 'Superior', '4500000', 28, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:13:45'),
(322, 32, 'Deluxe', '5850000', 16, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:13:46'),
(323, 32, 'Family Suite', '7650000', 7, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:13:46'),
(331, 33, 'Superior', '650000', 18, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:13:47'),
(332, 33, 'Deluxe', '850000', 10, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:13:47'),
(333, 33, 'Family Suite', '1110000', 4, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:13:47'),
(341, 34, 'Deluxe hướng vườn', '1150000', 24, 2, 1, 38, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:13:48'),
(342, 34, 'Deluxe hướng biển', '1440000', 16, 2, 1, 42, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:13:48'),
(343, 34, 'Family Suite', '1900000', 8, 4, 2, 62, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:13:48'),
(344, 34, 'Pool Villa', '2760000', 4, 4, 2, 95, '2 giường King', 2, 2, '[object Object]', 1, '2026-06-15 07:13:48'),
(351, 35, 'Biệt thự nguyên căn', '7650000', 1, 8, 2, 220, '2 giường King + 2 giường Queen', 4, 4, '[object Object]', 1, '2026-06-15 07:13:49'),
(411, 41, 'Biệt thự nguyên căn', '8850000', 1, 10, 2, 280, '2 giường King + 3 giường Queen', 5, 5, '[object Object]', 1, '2026-06-15 07:13:50'),
(421, 42, 'Superior', '2000000', 28, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:13:51'),
(422, 42, 'Deluxe', '2600000', 16, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:13:51'),
(423, 42, 'Family Suite', '3400000', 7, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:13:51'),
(431, 43, 'Superior', '1500000', 24, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:13:53'),
(432, 43, 'Deluxe', '1950000', 14, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:13:53'),
(433, 43, 'Family Suite', '2550000', 6, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:13:53'),
(511, 51, 'Superior', '1000000', 24, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:13:54'),
(512, 51, 'Deluxe', '1300000', 14, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:13:54'),
(513, 51, 'Family Suite', '1700000', 6, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:13:54'),
(521, 52, 'Deluxe hướng vườn', '1300000', 24, 2, 1, 38, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:13:55'),
(522, 52, 'Deluxe hướng biển', '1630000', 16, 2, 1, 42, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:13:55'),
(523, 52, 'Family Suite', '2150000', 8, 4, 2, 62, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:13:55'),
(524, 52, 'Pool Villa', '3120000', 4, 4, 2, 95, '2 giường King', 2, 2, '[object Object]', 1, '2026-06-15 07:13:55'),
(531, 53, 'Superior', '1000000', 24, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:13:56'),
(532, 53, 'Deluxe', '1300000', 14, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:13:56'),
(533, 53, 'Family Suite', '1700000', 6, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:13:56'),
(541, 54, 'Superior', '500000', 18, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:13:57'),
(542, 54, 'Deluxe', '650000', 10, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:13:57'),
(543, 54, 'Family Suite', '850000', 4, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:13:57'),
(551, 55, 'Superior', '600000', 18, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:13:58'),
(552, 55, 'Deluxe', '780000', 10, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:13:58'),
(553, 55, 'Family Suite', '1020000', 4, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:13:58'),
(1011, 101, 'Superior', '1200000', 24, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:13:59'),
(1012, 101, 'Deluxe', '1560000', 14, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:13:59'),
(1013, 101, 'Family Suite', '2040000', 6, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:13:59'),
(1021, 102, 'Superior', '1800000', 24, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:14:00'),
(1022, 102, 'Deluxe', '2340000', 14, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:00'),
(1023, 102, 'Family Suite', '3060000', 6, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:01'),
(1031, 103, 'Superior', '950000', 18, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:14:01'),
(1032, 103, 'Deluxe', '1240000', 10, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:01'),
(1033, 103, 'Family Suite', '1620000', 4, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:02'),
(1041, 104, 'Superior', '700000', 18, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:14:02');
INSERT INTO `room_types` (`id`, `property_id`, `name`, `price`, `total_allotment`, `max_adults`, `max_children`, `room_size`, `bed_type`, `bed_count`, `bathroom_count`, `bed_configuration`, `is_active`, `created_at`) VALUES
(1042, 104, 'Deluxe', '910000', 10, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:03'),
(1043, 104, 'Family Suite', '1190000', 4, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:03'),
(1051, 105, 'Superior', '900000', 18, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:14:03'),
(1052, 105, 'Deluxe', '1170000', 10, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:04'),
(1053, 105, 'Family Suite', '1530000', 4, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:04'),
(1061, 106, 'Deluxe hướng vườn', '1700000', 24, 2, 1, 38, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:04'),
(1062, 106, 'Deluxe hướng biển', '2130000', 16, 2, 1, 42, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:05'),
(1063, 106, 'Family Suite', '2810000', 8, 4, 2, 62, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:05'),
(1064, 106, 'Pool Villa', '4080000', 4, 4, 2, 95, '2 giường King', 2, 2, '[object Object]', 1, '2026-06-15 07:14:05'),
(1071, 107, 'Superior', '1050000', 24, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:14:06'),
(1072, 107, 'Deluxe', '1370000', 14, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:06'),
(1073, 107, 'Family Suite', '1790000', 6, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:06'),
(1081, 108, 'Superior', '1250000', 24, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:14:07'),
(1082, 108, 'Deluxe', '1630000', 14, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:07'),
(1083, 108, 'Family Suite', '2130000', 6, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:07'),
(1101, 110, 'Superior', '8500000', 32, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:14:08'),
(1102, 110, 'Deluxe', '11050000', 18, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:08'),
(1103, 110, 'Family Suite', '14450000', 8, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:08'),
(1111, 111, 'Superior', '3200000', 28, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:14:09'),
(1112, 111, 'Deluxe', '4160000', 16, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:10'),
(1113, 111, 'Family Suite', '5440000', 7, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:10'),
(1121, 112, 'Superior', '2100000', 28, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:14:11'),
(1122, 112, 'Deluxe', '2730000', 16, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:11'),
(1123, 112, 'Family Suite', '3570000', 7, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:11'),
(1131, 113, 'Deluxe hướng vườn', '12800000', 36, 2, 1, 38, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:12'),
(1132, 113, 'Deluxe hướng biển', '16000000', 24, 2, 1, 42, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:12'),
(1133, 113, 'Family Suite', '21120000', 12, 4, 2, 62, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:12'),
(1134, 113, 'Pool Villa', '30720000', 6, 4, 2, 95, '2 giường King', 2, 2, '[object Object]', 1, '2026-06-15 07:14:12'),
(1141, 114, 'Deluxe hướng vườn', '6500000', 36, 2, 1, 38, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:14'),
(1142, 114, 'Deluxe hướng biển', '8130000', 24, 2, 1, 42, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:14'),
(1143, 114, 'Family Suite', '10730000', 12, 4, 2, 62, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:14'),
(1144, 114, 'Pool Villa', '15600000', 6, 4, 2, 95, '2 giường King', 2, 2, '[object Object]', 1, '2026-06-15 07:14:14'),
(1151, 115, 'Superior', '2800000', 28, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:14:15'),
(1152, 115, 'Deluxe', '3640000', 16, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:15'),
(1153, 115, 'Family Suite', '4760000', 7, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:15'),
(1161, 116, 'Superior', '2200000', 28, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:14:17'),
(1162, 116, 'Deluxe', '2860000', 16, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:17'),
(1163, 116, 'Family Suite', '3740000', 7, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:17'),
(1171, 117, 'Deluxe hướng vườn', '4800000', 30, 2, 1, 38, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:18'),
(1172, 117, 'Deluxe hướng biển', '6000000', 20, 2, 1, 42, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:18'),
(1173, 117, 'Family Suite', '7920000', 10, 4, 2, 62, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:18'),
(1174, 117, 'Pool Villa', '11520000', 5, 4, 2, 95, '2 giường King', 2, 2, '[object Object]', 1, '2026-06-15 07:14:18'),
(1181, 118, 'Superior', '1600000', 24, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:14:19'),
(1182, 118, 'Deluxe', '2080000', 14, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:19'),
(1183, 118, 'Family Suite', '2720000', 6, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:20'),
(1191, 119, 'Deluxe hướng vườn', '7200000', 36, 2, 1, 38, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:20'),
(1192, 119, 'Deluxe hướng biển', '9000000', 24, 2, 1, 42, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:20'),
(1193, 119, 'Family Suite', '11880000', 12, 4, 2, 62, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:21'),
(1194, 119, 'Pool Villa', '17280000', 6, 4, 2, 95, '2 giường King', 2, 2, '[object Object]', 1, '2026-06-15 07:14:21'),
(1201, 120, 'Superior', '2400000', 28, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:14:22');
INSERT INTO `room_types` (`id`, `property_id`, `name`, `price`, `total_allotment`, `max_adults`, `max_children`, `room_size`, `bed_type`, `bed_count`, `bathroom_count`, `bed_configuration`, `is_active`, `created_at`) VALUES
(1202, 120, 'Deluxe', '3120000', 16, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:22'),
(1203, 120, 'Family Suite', '4080000', 7, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:22'),
(1211, 121, 'Superior', '3500000', 28, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:14:23'),
(1212, 121, 'Deluxe', '4550000', 16, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:23'),
(1213, 121, 'Family Suite', '5950000', 7, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:23'),
(1221, 122, 'Superior', '1800000', 24, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:14:25'),
(1222, 122, 'Deluxe', '2340000', 14, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:25'),
(1223, 122, 'Family Suite', '3060000', 6, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:25'),
(1231, 123, 'Superior', '1350000', 24, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:14:26'),
(1232, 123, 'Deluxe', '1760000', 14, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:26'),
(1233, 123, 'Family Suite', '2300000', 6, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:26'),
(1241, 124, 'Superior', '900000', 18, 2, 1, 24, '1 giường Queen', 1, 1, '[object Object]', 1, '2026-06-15 07:14:27'),
(1242, 124, 'Deluxe', '1170000', 10, 2, 1, 32, '1 giường King', 1, 1, '[object Object]', 1, '2026-06-15 07:14:27'),
(1243, 124, 'Family Suite', '1530000', 4, 4, 2, 46, '2 giường Queen', 2, 2, '[object Object]', 1, '2026-06-15 07:14:27');

-- ---------------------------------------------------
-- Bảng: bookings
-- ---------------------------------------------------
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE "bookings" (
  "id" int NOT NULL AUTO_INCREMENT,
  "customer_id" int NOT NULL,
  "guest_phone" varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  "guest_name" varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  "property_id" int NOT NULL,
  "room_type_id" int NOT NULL,
  "check_in" date NOT NULL,
  "check_out" date NOT NULL,
  "actual_check_out" date DEFAULT NULL,
  "number_of_rooms" int DEFAULT '1',
  "total_price" decimal(15,0) NOT NULL,
  "status" varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'pending',
  "special_requests" text COLLATE utf8mb4_general_ci,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "customer_id" ("customer_id"),
  KEY "property_id" ("property_id"),
  KEY "room_type_id" ("room_type_id"),
  CONSTRAINT "bookings_ibfk_1" FOREIGN KEY ("customer_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "bookings_ibfk_2" FOREIGN KEY ("property_id") REFERENCES "properties" ("id") ON DELETE CASCADE,
  CONSTRAINT "bookings_ibfk_3" FOREIGN KEY ("room_type_id") REFERENCES "room_types" ("id") ON DELETE CASCADE,
  CONSTRAINT "chk_bookings_dates" CHECK ((`check_out` > `check_in`)),
  CONSTRAINT "chk_bookings_room_count" CHECK ((`number_of_rooms` > 0)),
  CONSTRAINT "chk_bookings_total_price" CHECK ((`total_price` > 0))
);

-- (Bảng bookings không có dữ liệu)

-- ---------------------------------------------------
-- Bảng: reviews
-- ---------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE "reviews" (
  "id" int NOT NULL AUTO_INCREMENT,
  "customer_id" int NOT NULL,
  "property_id" int NOT NULL,
  "booking_id" int NOT NULL,
  "rating" int NOT NULL,
  "comment" text COLLATE utf8mb4_general_ci,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "booking_id" ("booking_id"),
  KEY "customer_id" ("customer_id"),
  KEY "property_id" ("property_id"),
  CONSTRAINT "reviews_ibfk_1" FOREIGN KEY ("customer_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "reviews_ibfk_2" FOREIGN KEY ("property_id") REFERENCES "properties" ("id") ON DELETE CASCADE,
  CONSTRAINT "reviews_ibfk_3" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE
);

-- (Bảng reviews không có dữ liệu)

-- ---------------------------------------------------
-- Bảng: payments
-- ---------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE "payments" (
  "id" int NOT NULL AUTO_INCREMENT,
  "booking_id" int NOT NULL,
  "amount" decimal(15,0) NOT NULL,
  "payment_method" varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  "payment_status" varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'pending',
  "transaction_id" varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  "payment_date" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" text COLLATE utf8mb4_general_ci,
  PRIMARY KEY ("id"),
  UNIQUE KEY "uniq_payments_booking" ("booking_id"),
  KEY "booking_id" ("booking_id"),
  CONSTRAINT "payments_ibfk_1" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE
);

-- (Bảng payments không có dữ liệu)

-- ---------------------------------------------------
-- Bảng: coupons
-- ---------------------------------------------------
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE "coupons" (
  "id" int NOT NULL AUTO_INCREMENT,
  "code" varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  "discount_type" varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  "discount_value" decimal(10,2) NOT NULL,
  "min_order_amount" decimal(15,0) DEFAULT NULL,
  "max_uses" int DEFAULT NULL,
  "used_count" int DEFAULT '0',
  "valid_from" date DEFAULT NULL,
  "valid_until" date DEFAULT NULL,
  "description" text COLLATE utf8mb4_general_ci,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "code" ("code")
);

-- (Bảng coupons không có dữ liệu)

-- ---------------------------------------------------
-- Bảng: booking_coupons
-- ---------------------------------------------------
DROP TABLE IF EXISTS `booking_coupons`;
CREATE TABLE "booking_coupons" (
  "booking_id" int NOT NULL,
  "coupon_id" int NOT NULL,
  "discount_amount" decimal(15,0) NOT NULL,
  PRIMARY KEY ("booking_id","coupon_id"),
  KEY "coupon_id" ("coupon_id"),
  CONSTRAINT "booking_coupons_ibfk_1" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE,
  CONSTRAINT "booking_coupons_ibfk_2" FOREIGN KEY ("coupon_id") REFERENCES "coupons" ("id") ON DELETE CASCADE
);

-- (Bảng booking_coupons không có dữ liệu)

-- ---------------------------------------------------
-- Bảng: wishlists
-- ---------------------------------------------------
DROP TABLE IF EXISTS `wishlists`;
CREATE TABLE "wishlists" (
  "id" int NOT NULL AUTO_INCREMENT,
  "user_id" int NOT NULL,
  "property_id" int NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "unique_wishlist" ("user_id","property_id"),
  KEY "property_id" ("property_id"),
  CONSTRAINT "wishlists_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "wishlists_ibfk_2" FOREIGN KEY ("property_id") REFERENCES "properties" ("id") ON DELETE CASCADE
);

-- (Bảng wishlists không có dữ liệu)

-- ---------------------------------------------------
-- Bảng: conversations
-- ---------------------------------------------------
DROP TABLE IF EXISTS `conversations`;
CREATE TABLE "conversations" (
  "id" int NOT NULL AUTO_INCREMENT,
  "booking_id" int DEFAULT NULL,
  "guest_id" int NOT NULL,
  "host_id" int NOT NULL,
  "property_id" int DEFAULT NULL,
  "last_message_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "booking_id" ("booking_id"),
  KEY "guest_id" ("guest_id"),
  KEY "host_id" ("host_id"),
  KEY "property_id" ("property_id"),
  CONSTRAINT "conversations_ibfk_1" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE SET NULL,
  CONSTRAINT "conversations_ibfk_2" FOREIGN KEY ("guest_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "conversations_ibfk_3" FOREIGN KEY ("host_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "conversations_ibfk_4" FOREIGN KEY ("property_id") REFERENCES "properties" ("id") ON DELETE SET NULL
);

-- (Bảng conversations không có dữ liệu)

-- ---------------------------------------------------
-- Bảng: messages
-- ---------------------------------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE "messages" (
  "id" int NOT NULL AUTO_INCREMENT,
  "conversation_id" int NOT NULL,
  "sender_id" int NOT NULL,
  "content" text COLLATE utf8mb4_general_ci NOT NULL,
  "is_read" tinyint(1) DEFAULT '0',
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "conversation_id" ("conversation_id"),
  KEY "sender_id" ("sender_id"),
  CONSTRAINT "messages_ibfk_1" FOREIGN KEY ("conversation_id") REFERENCES "conversations" ("id") ON DELETE CASCADE,
  CONSTRAINT "messages_ibfk_2" FOREIGN KEY ("sender_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- (Bảng messages không có dữ liệu)

-- ---------------------------------------------------
-- Bảng: booking_status_history
-- ---------------------------------------------------
DROP TABLE IF EXISTS `booking_status_history`;
CREATE TABLE "booking_status_history" (
  "id" int NOT NULL AUTO_INCREMENT,
  "booking_id" int NOT NULL,
  "status" varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  "note" text COLLATE utf8mb4_general_ci,
  "updated_by" int DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "booking_id" ("booking_id"),
  KEY "updated_by" ("updated_by"),
  CONSTRAINT "booking_status_history_ibfk_1" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE,
  CONSTRAINT "booking_status_history_ibfk_2" FOREIGN KEY ("updated_by") REFERENCES "users" ("id") ON DELETE SET NULL
);

-- (Bảng booking_status_history không có dữ liệu)

-- ---------------------------------------------------
-- Bảng: property_rules
-- ---------------------------------------------------
DROP TABLE IF EXISTS `property_rules`;
CREATE TABLE "property_rules" (
  "id" int NOT NULL AUTO_INCREMENT,
  "property_id" int NOT NULL,
  "rule_type" varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  "rule_content" text COLLATE utf8mb4_general_ci NOT NULL,
  "is_allowed" tinyint(1) DEFAULT '1',
  PRIMARY KEY ("id"),
  KEY "property_id" ("property_id"),
  CONSTRAINT "property_rules_ibfk_1" FOREIGN KEY ("property_id") REFERENCES "properties" ("id") ON DELETE CASCADE
);

-- (Bảng property_rules không có dữ liệu)

-- ---------------------------------------------------
-- Bảng: guest_bookings
-- ---------------------------------------------------
DROP TABLE IF EXISTS `guest_bookings`;
CREATE TABLE "guest_bookings" (
  "id" int NOT NULL AUTO_INCREMENT,
  "email" varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  "phone" varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  "guest_name" varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  "property_id" int NOT NULL,
  "room_type_id" int NOT NULL,
  "check_in" date NOT NULL,
  "check_out" date NOT NULL,
  "number_of_rooms" int DEFAULT '1',
  "total_price" decimal(15,0) NOT NULL,
  "special_requests" text COLLATE utf8mb4_general_ci,
  "confirm_token" varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  "is_confirmed" tinyint(1) DEFAULT '0',
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "payment_method" varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'momo',
  "status" varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'pending',
  PRIMARY KEY ("id"),
  UNIQUE KEY "confirm_token" ("confirm_token"),
  KEY "property_id" ("property_id"),
  KEY "room_type_id" ("room_type_id"),
  CONSTRAINT "guest_bookings_ibfk_1" FOREIGN KEY ("property_id") REFERENCES "properties" ("id") ON DELETE CASCADE,
  CONSTRAINT "guest_bookings_ibfk_2" FOREIGN KEY ("room_type_id") REFERENCES "room_types" ("id") ON DELETE CASCADE
);

-- (Bảng guest_bookings không có dữ liệu)

-- ---------------------------------------------------
-- Bảng: activity_logs
-- ---------------------------------------------------
DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE "activity_logs" (
  "id" int NOT NULL AUTO_INCREMENT,
  "user_id" int DEFAULT NULL,
  "action" varchar(255) NOT NULL,
  "details" text,
  "ip_address" varchar(50) DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "user_id" ("user_id"),
  CONSTRAINT "activity_logs_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL
);

-- (Bảng activity_logs không có dữ liệu)

-- ---------------------------------------------------
-- Bảng: magic_links
-- ---------------------------------------------------
DROP TABLE IF EXISTS `magic_links`;
CREATE TABLE "magic_links" (
  "id" int NOT NULL AUTO_INCREMENT,
  "code" varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  "token" text COLLATE utf8mb4_general_ci NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "code" ("code")
);

-- (Bảng magic_links không có dữ liệu)

-- ---------------------------------------------------
-- Bảng: sandbox_cards
-- ---------------------------------------------------
DROP TABLE IF EXISTS `sandbox_cards`;
CREATE TABLE "sandbox_cards" (
  "id" int NOT NULL AUTO_INCREMENT,
  "card_number" varchar(19) NOT NULL,
  "card_holder" varchar(255) NOT NULL,
  "expiry_date" varchar(5) NOT NULL,
  "cvv" varchar(4) NOT NULL,
  "phone_number" varchar(20) DEFAULT '0987654321',
  "balance" decimal(15,0) NOT NULL DEFAULT '10000000',
  "bank_name" varchar(100) DEFAULT 'Vietcombank',
  "is_active" tinyint(1) DEFAULT '1',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "card_number" ("card_number")
);

-- Data cho bảng sandbox_cards (5 dòng)
INSERT INTO `sandbox_cards` (`id`, `card_number`, `card_holder`, `expiry_date`, `cvv`, `phone_number`, `balance`, `bank_name`, `is_active`, `created_at`) VALUES
(1, '9704 0000 0000 0018', 'NGUYEN VAN A', '12/28', '123', '0912345678', '10000000', 'Vietcombank', 1, '2026-05-15 05:48:40'),
(2, '9704 0000 0000 0026', 'TRAN THI B', '06/27', '456', '0987654321', '500000', 'Techcombank', 1, '2026-05-15 05:48:40'),
(3, '9704 0000 0000 0034', 'LE VAN C', '03/29', '789', '0909090909', '50000000', 'BIDV', 1, '2026-05-15 05:48:40'),
(4, '9704 0000 0000 0042', 'PHAM THI D', '01/26', '321', '0888888888', '0', 'Agribank', 1, '2026-05-15 05:48:40'),
(5, '9999 0000 0000 9999', 'NGUYEN VU DAT', '01/30', '126', '0383021104', '999865360000', 'MB Bank', 1, '2026-05-15 05:48:41');

-- ---------------------------------------------------
-- Bảng: sandbox_otp_logs
-- ---------------------------------------------------
DROP TABLE IF EXISTS `sandbox_otp_logs`;
CREATE TABLE "sandbox_otp_logs" (
  "id" int NOT NULL AUTO_INCREMENT,
  "transaction_id" varchar(100) NOT NULL,
  "card_number" varchar(19) NOT NULL,
  "phone_number" varchar(20) DEFAULT NULL,
  "otp_code" varchar(6) NOT NULL,
  "amount" decimal(15,0) NOT NULL,
  "status" varchar(20) DEFAULT 'PENDING',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "transaction_id" ("transaction_id")
);

-- (Bảng sandbox_otp_logs không có dữ liệu)

-- ---------------------------------------------------
-- Bảng: site_visits
-- ---------------------------------------------------
DROP TABLE IF EXISTS `site_visits`;
CREATE TABLE "site_visits" (
  "id" int NOT NULL AUTO_INCREMENT,
  "user_id" int DEFAULT NULL,
  "page_path" varchar(255) NOT NULL,
  "ip_address" varchar(45) NOT NULL,
  "user_agent" text NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Data cho bảng site_visits (4 dòng)
INSERT INTO `site_visits` (`id`, `user_id`, `page_path`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 12, '/details/35', '123.23.29.116, 172.71.214.8, 10.29.95.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-15 07:15:03'),
(2, 12, '/', '123.23.29.116, 172.71.214.8, 10.29.223.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-15 07:15:15'),
(3, 12, '/details/33', '123.23.29.116, 172.71.214.9, 10.28.190.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-15 07:15:18'),
(4, 12, '/', '123.23.29.116, 172.71.214.9, 10.28.190.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-15 07:15:39');

-- ---------------------------------------------------
-- Bảng: system_emails
-- ---------------------------------------------------
DROP TABLE IF EXISTS `system_emails`;
CREATE TABLE "system_emails" (
  "id" int NOT NULL AUTO_INCREMENT,
  "recipient_email" varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  "subject" varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  "content" text COLLATE utf8mb4_general_ci NOT NULL,
  "is_read" tinyint(1) DEFAULT '0',
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- (Bảng system_emails không có dữ liệu)

-- ---------------------------------------------------
-- Bảng: system_sms
-- ---------------------------------------------------
DROP TABLE IF EXISTS `system_sms`;
CREATE TABLE "system_sms" (
  "id" int NOT NULL AUTO_INCREMENT,
  "phone_number" varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  "content" text COLLATE utf8mb4_general_ci NOT NULL,
  "sender_name" varchar(100) COLLATE utf8mb4_general_ci DEFAULT 'Antigravity Travel',
  "is_read" tinyint(1) DEFAULT '0',
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- (Bảng system_sms không có dữ liệu)

-- ---------------------------------------------------
-- Bảng: verification_otps
-- ---------------------------------------------------
DROP TABLE IF EXISTS `verification_otps`;
CREATE TABLE "verification_otps" (
  "id" int NOT NULL AUTO_INCREMENT,
  "identifier" varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  "otp_code" varchar(6) COLLATE utf8mb4_general_ci NOT NULL,
  "type" varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'sms',
  "status" varchar(20) COLLATE utf8mb4_general_ci DEFAULT 'PENDING',
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- (Bảng verification_otps không có dữ liệu)

SET FOREIGN_KEY_CHECKS = 1;

-- ✅ Import hoàn tất!

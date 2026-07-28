-- Drop tables in reverse order of creation to avoid foreign key constraints
DROP TABLE IF EXISTS site_visits;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS notification_deliveries;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS notification_campaigns;
DROP TABLE IF EXISTS push_tokens;
DROP TABLE IF EXISTS verification_otps;
DROP TABLE IF EXISTS magic_links;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS loyalty_transactions;
DROP TABLE IF EXISTS booking_status_history;
DROP TABLE IF EXISTS booking_coupons;
DROP TABLE IF EXISTS reward_redemptions;
DROP TABLE IF EXISTS rewards;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS wishlists;
DROP TABLE IF EXISTS property_rules;
DROP TABLE IF EXISTS guest_bookings;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS room_types;
DROP TABLE IF EXISTS property_amenities;
DROP TABLE IF EXISTS amenities;
DROP TABLE IF EXISTS property_images;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS sandbox_otp_logs;
DROP TABLE IF EXISTS sandbox_cards;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) DEFAULT 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  role VARCHAR(50) DEFAULT 'customer',
  phone VARCHAR(20) UNIQUE,
  loyalty_points BIGINT UNSIGNED NOT NULL DEFAULT 0,
  membership_tier VARCHAR(20) NOT NULL DEFAULT 'classic',
  transaction_pin VARCHAR(255) NULL,
  transaction_pin_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE push_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  expo_push_token VARCHAR(255) NOT NULL UNIQUE,
  provider VARCHAR(30) NOT NULL DEFAULT 'expo',
  expo_project_id VARCHAR(120),
  platform VARCHAR(30),
  device_id VARCHAR(120),
  app_version VARCHAR(40),
  permission_status VARCHAR(30),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  disabled_at TIMESTAMP NULL,
  last_error TEXT,
  last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_push_tokens_user_active (user_id, is_active)
);

CREATE TABLE notification_campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  audience VARCHAR(50) NOT NULL DEFAULT 'all',
  data_json TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'sent',
  created_by INT,
  sent_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  delivered_count INT NOT NULL DEFAULT 0,
  opened_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  campaign_id INT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'general',
  data_json TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  opened_at TIMESTAMP NULL,
  deep_link VARCHAR(255),
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  channel VARCHAR(50) NOT NULL DEFAULT 'default',
  sent_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES notification_campaigns(id) ON DELETE SET NULL,
  FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_notifications_user_created (user_id, created_at),
  INDEX idx_notifications_user_read (user_id, is_read)
);

CREATE TABLE notification_deliveries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notification_id INT NOT NULL,
  push_token_id INT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  expo_ticket_id VARCHAR(120),
  expo_receipt_id VARCHAR(120),
  error_code VARCHAR(120),
  error_message TEXT,
  sent_at TIMESTAMP NULL,
  received_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  FOREIGN KEY (push_token_id) REFERENCES push_tokens(id) ON DELETE SET NULL,
  INDEX idx_notification_deliveries_notification (notification_id),
  INDEX idx_notification_deliveries_token_status (push_token_id, status),
  INDEX idx_notification_deliveries_ticket (expo_ticket_id)
);

CREATE TABLE properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  host_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  location VARCHAR(255) NOT NULL,
  price_display DECIMAL(15,0),
  description TEXT,
  map_image VARCHAR(255),
  map_embed TEXT,
  is_hot BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active',
  status_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  max_guests INT DEFAULT 0,
  search_tags JSON,
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE property_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_property_images_property_url (property_id, image_url)
);

CREATE TABLE amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  category VARCHAR(100)
);

CREATE TABLE property_amenities (
  property_id INT NOT NULL,
  amenity_id INT NOT NULL,
  PRIMARY KEY (property_id, amenity_id),
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

CREATE TABLE room_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(15,0) NOT NULL,
  total_allotment INT NOT NULL,
  max_adults INT DEFAULT 2,
  max_children INT DEFAULT 1,
  room_size INT,
  bed_type VARCHAR(100),
  bed_count INT,
  bathroom_count INT,
  bed_configuration JSON,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_room_types_property_name (property_id, name),
  CONSTRAINT chk_room_types_price CHECK (price > 0),
  CONSTRAINT chk_room_types_allotment CHECK (total_allotment > 0),
  CONSTRAINT chk_room_types_capacity CHECK (max_adults > 0 AND max_children >= 0),
  CONSTRAINT chk_room_types_details CHECK (room_size > 0 AND bed_count > 0 AND bathroom_count > 0)
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  guest_phone VARCHAR(20),
  guest_name VARCHAR(255),
  property_id INT NOT NULL,
  room_type_id INT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  actual_check_out DATE,
  number_of_rooms INT DEFAULT 1,
  total_price DECIMAL(15,0) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
  CONSTRAINT chk_bookings_dates CHECK (check_out > check_in),
  CONSTRAINT chk_bookings_room_count CHECK (number_of_rooms > 0),
  CONSTRAINT chk_bookings_total_price CHECK (total_price > 0)
);

CREATE TABLE loyalty_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  booking_id INT NOT NULL,
  points INT UNSIGNED NOT NULL,
  amount DECIMAL(15,0) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_loyalty_booking (booking_id)
);

CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  property_id INT NOT NULL,
  booking_id INT NOT NULL UNIQUE,
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_payments_booking (booking_id)
);

-- =====================================================
-- BẢNG MỚI: THANH TOÁN VÀ TƯƠNG TÁC USER
-- =====================================================

-- Bảng thanh toán
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(15,0) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  transaction_id VARCHAR(255),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Bảng yêu thích (wishlist)
CREATE TABLE wishlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  property_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  UNIQUE KEY unique_wishlist (user_id, property_id)
);

-- Bảng tin nhắn
CREATE TABLE conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  guest_id INT NOT NULL,
  host_id INT NOT NULL,
  property_id INT,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
);

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng khuyến mãi
CREATE TABLE coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(15,0),
  max_uses INT,
  used_count INT DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rewards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  points INT UNSIGNED NOT NULL,
  discount_type VARCHAR(20) NOT NULL DEFAULT 'fixed',
  discount_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  min_order_amount DECIMAL(15,0) DEFAULT 0,
  category VARCHAR(50) NOT NULL DEFAULT 'voucher',
  image_url VARCHAR(500),
  partner_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO rewards
  (`key`, title, description, points, discount_type, discount_value, min_order_amount, category, image_url, partner_name)
VALUES
  ('stay-fixed-50k', 'Giảm trực tiếp 50.000 VNĐ khi đặt phòng', 'Coupon dùng cho mọi khách sạn, villa và homestay trên Aoklevart. Đơn đặt phòng tối thiểu 500.000đ.', 5, 'fixed', 50000, 500000, 'booking', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500&auto=format&fit=crop&q=70', 'AOKLEVART STAY'),
  ('stay-percent-5', 'Giảm 5% giá phòng cho chuyến đi tiếp theo', 'Giảm trực tiếp 5% trên tiền phòng cho đơn từ 600.000đ.', 6, 'percent', 5, 600000, 'booking', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=70', 'AOKLEVART STAY'),
  ('stay-fixed-100k', 'Giảm trực tiếp 100.000 VNĐ khi đặt phòng', 'Coupon áp dụng cho đơn đặt phòng từ 1.000.000đ trên Aoklevart.', 9, 'fixed', 100000, 1000000, 'booking', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500&auto=format&fit=crop&q=70', 'AOKLEVART STAY'),
  ('stay-percent-10', 'Giảm 10% giá phòng trên toàn hệ thống', 'Giảm trực tiếp 10% trên tiền phòng cho đơn từ 1.200.000đ.', 13, 'percent', 10, 1200000, 'booking', 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=500&auto=format&fit=crop&q=70', 'AOKLEVART STAY'),
  ('voucher-aoklevart', 'Giảm trực tiếp 200.000 VNĐ khi đặt phòng nghỉ dưỡng', 'Áp dụng cho mọi khách sạn, villa và homestay trên Aoklevart với đơn từ 800.000đ.', 15, 'fixed', 200000, 800000, 'booking', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=70', 'AOKLEVART STAY'),
  ('stay-percent-15', 'Giảm 15% giá phòng cho kỳ nghỉ dài ngày', 'Giảm trực tiếp 15% trên tiền phòng cho đơn từ 2.000.000đ.', 22, 'percent', 15, 2000000, 'booking', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&auto=format&fit=crop&q=70', 'AOKLEVART STAY'),
  ('stay-fixed-300k', 'Giảm trực tiếp 300.000 VNĐ khi đặt phòng', 'Coupon ưu đãi lớn dành cho đơn đặt phòng từ 3.000.000đ.', 25, 'fixed', 300000, 3000000, 'booking', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&auto=format&fit=crop&q=70', 'AOKLEVART STAY'),
  ('stay-percent-20', 'Giảm 20% giá phòng cho kỳ nghỉ cao cấp', 'Giảm trực tiếp 20% trên tiền phòng cho đơn từ 4.000.000đ.', 35, 'percent', 20, 4000000, 'booking', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=500&auto=format&fit=crop&q=70', 'AOKLEVART STAY');

CREATE TABLE reward_redemptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  coupon_id INT NOT NULL UNIQUE,
  reward_key VARCHAR(50) NOT NULL,
  points_spent INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE
);

CREATE TABLE booking_coupons (
  booking_id INT NOT NULL,
  coupon_id INT NOT NULL,
  discount_amount DECIMAL(15,0) NOT NULL,
  PRIMARY KEY (booking_id, coupon_id),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE
);

-- Bảng lịch sử trạng thái booking
CREATE TABLE booking_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  note TEXT,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Bảng quy định property
CREATE TABLE property_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  rule_type VARCHAR(100) NOT NULL,
  rule_content TEXT NOT NULL,
  is_allowed BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Bảng booking tạm cho khách chưa có tài khoản
CREATE TABLE guest_bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  property_id INT NOT NULL,
  room_type_id INT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  number_of_rooms INT DEFAULT 1,
  total_price DECIMAL(15,0) NOT NULL,
  special_requests TEXT,
  confirm_token VARCHAR(255) NOT NULL UNIQUE,
  is_confirmed BOOLEAN DEFAULT FALSE,
  payment_method VARCHAR(50) DEFAULT 'momo',
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
);

CREATE TABLE magic_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  token TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE verification_otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  type VARCHAR(50) DEFAULT 'sms',
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SANDBOX PAYMENT: Thẻ giả lập & Log OTP
-- =====================================================

CREATE TABLE sandbox_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_number VARCHAR(19) NOT NULL UNIQUE,
  card_holder VARCHAR(255) NOT NULL,
  expiry_date VARCHAR(5) NOT NULL,
  cvv VARCHAR(4) NOT NULL,
  balance DECIMAL(15,0) NOT NULL DEFAULT 10000000,
  bank_name VARCHAR(100) DEFAULT 'Vietcombank',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sandbox_otp_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id VARCHAR(100) NOT NULL UNIQUE,
  card_number VARCHAR(19) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  amount DECIMAL(15,0) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- EMAIL CLONE SYSTEM: Lưu thông báo email pseudo
-- =====================================================

CREATE TABLE system_emails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- =====================================================
-- SMS CLONE SYSTEM: Lưu thông báo SMS giả lập
-- =====================================================

CREATE TABLE system_sms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone_number VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  sender_name VARCHAR(100) DEFAULT 'Antigravity Travel',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SYSTEM TRACKING: Lượt truy cập & Nhật ký hoạt động
-- =====================================================

CREATE TABLE site_visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  page_path VARCHAR(255),
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(255) NOT NULL,
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

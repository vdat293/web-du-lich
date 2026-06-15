-- Drop tables in reverse order of creation to avoid foreign key constraints
DROP TABLE IF EXISTS site_visits;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS verification_otps;
DROP TABLE IF EXISTS magic_links;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS booking_status_history;
DROP TABLE IF EXISTS booking_coupons;
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

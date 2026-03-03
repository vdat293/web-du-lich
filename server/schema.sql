CREATE DATABASE IF NOT EXISTS aoklevart_db;
USE aoklevart_db;

-- Bảng hợp nhất users chứa tất cả thông tin
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT 'https://i.pravatar.cc/150?img=12',
    role VARCHAR(50) DEFAULT 'customer',
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert dữ liệu mẫu (mật khẩu đã mã hoá bcrypt cho '123')
INSERT INTO users (name, email, password, avatar, role, phone) 
VALUES ('Nguyễn Văn A', 'test@gmail.com', '$2b$10$0T9nMAyZy1Ip5WUQCBP0Z.8xvWRM6uemXXkBHmWHmayh9pD2zYdqq', 'https://i.pravatar.cc/150?img=12', 'customer', '0123456789');

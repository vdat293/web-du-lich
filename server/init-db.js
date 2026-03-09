const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
    try {
        console.log("Đang kết nối tới Local Database...");
        const initialConnection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        await initialConnection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
        await initialConnection.end();

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log("Đã kết nối thành công! Bắt đầu tạo bảng...");

        // Đọc nội dung file schema.sql
        const sql = fs.readFileSync('schema.sql', 'utf8');

        // Tách các câu lệnh chia bởi dấu chấm phẩy ; 
        // Lọc bỏ những đoạn mã rỗng
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (let statement of statements) {
            // Chạy từng lệnh một
            await connection.query(statement);
        }

        console.log("=========================================");
        console.log("🎉 Đã khởi tạo bảng và dữ liệu thành công!");
        console.log("Máy chủ đã sẵn sàng hoạt động cùng với Database Aiven.");
        console.log("=========================================");
        process.exit(0);
    } catch (error) {
        console.error("❌ Lỗi khi khởi tạo Database:", error);
        process.exit(1);
    }
}

initDB();

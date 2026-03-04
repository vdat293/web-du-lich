import mysql from 'mysql2/promise';
import path from 'path';

// === Safety net: Đảm bảo biến môi trường luôn được load ===
// Next.js tự load .env, nhưng thứ tự load có thể khác nhau giữa các OS.
// Dùng dotenv như một lớp bảo vệ thêm.
try {
    const dotenv = await import('dotenv');
    // process.cwd() trong Next.js luôn trỏ tới thư mục chứa package.json (server/)
    dotenv.config({ path: path.join(process.cwd(), '.env') });
} catch (e) {
    // Nếu dotenv không load được thì Next.js đã lo rồi, bỏ qua.
}

// === Kiểm tra biến môi trường bắt buộc ===
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
    console.error(`❌ [DB] Thiếu biến môi trường: ${missingVars.join(', ')}`);
    console.error('👉 Hãy kiểm tra file server/.env đã được tạo đúng chưa. Xem README.md để biết cách cấu hình.');
}

// === Tạo connection pool với cấu hình tối ưu cho Cloud Database ===
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 22669,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 5,          // Giảm xuống 5 vì Aiven free tier giới hạn
    queueLimit: 0,
    connectTimeout: 30000,       // 30s timeout cho kết nối lần đầu (cloud DB chậm hơn local)
    enableKeepAlive: true,       // Giữ kết nối sống, tránh bị cloud ngắt
    keepAliveInitialDelay: 10000 // Ping sau mỗi 10s
});

// === Test kết nối khi khởi động ===
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ [DB] Kết nối Aiven MySQL Cloud thành công!');
        connection.release();
    } catch (err) {
        console.error('❌ [DB] Không thể kết nối Database:', err.message);
        console.error('👉 Kiểm tra lại: 1) File .env 2) Mật khẩu DB 3) Kết nối mạng Internet');
    }
})();

export default pool;

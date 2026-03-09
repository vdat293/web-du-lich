/**
 * ===================================================
 *  IMPORT DATABASE ← database-dump.sql
 * ===================================================
 *  Script này sẽ đọc file `database-dump.sql` và import
 *  toàn bộ dữ liệu vào database MySQL local.
 *
 *  ⚠️ LƯU Ý: Sẽ XÓA TOÀN BỘ dữ liệu cũ và thay bằng
 *  dữ liệu từ file dump!
 *
 *  Cách dùng:
 *    cd server
 *    node import-db.js
 * ===================================================
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const readline = require('readline');
require('dotenv').config();

async function importDB() {
    // Kiểm tra file dump có tồn tại không
    const dumpFile = 'database-dump.sql';
    if (!fs.existsSync(dumpFile)) {
        console.error('❌ Không tìm thấy file database-dump.sql!');
        console.error('👉 Hãy chắc chắn bạn đã pull code mới nhất từ Git.');
        console.error('   Hoặc yêu cầu thành viên có data chạy: node export-db.js');
        process.exit(1);
    }

    // Xác nhận trước khi import
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise(resolve => {
        console.log('');
        console.log('⚠️  CẢNH BÁO: Thao tác này sẽ XÓA TOÀN BỘ dữ liệu cũ');
        console.log('   trong database và thay bằng dữ liệu từ file dump.');
        console.log('');
        rl.question('👉 Bạn có chắc chắn muốn tiếp tục? (y/N): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('❎ Đã hủy import.');
        process.exit(0);
    }

    console.log('\n🔄 Đang kết nối tới Database...');

    // Kết nối ban đầu không chọn database (để tạo nếu chưa có)
    const initialConnection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    // Tạo database nếu chưa tồn tại
    await initialConnection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    await initialConnection.end();

    // Kết nối lại với database đã chọn
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    console.log('✅ Kết nối thành công!');
    console.log('📥 Đang import dữ liệu...\n');

    // Đọc file SQL
    const sqlContent = fs.readFileSync(dumpFile, 'utf8');

    // Tách các câu lệnh bằng dấu ;
    // Lọc bỏ comment (dòng bắt đầu bằng --) và dòng trống
    const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => {
            if (s.length === 0) return false;
            // Bỏ qua nếu chỉ toàn comment
            const lines = s.split('\n').filter(l => !l.trim().startsWith('--') && l.trim().length > 0);
            return lines.length > 0;
        });

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
        try {
            // Lấy dòng lệnh chính (bỏ comment)
            const mainLine = statement.split('\n').find(l => !l.trim().startsWith('--') && l.trim().length > 0);
            if (mainLine) {
                const preview = mainLine.trim().substring(0, 60);
                process.stdout.write(`  ⏳ ${preview}...`);
            }

            await connection.query(statement);
            successCount++;
            process.stdout.write(' ✅\n');
        } catch (err) {
            errorCount++;
            process.stdout.write(` ❌ ${err.message}\n`);
        }
    }

    console.log('\n=========================================');
    if (errorCount === 0) {
        console.log('🎉 IMPORT THÀNH CÔNG!');
    } else {
        console.log(`⚠️  Import hoàn tất với ${errorCount} lỗi.`);
    }
    console.log(`📊 Tổng cộng: ${successCount} lệnh thành công, ${errorCount} lỗi`);
    console.log('=========================================');
    console.log('');
    console.log('👉 Bây giờ bạn có thể chạy server bình thường:');
    console.log('   npm run dev');

    await connection.end();
    process.exit(errorCount > 0 ? 1 : 0);
}

importDB().catch(err => {
    console.error('❌ Lỗi khi import:', err.message);
    process.exit(1);
});

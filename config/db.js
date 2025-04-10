const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

// Tạo pool kết nối thay vì connection đơn
const pool = mysql.createPool({
  connectionLimit: 10, // Số kết nối tối đa trong pool
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  queueLimit: 0,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Lỗi kết nối MySQL:", err.message);
  } else {
    console.log("✅ Kết nối MySQL thành công!");
    connection.release(); // Trả kết nối về pool
  }
});

module.exports = pool;

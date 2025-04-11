const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "your_database",
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});

// Xử lý lỗi pool
pool.on("error", (err) => {
  console.error("Lỗi MySQL Pool:", err.message);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.error("Kết nối tới database bị mất. Thử kết nối lại...");
    // Có thể thêm logic retry nếu cần
  }
});

// Kiểm tra kết nối ban đầu (tùy chọn)
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Lỗi kết nối MySQL ban đầu:", err.message);
    return;
  }
  console.log("✅ Kết nối MySQL thành công!");
  connection.release();
});

// Xuất promise-based pool để hỗ trợ async/await
module.exports = pool.promise();

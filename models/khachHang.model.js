const db = require("../config/db");

const KhachHang = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM KHACH_HANG");
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM KHACH_HANG WHERE Id_KhachHang = ?",
      [id]
    );
    return rows;
  },

  create: async (data, connection) => {
    const [result] = await connection.query(
      "INSERT INTO KHACH_HANG SET ?",
      data
    );
    return result;
  },

  update: async (id, data, connection) => {
    const [result] = await connection.query(
      "UPDATE KHACH_HANG SET ? WHERE Id_KhachHang = ?",
      [data, id]
    );
    return result;
  },

  checkUsage: async (id) => {
    const [rows] = await db.query(
      "SELECT COUNT(*) as count FROM PHIEU_XUAT WHERE MaKhachHang = ?",
      [id]
    );
    return rows[0].count;
  },

  delete: async (id, connection) => {
    const [result] = await connection.query(
      "DELETE FROM KHACH_HANG WHERE Id_KhachHang = ?",
      [id]
    );
    return result;
  },
};

module.exports = KhachHang;

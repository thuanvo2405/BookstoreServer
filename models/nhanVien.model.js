const db = require("../config/db");

const NhanVien = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM NHAN_VIEN");
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM NHAN_VIEN WHERE Id_NhanVien = ?",
      [id]
    );
    return rows;
  },

  create: async (data, connection) => {
    const [result] = await connection.query(
      "INSERT INTO NHAN_VIEN SET ?",
      data
    );
    return result;
  },

  update: async (id, data, connection) => {
    const [result] = await connection.query(
      "UPDATE NHAN_VIEN SET ? WHERE Id_NhanVien = ?",
      [data, id]
    );
    return result;
  },

  checkUsage: async (id) => {
    const [rows] = await db.query(
      "SELECT COUNT(*) as count FROM PHIEU_XUAT WHERE MaNhanVien = ?",
      [id]
    );
    return rows[0].count;
  },

  delete: async (id, connection) => {
    const [result] = await connection.query(
      "DELETE FROM NHAN_VIEN WHERE Id_NhanVien = ?",
      [id]
    );
    return result;
  },
};

module.exports = NhanVien;

const db = require("../config/db");

const NhaSanXuat = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM NHA_SAN_XUAT");
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM NHA_SAN_XUAT WHERE Id_NhaSanXuat = ?",
      [id]
    );
    return rows;
  },

  create: async (data, connection) => {
    const [result] = await connection.query(
      "INSERT INTO NHA_SAN_XUAT SET ?",
      data
    );
    return result;
  },

  update: async (id, data, connection) => {
    const [result] = await connection.query(
      "UPDATE NHA_SAN_XUAT SET ? WHERE Id_NhaSanXuat = ?",
      [data, id]
    );
    return result;
  },

  checkUsage: async (id) => {
    const [rows] = await db.query(
      "SELECT COUNT(*) as count FROM HANG_HOA WHERE Id_NhaSanXuat = ?",
      [id]
    );
    return rows[0].count;
  },

  delete: async (id, connection) => {
    const [result] = await connection.query(
      "DELETE FROM NHA_SAN_XUAT WHERE Id_NhaSanXuat = ?",
      [id]
    );
    return result;
  },
};

module.exports = NhaSanXuat;

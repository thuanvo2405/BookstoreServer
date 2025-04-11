const db = require("../config/db");

const LoaiHangHoa = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM LOAI_HANG_HOA");
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM LOAI_HANG_HOA WHERE Id_LoaiHangHoa = ?",
      [id]
    );
    return rows;
  },

  create: async (data, connection) => {
    const [result] = await connection.query(
      "INSERT INTO LOAI_HANG_HOA SET ?",
      data
    );
    return result;
  },

  update: async (id, data, connection) => {
    const [result] = await connection.query(
      "UPDATE LOAI_HANG_HOA SET ? WHERE Id_LoaiHangHoa = ?",
      [data, id]
    );
    return result;
  },

  checkUsage: async (id) => {
    const [rows] = await db.query(
      "SELECT COUNT(*) as count FROM HANG_HOA WHERE Id_LoaiHangHoa = ?",
      [id]
    );
    return rows[0].count;
  },

  delete: async (id, connection) => {
    const [result] = await connection.query(
      "DELETE FROM LOAI_HANG_HOA WHERE Id_LoaiHangHoa = ?",
      [id]
    );
    return result;
  },
};

module.exports = LoaiHangHoa;

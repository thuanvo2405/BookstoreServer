const db = require("../config/db");

const HoaDon = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM HOA_DON");
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM HOA_DON WHERE Id_HoaDon = ?", [
      id,
    ]);
    return rows;
  },

  create: async (data, connection) => {
    const [result] = await connection.query("INSERT INTO HOA_DON SET ?", data);
    return result;
  },

  update: async (id, data, connection) => {
    const [result] = await connection.query(
      "UPDATE HOA_DON SET ? WHERE Id_HoaDon = ?",
      [data, id]
    );
    return result;
  },

  delete: async (id, connection) => {
    const [result] = await connection.query(
      "DELETE FROM HOA_DON WHERE Id_HoaDon = ?",
      [id]
    );
    return result;
  },
};

module.exports = HoaDon;

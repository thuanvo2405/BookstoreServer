const db = require("../config/db");

const HangHoa = {
  getAll: async () => {
    const [rows] = await db.query(
      `SELECT hh.*, lhh.TenLoaiHangHoa, nsx.TenNhaSanXuat 
       FROM HANG_HOA hh 
       LEFT JOIN LOAI_HANG_HOA lhh ON hh.Id_LoaiHangHoa = lhh.Id_LoaiHangHoa 
       LEFT JOIN NHA_SAN_XUAT nsx ON hh.Id_NhaSanXuat = nsx.Id_NhaSanXuat`
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      `SELECT hh.*, lhh.TenLoaiHangHoa, nsx.TenNhaSanXuat 
       FROM HANG_HOA hh 
       LEFT JOIN LOAI_HANG_HOA lhh ON hh.Id_LoaiHangHoa = lhh.Id_LoaiHangHoa 
       LEFT JOIN NHA_SAN_XUAT nsx ON hh.Id_NhaSanXuat = nsx.Id_NhaSanXuat 
       WHERE hh.Id_HangHoa = ?`,
      [id]
    );
    return rows;
  },

  create: async (data, connection) => {
    const [result] = await connection.query("INSERT INTO HANG_HOA SET ?", data);
    return result;
  },

  update: async (id, data, connection) => {
    if (
      typeof data.SoLuongTonKho === "string" &&
      data.SoLuongTonKho.includes("SoLuongTonKho")
    ) {
      const [result] = await connection.query(
        `UPDATE HANG_HOA SET SoLuongTonKho = ${data.SoLuongTonKho} WHERE Id_HangHoa = ?`,
        [id]
      );
      return result;
    }
    const [result] = await connection.query(
      "UPDATE HANG_HOA SET ? WHERE Id_HangHoa = ?",
      [data, id]
    );
    return result;
  },

  delete: async (id, connection) => {
    const [result] = await connection.query(
      "DELETE FROM HANG_HOA WHERE Id_HangHoa = ?",
      [id]
    );
    return result;
  },
};

module.exports = HangHoa;

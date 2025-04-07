const db = require("../config/db");

const HangHoa = {
  getAll: (callback) => {
    db.query(
      `SELECT hh.*, lhh.TenLoaiHangHoa, nsx.TenNhaSanXuat 
       FROM HANG_HOA hh 
       LEFT JOIN LOAI_HANG_HOA lhh ON hh.Id_LoaiHangHoa = lhh.Id_LoaiHangHoa 
       LEFT JOIN NHA_SAN_XUAT nsx ON hh.Id_NhaSanXuat = nsx.Id_NhaSanXuat`,
      callback
    );
  },

  getById: (id, callback) => {
    db.query(
      `SELECT hh.*, lhh.TenLoaiHangHoa, nsx.TenNhaSanXuat 
       FROM HANG_HOA hh 
       LEFT JOIN LOAI_HANG_HOA lhh ON hh.Id_LoaiHangHoa = lhh.Id_LoaiHangHoa 
       LEFT JOIN NHA_SAN_XUAT nsx ON hh.Id_NhaSanXuat = nsx.Id_NhaSanXuat 
       WHERE hh.Id_HangHoa = ?`,
      [id],
      callback
    );
  },

  create: (data, callback) => {
    db.query("INSERT INTO HANG_HOA SET ?", data, callback);
  },

  update: (id, data, callback) => {
    // Nếu data chứa biểu thức SQL (như SoLuongTonKho = SoLuongTonKho - X)
    if (
      typeof data.SoLuongTonKho === "string" &&
      data.SoLuongTonKho.includes("SoLuongTonKho")
    ) {
      db.query(
        `UPDATE HANG_HOA SET SoLuongTonKho = ${data.SoLuongTonKho} WHERE Id_HangHoa = ?`,
        [id],
        callback
      );
    } else {
      db.query(
        "UPDATE HANG_HOA SET ? WHERE Id_HangHoa = ?",
        [data, id],
        callback
      );
    }
  },

  delete: (id, callback) => {
    db.query("DELETE FROM HANG_HOA WHERE Id_HangHoa = ?", [id], callback);
  },
};

module.exports = HangHoa;

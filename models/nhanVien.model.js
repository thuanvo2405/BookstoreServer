const db = require("../config/db");

const NhanVien = {
  getAll: (callback) => {
    db.query("SELECT * FROM NHAN_VIEN", callback);
  },

  getById: (id, callback) => {
    db.query("SELECT * FROM NHAN_VIEN WHERE Id_NhanVien = ?", [id], callback);
  },

  create: (data, callback) => {
    db.query("INSERT INTO NHAN_VIEN SET ?", data, callback);
  },

  update: (id, data, callback) => {
    db.query(
      "UPDATE NHAN_VIEN SET ? WHERE Id_NhanVien = ?",
      [data, id],
      callback
    );
  },

  checkUsage: (id, callback) => {
    db.query(
      "SELECT COUNT(*) as count FROM PHIEU_XUAT WHERE MaNhanVien = ?",
      [id],
      (err, result) => {
        if (err) return callback(err);
        callback(null, result[0].count);
      }
    );
  },

  delete: (id, callback) => {
    db.query("DELETE FROM NHAN_VIEN WHERE Id_NhanVien = ?", [id], callback);
  },
};

module.exports = NhanVien;

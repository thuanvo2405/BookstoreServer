const db = require("../config/db");

const KhachHang = {
  getAll: (callback) => {
    db.query("SELECT * FROM KHACH_HANG", callback);
  },

  getById: (id, callback) => {
    db.query("SELECT * FROM KHACH_HANG WHERE Id_KhachHang = ?", [id], callback);
  },

  create: (data, callback) => {
    db.query("INSERT INTO KHACH_HANG SET ?", data, callback);
  },

  update: (id, data, callback) => {
    db.query(
      "UPDATE KHACH_HANG SET ? WHERE Id_KhachHang = ?",
      [data, id],
      callback
    );
  },

  checkUsage: (id, callback) => {
    db.query(
      "SELECT COUNT(*) as count FROM PHIEU_XUAT WHERE MaKhachHang = ?",
      [id],
      (err, result) => {
        if (err) return callback(err);
        callback(null, result[0].count);
      }
    );
  },

  delete: (id, callback) => {
    db.query("DELETE FROM KHACH_HANG WHERE Id_KhachHang = ?", [id], callback);
  },
};

module.exports = KhachHang;

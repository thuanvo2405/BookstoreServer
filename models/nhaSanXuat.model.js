const db = require("../config/db");

const NhaSanXuat = {
  getAll: (callback) => {
    db.query("SELECT * FROM NHA_SAN_XUAT", callback);
  },

  getById: (id, callback) => {
    db.query(
      "SELECT * FROM NHA_SAN_XUAT WHERE Id_NhaSanXuat = ?",
      [id],
      callback
    );
  },

  create: (data, callback) => {
    db.query("INSERT INTO NHA_SAN_XUAT SET ?", data, callback);
  },

  update: (id, data, callback) => {
    db.query(
      "UPDATE NHA_SAN_XUAT SET ? WHERE Id_NhaSanXuat = ?",
      [data, id],
      callback
    );
  },

  // Kiểm tra xem nhà sản xuất có đang được sử dụng trong bảng HANG_HOA không
  checkUsage: (id, callback) => {
    db.query(
      "SELECT COUNT(*) as count FROM HANG_HOA WHERE Id_NhaSanXuat = ?",
      [id],
      (err, result) => {
        if (err) return callback(err);
        callback(null, result[0].count);
      }
    );
  },

  delete: (id, callback) => {
    db.query(
      "DELETE FROM NHA_SAN_XUAT WHERE Id_NhaSanXuat = ?",
      [id],
      callback
    );
  },
};

module.exports = NhaSanXuat;

const db = require("../config/db");

const LoaiHangHoa = {
  getAll: (callback) => {
    db.query("SELECT * FROM LOAI_HANG_HOA", callback);
  },

  getById: (id, callback) => {
    db.query(
      "SELECT * FROM LOAI_HANG_HOA WHERE Id_LoaiHangHoa = ?",
      [id],
      callback
    );
  },

  create: (data, callback) => {
    db.query("INSERT INTO LOAI_HANG_HOA SET ?", data, callback);
  },

  update: (id, data, callback) => {
    db.query(
      "UPDATE LOAI_HANG_HOA SET ? WHERE Id_LoaiHangHoa = ?",
      [data, id],
      callback
    );
  },

  // Kiểm tra xem loại hàng hóa có đang được sử dụng trong bảng HANG_HOA không
  checkUsage: (id, callback) => {
    db.query(
      "SELECT COUNT(*) as count FROM HANG_HOA WHERE Id_LoaiHangHoa = ?",
      [id],
      (err, result) => {
        if (err) return callback(err);
        callback(null, result[0].count);
      }
    );
  },

  delete: (id, callback) => {
    db.query(
      "DELETE FROM LOAI_HANG_HOA WHERE Id_LoaiHangHoa = ?",
      [id],
      callback
    );
  },
};

module.exports = LoaiHangHoa;

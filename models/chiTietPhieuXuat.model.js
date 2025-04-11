const db = require("../config/db");

const ChiTietPhieuXuat = {
  getAll: (callback) => {
    db.query(
      `SELECT ctpx.*, hh.TenHangHoa 
       FROM CHI_TIET_PHIEU_XUAT ctpx 
       JOIN HANG_HOA hh ON ctpx.MaHangHoa = hh.Id_HangHoa`,
      callback
    );
  },

  getByPhieuXuatId: (idPhieuXuat, callback) => {
    db.query(
      `SELECT ctpx.*, hh.TenHangHoa 
       FROM CHI_TIET_PHIEU_XUAT ctpx 
       JOIN HANG_HOA hh ON ctpx.MaHangHoa = hh.Id_HangHoa 
       WHERE ctpx.MaPhieuXuat = ?`,
      [idPhieuXuat],
      callback
    );
  },

  create: (data, callback) => {
    db.query("INSERT INTO CHI_TIET_PHIEU_XUAT SET ?", data, callback);
  },

  update: (id, data, callback) => {
    db.query(
      "UPDATE CHI_TIET_PHIEU_XUAT SET ? WHERE Id_ChiTietPhieuXuat = ?",
      [data, id],
      callback
    );
  },

  delete: (id, callback) => {
    db.query(
      "DELETE FROM CHI_TIET_PHIEU_XUAT WHERE Id_ChiTietPhieuXuat = ?",
      [id],
      callback
    );
  },

  deleteByPhieuXuatId: (idPhieuXuat, callback) => {
    db.query(
      "DELETE FROM CHI_TIET_PHIEU_XUAT WHERE MaPhieuXuat = ?",
      [idPhieuXuat],
      callback
    );
  },
};

module.exports = ChiTietPhieuXuat;

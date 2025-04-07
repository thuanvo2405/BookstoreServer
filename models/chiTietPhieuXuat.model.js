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
    db.query(
      "INSERT INTO CHI_TIET_PHIEU_XUAT (MaPhieuXuat, MaHangHoa, DonGia, SoLuong, PhuongThucThanhToan) VALUES (?, ?, ?, ?, ?)",
      [
        data.MaPhieuXuat,
        data.MaHangHoa,
        data.DonGia,
        data.SoLuong,
        data.PhuongThucThanhToan,
      ],
      callback
    );
  },

  update: (idPhieuXuat, idHangHoa, data, callback) => {
    db.query(
      "UPDATE CHI_TIET_PHIEU_XUAT SET ? WHERE MaPhieuXuat = ? AND MaHangHoa = ?",
      [data, idPhieuXuat, idHangHoa],
      callback
    );
  },

  delete: (idPhieuXuat, idHangHoa, callback) => {
    db.query(
      "DELETE FROM CHI_TIET_PHIEU_XUAT WHERE MaPhieuXuat = ? AND MaHangHoa = ?",
      [idPhieuXuat, idHangHoa],
      callback
    );
  },

  deleteByPhieuXuat: (idPhieuXuat, callback) => {
    db.query(
      "DELETE FROM CHI_TIET_PHIEU_XUAT WHERE MaPhieuXuat = ?",
      [idPhieuXuat],
      callback
    );
  },
};

module.exports = ChiTietPhieuXuat;

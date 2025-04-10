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
};
module.exports = ChiTietPhieuXuat;

const db = require("../config/db");

const PhieuXuatHang = {
  getAll: (callback) => {
    db.query(
      `SELECT pxh.*, nv.HoTen AS TenNhanVien, kh.HoTen AS TenKhachHang 
       FROM PHIEU_XUAT pxh 
       LEFT JOIN NHAN_VIEN nv ON pxh.MaNhanVien = nv.Id_NhanVien 
       LEFT JOIN KHACH_HANG kh ON pxh.MaKhachHang = kh.Id_KhachHang`,
      callback
    );
  },

  getById: (id, callback) => {
    db.query(
      `SELECT pxh.*, nv.HoTen AS TenNhanVien, kh.HoTen AS TenKhachHang 
       FROM PHIEU_XUAT pxh 
       LEFT JOIN NHAN_VIEN nv ON pxh.MaNhanVien = nv.Id_NhanVien 
       LEFT JOIN KHACH_HANG kh ON pxh.MaKhachHang = kh.Id_KhachHang 
       WHERE pxh.Id_PhieuXuat = ?`,
      [id],
      callback
    );
  },

  create: (data, callback) => {
    db.query("INSERT INTO PHIEU_XUAT SET ?", data, callback);
  },

  update: (id, data, callback) => {
    db.query(
      "UPDATE PHIEU_XUAT SET ? WHERE Id_PhieuXuat = ?",
      [data, id],
      callback
    );
  },

  delete: (id, callback) => {
    db.query("DELETE FROM PHIEU_XUAT WHERE Id_PhieuXuat = ?", [id], callback);
  },

  getDetails: (id, callback) => {
    db.query(
      `SELECT ctpx.*, hh.TenHangHoa 
       FROM CHI_TIET_PHIEU_XUAT ctpx 
       JOIN HANG_HOA hh ON ctpx.MaHangHoa = hh.Id_HangHoa 
       WHERE ctpx.MaPhieuXuat = ?`,
      [id],
      callback
    );
  },
};

module.exports = PhieuXuatHang;

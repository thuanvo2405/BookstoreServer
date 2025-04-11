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

  create: (data, connection, callback) => {
    connection.query("INSERT INTO PHIEU_XUAT SET ?", data, callback);
  },

  update: (id, data, connection, callback) => {
    connection.query(
      "UPDATE PHIEU_XUAT SET ? WHERE Id_PhieuXuat = ?",
      [data, id],
      callback
    );
  },

  delete: (id, connection, callback) => {
    connection.query(
      "DELETE FROM PHIEU_XUAT WHERE Id_PhieuXuat = ?",
      [id],
      callback
    );
  },
};

module.exports = PhieuXuatHang;

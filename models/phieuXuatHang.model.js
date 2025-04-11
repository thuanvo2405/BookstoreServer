const db = require("../config/db");

const PhieuXuatHang = {
  getAll: async () => {
    const [rows] = await db.query(
      `SELECT pxh.*, nv.HoTen AS TenNhanVien, kh.HoTen AS TenKhachHang 
       FROM PHIEU_XUAT pxh 
       LEFT JOIN NHAN_VIEN nv ON pxh.MaNhanVien = nv.Id_NhanVien 
       LEFT JOIN KHACH_HANG kh ON pxh.MaKhachHang = kh.Id_KhachHang`
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      `SELECT pxh.*, nv.HoTen AS TenNhanVien, kh.HoTen AS TenKhachHang 
       FROM PHIEU_XUAT pxh 
       LEFT JOIN NHAN_VIEN nv ON pxh.MaNhanVien = nv.Id_NhanVien 
       LEFT JOIN KHACH_HANG kh ON pxh.MaKhachHang = kh.Id_KhachHang 
       WHERE pxh.Id_PhieuXuat = ?`,
      [id]
    );
    return rows;
  },

  create: async (data, connection) => {
    const [result] = await connection.query(
      "INSERT INTO PHIEU_XUAT SET ?",
      data
    );
    return result;
  },

  update: async (id, data, connection) => {
    const [result] = await connection.query(
      "UPDATE PHIEU_XUAT SET ? WHERE Id_PhieuXuat = ?",
      [data, id]
    );
    return result;
  },

  delete: async (id, connection) => {
    const [result] = await connection.query(
      "DELETE FROM PHIEU_XUAT WHERE Id_PhieuXuat = ?",
      [id]
    );
    return result;
  },
};

module.exports = PhieuXuatHang;

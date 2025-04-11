const db = require("../config/db");

const ChiTietPhieuXuat = {
  getAll: async () => {
    const [rows] = await db.query(
      `SELECT ctpx.*, hh.TenHangHoa 
       FROM CHI_TIET_PHIEU_XUAT ctpx 
       JOIN HANG_HOA hh ON ctpx.MaHangHoa = hh.Id_HangHoa`
    );
    return rows;
  },

  getByPhieuXuatId: async (idPhieuXuat) => {
    const [rows] = await db.query(
      `SELECT ctpx.*, hh.TenHangHoa 
       FROM CHI_TIET_PHIEU_XUAT ctpx 
       JOIN HANG_HOA hh ON ctpx.MaHangHoa = hh.Id_HangHoa 
       WHERE ctpx.MaPhieuXuat = ?`,
      [idPhieuXuat]
    );
    return rows;
  },

  create: async (data, connection) => {
    const [result] = await connection.query(
      "INSERT INTO CHI_TIET_PHIEU_XUAT SET ?",
      data
    );
    return result;
  },

  update: async (id, data, connection) => {
    const [result] = await connection.query(
      "UPDATE CHI_TIET_PHIEU_XUAT SET ? WHERE Id_ChiTietPhieuXuat = ?",
      [data, id]
    );
    return result;
  },

  delete: async (id, connection) => {
    const [result] = await connection.query(
      "DELETE FROM CHI_TIET_PHIEU_XUAT WHERE Id_ChiTietPhieuXuat = ?",
      [id]
    );
    return result;
  },

  deleteByPhieuXuatId: async (idPhieuXuat, connection) => {
    const [result] = await connection.query(
      "DELETE FROM CHI_TIET_PHIEU_XUAT WHERE MaPhieuXuat = ?",
      [idPhieuXuat]
    );
    return result;
  },
};

module.exports = ChiTietPhieuXuat;

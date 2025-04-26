const db = require("../config/db");

const HoaDon = {
  create: async (hoaDon) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        `INSERT INTO HOA_DON (NgayXuat, TongTien, GhiChu, Id_PhieuXuat)
         VALUES (?, ?, ?, ?)`,
        [hoaDon.NgayXuat, hoaDon.TongTien, hoaDon.GhiChu, hoaDon.Id_PhieuXuat]
      );

      await conn.commit();
      return { id: result.insertId };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  getAll: async () => {
    const [rows] = await db.query(`
      SELECT 
        hd.Id_HoaDon,
        hd.NgayXuat,
        hd.TongTien,
        hd.GhiChu
      FROM HOA_DON hd
    `);
    return rows;
  },

  getByIdWithPhieuXuat: async (id) => {
    const [hoaDonRows] = await db.query(
      `
      SELECT 
        hd.Id_HoaDon,
        hd.NgayXuat,
        hd.TongTien,
        hd.GhiChu,
        hd.Id_PhieuXuat
      FROM HOA_DON hd
      WHERE hd.Id_HoaDon = ?
    `,
      [id]
    );

    if (hoaDonRows.length === 0) {
      throw new Error("Hóa đơn không tồn tại");
    }

    const hoaDon = hoaDonRows[0];

    // Lấy thông tin phiếu xuất liên quan
    const [phieuXuatRows] = await db.query(
      `
      SELECT 
        px.Id_PhieuXuat,
        px.NgayXuat,
        px.GhiChu,
        px.MaNhanVien,
        nv.HoTen AS TenNhanVien,
        px.MaKhachHang,
        kh.HoTen AS TenKhachHang,
        px.PhuongThucThanhToan
      FROM PHIEU_XUAT px
      LEFT JOIN NHAN_VIEN nv ON px.MaNhanVien = nv.Id_NhanVien
      LEFT JOIN KHACH_HANG kh ON px.MaKhachHang = kh.Id_KhachHang
      WHERE px.Id_PhieuXuat = ?
    `,
      [hoaDon.Id_PhieuXuat]
    );

    // Lấy chi tiết phiếu xuất
    const [chiTietPhieuXuatRows] = await db.query(
      `
      SELECT 
        ctpx.MaPhieuXuat,
        ctpx.MaHangHoa,
        hh.TenHangHoa,
        ctpx.DonGia,
        ctpx.SoLuong
      FROM CHI_TIET_PHIEU_XUAT ctpx
      JOIN HANG_HOA hh ON ctpx.MaHangHoa = hh.Id_HangHoa
      WHERE ctpx.MaPhieuXuat = ?
    `,
      [hoaDon.Id_PhieuXuat]
    );

    // Tổ chức dữ liệu
    hoaDon.phieuXuat = phieuXuatRows.map((px) => ({
      ...px,
      chiTiet: chiTietPhieuXuatRows.filter(
        (ct) => ct.MaPhieuXuat === px.Id_PhieuXuat
      ),
    }));

    return hoaDon;
  },
  deleteById: async (id) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        `DELETE FROM HOA_DON WHERE Id_HoaDon = ?`,
        [id]
      );

      await conn.commit();
      return result.affectedRows > 0;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = HoaDon;

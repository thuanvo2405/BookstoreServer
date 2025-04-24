const db = require("../config/db");

const checkInventory = async (maHangHoa, soLuong) => {
  const [results] = await db.query(
    "SELECT SoLuongTonKho FROM HANG_HOA WHERE Id_HangHoa = ?",
    [maHangHoa]
  );

  if (results.length === 0) {
    throw new Error("Hàng hóa không tồn tại");
  }

  const tonKho = results[0].SoLuongTonKho;
  if (tonKho < soLuong) {
    throw new Error("Không đủ hàng trong kho");
  }

  return true;
};

const createPhieuXuat = async (phieu, chiTiet) => {
  const conn = await db.getConnection(); // lấy kết nối từ pool

  try {
    await conn.beginTransaction();

    // 1. Tạo phiếu xuất (không có id_HoaDon)
    const [result] = await conn.query(
      `INSERT INTO PHIEU_XUAT (NgayXuat, GhiChu, MaNhanVien, MaKhachHang, PhuongThucThanhToan)
       VALUES (?, ?, ?, ?, ?)`,
      [
        phieu.NgayXuat,
        phieu.GhiChu,
        phieu.MaNhanVien,
        phieu.MaKhachHang,
        phieu.PhuongThucThanhToan,
      ]
    );
    const maPhieu = result.insertId;

    // 2. Thêm chi tiết phiếu
    const values = chiTiet.map((item) => [
      maPhieu,
      item.MaHangHoa,
      item.DonGia,
      item.SoLuong,
    ]);
    await conn.query(
      `INSERT INTO CHI_TIET_PHIEU_XUAT (MaPhieuXuat, MaHangHoa, DonGia, SoLuong)
       VALUES ?`,
      [values]
    );

    // 3. Cập nhật tồn kho
    for (let item of chiTiet) {
      await conn.query(
        `UPDATE HANG_HOA SET SoLuongTonKho = SoLuongTonKho - ? WHERE Id_HangHoa = ?`,
        [item.SoLuong, item.MaHangHoa]
      );
    }

    await conn.commit();
    return { maPhieu };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release(); // luôn giải phóng kết nối
  }
};

module.exports = { checkInventory, createPhieuXuat };

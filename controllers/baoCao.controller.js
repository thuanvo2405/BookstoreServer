const db = require("../config/db");

// 1. Báo cáo tổng doanh thu
const getDoanhThu = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const [results] = await db.query(
      `
      SELECT 
        px.Id_PhieuXuat,
        px.NgayXuat,
        SUM(ct.DonGia * ct.SoLuong) AS TongTien,
        px.GhiChu,
        nv.HoTen AS TenNhanVien
      FROM PHIEU_XUAT px
      JOIN CHI_TIET_PHIEU_XUAT ct ON px.Id_PhieuXuat = ct.MaPhieuXuat
      LEFT JOIN NHAN_VIEN nv ON px.MaNhanVien = nv.Id_NhanVien
      WHERE px.NgayXuat BETWEEN ? AND ?
      GROUP BY px.Id_PhieuXuat
    `,
      [startDate, endDate]
    );

    const total = results.reduce((acc, cur) => acc + cur.TongTien, 0) || 0;

    res.json({
      total,
      phieuXuatList: results.map((p) => ({
        ...p,
        TongTien: Number(p.TongTien),
      })),
    });
  } catch (error) {
    console.error("Lỗi báo cáo doanh thu:", error);
    res.status(500).json({ error: error.message });
  }
};

// 2. Doanh thu theo thời gian (cho biểu đồ)
const getDoanhThuTheoThoiGian = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    let format, groupBy;
    switch (type) {
      case "ngay":
        format = "%Y-%m-%d";
        groupBy = "DATE(px.NgayXuat)";
        break;
      case "tuan":
        format = "%Y-%u";
        groupBy = "YEARWEEK(px.NgayXuat)";
        break;
      case "thang":
        format = "%Y-%m";
        groupBy = "MONTH(px.NgayXuat)";
        break;
      case "nam":
        format = "%Y";
        groupBy = "YEAR(px.NgayXuat)";
        break;
      default:
        return res.status(400).json({ error: "Loại báo cáo không hợp lệ" });
    }
    const [results] = await db.query(
      `SELECT 
         DATE_FORMAT(px.NgayXuat, ?) AS date,
         SUM(ct.DonGia * ct.SoLuong) AS value
       FROM PHIEU_XUAT px
       JOIN CHI_TIET_PHIEU_XUAT ct ON px.Id_PhieuXuat = ct.MaPhieuXuat
       WHERE px.NgayXuat BETWEEN ? AND ?
       GROUP BY ${groupBy}
       ORDER BY date`,
      [format, startDate, endDate]
    );
    res.json(results.map((item) => ({ ...item, value: Number(item.value) })));
  } catch (error) {
    console.error("Lỗi báo cáo theo thời gian:", error);
    res.status(500).json({ error: error.message });
  }
};

// 3. Hàng tồn kho thấp
const getTonKhoThap = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        Id_HangHoa,
        TenHangHoa,
        SoLuongTonKho
      FROM HANG_HOA
      WHERE SoLuongTonKho < 10
      ORDER BY SoLuongTonKho ASC
    `);

    res.json(results);
  } catch (error) {
    console.error("Lỗi báo cáo tồn kho:", error);
    res.status(500).json({ error: error.message });
  }
};

// 4. Top hàng bán chạy
const getTopHangBanChay = async (req, res) => {
  try {
    const { startDate, endDate, limit = 5 } = req.query;

    const [results] = await db.query(
      `
      SELECT 
        hh.Id_HangHoa AS MaHangHoa,
        hh.TenHangHoa,
        SUM(ct.SoLuong) AS SoLuong,
        SUM(ct.DonGia * ct.SoLuong) AS DoanhThu
      FROM CHI_TIET_PHIEU_XUAT ct
      JOIN PHIEU_XUAT px ON ct.MaPhieuXuat = px.Id_PhieuXuat
      JOIN HANG_HOA hh ON ct.MaHangHoa = hh.Id_HangHoa
      WHERE px.NgayXuat BETWEEN ? AND ?
      GROUP BY hh.Id_HangHoa
      ORDER BY SoLuong DESC
      LIMIT ?
    `,
      [startDate, endDate, parseInt(limit)]
    );

    res.json(results);
  } catch (error) {
    console.error("Lỗi top hàng bán chạy:", error);
    res.status(500).json({ error: error.message });
  }
};

// 5. Nhân viên bán tốt nhất
const getNhanVienBanTotNhat = async (req, res) => {
  try {
    const { startDate, endDate, limit = 5 } = req.query;

    const [results] = await db.query(
      `
      SELECT 
        nv.Id_NhanVien AS MaNhanVien,
        nv.HoTen AS TenNhanVien,
        COUNT(px.Id_PhieuXuat) AS SoPhieuXuat,
        SUM(ct.DonGia * ct.SoLuong) AS DoanhThu
      FROM PHIEU_XUAT px
      JOIN CHI_TIET_PHIEU_XUAT ct ON px.Id_PhieuXuat = ct.MaPhieuXuat
      JOIN NHAN_VIEN nv ON px.MaNhanVien = nv.Id_NhanVien
      WHERE px.NgayXuat BETWEEN ? AND ?
      GROUP BY nv.Id_NhanVien
      ORDER BY DoanhThu DESC
      LIMIT ?
    `,
      [startDate, endDate, parseInt(limit)]
    );

    res.json(results);
  } catch (error) {
    console.error("Lỗi nhân viên bán tốt:", error);
    res.status(500).json({ error: error.message });
  }
};

// 6. Doanh thu theo loại hàng
const getDoanhThuTheoLoai = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const [doanhThu] = await db.query(
      `SELECT 
         lh.TenLoai AS type,
         SUM(ct.DonGia * ct.SoLuong) AS value
       FROM CHI_TIET_PHIEU_XUAT ct
       JOIN HANG_HOA hh ON ct.MaHangHoa = hh.Id_HangHoa
       JOIN LOAI_HANG_HOA lh ON hh.MaLoai = lh.Id_Loai
       JOIN PHIEU_XUAT px ON ct.MaPhieuXuat = px.Id_PhieuXuat
       WHERE px.NgayXuat BETWEEN ? AND ?
       GROUP BY lh.Id_Loai`,
      [startDate, endDate]
    );
    const [soLuong] = await db.query(
      `SELECT 
         lh.TenLoai AS type,
         SUM(ct.SoLuong) AS value
       FROM CHI_TIET_PHIEU_XUAT ct
       JOIN HANG_HOA hh ON ct.MaHangHoa = hh.Id_HangHoa
       JOIN LOAI_HANG_HOA lh ON hh.MaLoai = lh.Id_Loai
       JOIN PHIEU_XUAT px ON ct.MaPhieuXuat = px.Id_PhieuXuat
       WHERE px.NgayXuat BETWEEN ? AND ?
       GROUP BY lh.Id_Loai`,
      [startDate, endDate]
    );
    res.json({ doanhThuTheoLoai: doanhThu, soLuongTheoLoai: soLuong });
  } catch (error) {
    console.error("Lỗi báo cáo theo loại:", error);
    res.status(500).json({ error: error.message });
  }
};

// 7. Doanh thu theo phương thức thanh toán
const getDoanhThuTheoPhuongThuc = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const [results] = await db.query(
      `
      SELECT 
        PhuongThucThanhToan AS type,
        SUM(ct.DonGia * ct.SoLuong) AS value
      FROM PHIEU_XUAT px
      JOIN CHI_TIET_PHIEU_XUAT ct ON px.Id_PhieuXuat = ct.MaPhieuXuat
      WHERE px.NgayXuat BETWEEN ? AND ?
      GROUP BY PhuongThucThanhToan
    `,
      [startDate, endDate]
    );

    res.json(results);
  } catch (error) {
    console.error("Lỗi báo cáo phương thức:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDoanhThu,
  getDoanhThuTheoThoiGian,
  getTonKhoThap,
  getTopHangBanChay,
  getNhanVienBanTotNhat,
  getDoanhThuTheoLoai,
  getDoanhThuTheoPhuongThuc,
};

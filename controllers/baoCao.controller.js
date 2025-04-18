const db = require("../config/db");
const moment = require("moment");

// 1. Tổng doanh thu và danh sách phiếu xuất
const getDoanhThu = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const [results] = await db.query(
      `
      SELECT 
        px.Id_PhieuXuat,
        px.NgayXuat,
        SUM(ctpx.DonGia * ctpx.SoLuong) AS TongTien,
        px.GhiChu,
        nv.HoTen AS TenNhanVien
      FROM PHIEU_XUAT px
      LEFT JOIN CHI_TIET_PHIEU_XUAT ctpx ON px.Id_PhieuXuat = ctpx.MaPhieuXuat
      LEFT JOIN NHAN_VIEN nv ON px.MaNhanVien = nv.Id_NhanVien
      WHERE px.NgayXuat BETWEEN ? AND ?
      GROUP BY px.Id_PhieuXuat
    `,
      [startDate, endDate]
    );

    const total = results.reduce((sum, item) => sum + item.TongTien, 0);

    res.json({
      total,
      phieuXuatList: results,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Doanh thu theo thời gian (ngày/tuần/tháng/năm)
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
        groupBy = "WEEK(px.NgayXuat)";
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
        return res.status(400).json({ error: "Invalid type" });
    }

    const [results] = await db.query(
      `
      SELECT 
        DATE_FORMAT(px.NgayXuat, ?) AS date,
        SUM(ctpx.DonGia * ctpx.SoLuong) AS value
      FROM PHIEU_XUAT px
      JOIN CHI_TIET_PHIEU_XUAT ctpx ON px.Id_PhieuXuat = ctpx.MaPhieuXuat
      WHERE px.NgayXuat BETWEEN ? AND ?
      GROUP BY ${groupBy}
      ORDER BY px.NgayXuat
    `,
      [format, startDate, endDate]
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Hàng tồn kho thấp (<10)
const getTonKhoThap = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        Id_HangHoa,
        TenHangHoa,
        SoLuongTonKho 
      FROM HANG_HOA 
      WHERE SoLuongTonKho < 10
    `);

    res.json(results);
  } catch (error) {
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
        SUM(ctpx.SoLuong) AS SoLuong,
        SUM(ctpx.DonGia * ctpx.SoLuong) AS DoanhThu
      FROM CHI_TIET_PHIEU_XUAT ctpx
      JOIN HANG_HOA hh ON ctpx.MaHangHoa = hh.Id_HangHoa
      JOIN PHIEU_XUAT px ON ctpx.MaPhieuXuat = px.Id_PhieuXuat
      WHERE px.NgayXuat BETWEEN ? AND ?
      GROUP BY hh.Id_HangHoa
      ORDER BY SoLuong DESC
      LIMIT ?
    `,
      [startDate, endDate, parseInt(limit)]
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Top nhân viên bán tốt
const getNhanVienBanTotNhat = async (req, res) => {
  try {
    const { startDate, endDate, limit = 5 } = req.query;

    const [results] = await db.query(
      `
      SELECT 
        nv.Id_NhanVien AS MaNhanVien,
        nv.HoTen AS TenNhanVien,
        COUNT(px.Id_PhieuXuat) AS SoPhieuXuat,
        SUM(ctpx.DonGia * ctpx.SoLuong) AS DoanhThu
      FROM PHIEU_XUAT px
      JOIN NHAN_VIEN nv ON px.MaNhanVien = nv.Id_NhanVien
      JOIN CHI_TIET_PHIEU_XUAT ctpx ON px.Id_PhieuXuat = ctpx.MaPhieuXuat
      WHERE px.NgayXuat BETWEEN ? AND ?
      GROUP BY nv.Id_NhanVien
      ORDER BY DoanhThu DESC
      LIMIT ?
    `,
      [startDate, endDate, parseInt(limit)]
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Doanh thu theo loại hàng
const getDoanhThuTheoLoai = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const [doanhThu] = await db.query(
      `
      SELECT 
        lhh.TenLoai AS type,
        SUM(ctpx.DonGia * ctpx.SoLuong) AS value
      FROM CHI_TIET_PHIEU_XUAT ctpx
      JOIN HANG_HOA hh ON ctpx.MaHangHoa = hh.Id_HangHoa
      JOIN LOAI_HANG_HOA lhh ON hh.MaLoai = lhh.Id_Loai
      JOIN PHIEU_XUAT px ON ctpx.MaPhieuXuat = px.Id_PhieuXuat
      WHERE px.NgayXuat BETWEEN ? AND ?
      GROUP BY lhh.Id_Loai
    `,
      [startDate, endDate]
    );

    const [soLuong] = await db.query(
      `
      SELECT 
        lhh.TenLoai AS type,
        SUM(ctpx.SoLuong) AS value
      FROM CHI_TIET_PHIEU_XUAT ctpx
      JOIN HANG_HOA hh ON ctpx.MaHangHoa = hh.Id_HangHoa
      JOIN LOAI_HANG_HOA lhh ON hh.MaLoai = lhh.Id_Loai
      JOIN PHIEU_XUAT px ON ctpx.MaPhieuXuat = px.Id_PhieuXuat
      WHERE px.NgayXuat BETWEEN ? AND ?
      GROUP BY lhh.Id_Loai
    `,
      [startDate, endDate]
    );

    res.json({ doanhThuTheoLoai: doanhThu, soLuongTheoLoai: soLuong });
  } catch (error) {
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
        SUM(ctpx.DonGia * ctpx.SoLuong) AS value
      FROM PHIEU_XUAT px
      JOIN CHI_TIET_PHIEU_XUAT ctpx ON px.Id_PhieuXuat = ctpx.MaPhieuXuat
      WHERE px.NgayXuat BETWEEN ? AND ?
      GROUP BY PhuongThucThanhToan
    `,
      [startDate, endDate]
    );

    res.json(results);
  } catch (error) {
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

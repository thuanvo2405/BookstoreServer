const db = require("../config/db");

// Báo cáo doanh thu theo ngày/tháng/tuần
const getDoanhThu = async (req, res) => {
  const { type, date } = req.query;

  try {
    let query;
    let params = [date, date];
    let responseData = {};

    switch (type) {
      case "ngay":
        query = `
          SELECT 
            DATE(px.NgayXuat) AS Ngay,
            SUM(ct.SoLuong * ct.DonGia) AS DoanhThu,
            SUM(ct.SoLuong) AS TongSoLuong,
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'MaHangHoa', ct.MaHangHoa,
                'TenHangHoa', hh.TenHangHoa,
                'SoLuong', ct.SoLuong,
                'DonGia', ct.DonGia,
                'DoanhThu', ct.SoLuong * ct.DonGia
              )
            ) AS SanPham
          FROM PHIEU_XUAT px
          JOIN CHI_TIET_PHIEU_XUAT ct ON px.Id_PhieuXuat = ct.MaPhieuXuat
          JOIN HANG_HOA hh ON ct.MaHangHoa = hh.Id_HangHoa
          WHERE DATE(px.NgayXuat) = ?
          GROUP BY DATE(px.NgayXuat)
        `;
        const [dailyResults] = await db.query(query, [date]);
        responseData = dailyResults[0] || {
          Ngay: date,
          DoanhThu: 0,
          TongSoLuong: 0,
          SanPham: [],
        };
        break;

      case "thang":
        // Tổng doanh thu tháng
        query = `
          SELECT 
            MONTH(px.NgayXuat) AS Thang, 
            YEAR(px.NgayXuat) AS Nam, 
            SUM(ct.SoLuong * ct.DonGia) AS TongDoanhThu
          FROM PHIEU_XUAT px
          JOIN CHI_TIET_PHIEU_XUAT ct ON px.Id_PhieuXuat = ct.MaPhieuXuat
          WHERE MONTH(px.NgayXuat) = MONTH(?) AND YEAR(px.NgayXuat) = YEAR(?)
          GROUP BY MONTH(px.NgayXuat), YEAR(px.NgayXuat)
        `;
        const [monthTotal] = await db.query(query, params);

        // Doanh thu hàng tuần trong tháng
        query = `
          SELECT 
            WEEK(px.NgayXuat) AS Tuan, 
            YEAR(px.NgayXuat) AS Nam, 
            SUM(ct.SoLuong * ct.DonGia) AS DoanhThu
          FROM PHIEU_XUAT px
          JOIN CHI_TIET_PHIEU_XUAT ct ON px.Id_PhieuXuat = ct.MaPhieuXuat
          WHERE MONTH(px.NgayXuat) = MONTH(?) AND YEAR(px.NgayXuat) = YEAR(?)
          GROUP BY WEEK(px.NgayXuat), YEAR(px.NgayXuat)
          ORDER BY Tuan
        `;
        const [weeklyBreakdown] = await db.query(query, params);

        responseData = {
          total: monthTotal[0] || {
            Thang: new Date(date).getMonth() + 1,
            Nam: new Date(date).getFullYear(),
            TongDoanhThu: 0,
          },
          breakdown: weeklyBreakdown,
        };
        break;

      case "tuan":
        // Tổng doanh thu tuần
        query = `
          SELECT 
            WEEK(px.NgayXuat) AS Tuan, 
            YEAR(px.NgayXuat) AS Nam, 
            SUM(ct.SoLuong * ct.DonGia) AS TongDoanhThu
          FROM PHIEU_XUAT px
          JOIN CHI_TIET_PHIEU_XUAT ct ON px.Id_PhieuXuat = ct.MaPhieuXuat
          WHERE WEEK(px.NgayXuat) = WEEK(?) AND YEAR(px.NgayXuat) = YEAR(?)
          GROUP BY WEEK(px.NgayXuat), YEAR(px.NgayXuat)
        `;
        const [weekTotal] = await db.query(query, params);

        // Doanh thu hàng ngày trong tuần
        query = `
          SELECT 
            DATE(px.NgayXuat) AS Ngay, 
            SUM(ct.SoLuong * ct.DonGia) AS DoanhThu,
            SUM(ct.SoLuong) AS TongSoLuong,
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'MaHangHoa', ct.MaHangHoa,
                'TenHangHoa', hh.TenHangHoa,
                'SoLuong', ct.SoLuong,
                'DonGia', ct.DonGia,
                'DoanhThu', ct.SoLuong * ct.DonGia
              )
            ) AS SanPham
          FROM PHIEU_XUAT px
          JOIN CHI_TIET_PHIEU_XUAT ct ON px.Id_PhieuXuat = ct.MaPhieuXuat
          JOIN HANG_HOA hh ON ct.MaHangHoa = hh.Id_HangHoa
          WHERE WEEK(px.NgayXuat) = WEEK(?) AND YEAR(px.NgayXuat) = YEAR(?)
          GROUP BY DATE(px.NgayXuat)
          ORDER BY Ngay
        `;
        const [dailyBreakdown] = await db.query(query, params);

        responseData = {
          total: weekTotal[0] || {
            Tuan: Math.ceil(
              (new Date(date).getDate() +
                new Date(new Date(date).getFullYear(), 0, 1).getDay()) /
                7
            ),
            Nam: new Date(date).getFullYear(),
            TongDoanhThu: 0,
          },
          breakdown: dailyBreakdown,
        };
        break;

      default:
        return res.status(400).json({ error: "Loại báo cáo không hợp lệ" });
    }

    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Báo cáo sản phẩm bán chạy
const getSanPhamBanChay = async (req, res) => {
  const { date } = req.query; // Thêm tham số date để lọc theo thời gian
  try {
    let query = `
      SELECT 
        hh.Id_HangHoa, 
        hh.TenHangHoa, 
        SUM(ct.SoLuong) AS TongSoLuong,
        SUM(ct.SoLuong * ct.DonGia) AS DoanhThu
      FROM CHI_TIET_PHIEU_XUAT ct
      JOIN HANG_HOA hh ON ct.MaHangHoa = hh.Id_HangHoa
      JOIN PHIEU_XUAT px ON ct.MaPhieuXuat = px.Id_PhieuXuat
    `;
    let params = [];

    if (date) {
      query += ` WHERE DATE(px.NgayXuat) = ?`;
      params.push(date);
    }

    query += `
      GROUP BY hh.Id_HangHoa
      ORDER BY TongSoLuong DESC
      LIMIT 10
    `;
    const [results] = await db.query(query, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Báo cáo sản phẩm sắp hết hàng
const getSanPhamSapHet = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT Id_HangHoa, TenHangHoa, SoLuongTonKho
      FROM HANG_HOA
      WHERE SoLuongTonKho < 10
      ORDER BY SoLuongTonKho ASC
    `);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Báo cáo doanh thu theo nhân viên
const getDoanhThuNhanVien = async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ error: "Vui lòng cung cấp tháng và năm" });
  }

  try {
    const query = `
      SELECT 
        nv.Id_NhanVien,
        nv.HoTen AS TenNhanVien,
        SUM(ct.SoLuong * ct.DonGia) AS DoanhThu,
        SUM(ct.SoLuong) AS TongSoLuong
      FROM PHIEU_XUAT px
      JOIN CHI_TIET_PHIEU_XUAT ct ON px.Id_PhieuXuat = ct.MaPhieuXuat
      JOIN NHAN_VIEN nv ON px.MaNhanVien = nv.Id_NhanVien
      WHERE MONTH(px.NgayXuat) = ? AND YEAR(px.NgayXuat) = ?
      GROUP BY nv.Id_NhanVien, nv.HoTen
      ORDER BY DoanhThu DESC
    `;
    const [results] = await db.query(query, [month, year]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getDoanhThu,
  getSanPhamBanChay,
  getSanPhamSapHet,
  getDoanhThuNhanVien,
};

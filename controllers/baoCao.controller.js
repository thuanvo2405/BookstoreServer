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
          SELECT DATE(px.NgayXuat) AS Ngay, SUM(ct.SoLuong * ct.DonGia) AS DoanhThu
          FROM PHIEU_XUAT px
          JOIN CHI_TIET_PHIEU_XUAT ct ON px.Id_PhieuXuat = ct.MaPhieuXuat
          WHERE DATE(px.NgayXuat) = ?
          GROUP BY DATE(px.NgayXuat)
        `;
        const [dailyResults] = await db.query(query, [date]);
        responseData = dailyResults;
        break;

      case "thang":
        // Total revenue for the month
        query = `
          SELECT MONTH(px.NgayXuat) AS Thang, YEAR(px.NgayXuat) AS Nam, 
                 SUM(ct.SoLuong * ct.DonGia) AS TongDoanhThu
          FROM PHIEU_XUAT px
          JOIN CHI_TIET_PHIEU_XUAT ct ON px.Id_PhieuXuat = ct.MaPhieuXuat
          WHERE MONTH(px.NgayXuat) = MONTH(?) AND YEAR(px.NgayXuat) = YEAR(?)
          GROUP BY MONTH(px.NgayXuat), YEAR(px.NgayXuat)
        `;
        const [monthTotal] = await db.query(query, params);

        // Weekly revenue breakdown within the month
        query = `
          SELECT WEEK(px.NgayXuat) AS Tuan, YEAR(px.NgayXuat) AS Nam, 
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
            Thang: moment(date).month() + 1,
            Nam: moment(date).year(),
            TongDoanhThu: 0,
          },
          breakdown: weeklyBreakdown,
        };
        break;

      case "tuan":
        // Total revenue for the week
        query = `
          SELECT WEEK(px.NgayXuat) AS Tuan, YEAR(px.NgayXuat) AS Nam, 
                 SUM(ct.SoLuong * ct.DonGia) AS TongDoanhThu
          FROM PHIEU_XUAT px
          JOIN CHI_TIET_PHIEU_XUAT ct ON px.Id_PhieuXuat = ct.MaPhieuXuat
          WHERE WEEK(px.NgayXuat) = WEEK(?) AND YEAR(px.NgayXuat) = YEAR(?)
          GROUP BY WEEK(px.NgayXuat), YEAR(px.NgayXuat)
        `;
        const [weekTotal] = await db.query(query, params);

        // Daily revenue breakdown within the week
        query = `
          SELECT DATE(px.NgayXuat) AS Ngay, 
                 SUM(ct.SoLuong * ct.DonGia) AS DoanhThu
          FROM PHIEU_XUAT px
          JOIN CHI_TIET_PHIEU_XUAT ct ON px.Id_PhieuXuat = ct.MaPhieuXuat
          WHERE WEEK(px.NgayXuat) = WEEK(?) AND YEAR(px.NgayXuat) = YEAR(?)
          GROUP BY DATE(px.NgayXuat)
          ORDER BY Ngay
        `;
        const [dailyBreakdown] = await db.query(query, params);

        responseData = {
          total: weekTotal[0] || {
            Tuan: moment(date).week(),
            Nam: moment(date).year(),
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
  try {
    const [results] = await db.query(`
      SELECT hh.Id_HangHoa, hh.TenHangHoa, SUM(ct.SoLuong) AS TongSoLuong
      FROM CHI_TIET_PHIEU_XUAT ct
      JOIN HANG_HOA hh ON ct.MaHangHoa = hh.Id_HangHoa
      GROUP BY hh.Id_HangHoa
      ORDER BY TongSoLuong DESC
      LIMIT 10
    `);
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

module.exports = { getDoanhThu, getSanPhamBanChay, getSanPhamSapHet };

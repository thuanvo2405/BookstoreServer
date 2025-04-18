const db = require("../config/db");

const getChiTietByPhieuXuat = async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query(
      `
      SELECT 
        ct.MaPhieuXuat,
        ct.MaHangHoa,
        hh.TenHangHoa,
        ct.DonGia,
        ct.SoLuong
      FROM CHI_TIET_PHIEU_XUAT ct
      JOIN HANG_HOA hh ON ct.MaHangHoa = hh.Id_HangHoa
      WHERE ct.MaPhieuXuat = ?
    `,
      [id]
    );
    return res.status(200).json(results);
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết phiếu xuất:", err);
    return res.status(500).json({
      error: "Không thể lấy chi tiết phiếu xuất: " + err.message,
    });
  }
};

module.exports = { getChiTietByPhieuXuat };

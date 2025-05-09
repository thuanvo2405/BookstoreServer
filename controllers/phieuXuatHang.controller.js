const PhieuXuatHang = require("../models/phieuXuatHang.model");
const ChiTietPhieuXuat = require("../models/chiTietPhieuXuat.model");
const HangHoa = require("../models/hangHoa.model");
const db = require("../config/db");

const {
  checkInventory,
  createPhieuXuat,
} = require("../models/phieuXuatHang.model");

const taoPhieuXuat = async (req, res) => {
  console.log("Body nhận từ Postman:", req.body);

  try {
    const { phieu, chiTiet } = req.body;

    // Kiểm tra số lượng tồn kho từng mặt hàng
    for (let item of chiTiet) {
      await checkInventory(item.MaHangHoa, item.SoLuong);
    }

    // Tạo phiếu xuất nếu tất cả pass
    const result = await createPhieuXuat(phieu, chiTiet);
    return res.status(201).json({
      message: "Tạo phiếu xuất thành công",
      maPhieu: result.maPhieu,
    });
  } catch (err) {
    console.error("Lỗi tạo phiếu xuất:", err);
    return res.status(400).json({
      error: err.toString(),
    });
  }
};

const getAllPhieuXuat = async (req, res) => {
  try {
    const [results] = await db.query(`
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
    `);
    return res.status(200).json(results);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách phiếu xuất:", err);
    return res.status(500).json({
      error: "Không thể lấy danh sách phiếu xuất: " + err.message,
    });
  }
};

const updatePhieuXuat = async (req, res) => {
  const { id } = req.params;
  const { NgayXuat, GhiChu, MaNhanVien, MaKhachHang, PhuongThucThanhToan } =
    req.body;
  try {
    const [result] = await db.query(
      "UPDATE PHIEU_XUAT SET NgayXuat = ?, GhiChu = ?, MaNhanVien = ?, MaKhachHang = ?, PhuongThucThanhToan = ? WHERE Id_PhieuXuat = ?",
      [NgayXuat, GhiChu, MaNhanVien, MaKhachHang, PhuongThucThanhToan, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Phiếu xuất không tồn tại" });
    }
    return res.status(200).json({ message: "Cập nhật phiếu xuất thành công" });
  } catch (err) {
    console.error("Lỗi khi cập nhật phiếu xuất:", err);
    return res
      .status(500)
      .json({ error: "Lỗi khi cập nhật phiếu xuất: " + err.message });
  }
};

module.exports = { taoPhieuXuat, getAllPhieuXuat, updatePhieuXuat };

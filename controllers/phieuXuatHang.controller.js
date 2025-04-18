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

module.exports = { taoPhieuXuat };

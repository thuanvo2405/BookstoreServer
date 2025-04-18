const PhieuXuatHang = require("../models/phieuXuatHang.model");
const ChiTietPhieuXuat = require("../models/chiTietPhieuXuat.model");
const HangHoa = require("../models/hangHoa.model");
const db = require("../config/db");

const {
  checkInventory,
  createPhieuXuat,
} = require("../models/phieuXuatHang.model");

const taoPhieuXuat = async (req, res) => {
  try {
    const { phieu, chiTiet } = req.body;

    // Kiểm tra số lượng tồn kho cho từng mặt hàng
    for (let item of chiTiet) {
      await checkInventory(item.MaHangHoa, item.SoLuong);
    }

    // Nếu pass, tiến hành tạo phiếu xuất
    const result = await createPhieuXuat(phieu, chiTiet);
    res
      .status(201)
      .json({ message: "Tạo phiếu xuất thành công", maPhieu: result.maPhieu });
  } catch (err) {
    res.status(400).json({ error: err.toString() });
  }
};

module.exports = { taoPhieuXuat };

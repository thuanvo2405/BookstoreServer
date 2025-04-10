const ChiTietPhieuXuat = require("../models/chiTietPhieuXuat.model");
const PhieuXuatHang = require("../models/phieuXuatHang.model");
const HangHoa = require("../models/hangHoa.model");

exports.getAll = async (req, res) => {
  try {
    ChiTietPhieuXuat.getAll((err, data) => {
      if (err) throw err;
      res.json(data);
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách chi tiết phiếu xuất",
      error: error.message,
    });
  }
};

exports.getByPhieuXuatId = async (req, res) => {
  try {
    const maPhieuXuat = req.params.maPhieuXuat;
    ChiTietPhieuXuat.getByPhieuXuatId(maPhieuXuat, (err, data) => {
      if (err) throw err;
      if (!data.length)
        return res
          .status(404)
          .json({ message: "Không tìm thấy chi tiết cho phiếu xuất này" });
      res.json(data);
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết phiếu xuất",
      error: error.message,
    });
  }
};

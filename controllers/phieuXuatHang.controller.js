const PhieuXuatHang = require("../models/phieuXuatHang.model");
const ChiTietPhieuXuat = require("../models/chiTietPhieuXuat.model");
const HangHoa = require("../models/hangHoa.model");
const db = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    PhieuXuatHang.getAll((err, data) => {
      if (err) {
        console.error("Database error in getAll:", err);
        return res
          .status(500)
          .json({ message: "Lỗi khi truy vấn database", error: err.message });
      }
      res.json(data);
    });
  } catch (error) {
    console.error("Error in getAll:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách phiếu xuất",
      error: error.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || id === "null" || isNaN(id)) {
      return res.status(400).json({ message: "ID phiếu xuất không hợp lệ" });
    }

    PhieuXuatHang.getById(id, (err, data) => {
      if (err) {
        console.error("Database error in getById:", err);
        return res
          .status(500)
          .json({ message: "Lỗi khi truy vấn database", error: err.message });
      }
      if (!data || data.length === 0) {
        return res.status(404).json({ message: "Phiếu xuất không tồn tại" });
      }

      PhieuXuatHang.getDetails(id, (err, details) => {
        if (err) {
          console.error("Database error in getDetails:", err);
          return res.status(500).json({
            message: "Lỗi khi lấy chi tiết phiếu xuất",
            error: err.message,
          });
        }
        res.json({ ...data[0], chiTiet: details });
      });
    });
  } catch (error) {
    console.error("Error in getById:", error);
    res.status(500).json({
      message: "Lỗi khi lấy thông tin phiếu xuất",
      error: error.message,
    });
  }
};

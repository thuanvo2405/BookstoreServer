const HoaDon = require("../models/hoaDon.model");
const PhieuXuatHang = require("../models/phieuXuatHang.model");
const db = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    HoaDon.getAll((err, data) => {
      if (err) throw err;
      res.json(data);
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách hóa đơn", error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    HoaDon.getById(id, (err, data) => {
      if (err) throw err;
      if (!data.length)
        return res.status(404).json({ message: "Hóa đơn không tồn tại" });
      res.json(data[0]);
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy thông tin hóa đơn", error: error.message });
  }
};

const HoaDon = require("../models/hoaDon.model");

const taoHoaDon = async (req, res) => {
  try {
    const hoaDon = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!hoaDon.NgayXuat || !hoaDon.TongTien) {
      return res.status(400).json({
        error: "Thiếu thông tin ngày xuất hoặc tổng tiền",
      });
    }

    const result = await HoaDon.create(hoaDon);
    return res.status(201).json({
      message: "Tạo hóa đơn thành công",
      id: result.id,
    });
  } catch (err) {
    console.error("Lỗi tạo hóa đơn:", err);
    return res.status(400).json({
      error: err.toString(),
    });
  }
};

const getAllHoaDon = async (req, res) => {
  try {
    const results = await HoaDon.getAll();
    return res.status(200).json(results);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách hóa đơn:", err);
    return res.status(500).json({
      error: "Không thể lấy danh sách hóa đơn: " + err.message,
    });
  }
};

const getHoaDonDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const hoaDon = await HoaDon.getByIdWithPhieuXuat(id);
    return res.status(200).json(hoaDon);
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết hóa đơn:", err);
    return res.status(404).json({
      error: err.toString(),
    });
  }
};

module.exports = { taoHoaDon, getAllHoaDon, getHoaDonDetail };

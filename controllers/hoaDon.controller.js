const HoaDon = require("../models/hoaDon.model");

const taoHoaDon = async (req, res) => {
  try {
    const hoaDon = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!hoaDon.NgayXuat || !hoaDon.TongTien || !hoaDon.Id_PhieuXuat) {
      return res.status(400).json({
        error: "Thiếu thông tin ngày xuất, tổng tiền hoặc Id_PhieuXuat",
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

const xoaHoaDon = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await HoaDon.deleteById(id);

    if (!success) {
      return res.status(404).json({ error: "Không tìm thấy hóa đơn để xóa" });
    }

    return res.status(200).json({ message: "Xóa hóa đơn thành công" });
  } catch (err) {
    console.error("Lỗi khi xóa hóa đơn:", err);
    return res.status(500).json({ error: "Lỗi server khi xóa hóa đơn" });
  }
};

module.exports = { taoHoaDon, getAllHoaDon, getHoaDonDetail, xoaHoaDon };

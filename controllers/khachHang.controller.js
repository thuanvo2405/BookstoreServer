const KhachHang = require("../models/khachHang.model");

exports.getAll = async (req, res) => {
  try {
    KhachHang.getAll((err, data) => {
      if (err) throw err;
      res.json(data);
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách khách hàng",
      error: error.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    KhachHang.getById(id, (err, data) => {
      if (err) throw err;
      if (!data.length)
        return res.status(404).json({ message: "Khách hàng không tồn tại" });
      res.json(data[0]);
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin khách hàng",
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  try {
    const newKhachHang = req.body;

    // Validation
    if (!newKhachHang.HoTen || !newKhachHang.Email) {
      return res.status(400).json({ message: "Họ tên và email là bắt buộc" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newKhachHang.Email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    KhachHang.create(newKhachHang, (err, result) => {
      if (err) throw err;
      res.status(201).json({ id: result.insertId, ...newKhachHang });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo khách hàng", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    KhachHang.update(id, updatedData, (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Khách hàng không tồn tại" });
      res.json({ message: "Cập nhật khách hàng thành công" });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật khách hàng", error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    // Kiểm tra xem khách hàng có đang được sử dụng không
    KhachHang.checkUsage(id, (err, count) => {
      if (err) throw err;
      if (count > 0) {
        return res.status(400).json({
          message: `Không thể xóa khách hàng này vì có ${count} phiếu xuất đang sử dụng.`,
        });
      }

      // Nếu không có phiếu xuất nào sử dụng, tiến hành xóa
      KhachHang.delete(id, (err, result) => {
        if (err) throw err;
        if (result.affectedRows === 0)
          return res.status(404).json({ message: "Khách hàng không tồn tại" });
        res.json({ message: "Xóa khách hàng thành công" });
      });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa khách hàng", error: error.message });
  }
};

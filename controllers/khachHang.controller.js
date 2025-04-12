const KhachHang = require("../models/khachHang.model");
const db = require("../config/db"); 
exports.getAll = async (req, res) => {
  try {
    const data = await KhachHang.getAll();
    res.json(data);
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
    const data = await KhachHang.getById(id);
    if (!data.length) {
      return res.status(404).json({ message: "Khách hàng không tồn tại" });
    }
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin khách hàng",
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  let connection;
  try {
    const newKhachHang = req.body;

    if (!newKhachHang.HoTen || !newKhachHang.Email) {
      return res.status(400).json({ message: "Họ tên và email là bắt buộc" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newKhachHang.Email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    connection = await db.getConnection();
    const result = await KhachHang.create(newKhachHang, connection);

    res.status(201).json({ id: result.insertId, ...newKhachHang });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi tạo khách hàng",
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.update = async (req, res) => {
  let connection;
  try {
    const id = req.params.id;
    const updatedData = req.body;

    const existingKhachHang = await KhachHang.getById(id);
    if (!existingKhachHang.length) {
      return res.status(404).json({ message: "Khách hàng không tồn tại" });
    }

    connection = await db.getConnection();
    const result = await KhachHang.update(id, updatedData, connection);

    if (result.affectedRows === 0) {
      throw new Error("Khách hàng không tồn tại");
    }

    res.json({ message: "Cập nhật khách hàng thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật khách hàng",
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.delete = async (req, res) => {
  let connection;
  try {
    const id = req.params.id;

    const count = await KhachHang.checkUsage(id);
    if (count > 0) {
      return res.status(400).json({
        message: `Không thể xóa khách hàng này vì có ${count} phiếu xuất đang sử dụng.`,
      });
    }

    connection = await db.getConnection();
    const result = await KhachHang.delete(id, connection);

    if (result.affectedRows === 0) {
      throw new Error("Khách hàng không tồn tại");
    }

    res.json({ message: "Xóa khách hàng thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa khách hàng",
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

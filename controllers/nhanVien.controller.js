const NhanVien = require("../models/nhanVien.model");

exports.getAll = async (req, res) => {
  try {
    NhanVien.getAll((err, data) => {
      if (err) throw err;
      res.json(data);
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách nhân viên",
      error: error.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    NhanVien.getById(id, (err, data) => {
      if (err) throw err;
      if (!data.length)
        return res.status(404).json({ message: "Nhân viên không tồn tại" });
      res.json(data[0]);
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin nhân viên",
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  try {
    const newNhanVien = req.body;
    NhanVien.create(newNhanVien, (err, result) => {
      if (err) throw err;
      res.status(201).json({ id: result.insertId, ...newNhanVien });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo nhân viên", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    NhanVien.update(id, updatedData, (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Nhân viên không tồn tại" });
      res.json({ message: "Cập nhật nhân viên thành công" });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật nhân viên", error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    // Kiểm tra xem nhân viên có đang được sử dụng không
    NhanVien.checkUsage(id, (err, count) => {
      if (err) throw err;
      if (count > 0) {
        return res.status(400).json({
          message: `Không thể xóa nhân viên này vì có ${count} phiếu xuất đang sử dụng.`,
        });
      }

      // Nếu không có phiếu xuất nào sử dụng, tiến hành xóa
      NhanVien.delete(id, (err, result) => {
        if (err) throw err;
        if (result.affectedRows === 0)
          return res.status(404).json({ message: "Nhân viên không tồn tại" });
        res.json({ message: "Xóa nhân viên thành công" });
      });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa nhân viên", error: error.message });
  }
};

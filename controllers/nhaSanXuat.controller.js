const NhaSanXuat = require("../models/nhaSanXuat.model");

exports.getAll = async (req, res) => {
  try {
    NhaSanXuat.getAll((err, data) => {
      if (err) throw err;
      res.json(data);
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Lỗi khi lấy danh sách nhà sản xuất",
        error: error.message,
      });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    NhaSanXuat.getById(id, (err, data) => {
      if (err) throw err;
      if (!data.length)
        return res.status(404).json({ message: "Nhà sản xuất không tồn tại" });
      res.json(data[0]);
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Lỗi khi lấy thông tin nhà sản xuất",
        error: error.message,
      });
  }
};

exports.create = async (req, res) => {
  try {
    const newNhaSanXuat = req.body;
    NhaSanXuat.create(newNhaSanXuat, (err, result) => {
      if (err) throw err;
      res.status(201).json({ id: result.insertId, ...newNhaSanXuat });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo nhà sản xuất", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    NhaSanXuat.update(id, updatedData, (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Nhà sản xuất không tồn tại" });
      res.json({ message: "Cập nhật nhà sản xuất thành công" });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật nhà sản xuất", error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    // Kiểm tra xem nhà sản xuất có đang được sử dụng không
    NhaSanXuat.checkUsage(id, (err, count) => {
      if (err) throw err;
      if (count > 0) {
        return res.status(400).json({
          message: `Không thể xóa nhà sản xuất này vì có ${count} hàng hóa đang sử dụng nó.`,
        });
      }

      // Nếu không có hàng hóa nào sử dụng, tiến hành xóa
      NhaSanXuat.delete(id, (err, result) => {
        if (err) throw err;
        if (result.affectedRows === 0)
          return res
            .status(404)
            .json({ message: "Nhà sản xuất không tồn tại" });
        res.json({ message: "Xóa nhà sản xuất thành công" });
      });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa nhà sản xuất", error: error.message });
  }
};

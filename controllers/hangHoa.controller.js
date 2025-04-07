const HangHoa = require("../models/hangHoa.model");

exports.getAll = async (req, res) => {
  try {
    HangHoa.getAll((err, data) => {
      if (err) throw err;
      res.json(data);
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách hàng hóa",
      error: error.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    HangHoa.getById(id, (err, data) => {
      if (err) throw err;
      if (!data.length)
        return res.status(404).json({ message: "Hàng hóa không tồn tại" });
      res.json(data[0]);
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin hàng hóa",
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  try {
    const newHangHoa = req.body;
    HangHoa.create(newHangHoa, (err, result) => {
      if (err) throw err;
      res.status(201).json({ id: result.insertId, ...newHangHoa });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo hàng hóa", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    HangHoa.update(id, updatedData, (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Hàng hóa không tồn tại" });
      res.json({ message: "Cập nhật hàng hóa thành công" });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật hàng hóa", error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    // Kiểm tra xem hàng hóa có đang được sử dụng trong CHI_TIET_PHIEU_XUAT không
    const usageCount = await new Promise((resolve, reject) => {
      db.query(
        "SELECT COUNT(*) as count FROM CHI_TIET_PHIEU_XUAT WHERE MaHangHoa = ?",
        [id],
        (err, result) => {
          if (err) reject(err);
          resolve(result[0].count);
        }
      );
    });

    if (usageCount > 0) {
      return res.status(400).json({
        message: `Không thể xóa hàng hóa này vì có ${usageCount} chi tiết phiếu xuất đang sử dụng.`,
      });
    }

    HangHoa.delete(id, (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Hàng hóa không tồn tại" });
      res.json({ message: "Xóa hàng hóa thành công" });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa hàng hóa", error: error.message });
  }
};

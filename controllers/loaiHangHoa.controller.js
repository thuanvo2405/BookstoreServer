const LoaiHangHoa = require("../models/loaiHangHoa.model");

exports.getAll = async (req, res) => {
  try {
    LoaiHangHoa.getAll((err, data) => {
      if (err) throw err;
      res.json(data);
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Lỗi khi lấy danh sách loại hàng hóa",
        error: error.message,
      });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    LoaiHangHoa.getById(id, (err, data) => {
      if (err) throw err;
      if (!data.length)
        return res.status(404).json({ message: "Loại hàng hóa không tồn tại" });
      res.json(data[0]);
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Lỗi khi lấy thông tin loại hàng hóa",
        error: error.message,
      });
  }
};

exports.create = async (req, res) => {
  try {
    const newLoaiHangHoa = req.body;
    LoaiHangHoa.create(newLoaiHangHoa, (err, result) => {
      if (err) throw err;
      res.status(201).json({ id: result.insertId, ...newLoaiHangHoa });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo loại hàng hóa", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    LoaiHangHoa.update(id, updatedData, (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Loại hàng hóa không tồn tại" });
      res.json({ message: "Cập nhật loại hàng hóa thành công" });
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Lỗi khi cập nhật loại hàng hóa",
        error: error.message,
      });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    // Kiểm tra xem loại hàng hóa có đang được sử dụng không
    LoaiHangHoa.checkUsage(id, (err, count) => {
      if (err) throw err;
      if (count > 0) {
        return res.status(400).json({
          message: `Không thể xóa loại hàng hóa này vì có ${count} hàng hóa đang sử dụng nó.`,
        });
      }

      // Nếu không có hàng hóa nào sử dụng, tiến hành xóa
      LoaiHangHoa.delete(id, (err, result) => {
        if (err) throw err;
        if (result.affectedRows === 0)
          return res
            .status(404)
            .json({ message: "Loại hàng hóa không tồn tại" });
        res.json({ message: "Xóa loại hàng hóa thành công" });
      });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa loại hàng hóa", error: error.message });
  }
};

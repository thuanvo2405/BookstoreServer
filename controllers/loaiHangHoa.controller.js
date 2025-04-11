const LoaiHangHoa = require("../models/loaiHangHoa.model");

exports.getAll = async (req, res) => {
  try {
    const data = await LoaiHangHoa.getAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách loại hàng hóa",
      error: error.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await LoaiHangHoa.getById(id);
    if (!data.length) {
      return res.status(404).json({ message: "Loại hàng hóa không tồn tại" });
    }
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin loại hàng hóa",
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  let connection;
  try {
    const newLoaiHangHoa = req.body;

    connection = await db.getConnection();
    const result = await LoaiHangHoa.create(newLoaiHangHoa, connection);

    res.status(201).json({ id: result.insertId, ...newLoaiHangHoa });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi tạo loại hàng hóa",
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

    const existingLoaiHangHoa = await LoaiHangHoa.getById(id);
    if (!existingLoaiHangHoa.length) {
      return res.status(404).json({ message: "Loại hàng hóa không tồn tại" });
    }

    connection = await db.getConnection();
    const result = await LoaiHangHoa.update(id, updatedData, connection);

    if (result.affectedRows === 0) {
      throw new Error("Loại hàng hóa không tồn tại");
    }

    res.json({ message: "Cập nhật loại hàng hóa thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật loại hàng hóa",
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

    const count = await LoaiHangHoa.checkUsage(id);
    if (count > 0) {
      return res.status(400).json({
        message: `Không thể xóa loại hàng hóa này vì có ${count} hàng hóa đang sử dụng nó.`,
      });
    }

    connection = await db.getConnection();
    const result = await LoaiHangHoa.delete(id, connection);

    if (result.affectedRows === 0) {
      throw new Error("Loại hàng hóa không tồn tại");
    }

    res.json({ message: "Xóa loại hàng hóa thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa loại hàng hóa",
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

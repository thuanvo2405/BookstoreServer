const NhaSanXuat = require("../models/nhaSanXuat.model");

exports.getAll = async (req, res) => {
  try {
    const data = await NhaSanXuat.getAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách nhà sản xuất",
      error: error.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await NhaSanXuat.getById(id);
    if (!data.length) {
      return res.status(404).json({ message: "Nhà sản xuất không tồn tại" });
    }
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin nhà sản xuất",
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  let connection;
  try {
    const newNhaSanXuat = req.body;

    connection = await db.getConnection();
    const result = await NhaSanXuat.create(newNhaSanXuat, connection);

    res.status(201).json({ id: result.insertId, ...newNhaSanXuat });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi tạo nhà sản xuất",
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

    const existingNhaSanXuat = await NhaSanXuat.getById(id);
    if (!existingNhaSanXuat.length) {
      return res.status(404).json({ message: "Nhà sản xuất không tồn tại" });
    }

    connection = await db.getConnection();
    const result = await NhaSanXuat.update(id, updatedData, connection);

    if (result.affectedRows === 0) {
      throw new Error("Nhà sản xuất không tồn tại");
    }

    res.json({ message: "Cập nhật nhà sản xuất thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật nhà sản xuất",
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

    const count = await NhaSanXuat.checkUsage(id);
    if (count > 0) {
      return res.status(400).json({
        message: `Không thể xóa nhà sản xuất này vì có ${count} hàng hóa đang sử dụng nó.`,
      });
    }

    connection = await db.getConnection();
    const result = await NhaSanXuat.delete(id, connection);

    if (result.affectedRows === 0) {
      throw new Error("Nhà sản xuất không tồn tại");
    }

    res.json({ message: "Xóa nhà sản xuất thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa nhà sản xuất",
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

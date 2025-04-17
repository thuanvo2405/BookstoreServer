const HangHoa = require("../models/hangHoa.model");
const db = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    const data = await HangHoa.getAll();
    res.json(data);
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
    const data = await HangHoa.getById(id);
    if (!data.length) {
      return res.status(404).json({ message: "Hàng hóa không tồn tại" });
    }
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin hàng hóa",
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  let connection;
  try {
    const newHangHoa = req.body;

    // Kiểm tra dữ liệu đầu vào
    const requiredFields = [
      "TenHangHoa",
      "Id_LoaiHangHoa",
      "Id_NhaSanXuat",
      "GiaBan",
      "GiaNhap",
      "SoLuongTonKho",
      "MoTa",
    ];
    for (const field of requiredFields) {
      if (!newHangHoa[field]) {
        return res
          .status(400)
          .json({ message: `Missing required field: ${field}` });
      }
    }

    // Nếu có file ảnh được gửi lên, upload ảnh lên Cloudinary
    if (req.file) {
      const formData = new FormData();
      formData.append("image", req.file.buffer.toString("base64")); // Chuyển buffer thành base64

      const uploadResponse = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload ảnh thất bại");
      }

      const uploadData = await uploadResponse.json();
      newHangHoa.anh_url = uploadData.url; // Lưu URL ảnh vào dữ liệu hàng hóa
    }

    connection = await db.getConnection();
    const result = await HangHoa.create(newHangHoa, connection);

    res.status(201).json({ id: result.insertId, ...newHangHoa });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi tạo hàng hóa",
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

    const existingHangHoa = await HangHoa.getById(id);
    if (!existingHangHoa.length) {
      return res.status(404).json({ message: "Hàng hóa không tồn tại" });
    }

    connection = await db.getConnection();
    const result = await HangHoa.update(id, updatedData, connection);

    if (result.affectedRows === 0) {
      throw new Error("Hàng hóa không tồn tại");
    }

    res.json({ message: "Cập nhật hàng hóa thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật hàng hóa",
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

    const [usageRows] = await db.query(
      "SELECT COUNT(*) as count FROM CHI_TIET_PHIEU_XUAT WHERE MaHangHoa = ?",
      [id]
    );
    const usageCount = usageRows[0].count;

    if (usageCount > 0) {
      return res.status(400).json({
        message: `Không thể xóa hàng hóa này vì có ${usageCount} chi tiết phiếu xuất đang sử dụng.`,
      });
    }

    connection = await db.getConnection();
    const result = await HangHoa.delete(id, connection);

    if (result.affectedRows === 0) {
      throw new Error("Hàng hóa không tồn tại");
    }

    res.json({ message: "Xóa hàng hóa thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa hàng hóa",
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

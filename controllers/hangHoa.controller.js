const HangHoa = require("../models/hangHoa.model");
const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

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
    // Log dữ liệu nhận được từ request
    console.log("Dữ liệu nhận được từ frontend:", req.body);
    console.log("File nhận được từ frontend:", req.file);

    const newHangHoa = {
      TenHangHoa: req.body.TenHangHoa,
      Id_LoaiHangHoa: req.body.Id_LoaiHangHoa,
      Id_NhaSanXuat: req.body.Id_NhaSanXuat,
      GiaBan: req.body.GiaBan,
      GiaNhap: req.body.GiaNhap,
      SoLuongTonKho: req.body.SoLuongTonKho,
      MoTa: req.body.MoTa,
    };

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
      if (newHangHoa[field] === undefined || newHangHoa[field] === null) {
        console.log(`Thiếu trường bắt buộc: ${field}`);
        return res
          .status(400)
          .json({ message: `Missing required field: ${field}` });
      }
    }

    // Nếu có file ảnh được gửi lên, upload ảnh lên Cloudinary
    if (req.file) {
      console.log("Bắt đầu upload ảnh lên Cloudinary...");
      console.log("Thông tin file:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      const stream = Readable.from(req.file.buffer);
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "hanghoa" },
          (error, result) => {
            if (error) {
              console.error("Lỗi khi upload ảnh lên Cloudinary:", error);
              reject(error);
            } else {
              console.log("Upload ảnh thành công:", {
                url: result.secure_url,
                public_id: result.public_id,
              });
              resolve(result);
            }
          }
        );
        stream.pipe(uploadStream);
      });
      newHangHoa.anh_url = uploadResult.secure_url; // Lưu URL ảnh vào dữ liệu hàng hóa
    } else {
      console.log("Không nhận được file ảnh từ frontend");
      return res.status(400).json({ message: "Vui lòng tải lên hình ảnh!" });
    }

    connection = await db.getConnection();
    console.log("Đã kết nối database, bắt đầu insert dữ liệu...");
    const result = await HangHoa.create(newHangHoa, connection);
    console.log("Kết quả insert:", result);

    res.status(201).json({ id: result.insertId, ...newHangHoa });
  } catch (error) {
    console.error("Lỗi trong hàm create:", error);
    res.status(500).json({
      message: "Lỗi khi tạo hàng hóa",
      error: error.message,
    });
  } finally {
    if (connection) {
      console.log("Giải phóng kết nối database");
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

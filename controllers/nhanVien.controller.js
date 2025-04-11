const NhanVien = require("../models/nhanVien.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SALT_ROUNDS = 10;
const blacklistedTokens = new Set();

exports.getAll = async (req, res) => {
  try {
    const data = await NhanVien.getAll();
    res.json(data);
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
    const data = await NhanVien.getById(id);
    if (!data.length) {
      return res.status(404).json({ message: "Nhân viên không tồn tại" });
    }
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin nhân viên",
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  let connection;
  try {
    const newNhanVien = req.body;

    if (!newNhanVien.HoTen || !newNhanVien.Email || !newNhanVien.MatKhau) {
      return res
        .status(400)
        .json({ message: "Họ tên, email và mật khẩu là bắt buộc" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newNhanVien.Email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    newNhanVien.MatKhau = await bcrypt.hash(newNhanVien.MatKhau, SALT_ROUNDS);

    connection = await db.getConnection();
    const result = await NhanVien.create(newNhanVien, connection);

    res.status(201).json({ id: result.insertId, ...newNhanVien });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi tạo nhân viên",
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

    const existingNhanVien = await NhanVien.getById(id);
    if (!existingNhanVien.length) {
      return res.status(404).json({ message: "Nhân viên không tồn tại" });
    }

    if (updatedData.MatKhau) {
      updatedData.MatKhau = await bcrypt.hash(updatedData.MatKhau, SALT_ROUNDS);
    }

    connection = await db.getConnection();
    const result = await NhanVien.update(id, updatedData, connection);

    if (result.affectedRows === 0) {
      throw new Error("Nhân viên không tồn tại");
    }

    res.json({ message: "Cập nhật nhân viên thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật nhân viên",
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

    const count = await NhanVien.checkUsage(id);
    if (count > 0) {
      return res.status(400).json({
        message: `Không thể xóa nhân viên này vì có ${count} phiếu xuất đang sử dụng.`,
      });
    }

    connection = await db.getConnection();
    const result = await NhanVien.delete(id, connection);

    if (result.affectedRows === 0) {
      throw new Error("Nhân viên không tồn tại");
    }

    res.json({ message: "Xóa nhân viên thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa nhân viên",
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.login = async (req, res) => {
  try {
    const { Email, MatKhau } = req.body;

    if (!Email || !MatKhau) {
      return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });
    }

    const data = await NhanVien.getAll();
    const nhanVien = data.find((nv) => nv.Email === Email);

    if (!nhanVien) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const isMatch = await bcrypt.compare(MatKhau, nhanVien.MatKhau);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { id: nhanVien.Id_NhanVien, chucVu: nhanVien.ChucVu },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    res.json({ message: "Đăng nhập thành công", token });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi đăng nhập",
      error: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "Không tìm thấy token" });
    }

    blacklistedTokens.add(token);
    res.json({ message: "Đăng xuất thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi đăng xuất",
      error: error.message,
    });
  }
};

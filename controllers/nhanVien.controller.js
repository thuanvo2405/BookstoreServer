const NhanVien = require("../models/nhanVien.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SALT_ROUNDS = 10;
const blacklistedTokens = new Set();
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

    // Kiểm tra các trường bắt buộc
    if (!newNhanVien.HoTen || !newNhanVien.Email || !newNhanVien.MatKhau) {
      return res
        .status(400)
        .json({ message: "Họ tên, email và mật khẩu là bắt buộc" });
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newNhanVien.Email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    // Mã hóa mật khẩu
    newNhanVien.MatKhau = await bcrypt.hash(newNhanVien.MatKhau, SALT_ROUNDS);

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

    // Nếu có cập nhật mật khẩu, mã hóa nó
    if (updatedData.MatKhau) {
      updatedData.MatKhau = await bcrypt.hash(updatedData.MatKhau, SALT_ROUNDS);
    }

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

exports.login = async (req, res) => {
  try {
    const { Email, MatKhau } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!Email || !MatKhau) {
      return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });
    }

    // Tìm nhân viên theo email
    const nhanVien = await new Promise((resolve, reject) => {
      NhanVien.getAll((err, data) => {
        if (err) return reject(err);
        const user = data.find((nv) => nv.Email === Email);
        resolve(user);
      });
    });

    if (!nhanVien) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(MatKhau, nhanVien.MatKhau);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Tạo JWT
    const token = jwt.sign(
      { id: nhanVien.Id_NhanVien, chucVu: nhanVien.ChucVu },
      process.env.JWT_SECRET || "your_jwt_secret", // Đặt secret trong file .env
      { expiresIn: "1h" }
    );

    res.json({ message: "Đăng nhập thành công", token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi đăng nhập", error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Lấy token từ header
    if (!token) {
      return res.status(400).json({ message: "Không tìm thấy token" });
    }

    // Thêm token vào danh sách đen
    blacklistedTokens.add(token);

    res.json({ message: "Đăng xuất thành công" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi đăng xuất", error: error.message });
  }
};

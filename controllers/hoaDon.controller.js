const HoaDon = require("../models/hoaDon.model");
const PhieuXuatHang = require("../models/phieuXuatHang.model");
const db = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    HoaDon.getAll((err, data) => {
      if (err) throw err;
      res.json(data);
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách hóa đơn", error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    HoaDon.getById(id, (err, data) => {
      if (err) throw err;
      if (!data.length)
        return res.status(404).json({ message: "Hóa đơn không tồn tại" });
      res.json(data[0]);
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy thông tin hóa đơn", error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const hoaDonData = req.body;

    // Validate required fields
    if (!hoaDonData.NgayXuat || !hoaDonData.TongTien) {
      return res.status(400).json({ message: "Dữ liệu hóa đơn không hợp lệ" });
    }

    // If linked to PhieuXuatHang, verify it exists
    if (hoaDonData.Id_PhieuXuat) {
      const phieuXuat = await new Promise((resolve, reject) => {
        PhieuXuatHang.getById(hoaDonData.Id_PhieuXuat, (err, data) => {
          if (err) reject(err);
          resolve(data);
        });
      });
      if (!phieuXuat.length) {
        return res.status(404).json({ message: "Phiếu xuất không tồn tại" });
      }
    }

    HoaDon.create(hoaDonData, (err, result) => {
      if (err) throw err;
      res.status(201).json({
        message: "Tạo hóa đơn thành công",
        Id_HoaDon: result.insertId,
        ...hoaDonData,
      });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo hóa đơn", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    // Verify invoice exists
    const existingHoaDon = await new Promise((resolve, reject) => {
      HoaDon.getById(id, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
    if (!existingHoaDon.length) {
      return res.status(404).json({ message: "Hóa đơn không tồn tại" });
    }

    HoaDon.update(id, updatedData, (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Hóa đơn không tồn tại" });
      }
      res.json({ message: "Cập nhật hóa đơn thành công" });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật hóa đơn", error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    // Verify invoice exists
    const existingHoaDon = await new Promise((resolve, reject) => {
      HoaDon.getById(id, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
    if (!existingHoaDon.length) {
      return res.status(404).json({ message: "Hóa đơn không tồn tại" });
    }

    HoaDon.delete(id, (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Hóa đơn không tồn tại" });
      }
      res.json({ message: "Xóa hóa đơn thành công" });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa hóa đơn", error: error.message });
  }
};

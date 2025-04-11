const HoaDon = require("../models/hoaDon.model");
const PhieuXuatHang = require("../models/phieuXuatHang.model");
const ChiTietPhieuXuat = require("../models/chiTietPhieuXuat.model");
const db = require("../config/db");
exports.getAll = async (req, res) => {
  try {
    const data = await HoaDon.getAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách hóa đơn",
      error: error.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await HoaDon.getById(id);
    if (!data.length) {
      return res.status(404).json({ message: "Hóa đơn không tồn tại" });
    }
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin hóa đơn",
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  let connection;
  try {
    const hoaDonData = req.body;

    if (!hoaDonData.NgayXuat || !hoaDonData.TongTien) {
      return res.status(400).json({ message: "Dữ liệu hóa đơn không hợp lệ" });
    }

    if (hoaDonData.Id_PhieuXuat) {
      const phieuXuat = await PhieuXuatHang.getById(hoaDonData.Id_PhieuXuat);
      if (!phieuXuat.length) {
        return res.status(404).json({ message: "Phiếu xuất không tồn tại" });
      }
    }

    connection = await db.getConnection();
    const result = await HoaDon.create(hoaDonData, connection);

    res.status(201).json({
      message: "Tạo hóa đơn thành công",
      Id_HoaDon: result.insertId,
      ...hoaDonData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi tạo hóa đơn",
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

    const existingHoaDon = await HoaDon.getById(id);
    if (!existingHoaDon.length) {
      return res.status(404).json({ message: "Hóa đơn không tồn tại" });
    }

    connection = await db.getConnection();
    const result = await HoaDon.update(id, updatedData, connection);

    if (result.affectedRows === 0) {
      throw new Error("Hóa đơn không tồn tại");
    }

    res.json({ message: "Cập nhật hóa đơn thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật hóa đơn",
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

    const existingHoaDon = await HoaDon.getById(id);
    if (!existingHoaDon.length) {
      return res.status(404).json({ message: "Hóa đơn không tồn tại" });
    }

    connection = await db.getConnection();
    const result = await HoaDon.delete(id, connection);

    if (result.affectedRows === 0) {
      throw new Error("Hóa đơn không tồn tại");
    }

    res.json({ message: "Xóa hóa đơn thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa hóa đơn",
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.createFromPhieuXuat = async (req, res) => {
  let connection;
  try {
    const { phieuXuatId } = req.body;

    if (!phieuXuatId) {
      return res.status(400).json({ message: "ID phiếu xuất là bắt buộc" });
    }

    // Lấy thông tin phiếu xuất
    const phieuXuatRows = await PhieuXuatHang.getById(phieuXuatId);
    if (!phieuXuatRows.length) {
      return res.status(404).json({ message: "Phiếu xuất không tồn tại" });
    }
    const phieuXuat = phieuXuatRows[0];

    // Lấy chi tiết phiếu xuất
    const chiTietRows = await ChiTietPhieuXuat.getByPhieuXuatId(phieuXuatId);
    if (!chiTietRows.length) {
      return res.status(400).json({ message: "Phiếu xuất không có chi tiết" });
    }

    // Tính tổng tiền từ chi tiết phiếu xuất
    const tongTien = chiTietRows.reduce(
      (sum, detail) => sum + detail.SoLuong * detail.DonGia,
      0
    );

    // Tạo dữ liệu hóa đơn
    const hoaDonData = {
      Id_PhieuXuat: phieuXuatId,
      NgayXuat: phieuXuat.NgayXuat || new Date().toISOString().split("T")[0], // Lấy từ phiếu xuất hoặc ngày hiện tại
      TongTien: tongTien,
      // Thêm các trường khác nếu cần, ví dụ: GhiChu, TrangThai
    };

    connection = await db.getConnection();
    await connection.beginTransaction();

    const result = await HoaDon.create(hoaDonData, connection);
    await connection.commit();

    res.status(201).json({
      message: "Tạo hóa đơn từ phiếu xuất thành công",
      Id_HoaDon: result.insertId,
      ...hoaDonData,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error in createFromPhieuXuat:", error);
    res.status(500).json({
      message: "Lỗi khi tạo hóa đơn từ phiếu xuất",
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

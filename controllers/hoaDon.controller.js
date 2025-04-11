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

    // Xác thực đầu vào
    if (!phieuXuatId || isNaN(phieuXuatId)) {
      return res.status(400).json({ message: "ID phiếu xuất không hợp lệ" });
    }

    // Lấy kết nối cơ sở dữ liệu và bắt đầu giao dịch
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Kiểm tra xem hóa đơn đã tồn tại cho phiếu xuất này chưa
    const [existingHoaDon] = await connection.query(
      "SELECT Id_HoaDon FROM HOA_DON WHERE Id_PhieuXuat = ?",
      [phieuXuatId]
    );
    if (existingHoaDon.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        message: "Hóa đơn đã tồn tại cho phiếu xuất này",
      });
    }

    // Lấy thông tin phiếu xuất
    const phieuXuatRows = await PhieuXuatHang.getById(phieuXuatId);
    if (!phieuXuatRows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Phiếu xuất không tồn tại" });
    }
    const phieuXuat = phieuXuatRows[0];

    // Kiểm tra trạng thái phiếu xuất (giả sử có trường TrangThai)
    if (phieuXuat.TrangThai && phieuXuat.TrangThai !== "hoan_tat") {
      await connection.rollback();
      return res.status(400).json({
        message: "Phiếu xuất chưa hoàn tất, không thể tạo hóa đơn",
      });
    }

    // Lấy chi tiết phiếu xuất
    const chiTietRows = await ChiTietPhieuXuat.getByPhieuXuatId(phieuXuatId);
    if (!chiTietRows.length) {
      await connection.rollback();
      return res.status(400).json({ message: "Phiếu xuất không có chi tiết" });
    }

    // Tính tổng tiền
    const tongTien = chiTietRows.reduce(
      (sum, detail) => sum + detail.SoLuong * detail.DonGia,
      0
    );
    if (tongTien <= 0) {
      await connection.rollback();
      return res
        .status(400)
        .json({ message: "Tổng tiền hóa đơn không hợp lệ" });
    }

    // Xác định phương thức thanh toán (lấy từ chi tiết đầu tiên hoặc mặc định)
    const phuongThucThanhToan =
      chiTietRows[0].PhuongThucThanhToan || "Chưa xác định";

    // Xác thực ngày xuất
    const ngayXuat = phieuXuat.NgayXuat;
    if (!ngayXuat || isNaN(new Date(ngayXuat).getTime())) {
      await connection.rollback();
      return res.status(400).json({ message: "Ngày xuất không hợp lệ" });
    }

    // Tạo dữ liệu hóa đơn
    const hoaDonData = {
      Id_PhieuXuat: phieuXuatId,
      NgayXuat: ngayXuat,
      TongTien: tongTien,
      PhuongThucThanhToan: phuongThucThanhToan,
      TrangThai: "cho_xu_ly", // Trạng thái ban đầu của hóa đơn
    };

    // Tạo hóa đơn
    const result = await HoaDon.create(hoaDonData, connection);

    // Cập nhật trạng thái phiếu xuất thành "đã lập hóa đơn"
    await connection.query(
      "UPDATE PHIEU_XUAT SET TrangThai = ? WHERE Id_PhieuXuat = ?",
      ["da_lap_hoa_don", phieuXuatId]
    );

    // Hoàn tất giao dịch
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
    console.error("Lỗi trong createFromPhieuXuat:", error);

    // Xử lý lỗi cụ thể
    if (error.message.includes("ER_DUP_ENTRY")) {
      return res.status(400).json({
        message: "Hóa đơn đã tồn tại cho phiếu xuất này",
      });
    }
    if (error.message.includes("ER_NO_REFERENCED_ROW")) {
      return res.status(400).json({
        message: "Dữ liệu liên quan không hợp lệ",
      });
    }

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

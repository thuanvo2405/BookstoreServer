const ChiTietPhieuXuat = require("../models/chiTietPhieuXuat.model");
const PhieuXuatHang = require("../models/phieuXuatHang.model");
const HangHoa = require("../models/hangHoa.model");
const db = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    const data = await ChiTietPhieuXuat.getAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách chi tiết phiếu xuất",
      error: error.message,
    });
  }
};

exports.getByPhieuXuatId = async (req, res) => {
  try {
    const maPhieuXuat = req.params.maPhieuXuat;
    const data = await ChiTietPhieuXuat.getByPhieuXuatId(maPhieuXuat);
    if (!data.length) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy chi tiết cho phiếu xuất này" });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết phiếu xuất",
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  let connection;
  try {
    const detailData = req.body;

    if (
      !detailData.MaPhieuXuat ||
      !detailData.MaHangHoa ||
      !detailData.SoLuong ||
      !detailData.DonGia
    ) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    const phieuXuat = await PhieuXuatHang.getById(detailData.MaPhieuXuat);
    if (!phieuXuat.length) {
      return res.status(404).json({ message: "Phiếu xuất không tồn tại" });
    }

    const hangHoaRows = await HangHoa.getById(detailData.MaHangHoa);
    const hangHoa = hangHoaRows[0];
    if (!hangHoa) {
      return res.status(404).json({ message: "Hàng hóa không tồn tại" });
    }
    if (hangHoa.SoLuongTonKho < detailData.SoLuong) {
      return res.status(400).json({
        message: `Hàng hóa ${hangHoa.TenHangHoa} không đủ tồn kho`,
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const result = await ChiTietPhieuXuat.create(detailData, connection);
    await HangHoa.update(
      detailData.MaHangHoa,
      { SoLuongTonKho: `SoLuongTonKho - ${detailData.SoLuong}` },
      connection
    );

    await connection.commit();
    res.status(201).json({
      message: "Tạo chi tiết phiếu xuất thành công",
      Id_ChiTietPhieuXuat: result.insertId,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    res.status(500).json({
      message: "Lỗi khi tạo chi tiết phiếu xuất",
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

    const existingDetails = await ChiTietPhieuXuat.getByPhieuXuatId(
      updatedData.MaPhieuXuat || ""
    );
    const existingDetail = existingDetails.find(
      (d) => d.Id_ChiTietPhieuXuat === parseInt(id)
    );
    if (!existingDetail) {
      return res
        .status(404)
        .json({ message: "Chi tiết phiếu xuất không tồn tại" });
    }

    if (updatedData.SoLuong && updatedData.SoLuong !== existingDetail.SoLuong) {
      const hangHoaRows = await HangHoa.getById(existingDetail.MaHangHoa);
      const hangHoa = hangHoaRows[0];
      const delta = updatedData.SoLuong - existingDetail.SoLuong;

      if (hangHoa.SoLuongTonKho < delta) {
        return res.status(400).json({
          message: `Hàng hóa ${hangHoa.TenHangHoa} không đủ tồn kho`,
        });
      }

      connection = await db.getConnection();
      await connection.beginTransaction();

      await ChiTietPhieuXuat.update(id, updatedData, connection);
      await HangHoa.update(
        existingDetail.MaHangHoa,
        { SoLuongTonKho: `SoLuongTonKho - ${delta}` },
        connection
      );

      await connection.commit();
    } else {
      await ChiTietPhieuXuat.update(id, updatedData, connection);
    }

    res.json({ message: "Cập nhật chi tiết phiếu xuất thành công" });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    res.status(500).json({
      message: "Lỗi khi cập nhật chi tiết phiếu xuất",
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

    const existingDetails = await ChiTietPhieuXuat.getAll();
    const existingDetail = existingDetails.find(
      (d) => d.Id_ChiTietPhieuXuat === parseInt(id)
    );
    if (!existingDetail) {
      return res
        .status(404)
        .json({ message: "Chi tiết phiếu xuất không tồn tại" });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    await ChiTietPhieuXuat.delete(id, connection);
    await HangHoa.update(
      existingDetail.MaHangHoa,
      { SoLuongTonKho: `SoLuongTonKho + ${existingDetail.SoLuong}` },
      connection
    );

    await connection.commit();
    res.json({ message: "Xóa chi tiết phiếu xuất thành công" });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    res.status(500).json({
      message: "Lỗi khi xóa chi tiết phiếu xuất",
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const PhieuXuatHang = require("../models/phieuXuatHang.model");
const ChiTietPhieuXuat = require("../models/chiTietPhieuXuat.model");
const HangHoa = require("../models/hangHoa.model");
const db = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    const data = await PhieuXuatHang.getAll();
    res.json(data);
  } catch (error) {
    console.error("Error in getAll:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách phiếu xuất",
      error: error.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || id === "null" || isNaN(id)) {
      return res.status(400).json({ message: "ID phiếu xuất không hợp lệ" });
    }

    const data = await PhieuXuatHang.getById(id);
    if (!data.length) {
      return res.status(404).json({ message: "Phiếu xuất không tồn tại" });
    }

    const details = await ChiTietPhieuXuat.getByPhieuXuatId(id);
    res.json({ ...data[0], chiTiet: details });
  } catch (error) {
    console.error("Error in getById:", error);
    res.status(500).json({
      message: "Lỗi khi lấy thông tin phiếu xuất",
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  let connection;
  try {
    const { phieuXuatData, chiTiet } = req.body;

    if (
      !phieuXuatData.MaNhanVien ||
      !chiTiet ||
      !Array.isArray(chiTiet) ||
      chiTiet.length === 0
    ) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const phieuXuatResult = await PhieuXuatHang.create(
      phieuXuatData,
      connection
    );
    const idPhieuXuat = phieuXuatResult.insertId;

    for (const detail of chiTiet) {
      if (!detail.MaHangHoa || !detail.SoLuong || !detail.DonGia) {
        throw new Error("Chi tiết phiếu xuất không hợp lệ");
      }

      const hangHoaRows = await HangHoa.getById(detail.MaHangHoa);
      const hangHoa = hangHoaRows[0];

      if (!hangHoa) {
        throw new Error(`Hàng hóa ${detail.MaHangHoa} không tồn tại`);
      }
      if (hangHoa.SoLuongTonKho < detail.SoLuong) {
        throw new Error(`Hàng hóa ${hangHoa.TenHangHoa} không đủ tồn kho`);
      }

      await ChiTietPhieuXuat.create(
        {
          MaPhieuXuat: idPhieuXuat,
          MaHangHoa: detail.MaHangHoa,
          SoLuong: detail.SoLuong,
          DonGia: detail.DonGia,
          PhuongThucThanhToan: detail.PhuongThucThanhToan,
        },
        connection
      );

      await HangHoa.update(
        detail.MaHangHoa,
        { SoLuongTonKho: `SoLuongTonKho - ${detail.SoLuong}` },
        connection
      );
    }

    await connection.commit();
    res.status(201).json({
      message: "Tạo phiếu xuất thành công",
      Id_PhieuXuat: idPhieuXuat,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error in create:", error);
    res.status(500).json({
      message: "Lỗi khi tạo phiếu xuất",
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
    const { phieuXuatData, chiTiet } = req.body;

    const existingPhieuXuat = await PhieuXuatHang.getById(id);
    if (!existingPhieuXuat.length) {
      return res.status(404).json({ message: "Phiếu xuất không tồn tại" });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    await PhieuXuatHang.update(id, phieuXuatData, connection);

    if (chiTiet && Array.isArray(chiTiet)) {
      const existingDetails = await ChiTietPhieuXuat.getByPhieuXuatId(id);

      for (const detail of existingDetails) {
        await HangHoa.update(
          detail.MaHangHoa,
          { SoLuongTonKho: `SoLuongTonKho + ${detail.SoLuong}` },
          connection
        );
      }

      await ChiTietPhieuXuat.deleteByPhieuXuatId(id, connection);

      for (const detail of chiTiet) {
        if (!detail.MaHangHoa || !detail.SoLuong || !detail.DonGia) {
          throw new Error("Chi tiết phiếu xuất không hợp lệ");
        }

        const hangHoaRows = await HangHoa.getById(detail.MaHangHoa);
        const hangHoa = hangHoaRows[0];

        if (!hangHoa) {
          throw new Error(`Hàng hóa ${detail.MaHangHoa} không tồn tại`);
        }
        if (hangHoa.SoLuongTonKho < detail.SoLuong) {
          throw new Error(`Hàng hóa ${hangHoa.TenHangHoa} không đủ tồn kho`);
        }

        await ChiTietPhieuXuat.create(
          {
            MaPhieuXuat: id,
            MaHangHoa: detail.MaHangHoa,
            SoLuong: detail.SoLuong,
            DonGia: detail.DonGia,
            PhuongThucThanhToan: detail.PhuongThucThanhToan,
          },
          connection
        );

        await HangHoa.update(
          detail.MaHangHoa,
          { SoLuongTonKho: `SoLuongTonKho - ${detail.SoLuong}` },
          connection
        );
      }
    }

    await connection.commit();
    res.json({ message: "Cập nhật phiếu xuất thành công" });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error in update:", error);
    res.status(500).json({
      message: "Lỗi khi cập nhật phiếu xuất",
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

    if (!id || id === "null" || isNaN(id)) {
      return res.status(400).json({ message: "ID phiếu xuất không hợp lệ" });
    }

    const existingPhieuXuat = await PhieuXuatHang.getById(id);
    if (!existingPhieuXuat.length) {
      return res.status(404).json({ message: "Phiếu xuất không tồn tại" });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const existingDetails = await ChiTietPhieuXuat.getByPhieuXuatId(id);
    for (const detail of existingDetails) {
      await HangHoa.update(
        detail.MaHangHoa,
        { SoLuongTonKho: `SoLuongTonKho + ${detail.SoLuong}` },
        connection
      );
    }

    await ChiTietPhieuXuat.deleteByPhieuXuatId(id, connection);
    const result = await PhieuXuatHang.delete(id, connection);

    if (result.affectedRows === 0) {
      throw new Error("Phiếu xuất không tồn tại");
    }

    await connection.commit();
    res.json({ message: "Xóa phiếu xuất thành công" });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error in delete:", error);
    res.status(500).json({
      message: "Lỗi khi xóa phiếu xuất",
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

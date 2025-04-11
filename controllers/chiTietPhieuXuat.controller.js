const ChiTietPhieuXuat = require("../models/chiTietPhieuXuat.model");
const PhieuXuatHang = require("../models/phieuXuatHang.model");
const HangHoa = require("../models/hangHoa.model");
const db = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    ChiTietPhieuXuat.getAll((err, data) => {
      if (err) throw err;
      res.json(data);
    });
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
    ChiTietPhieuXuat.getByPhieuXuatId(maPhieuXuat, (err, data) => {
      if (err) throw err;
      if (!data.length)
        return res
          .status(404)
          .json({ message: "Không tìm thấy chi tiết cho phiếu xuất này" });
      res.json(data);
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết phiếu xuất",
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  try {
    const detailData = req.body;

    // Validate input
    if (
      !detailData.MaPhieuXuat ||
      !detailData.MaHangHoa ||
      !detailData.SoLuong ||
      !detailData.DonGia
    ) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    // Verify PhieuXuatHang exists
    const phieuXuat = await new Promise((resolve, reject) => {
      PhieuXuatHang.getById(detailData.MaPhieuXuat, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
    if (!phieuXuat.length) {
      return res.status(404).json({ message: "Phiếu xuất không tồn tại" });
    }

    // Verify HangHoa exists and has enough stock
    const hangHoa = await new Promise((resolve, reject) => {
      HangHoa.getById(detailData.MaHangHoa, (err, data) => {
        if (err) reject(err);
        resolve(data[0]);
      });
    });
    if (!hangHoa) {
      return res.status(404).json({ message: "Hàng hóa không tồn tại" });
    }
    if (hangHoa.SoLuongTonKho < detailData.SoLuong) {
      return res.status(400).json({
        message: `Hàng hóa ${hangHoa.TenHangHoa} không đủ tồn kho`,
      });
    }

    // Start a transaction
    await new Promise((resolve, reject) => {
      db.beginTransaction((err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // Create ChiTietPhieuXuat
    const result = await new Promise((resolve, reject) => {
      ChiTietPhieuXuat.create(detailData, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    // Update inventory
    await new Promise((resolve, reject) => {
      HangHoa.update(
        detailData.MaHangHoa,
        { SoLuongTonKho: `SoLuongTonKho - ${detailData.SoLuong}` },
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });

    // Commit transaction
    await new Promise((resolve, reject) => {
      db.commit((err) => {
        if (err) reject(err);
        resolve();
      });
    });

    res.status(201).json({
      message: "Tạo chi tiết phiếu xuất thành công",
      Id_ChiTietPhieuXuat: result.insertId,
    });
  } catch (error) {
    await new Promise((resolve) => {
      db.rollback(() => resolve());
    });
    res.status(500).json({
      message: "Lỗi khi tạo chi tiết phiếu xuất",
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    // Verify ChiTietPhieuXuat exists
    const existingDetail = await new Promise((resolve, reject) => {
      ChiTietPhieuXuat.getById(id, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
    if (!existingDetail.length) {
      return res
        .status(404)
        .json({ message: "Chi tiết phiếu xuất không tồn tại" });
    }

    // If updating quantity, adjust inventory
    if (
      updatedData.SoLuong &&
      updatedData.SoLuong !== existingDetail[0].SoLuong
    ) {
      const hangHoa = await new Promise((resolve, reject) => {
        HangHoa.getById(existingDetail[0].MaHangHoa, (err, data) => {
          if (err) reject(err);
          resolve(data[0]);
        });
      });

      const delta = updatedData.SoLuong - existingDetail[0].SoLuong;
      if (hangHoa.SoLuongTonKho < delta) {
        return res.status(400).json({
          message: `Hàng hóa ${hangHoa.TenHangHoa} không đủ tồn kho`,
        });
      }

      // Start a transaction
      await new Promise((resolve, reject) => {
        db.beginTransaction((err) => {
          if (err) reject(err);
          resolve();
        });
      });

      // Update ChiTietPhieuXuat
      await new Promise((resolve, reject) => {
        ChiTietPhieuXuat.update(id, updatedData, (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });

      // Update inventory
      await new Promise((resolve, reject) => {
        HangHoa.update(
          existingDetail[0].MaHangHoa,
          { SoLuongTonKho: `SoLuongTonKho - ${delta}` },
          (err, result) => {
            if (err) reject(err);
            resolve(result);
          }
        );
      });

      // Commit transaction
      await new Promise((resolve, reject) => {
        db.commit((err) => {
          if (err) reject(err);
          resolve();
        });
      });
    } else {
      // Update ChiTietPhieuXuat without inventory change
      await new Promise((resolve, reject) => {
        ChiTietPhieuXuat.update(id, updatedData, (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });
    }

    res.json({ message: "Cập nhật chi tiết phiếu xuất thành công" });
  } catch (error) {
    await new Promise((resolve) => {
      db.rollback(() => resolve());
    });
    res.status(500).json({
      message: "Lỗi khi cập nhật chi tiết phiếu xuất",
      error: error.message,
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    // Verify ChiTietPhieuXuat exists
    const existingDetail = await new Promise((resolve, reject) => {
      ChiTietPhieuXuat.getById(id, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
    if (!existingDetail.length) {
      return res
        .status(404)
        .json({ message: "Chi tiết phiếu xuất không tồn tại" });
    }

    // Start a transaction
    await new Promise((resolve, reject) => {
      db.beginTransaction((err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // Delete ChiTietPhieuXuat
    await new Promise((resolve, reject) => {
      ChiTietPhieuXuat.delete(id, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    // Restore inventory
    await new Promise((resolve, reject) => {
      HangHoa.update(
        existingDetail[0].MaHangHoa,
        { SoLuongTonKho: `SoLuongTonKho + ${existingDetail[0].SoLuong}` },
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });

    // Commit transaction
    await new Promise((resolve, reject) => {
      db.commit((err) => {
        if (err) reject(err);
        resolve();
      });
    });

    res.json({ message: "Xóa chi tiết phiếu xuất thành công" });
  } catch (error) {
    await new Promise((resolve) => {
      db.rollback(() => resolve());
    });
    res.status(500).json({
      message: "Lỗi khi xóa chi tiết phiếu xuất",
      error: error.message,
    });
  }
};

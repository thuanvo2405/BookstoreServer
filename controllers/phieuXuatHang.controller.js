const PhieuXuatHang = require("../models/phieuXuatHang.model");
const ChiTietPhieuXuat = require("../models/chiTietPhieuXuat.model");
const HangHoa = require("../models/hangHoa.model");
const db = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    PhieuXuatHang.getAll((err, data) => {
      if (err) {
        console.error("Database error in getAll:", err);
        return res
          .status(500)
          .json({ message: "Lỗi khi truy vấn database", error: err.message });
      }
      res.json(data);
    });
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

    PhieuXuatHang.getById(id, (err, data) => {
      if (err) {
        console.error("Database error in getById:", err);
        return res
          .status(500)
          .json({ message: "Lỗi khi truy vấn database", error: err.message });
      }
      if (!data || data.length === 0) {
        return res.status(404).json({ message: "Phiếu xuất không tồn tại" });
      }

      ChiTietPhieuXuat.getByPhieuXuatId(id, (err, details) => {
        if (err) {
          console.error("Database error in getDetails:", err);
          return res.status(500).json({
            message: "Lỗi khi lấy chi tiết phiếu xuất",
            error: err.message,
          });
        }
        res.json({ ...data[0], chiTiet: details });
      });
    });
  } catch (error) {
    console.error("Error in getById:", error);
    res.status(500).json({
      message: "Lỗi khi lấy thông tin phiếu xuất",
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { phieuXuatData, chiTiet } = req.body;

    // Validate input
    if (
      !phieuXuatData.MaNhanVien ||
      !chiTiet ||
      !Array.isArray(chiTiet) ||
      chiTiet.length === 0
    ) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    // Start a transaction
    await new Promise((resolve, reject) => {
      db.beginTransaction((err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // Create PhieuXuatHang
    const phieuXuatResult = await new Promise((resolve, reject) => {
      PhieuXuatHang.create(phieuXuatData, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    const idPhieuXuat = phieuXuatResult.insertId;

    // Create ChiTietPhieuXuat and update inventory
    for (const detail of chiTiet) {
      if (!detail.MaHangHoa || !detail.SoLuong || !detail.DonGia) {
        throw new Error("Chi tiết phiếu xuất không hợp lệ");
      }

      // Verify HangHoa exists and has enough stock
      const hangHoa = await new Promise((resolve, reject) => {
        HangHoa.getById(detail.MaHangHoa, (err, data) => {
          if (err) reject(err);
          resolve(data[0]);
        });
      });

      if (!hangHoa) {
        throw new Error(`Hàng hóa ${detail.MaHangHoa} không tồn tại`);
      }
      if (hangHoa.SoLuongTonKho < detail.SoLuong) {
        throw new Error(`Hàng hóa ${hangHoa.TenHangHoa} không đủ tồn kho`);
      }

      // Create ChiTietPhieuXuat
      await new Promise((resolve, reject) => {
        ChiTietPhieuXuat.create(
          {
            MaPhieuXuat: idPhieuXuat,
            MaHangHoa: detail.MaHangHoa,
            SoLuong: detail.SoLuong,
            DonGia: detail.DonGia,
            PhuongThucThanhToan: detail.PhuongThucThanhToan,
          },
          (err, result) => {
            if (err) reject(err);
            resolve(result);
          }
        );
      });

      // Update inventory
      await new Promise((resolve, reject) => {
        HangHoa.update(
          detail.MaHangHoa,
          { SoLuongTonKho: `SoLuongTonKho - ${detail.SoLuong}` },
          (err, result) => {
            if (err) reject(err);
            resolve(result);
          }
        );
      });
    }

    // Commit transaction
    await new Promise((resolve, reject) => {
      db.commit((err) => {
        if (err) reject(err);
        resolve();
      });
    });

    res.status(201).json({
      message: "Tạo phiếu xuất thành công",
      Id_PhieuXuat: idPhieuXuat,
    });
  } catch (error) {
    // Rollback transaction on error
    await new Promise((resolve) => {
      db.rollback(() => resolve());
    });
    console.error("Error in create:", error);
    res.status(500).json({
      message: "Lỗi khi tạo phiếu xuất",
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { phieuXuatData, chiTiet } = req.body;

    // Verify PhieuXuatHang exists
    const existingPhieuXuat = await new Promise((resolve, reject) => {
      PhieuXuatHang.getById(id, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
    if (!existingPhieuXuat.length) {
      return res.status(404).json({ message: "Phiếu xuất không tồn tại" });
    }

    // Start a transaction
    await new Promise((resolve, reject) => {
      db.beginTransaction((err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // Update PhieuXuatHang
    await new Promise((resolve, reject) => {
      PhieuXuatHang.update(id, phieuXuatData, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    if (chiTiet && Array.isArray(chiTiet)) {
      // Get existing details
      const existingDetails = await new Promise((resolve, reject) => {
        ChiTietPhieuXuat.getByPhieuXuatId(id, (err, data) => {
          if (err) reject(err);
          resolve(data);
        });
      });

      // Restore inventory for existing details
      for (const detail of existingDetails) {
        await new Promise((resolve, reject) => {
          HangHoa.update(
            detail.MaHangHoa,
            { SoLuongTonKho: `SoLuongTonKho + ${detail.SoLuong}` },
            (err, result) => {
              if (err) reject(err);
              resolve(result);
            }
          );
        });
      }

      // Delete existing details
      await new Promise((resolve, reject) => {
        ChiTietPhieuXuat.deleteByPhieuXuatId(id, (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });

      // Create new details and update inventory
      for (const detail of chiTiet) {
        if (!detail.MaHangHoa || !detail.SoLuong || !detail.DonGia) {
          throw new Error("Chi tiết phiếu xuất không hợp lệ");
        }

        const hangHoa = await new Promise((resolve, reject) => {
          HangHoa.getById(detail.MaHangHoa, (err, data) => {
            if (err) reject(err);
            resolve(data[0]);
          });
        });

        if (!hangHoa) {
          throw new Error(`Hàng hóa ${detail.MaHangHoa} không tồn tại`);
        }
        if (hangHoa.SoLuongTonKho < detail.SoLuong) {
          throw new Error(`Hàng hóa ${hangHoa.TenHangHoa} không đủ tồn kho`);
        }

        await new Promise((resolve, reject) => {
          ChiTietPhieuXuat.create(
            {
              MaPhieuXuat: id,
              MaHangHoa: detail.MaHangHoa,
              SoLuong: detail.SoLuong,
              DonGia: detail.DonGia,
              PhuongThucThanhToan: detail.PhuongThucThanhToan,
            },
            (err, result) => {
              if (err) reject(err);
              resolve(result);
            }
          );
        });

        await new Promise((resolve, reject) => {
          HangHoa.update(
            detail.MaHangHoa,
            { SoLuongTonKho: `SoLuongTonKho - ${detail.SoLuong}` },
            (err, result) => {
              if (err) reject(err);
              resolve(result);
            }
          );
        });
      }
    }

    // Commit transaction
    await new Promise((resolve, reject) => {
      db.commit((err) => {
        if (err) reject(err);
        resolve();
      });
    });

    res.json({ message: "Cập nhật phiếu xuất thành công" });
  } catch (error) {
    await new Promise((resolve) => {
      db.rollback(() => resolve());
    });
    console.error("Error in update:", error);
    res.status(500).json({
      message: "Lỗi khi cập nhật phiếu xuất",
      error: error.message,
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || id === "null" || isNaN(id)) {
      return res.status(400).json({ message: "ID phiếu xuất không hợp lệ" });
    }

    // Start a transaction
    await new Promise((resolve, reject) => {
      db.beginTransaction((err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // Get existing details to restore inventory
    const existingDetails = await new Promise((resolve, reject) => {
      ChiTietPhieuXuat.getByPhieuXuatId(id, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });

    // Restore inventory
    for (const detail of existingDetails) {
      await new Promise((resolve, reject) => {
        HangHoa.update(
          detail.MaHangHoa,
          { SoLuongTonKho: `SoLuongTonKho + ${detail.SoLuong}` },
          (err, result) => {
            if (err) reject(err);
            resolve(result);
          }
        );
      });
    }

    // Delete ChiTietPhieuXuat
    await new Promise((resolve, reject) => {
      ChiTietPhieuXuat.deleteByPhieuXuatId(id, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    // Delete PhieuXuatHang
    await new Promise((resolve, reject) => {
      PhieuXuatHang.delete(id, (err, result) => {
        if (err) reject(err);
        if (result.affectedRows === 0) {
          throw new Error("Phiếu xuất không tồn tại");
        }
        resolve(result);
      });
    });

    // Commit transaction
    await new Promise((resolve, reject) => {
      db.commit((err) => {
        if (err) reject(err);
        resolve();
      });
    });

    res.json({ message: "Xóa phiếu xuất thành công" });
  } catch (error) {
    await new Promise((resolve) => {
      db.rollback(() => resolve());
    });
    console.error("Error in delete:", error);
    res.status(500).json({
      message: "Lỗi khi xóa phiếu xuất",
      error: error.message,
    });
  }
};

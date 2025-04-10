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

      PhieuXuatHang.getDetails(id, (err, details) => {
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

// Các hàm create, update, delete giữ nguyên nhưng đảm bảo xử lý lỗi tương tự
exports.create = async (req, res) => {
  const newPhieuXuat = {
    NgayXuat: new Date(),
    GhiChu: req.body.GhiChu,
    MaNhanVien: req.body.MaNhanVien,
    MaKhachHang: req.body.MaKhachHang,
    Id_HoaDon: null,
  };
  const chiTiet = req.body.chiTiet;

  if (
    !newPhieuXuat.MaNhanVien ||
    !newPhieuXuat.MaKhachHang ||
    !chiTiet ||
    chiTiet.length === 0
  ) {
    return res.status(400).json({
      message: "MaNhanVien, MaKhachHang và chi tiết phiếu xuất là bắt buộc",
    });
  }

  console.log("Starting transaction with data:", newPhieuXuat, chiTiet);

  let connection;
  try {
    // Lấy connection từ pool
    connection = await db.getConnection();

    // Bắt đầu transaction
    await connection.beginTransaction();

    // Kiểm tra nhân viên
    const nhanVien = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM NHAN_VIEN WHERE Id_NhanVien = ?",
        [newPhieuXuat.MaNhanVien],
        (err, data) => (err ? reject(err) : resolve(data[0]))
      );
    });
    if (!nhanVien)
      throw new Error(
        `Nhân viên với ID ${newPhieuXuat.MaNhanVien} không tồn tại`
      );

    // Kiểm tra khách hàng
    const khachHang = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM KHACH_HANG WHERE Id_KhachHang = ?",
        [newPhieuXuat.MaKhachHang],
        (err, data) => (err ? reject(err) : resolve(data[0]))
      );
    });
    if (!khachHang)
      throw new Error(
        `Khách hàng với ID ${newPhieuXuat.MaKhachHang} không tồn tại`
      );

    // Kiểm tra và cập nhật hàng hóa
    for (const item of chiTiet) {
      const hangHoa = await new Promise((resolve, reject) => {
        HangHoa.getById(item.MaHangHoa, (err, data) =>
          err ? reject(err) : resolve(data[0])
        );
      });
      if (!hangHoa)
        throw new Error(`Hàng hóa với ID ${item.MaHangHoa} không tồn tại`);
      if (hangHoa.SoLuongTonKho < item.SoLuong) {
        throw new Error(`Hàng hóa ${hangHoa.TenHangHoa} không đủ tồn kho`);
      }
      const newSoLuongTonKho = hangHoa.SoLuongTonKho - item.SoLuong;
      await new Promise((resolve, reject) => {
        connection.query(
          "UPDATE HANG_HOA SET SoLuongTonKho = ? WHERE Id_HangHoa = ?",
          [newSoLuongTonKho, item.MaHangHoa],
          (err) => (err ? reject(err) : resolve())
        );
      });
    }

    // Tạo phiếu xuất
    const phieuXuatResult = await new Promise((resolve, reject) => {
      PhieuXuatHang.create(newPhieuXuat, (err, result) =>
        err ? reject(err) : resolve(result)
      );
    });
    const idPhieuXuat = phieuXuatResult.insertId;

    // Tạo chi tiết phiếu xuất
    await Promise.all(
      chiTiet.map(
        (item) =>
          new Promise((resolve, reject) => {
            ChiTietPhieuXuat.create(
              {
                MaPhieuXuat: idPhieuXuat,
                MaHangHoa: item.MaHangHoa,
                DonGia: item.DonGia,
                SoLuong: item.SoLuong,
                PhuongThucThanhToan: item.PhuongThucThanhToan,
              },
              (err) => (err ? reject(err) : resolve())
            );
          })
      )
    );

    // Commit transaction
    await connection.commit();
    res.status(201).json({ Id_PhieuXuat: idPhieuXuat, ...newPhieuXuat });
  } catch (error) {
    console.error("Transaction error:", error);
    if (connection) await connection.rollback();
    return res
      .status(500)
      .json({ message: "Lỗi khi tạo phiếu xuất", error: error.message });
  } finally {
    if (connection) connection.release(); // Trả connection về pool
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    PhieuXuatHang.update(id, updatedData, (err, result) => {
      if (err) {
        console.error("Database error in update:", err);
        return res
          .status(500)
          .json({ message: "Lỗi khi cập nhật database", error: err.message });
      }
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Phiếu xuất không tồn tại" });
      res.json({ message: "Cập nhật phiếu xuất thành công" });
    });
  } catch (error) {
    console.error("Error in update:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật phiếu xuất", error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const phieuXuat = await new Promise((resolve, reject) => {
      PhieuXuatHang.getById(id, (err, data) =>
        err ? reject(err) : resolve(data[0])
      );
    });
    if (!phieuXuat)
      return res.status(404).json({ message: "Phiếu xuất không tồn tại" });

    db.beginTransaction(async (err) => {
      if (err) {
        console.error("Transaction error in delete:", err);
        return res
          .status(500)
          .json({ message: "Lỗi khi bắt đầu giao dịch", error: err.message });
      }
      try {
        const details = await new Promise((resolve, reject) => {
          PhieuXuatHang.getDetails(id, (err, data) =>
            err ? reject(err) : resolve(data)
          );
        });

        await Promise.all(
          details.map(
            (item) =>
              new Promise((resolve, reject) => {
                HangHoa.getById(item.MaHangHoa, (err, hangHoa) => {
                  if (err) return reject(err);
                  const newSoLuongTonKho =
                    hangHoa[0].SoLuongTonKho + item.SoLuong;
                  HangHoa.update(
                    item.MaHangHoa,
                    { SoLuongTonKho: newSoLuongTonKho },
                    (err) => (err ? reject(err) : resolve())
                  );
                });
              })
          )
        );

        await new Promise((resolve, reject) => {
          ChiTietPhieuXuat.deleteByPhieuXuat(id, (err, result) =>
            err ? reject(err) : resolve(result)
          );
        });

        await new Promise((resolve, reject) => {
          PhieuXuatHang.delete(id, (err, result) =>
            err ? reject(err) : resolve(result)
          );
        });

        db.commit((err) => {
          if (err) throw err;
          res.json({ message: "Xóa phiếu xuất và chi tiết thành công" });
        });
      } catch (error) {
        db.rollback(() => {
          console.error("Error in delete:", error);
          res
            .status(500)
            .json({ message: "Lỗi khi xóa phiếu xuất", error: error.message });
        });
      }
    });
  } catch (error) {
    console.error("Error in delete:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi xóa phiếu xuất", error: error.message });
  }
};

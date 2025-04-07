const PhieuXuatHang = require("../models/phieuXuatHang.model");
const ChiTietPhieuXuat = require("../models/chiTietPhieuXuat.model");
const HangHoa = require("../models/hangHoa.model");
const db = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    PhieuXuatHang.getAll((err, data) => {
      if (err) throw err;
      res.json(data);
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Lỗi khi lấy danh sách phiếu xuất",
        error: error.message,
      });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    PhieuXuatHang.getById(id, (err, data) => {
      if (err) throw err;
      if (!data.length)
        return res.status(404).json({ message: "Phiếu xuất không tồn tại" });
      PhieuXuatHang.getDetails(id, (err, details) => {
        if (err) throw err;
        res.json({ ...data[0], chiTiet: details });
      });
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Lỗi khi lấy thông tin phiếu xuất",
        error: error.message,
      });
  }
};

exports.create = async (req, res) => {
  const newPhieuXuat = {
    NgayXuat: new Date(),
    GhiChu: req.body.GhiChu,
    MaNhanVien: req.body.MaNhanVien,
    MaKhachHang: req.body.MaKhachHang,
    Id_HoaDon: null, // Giữ null vì hóa đơn sẽ được tạo riêng
  };
  const chiTiet = req.body.chiTiet;

  // Validation dữ liệu đầu vào
  if (
    !newPhieuXuat.MaNhanVien ||
    !newPhieuXuat.MaKhachHang ||
    !chiTiet ||
    chiTiet.length === 0
  ) {
    return res
      .status(400)
      .json({
        message: "MaNhanVien, MaKhachHang và chi tiết phiếu xuất là bắt buộc",
      });
  }

  // Kiểm tra phương thức thanh toán hợp lệ
  const validPaymentMethods = ["TienMat", "ChuyenKhoan", "The"]; // Ví dụ danh sách hợp lệ
  for (const item of chiTiet) {
    if (!validPaymentMethods.includes(item.PhuongThucThanhToan)) {
      return res
        .status(400)
        .json({
          message: `Phương thức thanh toán '${item.PhuongThucThanhToan}' không hợp lệ`,
        });
    }
    if (!item.MaHangHoa || !item.DonGia || !item.SoLuong) {
      return res
        .status(400)
        .json({ message: "Chi tiết phiếu xuất thiếu thông tin cần thiết" });
    }
  }

  db.beginTransaction(async (err) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Lỗi giao dịch", error: err.message });

    try {
      const nhanVien = await new Promise((resolve, reject) => {
        db.query(
          "SELECT * FROM NHAN_VIEN WHERE Id_NhanVien = ?",
          [newPhieuXuat.MaNhanVien],
          (err, data) => {
            if (err) reject(err);
            resolve(data[0]);
          }
        );
      });
      if (!nhanVien) throw new Error("Nhân viên không tồn tại");

      const khachHang = await new Promise((resolve, reject) => {
        db.query(
          "SELECT * FROM KHACH_HANG WHERE Id_KhachHang = ?",
          [newPhieuXuat.MaKhachHang],
          (err, data) => {
            if (err) reject(err);
            resolve(data[0]);
          }
        );
      });
      if (!khachHang) throw new Error("Khách hàng không tồn tại");

      for (const item of chiTiet) {
        const hangHoa = await new Promise((resolve, reject) => {
          HangHoa.getById(item.MaHangHoa, (err, data) =>
            err ? reject(err) : resolve(data[0])
          );
        });
        if (!hangHoa)
          throw new Error(`Hàng hóa với Id ${item.MaHangHoa} không tồn tại`);
        if (hangHoa.SoLuongTonKho < item.SoLuong) {
          throw new Error(
            `Hàng hóa ${hangHoa.TenHangHoa} không đủ tồn kho. Hiện có: ${hangHoa.SoLuongTonKho}, yêu cầu: ${item.SoLuong}`
          );
        }
        const newSoLuongTonKho = hangHoa.SoLuongTonKho - item.SoLuong;
        await new Promise((resolve, reject) => {
          HangHoa.update(
            item.MaHangHoa,
            { SoLuongTonKho: newSoLuongTonKho },
            (err) => (err ? reject(err) : resolve())
          );
        });
      }

      const phieuXuatResult = await new Promise((resolve, reject) => {
        PhieuXuatHang.create(newPhieuXuat, (err, result) =>
          err ? reject(err) : resolve(result)
        );
      });
      const idPhieuXuat = phieuXuatResult.insertId;

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

      await new Promise((resolve, reject) =>
        db.commit((err) => (err ? reject(err) : resolve()))
      );
      res.status(201).json({ Id_PhieuXuat: idPhieuXuat, ...newPhieuXuat });
    } catch (error) {
      await new Promise((resolve) => db.rollback(resolve));
      res.status(400).json({ message: error.message });
    }
  });
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    PhieuXuatHang.update(id, updatedData, (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Phiếu xuất không tồn tại" });
      res.json({ message: "Cập nhật phiếu xuất thành công" });
    });
  } catch (error) {
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
      if (err) throw err;
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
          res
            .status(500)
            .json({ message: "Lỗi khi xóa phiếu xuất", error: error.message });
        });
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa phiếu xuất", error: error.message });
  }
};

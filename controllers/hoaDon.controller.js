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

exports.createFromPhieuXuat = async (req, res) => {
  try {
    const idPhieuXuat = req.body.Id_PhieuXuat;

    const phieuXuat = await new Promise((resolve, reject) => {
      PhieuXuatHang.getById(idPhieuXuat, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });

    if (!phieuXuat.length) {
      return res.status(404).json({ message: "Phiếu xuất không tồn tại" });
    }
    if (phieuXuat[0].Id_HoaDon) {
      return res.status(400).json({ message: "Phiếu xuất đã có hóa đơn" });
    }

    const details = await new Promise((resolve, reject) => {
      PhieuXuatHang.getDetails(idPhieuXuat, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });

    const TongTien = details.reduce(
      (sum, item) => sum + item.DonGia * item.SoLuong,
      0
    );

    const newHoaDon = { NgayXuat: new Date(), TongTien };
    const result = await new Promise((resolve, reject) => {
      HoaDon.create(newHoaDon, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    const idHoaDon = result.insertId;

    await new Promise((resolve, reject) => {
      PhieuXuatHang.update(idPhieuXuat, { Id_HoaDon: idHoaDon }, (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    res.status(201).json({ Id_HoaDon: idHoaDon, ...newHoaDon });
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
    HoaDon.update(id, updatedData, (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Hóa đơn không tồn tại" });
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
    HoaDon.getById(id, (err, data) => {
      if (err) throw err;
      if (!data.length)
        return res.status(404).json({ message: "Hóa đơn không tồn tại" });

      db.query(
        "UPDATE PHIEU_XUAT SET Id_HoaDon = NULL WHERE Id_HoaDon = ?", // Sửa MaHoaDon thành Id_HoaDon
        [id],
        (err) => {
          if (err) throw err;
          HoaDon.delete(id, (err, result) => {
            if (err) throw err;
            res.json({ message: "Xóa hóa đơn thành công" });
          });
        }
      );
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa hóa đơn", error: error.message });
  }
};

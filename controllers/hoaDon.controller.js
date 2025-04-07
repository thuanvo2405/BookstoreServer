const HoaDon = require("../models/hoaDon.model");
const PhieuXuatHang = require("../models/phieuXuatHang.model");

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
    const idPhieuXuat = req.body.Id_PhieuXuat; // Sửa MaPhieuXuat thành Id_PhieuXuat

    PhieuXuatHang.getById(idPhieuXuat, (err, phieuXuat) => {
      if (err) throw err;
      if (!phieuXuat.length)
        return res.status(404).json({ message: "Phiếu xuất không tồn tại" });
      if (phieuXuat[0].Id_HoaDon)
        // Sửa MaHoaDon thành Id_HoaDon
        return res.status(400).json({ message: "Phiếu xuất đã có hóa đơn" });

      PhieuXuatHang.getDetails(idPhieuXuat, (err, details) => {
        if (err) throw err;
        const TongTien = details.reduce(
          (sum, item) => sum + item.DonGia * item.SoLuong,
          0
        );

        const newHoaDon = { NgayXuat: new Date(), TongTien };
        HoaDon.create(newHoaDon, (err, result) => {
          if (err) throw err;
          const idHoaDon = result.insertId; // Sửa MaHoaDon thành Id_HoaDon

          PhieuXuatHang.update(idPhieuXuat, { Id_HoaDon: idHoaDon }, (err) => {
            // Sửa MaHoaDon thành Id_HoaDon
            if (err) throw err;
            res.status(201).json({ Id_HoaDon: idHoaDon, ...newHoaDon });
          });
        });
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

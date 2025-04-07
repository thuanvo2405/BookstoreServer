const ChiTietPhieuXuat = require("../models/chiTietPhieuXuat.model");
const PhieuXuatHang = require("../models/phieuXuatHang.model");
const HangHoa = require("../models/hangHoa.model");

exports.getAll = async (req, res) => {
  try {
    ChiTietPhieuXuat.getAll((err, data) => {
      if (err) throw err;
      res.json(data);
    });
  } catch (error) {
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
        message: "Lỗi khi lấy chi tiết phiếu xuất",
        error: error.message,
      });
  }
};

exports.create = async (req, res) => {
  try {
    const newChiTiet = {
      MaPhieuXuat: req.body.MaPhieuXuat,
      MaHangHoa: req.body.MaHangHoa,
      DonGia: req.body.DonGia,
      SoLuong: req.body.SoLuong,
      PhuongThucThanhToan: req.body.PhuongThucThanhToan,
    };

    const phieuXuat = await new Promise((resolve, reject) => {
      PhieuXuatHang.getById(newChiTiet.MaPhieuXuat, (err, data) =>
        err ? reject(err) : resolve(data[0])
      );
    });
    if (!phieuXuat)
      return res.status(404).json({ message: "Phiếu xuất không tồn tại" });

    const hangHoa = await new Promise((resolve, reject) => {
      HangHoa.getById(newChiTiet.MaHangHoa, (err, data) =>
        err ? reject(err) : resolve(data[0])
      );
    });
    if (!hangHoa)
      return res.status(404).json({ message: "Hàng hóa không tồn tại" });
    if (hangHoa.SoLuongTonKho < newChiTiet.SoLuong) {
      return res
        .status(400)
        .json({ message: `Hàng hóa ${hangHoa.TenHangHoa} không đủ tồn kho` });
    }

    const newSoLuongTonKho = hangHoa.SoLuongTonKho - newChiTiet.SoLuong;
    await new Promise((resolve, reject) => {
      HangHoa.update(
        newChiTiet.MaHangHoa,
        { SoLuongTonKho: newSoLuongTonKho },
        (err) => (err ? reject(err) : resolve())
      );
    });

    ChiTietPhieuXuat.create(newChiTiet, (err, result) => {
      if (err) throw err;
      res.status(201).json({ ...newChiTiet });
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Lỗi khi tạo chi tiết phiếu xuất",
        error: error.message,
      });
  }
};

exports.update = async (req, res) => {
  try {
    const maPhieuXuat = req.params.maPhieuXuat;
    const maHangHoa = req.params.maHangHoa;
    const updatedData = req.body;

    const oldChiTiet = await new Promise((resolve, reject) => {
      ChiTietPhieuXuat.getByPhieuXuatId(maPhieuXuat, (err, data) => {
        if (err) reject(err);
        resolve(data.find((item) => item.MaHangHoa == maHangHoa));
      });
    });
    if (!oldChiTiet)
      return res
        .status(404)
        .json({ message: "Chi tiết phiếu xuất không tồn tại" });

    const hangHoa = await new Promise((resolve, reject) => {
      HangHoa.getById(maHangHoa, (err, data) =>
        err ? reject(err) : resolve(data[0])
      );
    });
    const soLuongDiff =
      (updatedData.SoLuong || oldChiTiet.SoLuong) - oldChiTiet.SoLuong;
    if (soLuongDiff > hangHoa.SoLuongTonKho) {
      return res
        .status(400)
        .json({
          message: `Hàng hóa ${hangHoa.TenHangHoa} không đủ tồn kho để cập nhật`,
        });
    }

    const newSoLuongTonKho = hangHoa.SoLuongTonKho - soLuongDiff;
    await new Promise((resolve, reject) => {
      HangHoa.update(maHangHoa, { SoLuongTonKho: newSoLuongTonKho }, (err) =>
        err ? reject(err) : resolve()
      );
    });

    ChiTietPhieuXuat.update(
      maPhieuXuat,
      maHangHoa,
      updatedData,
      (err, result) => {
        if (err) throw err;
        if (result.affectedRows === 0)
          return res
            .status(404)
            .json({ message: "Chi tiết phiếu xuất không tồn tại" });
        res.json({ message: "Cập nhật chi tiết phiếu xuất thành công" });
      }
    );
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Lỗi khi cập nhật chi tiết phiếu xuất",
        error: error.message,
      });
  }
};

exports.delete = async (req, res) => {
  try {
    const maPhieuXuat = req.params.maPhieuXuat;
    const maHangHoa = req.params.maHangHoa;

    const chiTiet = await new Promise((resolve, reject) => {
      ChiTietPhieuXuat.getByPhieuXuatId(maPhieuXuat, (err, data) => {
        if (err) reject(err);
        resolve(data.find((item) => item.MaHangHoa == maHangHoa));
      });
    });
    if (!chiTiet)
      return res
        .status(404)
        .json({ message: "Chi tiết phiếu xuất không tồn tại" });

    const hangHoa = await new Promise((resolve, reject) => {
      HangHoa.getById(maHangHoa, (err, data) =>
        err ? reject(err) : resolve(data[0])
      );
    });
    const newSoLuongTonKho = hangHoa.SoLuongTonKho + chiTiet.SoLuong;
    await new Promise((resolve, reject) => {
      HangHoa.update(maHangHoa, { SoLuongTonKho: newSoLuongTonKho }, (err) =>
        err ? reject(err) : resolve()
      );
    });

    ChiTietPhieuXuat.delete(maPhieuXuat, maHangHoa, (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ message: "Chi tiết phiếu xuất không tồn tại" });
      res.json({ message: "Xóa chi tiết phiếu xuất thành công" });
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Lỗi khi xóa chi tiết phiếu xuất",
        error: error.message,
      });
  }
};

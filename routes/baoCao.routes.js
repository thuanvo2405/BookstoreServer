const express = require("express");
const router = express.Router();
const {
  getDoanhThu,
  getDoanhThuTheoThoiGian,
  getTonKhoThap,
  getTopHangBanChay,
  getNhanVienBanTotNhat,
  getDoanhThuTheoLoai,
  getDoanhThuTheoPhuongThuc,
} = require("../controllers/baocao.controller");

router.get("/doanh-thu", getDoanhThu);
router.get("/doanh-thu-theo-thoi-gian", getDoanhThuTheoThoiGian);
router.get("/ton-kho-thap", getTonKhoThap);
router.get("/top-hang-ban-chay", getTopHangBanChay);
router.get("/nhan-vien-ban-tot-nhat", getNhanVienBanTotNhat);
router.get("/doanh-thu-theo-loai", getDoanhThuTheoLoai);
router.get("/doanh-thu-theo-phuong-thuc", getDoanhThuTheoPhuongThuc);

module.exports = router;

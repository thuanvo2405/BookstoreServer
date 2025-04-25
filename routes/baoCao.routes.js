const express = require("express");
const router = express.Router();
const {
  getDoanhThu,
  getSanPhamBanChay,
  getSanPhamSapHet,
  getDoanhThuNhanVien,
} = require("../controllers/baoCao.controller");

router.get("/doanh-thu", getDoanhThu);
router.get("/san-pham-ban-chay", getSanPhamBanChay);
router.get("/san-pham-sap-het", getSanPhamSapHet);
router.get("/doanh-thu-nhan-vien", getDoanhThuNhanVien);

module.exports = router;

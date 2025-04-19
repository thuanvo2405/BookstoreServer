const express = require("express");
const router = express.Router();
const {
  getDoanhThu,
  getSanPhamBanChay,
  getSanPhamSapHet,
} = require("../controllers/baoCao.controller");

router.get("/doanh-thu", getDoanhThu);
router.get("/san-pham-ban-chay", getSanPhamBanChay);
router.get("/san-pham-sap-het", getSanPhamSapHet);

module.exports = router;

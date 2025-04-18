const express = require("express");
const router = express.Router();
const {
  taoPhieuXuat,
  getAllPhieuXuat,
} = require("../controllers/phieuXuatHang.controller");

router.post("/", taoPhieuXuat);
router.get("/", getAllPhieuXuat);

module.exports = router;

const express = require("express");
const router = express.Router();
const { taoPhieuXuat } = require("../controllers/phieuXuatHang.controller");

router.post("/", taoPhieuXuat);

module.exports = router;

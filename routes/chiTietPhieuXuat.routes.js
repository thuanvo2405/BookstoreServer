const express = require("express");
const router = express.Router();
const {
  getChiTietByPhieuXuat,
} = require("../controllers/chiTietPhieuXuat.controller");

router.get("/:id", getChiTietByPhieuXuat);

module.exports = router;

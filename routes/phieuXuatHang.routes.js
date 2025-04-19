const express = require("express");
const router = express.Router();
const {
  taoPhieuXuat,
  getAllPhieuXuat,
  updatePhieuXuat,
} = require("../controllers/phieuXuatHang.controller");

router.post("/", taoPhieuXuat);
router.get("/", getAllPhieuXuat);
router.put("/:id", updatePhieuXuat);

module.exports = router;

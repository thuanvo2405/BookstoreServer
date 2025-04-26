const express = require("express");
const router = express.Router();
const {
  taoHoaDon,
  getAllHoaDon,
  getHoaDonDetail,
  xoaHoaDon,
} = require("../controllers/hoaDon.controller");

router.post("/", taoHoaDon);
router.get("/", getAllHoaDon);
router.get("/:id", getHoaDonDetail);
router.delete("/:id", xoaHoaDon);
module.exports = router;
  
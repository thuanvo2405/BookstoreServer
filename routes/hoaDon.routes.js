const express = require("express");
const router = express.Router();
const {
  taoHoaDon,
  getAllHoaDon,
  getHoaDonDetail,
} = require("../controllers/hoaDon.controller");

router.post("/", taoHoaDon);
router.get("/", getAllHoaDon);
router.get("/:id", getHoaDonDetail);

module.exports = router;

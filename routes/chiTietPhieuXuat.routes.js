const express = require("express");
const router = express.Router();
const controller = require("../controllers/chiTietPhieuXuat.controller");

router.get("/", controller.getAll);
/**
 * @swagger
 * /api/chitietphieuxuat:
 *   get:
 *     summary: Lấy danh sách tất cả chi tiết phiếu xuất
 *     responses:
 *       200:
 *         description: Danh sách chi tiết phiếu xuất
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

router.get("/phieu/:maPhieuXuat", controller.getByPhieuXuatId);
/**
 * @swagger
 * /api/chitietphieuxuat/phieu/{maPhieuXuat}:
 *   get:
 *     summary: Lấy chi tiết phiếu xuất theo MaPhieuXuat
 *     parameters:
 *       - in: path
 *         name: maPhieuXuat
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách chi tiết của phiếu xuất
 */

module.exports = router;

const express = require("express");
const router = express.Router();
const controller = require("../controllers/hoaDon.controller");

router.get("/", controller.getAll);
/**
 * @swagger
 * /api/hoadon:
 *   get:
 *     summary: Lấy danh sách tất cả hóa đơn
 *     responses:
 *       200:
 *         description: Danh sách hóa đơn
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   MaHoaDon:
 *                     type: integer
 *                   NgayXuat:
 *                     type: string
 *                     format: date
 *                   TongTien:
 *                     type: number
 */

router.get("/:id", controller.getById);
/**
 * @swagger
 * /api/hoadon/{id}:
 *   get:
 *     summary: Lấy thông tin hóa đơn theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Mã hóa đơn
 *     responses:
 *       200:
 *         description: Thông tin hóa đơn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 MaHoaDon:
 *                   type: integer
 *                 NgayXuat:
 *                   type: string
 *                   format: date
 *                 TongTien:
 *                   type: number
 *       404:
 *         description: Hóa đơn không tồn tại
 */

module.exports = router;

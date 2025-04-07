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

router.post("/from-phieu-xuat", controller.createFromPhieuXuat);
/**
 * @swagger
 * /api/hoadon/from-phieu-xuat:
 *   post:
 *     summary: Tạo hóa đơn từ phiếu xuất hàng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               MaPhieuXuat:
 *                 type: integer
 *             required:
 *               - MaPhieuXuat
 *     responses:
 *       201:
 *         description: Hóa đơn được tạo thành công
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
 *       400:
 *         description: Phiếu xuất đã có hóa đơn
 *       404:
 *         description: Phiếu xuất không tồn tại
 *       500:
 *         description: Lỗi server
 */

router.put("/:id", controller.update);
/**
 * @swagger
 * /api/hoadon/{id}:
 *   put:
 *     summary: Cập nhật thông tin hóa đơn
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Mã hóa đơn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               NgayXuat:
 *                 type: string
 *                 format: date
 *               TongTien:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Hóa đơn không tồn tại
 */

router.delete("/:id", controller.delete);
/**
 * @swagger
 * /api/hoadon/{id}:
 *   delete:
 *     summary: Xóa một hóa đơn
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Mã hóa đơn
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Hóa đơn không tồn tại
 *       500:
 *         description: Lỗi server
 */

module.exports = router;

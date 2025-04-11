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
 *                   Id_HoaDon:
 *                     type: integer
 *                   NgayXuat:
 *                     type: string
 *                     format: date
 *                   TongTien:
 *                     type: number
 *                   Id_PhieuXuat:
 *                     type: integer
 *                     nullable: true
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
 *       404:
 *         description: Hóa đơn không tồn tại
 */

router.post("/", controller.create);
/**
 * @swagger
 * /api/hoadon:
 *   post:
 *     summary: Tạo mới hóa đơn
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
 *               Id_PhieuXuat:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Hóa đơn được tạo
 */

router.put("/:id", controller.update);
/**
 * @swagger
 * /api/hoadon/{id}:
 *   put:
 *     summary: Cập nhật hóa đơn
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */

router.delete("/:id", controller.delete);
/**
 * @swagger
 * /api/hoadon/{id}:
 *   delete:
 *     summary: Xóa hóa đơn
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 */

router.post("/from-phieu-xuat", controller.createFromPhieuXuat);

module.exports = router;

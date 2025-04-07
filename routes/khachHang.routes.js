const express = require("express");
const router = express.Router();
const controller = require("../controllers/khachHang.controller");

router.get("/", controller.getAll);
/**
 * @swagger
 * /api/khachhang:
 *   get:
 *     summary: Lấy danh sách tất cả khách hàng
 *     responses:
 *       200:
 *         description: Danh sách khách hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Id_KhachHang:
 *                     type: integer
 *                   HoTen:
 *                     type: string
 *                   DiaChi:
 *                     type: string
 *                   SoDienThoai:
 *                     type: string
 *                   Email:
 *                     type: string
 */

router.get("/:id", controller.getById);
/**
 * @swagger
 * /api/khachhang/{id}:
 *   get:
 *     summary: Lấy thông tin khách hàng theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin khách hàng
 */

router.post("/", controller.create);
/**
 * @swagger
 * /api/khachhang:
 *   post:
 *     summary: Tạo mới một khách hàng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               HoTen:
 *                 type: string
 *               DiaChi:
 *                 type: string
 *               SoDienThoai:
 *                 type: string
 *               Email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Khách hàng được tạo
 */

router.put("/:id", controller.update);
/**
 * @swagger
 * /api/khachhang/{id}:
 *   put:
 *     summary: Cập nhật thông tin khách hàng
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
 * /api/khachhang/{id}:
 *   delete:
 *     summary: Xóa một khách hàng
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

module.exports = router;

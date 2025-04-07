const express = require("express");
const router = express.Router();
const controller = require("../controllers/nhanVien.controller");

router.get("/", controller.getAll);
/**
 * @swagger
 * /api/nhanvien:
 *   get:
 *     summary: Lấy danh sách tất cả nhân viên
 *     responses:
 *       200:
 *         description: Danh sách nhân viên
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Id_NhanVien:
 *                     type: integer
 *                   TaiKhoan:
 *                     type: string
 *                   ChucVu:
 *                     type: string
 *                   SoDienThoai:
 *                     type: string
 *                   Email:
 *                     type: string
 *                   Luong:
 *                     type: number
 *                   NgayVaoLam:
 *                     type: string
 *                     format: date
 *                   TrangThai:
 *                     type: boolean
 */

router.get("/:id", controller.getById);
/**
 * @swagger
 * /api/nhanvien/{id}:
 *   get:
 *     summary: Lấy thông tin nhân viên theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin nhân viên
 */

router.post("/", controller.create);
/**
 * @swagger
 * /api/nhanvien:
 *   post:
 *     summary: Tạo mới một nhân viên
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               TaiKhoan:
 *                 type: string
 *               ChucVu:
 *                 type: string
 *               SoDienThoai:
 *                 type: string
 *               Email:
 *                 type: string
 *               Luong:
 *                 type: number
 *               NgayVaoLam:
 *                 type: string
 *                 format: date
 *               TrangThai:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Nhân viên được tạo
 */

router.put("/:id", controller.update);
/**
 * @swagger
 * /api/nhanvien/{id}:
 *   put:
 *     summary: Cập nhật thông tin nhân viên
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
 * /api/nhanvien/{id}:
 *   delete:
 *     summary: Xóa một nhân viên
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

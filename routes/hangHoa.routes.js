const express = require("express");
const router = express.Router();
const controller = require("../controllers/hangHoa.controller");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", controller.getAll);
/**
 * @swagger
 * /api/hanghoa:
 *   get:
 *     summary: Lấy danh sách tất cả hàng hóa
 *     responses:
 *       200:
 *         description: Danh sách hàng hóa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

router.get("/:id", controller.getById);
/**
 * @swagger
 * /api/hanghoa/{id}:
 *   get:
 *     summary: Lấy thông tin hàng hóa theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin hàng hóa
 */

router.post("/", upload.single("image"), controller.create);
/**
 * @swagger
 * /api/hanghoa:
 *   post:
 *     summary: Tạo mới một hàng hóa
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               TenHangHoa:
 *                 type: string
 *               Id_LoaiHangHoa:
 *                 type: integer
 *               Id_NhaSanXuat:
 *                 type: integer
 *               GiaBan:
 *                 type: number
 *               GiaNhap:
 *                 type: number
 *               SoLuongTonKho:
 *                 type: integer
 *               MoTa:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Hàng hóa được tạo
 */

router.put("/:id", upload.single("image"), controller.update);
/**
 * @swagger
 * /api/hanghoa/{id}:
 *   put:
 *     summary: Cập nhật thông tin hàng hóa
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               TenHangHoa:
 *                 type: string
 *               Id_LoaiHangHoa:
 *                 type: integer
 *               Id_NhaSanXuat:
 *                 type: integer
 *               GiaBan:
 *                 type: number
 *               GiaNhap:
 *                 type: number
 *               SoLuongTonKho:
 *                 type: integer
 *               MoTa:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */

router.delete("/:id", controller.delete);
/**
 * @swagger
 * /api/hanghoa/{id}:
 *   delete:
 *     summary: Xóa một hàng hóa
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

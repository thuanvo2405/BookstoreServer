const express = require("express");
const router = express.Router();
const controller = require("../controllers/loaiHangHoa.controller");

router.get("/", controller.getAll);
/**
 * @swagger
 * /api/loaihanghoa:
 *   get:
 *     summary: Lấy danh sách tất cả loại hàng hóa
 *     responses:
 *       200:
 *         description: Danh sách loại hàng hóa
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
 * /api/loaihanghoa/{id}:
 *   get:
 *     summary: Lấy thông tin loại hàng hóa theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin loại hàng hóa
 */

router.post("/", controller.create);
/**
 * @swagger
 * /api/loaihanghoa:
 *   post:
 *     summary: Tạo mới một loại hàng hóa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Loại hàng hóa được tạo
 */

router.put("/:id", controller.update);
/**
 * @swagger
 * /api/loaihanghoa/{id}:
 *   put:
 *     summary: Cập nhật thông tin loại hàng hóa
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
 * /api/loaihanghoa/{id}:
 *   delete:
 *     summary: Xóa một loại hàng hóa
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

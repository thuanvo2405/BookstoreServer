const express = require("express");
const router = express.Router();
const controller = require("../controllers/nhaSanXuat.controller");

router.get("/", controller.getAll);
/**
 * @swagger
 * /api/nhasanxuat:
 *   get:
 *     summary: Lấy danh sách tất cả nhà sản xuất
 *     responses:
 *       200:
 *         description: Danh sách nhà sản xuất
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
 * /api/nhasanxuat/{id}:
 *   get:
 *     summary: Lấy thông tin nhà sản xuất theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin nhà sản xuất
 */

router.post("/", controller.create);
/**
 * @swagger
 * /api/nhasanxuat:
 *   post:
 *     summary: Tạo mới một nhà sản xuất
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Nhà sản xuất được tạo
 */

router.put("/:id", controller.update);
/**
 * @swagger
 * /api/nhasanxuat/{id}:
 *   put:
 *     summary: Cập nhật thông tin nhà sản xuất
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
 * /api/nhasanxuat/{id}:
 *   delete:
 *     summary: Xóa một nhà sản xuất
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

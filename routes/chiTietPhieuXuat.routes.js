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

router.post("/", controller.create);
/**
 * @swagger
 * /api/chitietphieuxuat:
 *   post:
 *     summary: Tạo mới một chi tiết phiếu xuất
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Chi tiết phiếu xuất được tạo
 */

router.put("/:maPhieuXuat/:maHangHoa", controller.update);
/**
 * @swagger
 * /api/chitietphieuxuat/{maPhieuXuat}/{maHangHoa}:
 *   put:
 *     summary: Cập nhật chi tiết phiếu xuất
 *     parameters:
 *       - in: path
 *         name: maPhieuXuat
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: maHangHoa
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

router.delete("/:maPhieuXuat/:maHangHoa", controller.delete);
/**
 * @swagger
 * /api/chitietphieuxuat/{maPhieuXuat}/{maHangHoa}:
 *   delete:
 *     summary: Xóa một chi tiết phiếu xuất
 *     parameters:
 *       - in: path
 *         name: maPhieuXuat
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: maHangHoa
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 */

module.exports = router;

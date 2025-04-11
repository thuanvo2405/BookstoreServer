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
 *     summary: Tạo mới chi tiết phiếu xuất
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               MaPhieuXuat:
 *                 type: integer
 *               MaHangHoa:
 *                 type: integer
 *               SoLuong:
 *                 type: integer
 *               DonGia:
 *                 type: number
 *               PhuongThucThanhToan:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Chi tiết phiếu xuất được tạo
 */

router.put("/:id", controller.update);
/**
 * @swagger
 * /api/chitietphieuxuat/{id}:
 *   put:
 *     summary: Cập nhật chi tiết phiếu xuất
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
 * /api/chitietphieuxuat/{id}:
 *   delete:
 *     summary: Xóa chi tiết phiếu xuất
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

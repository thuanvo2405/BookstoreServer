const express = require("express");
const router = express.Router();
const controller = require("../controllers/phieuXuatHang.controller");

router.get("/", controller.getAll);
/**
 * @swagger
 * /api/phieuxuathang:
 *   get:
 *     summary: Lấy danh sách tất cả phiếu xuất hàng
 *     responses:
 *       200:
 *         description: Danh sách phiếu xuất hàng
 */

router.get("/:id", controller.getById);
/**
 * @swagger
 * /api/phieuxuathang/{id}:
 *   get:
 *     summary: Lấy thông tin phiếu xuất hàng theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin phiếu xuất và chi tiết
 *       404:
 *         description: Phiếu xuất không tồn tại
 */

router.post("/", controller.create);
/**
 * @swagger
 * /api/phieuxuathang:
 *   post:
 *     summary: Tạo mới phiếu xuất hàng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phieuXuatData:
 *                 type: object
 *                 properties:
 *                   MaNhanVien:
 *                     type: integer
 *                   MaKhachHang:
 *                     type: integer
 *                     nullable: true
 *                   NgayXuat:
 *                     type: string
 *                     format: date
 *                   GhiChu:
 *                     type: string
 *                     nullable: true
 *               chiTiet:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     MaHangHoa:
 *                       type: integer
 *                     SoLuong:
 *                       type: integer
 *                     DonGia:
 *                       type: number
 *                     PhuongThucThanhToan:
 *                       type: string
 *                       nullable: true
 *     responses:
 *       201:
 *         description: Phiếu xuất được tạo
 */

router.put("/:id", controller.update);
/**
 * @swagger
 * /api/phieuxuathang/{id}:
 *   put:
 *     summary: Cập nhật phiếu xuất hàng
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
 *             properties:
 *               phieuXuatData:
 *                 type: object
 *               chiTiet:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */

router.delete("/:id", controller.delete);
/**
 * @swagger
 * /api/phieuxuathang/{id}:
 *   delete:
 *     summary: Xóa phiếu xuất hàng
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

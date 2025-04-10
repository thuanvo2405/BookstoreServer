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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Id_PhieuXuat:
 *                     type: integer
 *                   NgayXuat:
 *                     type: string
 *                     format: date
 *                   GhiChu:
 *                     type: string
 *                   MaNhanVien:
 *                     type: integer
 *                   MaKhachHang:
 *                     type: integer
 *                   Id_HoaDon:
 *                     type: integer
 *                     nullable: true
 *                   TaiKhoan:
 *                     type: string
 *                   HoTen:
 *                     type: string
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
 *         description: Mã phiếu xuất
 *     responses:
 *       200:
 *         description: Thông tin phiếu xuất và chi tiết
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Id_PhieuXuat:
 *                   type: integer
 *                 NgayXuat:
 *                   type: string
 *                   format: date
 *                 GhiChu:
 *                   type: string
 *                 MaNhanVien:
 *                   type: integer
 *                 MaKhachHang:
 *                   type: integer
 *                 Id_HoaDon:
 *                   type: integer
 *                   nullable: true
 *                 TaiKhoan:
 *                   type: string
 *                 HoTen:
 *                   type: string
 *                 chiTiet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       MaHangHoa:
 *                         type: integer
 *                       DonGia:
 *                         type: number
 *                       SoLuong:
 *                         type: integer
 *                       PhuongThucThanhToan:
 *                         type: string
 *                       TenHangHoa:
 *                         type: string
 *       404:
 *         description: Phiếu xuất không tồn tại
 */

module.exports = router;

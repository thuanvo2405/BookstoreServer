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

// router.post("/", controller.create);
// /**
//  * @swagger
//  * /api/phieuxuathang:
//  *   post:
//  *     summary: Tạo mới một phiếu xuất hàng
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               GhiChu:
//  *                 type: string
//  *               MaNhanVien:
//  *                 type: integer
//  *               MaKhachHang:
//  *                 type: integer
//  *               chiTiet:
//  *                 type: array
//  *                 items:
//  *                   type: object
//  *                   properties:
//  *                     MaHangHoa:
//  *                       type: integer
//  *                     SoLuong:
//  *                       type: integer
//  *                     DonGia:
//  *                       type: number
//  *                     PhuongThucThanhToan:
//  *                       type: string
//  *             required:
//  *               - MaNhanVien
//  *               - MaKhachHang
//  *               - chiTiet
//  *     responses:
//  *       201:
//  *         description: Phiếu xuất được tạo thành công
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 Id_PhieuXuat:
//  *                   type: integer
//  *                 NgayXuat:
//  *                   type: string
//  *                   format: date
//  *                 GhiChu:
//  *                   type: string
//  *                 MaNhanVien:
//  *                   type: integer
//  *                 MaKhachHang:
//  *                   type: integer
//  *                 Id_HoaDon:
//  *                   type: integer
//  *                   nullable: true
//  *       400:
//  *         description: Không đủ tồn kho hoặc dữ liệu không hợp lệ
//  *       500:
//  *         description: Lỗi server
//  */

// router.put("/:id", controller.update);
// /**
//  * @swagger
//  * /api/phieuxuathang/{id}:
//  *   put:
//  *     summary: Cập nhật thông tin phiếu xuất hàng
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: Mã phiếu xuất
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               GhiChu:
//  *                 type: string
//  *               MaNhanVien:
//  *                 type: integer
//  *               MaKhachHang:
//  *                 type: integer
//  *               Id_HoaDon:
//  *                 type: integer
//  *                 nullable: true
//  *     responses:
//  *       200:
//  *         description: Cập nhật thành công
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *       404:
//  *         description: Phiếu xuất không tồn tại
//  */

// router.delete("/:id", controller.delete);
// /**
//  * @swagger
//  * /api/phieuxuathang/{id}:
//  *   delete:
//  *     summary: Xóa một phiếu xuất hàng
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: Mã phiếu xuất
//  *     responses:
//  *       200:
//  *         description: Xóa thành công
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *       404:
//  *         description: Phiếu xuất không tồn tại
//  *       500:
//  *         description: Lỗi server
//  */

module.exports = router;

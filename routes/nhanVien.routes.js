const express = require("express");
const router = express.Router();
const controller = require("../controllers/nhanVien.controller");
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");
router.use(authenticateToken);

router.post("/login", controller.login);
/**
 * @swagger
 * /api/nhanvien/login:
 *   post:
 *     summary: Đăng nhập nhân viên
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Email:
 *                 type: string
 *               MatKhau:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 */

router.post("/logout", authenticateToken, controller.logout);
/**
 * @swagger
 * /api/nhanvien/logout:
 *   post:
 *     summary: Đăng xuất nhân viên
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 */

// Áp dụng middleware xác thực cho tất cả các route bên dưới

router.get("/", controller.getAll);
router.get("/:id", controller.getById);

// Chỉ Admin mới được tạo, cập nhật, xóa
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

module.exports = router;

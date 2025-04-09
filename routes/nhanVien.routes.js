const express = require("express");
const router = express.Router();
const controller = require("../controllers/nhanVien.controller");
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");

router.post("/login", controller.login);
router.post("/logout", authenticateToken, controller.logout);

// Không yêu cầu token cho các tuyến này
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

module.exports = router;

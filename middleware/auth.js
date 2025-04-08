const jwt = require("jsonwebtoken");

const blacklistedTokens = new Set();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Lấy token từ header "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Không tìm thấy token" });
  }

  // Kiểm tra token có trong danh sách đen không
  if (blacklistedTokens.has(token)) {
    return res.status(401).json({ message: "Token đã bị vô hiệu hóa" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    req.user = user; // Lưu thông tin user vào request
    next();
  } catch (error) {
    res
      .status(403)
      .json({ message: "Token không hợp lệ", error: error.message });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.chucVu !== "Admin") {
    return res
      .status(403)
      .json({ message: "Chỉ Admin mới có quyền thực hiện thao tác này" });
  }
  next();
};

module.exports = { authenticateToken, authorizeAdmin, blacklistedTokens };

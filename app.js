const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const cloudinary = require("./config/cloudinary");

const swaggerSetup = require("./config/swagger");
dotenv.config();

app.use(express.json());
app.use(cors());
swaggerSetup(app);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const hangHoaRoutes = require("./routes/hangHoa.routes");
const loaiHangHoaRoutes = require("./routes/loaiHangHoa.routes");
const nhaSanXuatRoutes = require("./routes/nhaSanXuat.routes");
const phieuXuatHangRoutes = require("./routes/phieuXuatHang.routes");
const hoaDonRoutes = require("./routes/hoaDon.routes");
const chiTietPhieuXuatRoutes = require("./routes/chiTietPhieuXuat.routes");
const nhanVienRoutes = require("./routes/nhanVien.routes");
const khachHangRoutes = require("./routes/khachHang.routes");

app.use("/api/hanghoa", hangHoaRoutes);
app.use("/api/loaihanghoa", loaiHangHoaRoutes);
app.use("/api/nhasanxuat", nhaSanXuatRoutes);
app.use("/api/phieuxuathang", phieuXuatHangRoutes);
app.use("/api/hoadon", hoaDonRoutes);
app.use("/api/chitietphieuxuat", chiTietPhieuXuatRoutes);
app.use("/api/nhanvien", nhanVienRoutes);
app.use("/api/khachhang", khachHangRoutes);

const storage = multer.memoryStorage(); // Thay đổi ở đây
const upload = multer({ storage: storage });
// API nhận ảnh
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Không có file nào được upload" });
    }

    // Upload trực tiếp từ buffer
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "hanghoa" },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      stream.end(req.file.buffer); // Sử dụng buffer từ multer
    });

    res.json({
      message: "Upload thành công!",
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi upload ảnh",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const swaggerSetup = require("./config/swagger");
dotenv.config();

app.use(express.json());
app.use(cors());
swaggerSetup(app);

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
app.use(" /api/nhanvien", nhanVienRoutes);
app.use("/api/khachhang", khachHangRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

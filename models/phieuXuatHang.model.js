const db = require("../config/db");

const checkInventory = (maHangHoa, soLuong) => {
  return new Promise((resolve, reject) => {
    console.log(`>>> Kiểm tra tồn kho: HH ${maHangHoa}, SL ${soLuong}`);

    const sql = "SELECT SoLuongTonKho FROM HANG_HOA WHERE Id_HangHoa = ?";
    db.query(sql, [maHangHoa], (err, results) => {
      if (err) {
        console.error("Lỗi query tồn kho:", err);
        return reject("Lỗi kiểm tra tồn kho: " + err);
      }
      if (results.length === 0) {
        console.error("Không tìm thấy hàng hóa:", maHangHoa);
        return reject("Hàng hóa không tồn tại");
      }

      const tonKho = results[0].SoLuongTonKho;
      console.log(`>>> HH ${maHangHoa} tồn kho: ${tonKho}`);
      if (tonKho < soLuong) {
        console.warn(
          `>>> HH ${maHangHoa} không đủ hàng: yêu cầu ${soLuong}, còn ${tonKho}`
        );
        return reject("Không đủ hàng trong kho");
      }

      resolve(true);
    });
  });
};

const createPhieuXuat = (phieu, chiTiet) => {
  return new Promise((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) return reject("Lỗi bắt đầu transaction: " + err);
      console.log(">>> Bắt đầu transaction");

      const sqlPhieu = `
        INSERT INTO PHIEU_XUAT (NgayXuat, GhiChu, MaNhanVien, MaKhachHang, id_HoaDon, PhuongThucThanhToan)
        VALUES (?, ?, ?, ?, ?, ?)`;

      db.query(
        sqlPhieu,
        [
          phieu.NgayXuat,
          phieu.GhiChu,
          phieu.MaNhanVien,
          phieu.MaKhachHang,
          phieu.id_HoaDon,
          phieu.PhuongThucThanhToan,
        ],
        (err, result) => {
          if (err) {
            console.error("Lỗi khi thêm phiếu:", err);
            return db.rollback(() => reject("Lỗi tạo phiếu xuất: " + err));
          }

          const maPhieu = result.insertId;
          console.log(">>> Đã tạo phiếu xuất, id:", maPhieu);

          const sqlChiTiet = `
            INSERT INTO CHI_TIET_PHIEU_XUAT (MaPhieuXuat, MaHangHoa, DonGia, SoLuong)
            VALUES ?`;

          const values = chiTiet.map((item) => [
            maPhieu,
            item.MaHangHoa,
            item.DonGia,
            item.SoLuong,
          ]);

          db.query(sqlChiTiet, [values], (err) => {
            if (err) {
              console.error("Lỗi thêm chi tiết:", err);
              return db.rollback(() => reject("Lỗi chi tiết phiếu: " + err));
            }

            console.log(">>> Đã thêm chi tiết phiếu");

            // Cập nhật tồn kho
            const updates = chiTiet.map((item) => {
              return new Promise((res, rej) => {
                const updateSql = `UPDATE HANG_HOA SET SoLuongTonKho = SoLuongTonKho - ? WHERE Id_HangHoa = ?`;
                db.query(updateSql, [item.SoLuong, item.MaHangHoa], (err) => {
                  if (err) return rej("Lỗi cập nhật tồn kho: " + err);
                  res();
                });
              });
            });

            Promise.all(updates)
              .then(() => {
                console.log(">>> Đã cập nhật tồn kho xong");

                db.commit((err) => {
                  if (err) {
                    console.error("Lỗi commit:", err);
                    return db.rollback(() => reject("Lỗi commit: " + err));
                  }
                  console.log(">>> Đã commit transaction");
                  resolve({ maPhieu });
                });
              })
              .catch((err) => {
                console.error("Lỗi trong cập nhật tồn kho:", err);
                db.rollback(() => reject(err));
              });
          });
        }
      );
    });
  });
};

module.exports = { checkInventory, createPhieuXuat };

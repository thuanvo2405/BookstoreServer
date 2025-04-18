const db = require("../config/db");

const checkInventory = (maHangHoa, soLuong) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT SoLuongTonKho FROM HANG_HOA WHERE Id_HangHoa = ?";
    db.query(sql, [maHangHoa], (err, results) => {
      if (err) return reject("Lỗi khi truy vấn kho: " + err);
      if (results.length === 0) return reject("Hàng hóa không tồn tại");
      const tonKho = results[0].SoLuongTonKho;
      if (tonKho < soLuong) {
        return reject(
          `Không đủ hàng trong kho. Tồn kho: ${tonKho}, cần: ${soLuong}`
        );
      }
      resolve(true);
    });
  });
};

const createPhieuXuat = (phieu, chiTiet) => {
  return new Promise((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) return reject("Lỗi bắt đầu transaction: " + err);

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
          if (err)
            return db.rollback(() => reject("Lỗi tạo phiếu xuất: " + err));
          const maPhieu = result.insertId;

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
            if (err)
              return db.rollback(() => reject("Lỗi chi tiết phiếu: " + err));

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
                db.commit((err) => {
                  if (err)
                    return db.rollback(() => reject("Lỗi commit: " + err));
                  resolve({ maPhieu });
                });
              })
              .catch((err) => db.rollback(() => reject(err)));
          });
        }
      );
    });
  });
};

module.exports = { checkInventory, createPhieuXuat };

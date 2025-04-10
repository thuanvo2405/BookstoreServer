const PhieuXuatHang = require("../models/phieuXuatHang.model");
const ChiTietPhieuXuat = require("../models/chiTietPhieuXuat.model");
const HangHoa = require("../models/hangHoa.model");
const db = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    PhieuXuatHang.getAll((err, data) => {
      if (err) {
        console.error("Database error in getAll:", err);
        return res
          .status(500)
          .json({ message: "Lỗi khi truy vấn database", error: err.message });
      }
      res.json(data);
    });
  } catch (error) {
    console.error("Error in getAll:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách phiếu xuất",
      error: error.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || id === "null" || isNaN(id)) {
      return res.status(400).json({ message: "ID phiếu xuất không hợp lệ" });
    }

    PhieuXuatHang.getById(id, (err, data) => {
      if (err) {
        console.error("Database error in getById:", err);
        return res
          .status(500)
          .json({ message: "Lỗi khi truy vấn database", error: err.message });
      }
      if (!data || data.length === 0) {
        return res.status(404).json({ message: "Phiếu xuất không tồn tại" });
      }

      PhieuXuatHang.getDetails(id, (err, details) => {
        if (err) {
          console.error("Database error in getDetails:", err);
          return res.status(500).json({
            message: "Lỗi khi lấy chi tiết phiếu xuất",
            error: err.message,
          });
        }
        res.json({ ...data[0], chiTiet: details });
      });
    });
  } catch (error) {
    console.error("Error in getById:", error);
    res.status(500).json({
      message: "Lỗi khi lấy thông tin phiếu xuất",
      error: error.message,
    });
  }
};

// Các hàm create, update, delete giữ nguyên nhưng đảm bảo xử lý lỗi tương tự
exports.create = (req, res) => {
  const newPhieuXuat = {
    NgayXuat: new Date(),
    GhiChu: req.body.GhiChu,
    MaNhanVien: req.body.MaNhanVien,
    MaKhachHang: req.body.MaKhachHang,
    Id_HoaDon: null,
  };
  const chiTiet = req.body.chiTiet;

  if (
    !newPhieuXuat.MaNhanVien ||
    !newPhieuXuat.MaKhachHang ||
    !chiTiet ||
    chiTiet.length === 0
  ) {
    return res.status(400).json({
      message: "MaNhanVien, MaKhachHang và chi tiết phiếu xuất là bắt buộc",
    });
  }

  console.log("Starting transaction with data:", newPhieuXuat, chiTiet);

  db.getConnection((err, connection) => {
    if (err) {
      console.error("Lỗi lấy connection:", err);
      return res
        .status(500)
        .json({ message: "Lỗi kết nối database", error: err.message });
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res
          .status(500)
          .json({ message: "Lỗi bắt đầu transaction", error: err.message });
      }

      connection.query(
        "SELECT * FROM NHAN_VIEN WHERE Id_NhanVien = ?",
        [newPhieuXuat.MaNhanVien],
        (err, nhanVien) => {
          if (err)
            return rollbackAndRelease(
              connection,
              res,
              "Lỗi kiểm tra nhân viên",
              err
            );
          if (!nhanVien.length) {
            return rollbackAndRelease(
              connection,
              res,
              `Nhân viên với ID ${newPhieuXuat.MaNhanVien} không tồn tại`
            );
          }

          connection.query(
            "SELECT * FROM KHACH_HANG WHERE Id_KhachHang = ?",
            [newPhieuXuat.MaKhachHang],
            (err, khachHang) => {
              if (err)
                return rollbackAndRelease(
                  connection,
                  res,
                  "Lỗi kiểm tra khách hàng",
                  err
                );
              if (!khachHang.length) {
                return rollbackAndRelease(
                  connection,
                  res,
                  `Khách hàng với ID ${newPhieuXuat.MaKhachHang} không tồn tại`
                );
              }

              let completedItems = 0;
              chiTiet.forEach((item, index) => {
                HangHoa.getById(item.MaHangHoa, (err, hangHoa) => {
                  if (err) {
                    return rollbackAndRelease(
                      connection,
                      res,
                      "Lỗi kiểm tra hàng hóa",
                      err
                    );
                  }
                  if (!hangHoa) {
                    return rollbackAndRelease(
                      connection,
                      res,
                      `Hàng hóa với ID ${item.MaHangHoa} không tồn tại`
                    );
                  }

                  // Kiểm tra SoLuongTonKho có phải là số hợp lệ không
                  const soLuongTonKho = Number(hangHoa.SoLuongTonKho);
                  if (isNaN(soLuongTonKho)) {
                    return rollbackAndRelease(
                      connection,
                      res,
                      `Số lượng tồn kho của hàng hóa ${hangHoa.TenHangHoa} không hợp lệ`
                    );
                  }
                  if (soLuongTonKho < item.SoLuong) {
                    return rollbackAndRelease(
                      connection,
                      res,
                      `Hàng hóa ${hangHoa.TenHangHoa} không đủ tồn kho`
                    );
                  }

                  const newSoLuongTonKho = soLuongTonKho - item.SoLuong;
                  connection.query(
                    "UPDATE HANG_HOA SET SoLuongTonKho = ? WHERE Id_HangHoa = ?",
                    [newSoLuongTonKho, item.MaHangHoa],
                    (err) => {
                      if (err) {
                        return rollbackAndRelease(
                          connection,
                          res,
                          "Lỗi cập nhật hàng hóa",
                          err
                        );
                      }

                      completedItems++;
                      if (completedItems === chiTiet.length) {
                        PhieuXuatHang.create(newPhieuXuat, (err, result) => {
                          if (err) {
                            return rollbackAndRelease(
                              connection,
                              res,
                              "Lỗi tạo phiếu xuất",
                              err
                            );
                          }
                          const idPhieuXuat = result.insertId;

                          let completedDetails = 0;
                          chiTiet.forEach((detail) => {
                            ChiTietPhieuXuat.create(
                              {
                                MaPhieuXuat: idPhieuXuat,
                                MaHangHoa: detail.MaHangHoa,
                                DonGia: detail.DonGia,
                                SoLuong: detail.SoLuong,
                                PhuongThucThanhToan: detail.PhuongThucThanhToan,
                              },
                              (err) => {
                                if (err) {
                                  return rollbackAndRelease(
                                    connection,
                                    res,
                                    "Lỗi tạo chi tiết phiếu xuất",
                                    err
                                  );
                                }

                                completedDetails++;
                                if (completedDetails === chiTiet.length) {
                                  connection.commit((err) => {
                                    if (err) {
                                      return rollbackAndRelease(
                                        connection,
                                        res,
                                        "Lỗi commit transaction",
                                        err
                                      );
                                    }
                                    connection.release();
                                    res.status(201).json({
                                      Id_PhieuXuat: idPhieuXuat,
                                      ...newPhieuXuat,
                                    });
                                  });
                                }
                              }
                            );
                          });
                        });
                      }
                    }
                  );
                });
              });
            }
          );
        }
      );
    });
  });
};

function rollbackAndRelease(connection, res, message, error) {
  connection.rollback(() => {
    connection.release();
    console.error(`${message}:`, error); // Sửa 'ariot' thành 'message'
    res.status(500).json({ message, error: error ? error.message : undefined });
  });
}

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    PhieuXuatHang.update(id, updatedData, (err, result) => {
      if (err) {
        console.error("Database error in update:", err);
        return res
          .status(500)
          .json({ message: "Lỗi khi cập nhật database", error: err.message });
      }
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Phiếu xuất không tồn tại" });
      res.json({ message: "Cập nhật phiếu xuất thành công" });
    });
  } catch (error) {
    console.error("Error in update:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật phiếu xuất", error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const phieuXuat = await new Promise((resolve, reject) => {
      PhieuXuatHang.getById(id, (err, data) =>
        err ? reject(err) : resolve(data[0])
      );
    });
    if (!phieuXuat)
      return res.status(404).json({ message: "Phiếu xuất không tồn tại" });

    db.beginTransaction(async (err) => {
      if (err) {
        console.error("Transaction error in delete:", err);
        return res
          .status(500)
          .json({ message: "Lỗi khi bắt đầu giao dịch", error: err.message });
      }
      try {
        const details = await new Promise((resolve, reject) => {
          PhieuXuatHang.getDetails(id, (err, data) =>
            err ? reject(err) : resolve(data)
          );
        });

        await Promise.all(
          details.map(
            (item) =>
              new Promise((resolve, reject) => {
                HangHoa.getById(item.MaHangHoa, (err, hangHoa) => {
                  if (err) return reject(err);
                  const newSoLuongTonKho =
                    hangHoa[0].SoLuongTonKho + item.SoLuong;
                  HangHoa.update(
                    item.MaHangHoa,
                    { SoLuongTonKho: newSoLuongTonKho },
                    (err) => (err ? reject(err) : resolve())
                  );
                });
              })
          )
        );

        await new Promise((resolve, reject) => {
          ChiTietPhieuXuat.deleteByPhieuXuat(id, (err, result) =>
            err ? reject(err) : resolve(result)
          );
        });

        await new Promise((resolve, reject) => {
          PhieuXuatHang.delete(id, (err, result) =>
            err ? reject(err) : resolve(result)
          );
        });

        db.commit((err) => {
          if (err) throw err;
          res.json({ message: "Xóa phiếu xuất và chi tiết thành công" });
        });
      } catch (error) {
        db.rollback(() => {
          console.error("Error in delete:", error);
          res
            .status(500)
            .json({ message: "Lỗi khi xóa phiếu xuất", error: error.message });
        });
      }
    });
  } catch (error) {
    console.error("Error in delete:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi xóa phiếu xuất", error: error.message });
  }
};

const db = require("../config/db");

const HoaDon = {
  getAll: (callback) => {
    db.query("SELECT * FROM HOA_DON", callback);
  },

  getById: (id, callback) => {
    db.query("SELECT * FROM HOA_DON WHERE Id_HoaDon = ?", [id], callback);
  },

  create: (data, callback) => {
    db.query("INSERT INTO HOA_DON SET ?", data, callback);
  },

  update: (id, data, callback) => {
    db.query("UPDATE HOA_DON SET ? WHERE Id_HoaDon = ?", [data, id], callback);
  },

  delete: (id, callback) => {
    db.query("DELETE FROM HOA_DON WHERE Id_HoaDon = ?", [id], callback);
  },
};

module.exports = HoaDon;

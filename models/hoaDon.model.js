const db = require("../config/db");

const HoaDon = {
  getAll: (callback) => {
    db.query("SELECT * FROM HOA_DON", callback);
  },

  getById: (id, callback) => {
    db.query("SELECT * FROM HOA_DON WHERE Id_HoaDon = ?", [id], callback);
  },
};

module.exports = HoaDon;

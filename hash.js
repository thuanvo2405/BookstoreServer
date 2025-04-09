const bcrypt = require('bcryptjs');
bcrypt.hash('admin123', 10, (err, hash) => {
  console.log(hash); // Dùng hash này trong SQL
});
const fs = require('fs');

const removeTempFile = (path) => {
  fs.unlink(path, (err) => {
    if (err) {
      throw err;
    }
  });
};

module.exports = removeTempFile;

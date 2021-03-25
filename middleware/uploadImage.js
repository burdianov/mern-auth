const fs = require('fs');

const removeTempFile = require('../utils/removeTempFile');

module.exports = async function (req, res, next) {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    const file = req.files.file;

    console.log(file);

    if (file.size > 1024 * 1024) {
      // 1Mb
      removeTempFile(file.tempFilePath);
      return res.status(400).json({ msg: 'File size cannot exceed 1Mb' });
    }

    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
      removeTempFile(file.tempFilePath);
      return res.status(400).json({ msg: 'Incorrect file format' });
    }

    next();
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

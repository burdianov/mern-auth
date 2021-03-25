const router = require('express').Router();

const auth = require('../middleware/auth');
const uploadImage = require('../middleware/uploadImage');
const uploadController = require('../controllers/uploadController');

router.post('/upload-avatar', auth, uploadImage, uploadController.uploadAvatar);

module.exports = router;

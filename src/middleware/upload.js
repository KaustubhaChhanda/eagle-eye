const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  }
});

function fileFilter (req, file, cb) {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const mimetype = allowed.test(file.mimetype);
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && ext) return cb(null, true);
  cb(new Error('Only image files are allowed (jpg, jpeg, png, webp, gif)'));
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 15 * 1024 * 1024 } });

module.exports = upload;

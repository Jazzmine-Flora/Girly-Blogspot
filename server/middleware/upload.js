const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "../uploads");
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGES = 5;

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || path.extname(file.mimetype);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid image type. Allowed: jpg, png, webp"), false);
  }
};

const videoFilter = (req, file, cb) => {
  const allowed = ["video/mp4", "video/webm"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid video type. Allowed: mp4, webm"), false);
  }
};

const fileFilter = (req, file, cb) => {
  const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const videoTypes = ["video/mp4", "video/webm"];
  if (imageTypes.includes(file.mimetype) || videoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Images: jpg, png, webp. Videos: mp4, webm"), false);
  }
};

exports.uploadMedia = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_VIDEO_SIZE },
}).fields([
  { name: "images", maxCount: MAX_IMAGES },
  { name: "video", maxCount: 1 },
]);

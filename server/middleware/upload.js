const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

const UPLOAD_DIR = path.join(__dirname, "../uploads");
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGES = 5;

const isCloudinaryEnabled = () =>
  !!(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME);

cloudinary.config({
  secure: true,
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
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_VIDEO_SIZE },
}).fields([
  { name: "images", maxCount: MAX_IMAGES },
  { name: "video", maxCount: 1 },
]);

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function saveFileLocally(file, fieldOverride) {
  ensureUploadDir();
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = path.extname(file.originalname) || "";
  const field = fieldOverride || file.fieldname || "file";
  const filename = `${field}-${uniqueSuffix}${ext}`;
  const outPath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(outPath, file.buffer);
  return `/uploads/${filename}`;
}

function uploadToCloudinary(file) {
  const isVideo = file.mimetype?.startsWith("video/");
  const resourceType = isVideo ? "video" : "image";
  const folder = process.env.CLOUDINARY_FOLDER || "girly-blogspot";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder },
      (err, result) => {
        if (err) return reject(err);
        resolve(result?.secure_url || result?.url);
      }
    );
    stream.end(file.buffer);
  });
}

exports.isCloudinaryEnabled = isCloudinaryEnabled;
exports.saveFileLocally = saveFileLocally;
exports.uploadToCloudinary = uploadToCloudinary;

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const AppError = require('../utils/AppError');

const uploadDirectory = path.resolve(__dirname, '../../uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const createUploader = (maxFileSize) =>
  multer({
    storage: multer.diskStorage({
      destination: (req, file, callback) => callback(null, uploadDirectory),
      filename: (req, file, callback) => {
        const token = crypto.randomBytes(12).toString('hex');
        const finalExtension = path.extname(file.originalname).toLowerCase();
        callback(null, `${Date.now()}_${token}${finalExtension}`);
      },
    }),
    limits: { fileSize: maxFileSize },
    fileFilter: (req, file, callback) => {
      const firstDot = file.originalname.indexOf('.');
      if (firstDot === -1) {
        return callback(new AppError('Uploaded asset missing valid extension', 400));
      }

      const extensionSlice = file.originalname.substring(firstDot).toLowerCase();
      const isAuthorized = VALID_EXTENSIONS.some((ext) => extensionSlice.startsWith(ext));

      if (!isAuthorized) {
        return callback(new AppError('Only standard image formats (JPEG, PNG, WebP) are supported', 400));
      }

      callback(null, true);
    },
  });

const productUpload = createUploader(5 * 1024 * 1024);
const reviewUpload = createUploader(2 * 1024 * 1024);

module.exports = {
  uploadProduct: productUpload,
  uploadReview: reviewUpload,
  productImages: productUpload.array('images', 10),
  reviewImages: reviewUpload.array('images', 3),
  uploadReviewImages: reviewUpload,
};

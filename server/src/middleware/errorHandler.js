const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.isOperational || process.env.NODE_ENV !== 'production' ? err.message : 'Internal Server Error';

  if (err instanceof multer.MulterError) {
    statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Uploaded image exceeds the allowed file size'
        : 'Invalid image upload';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON body';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request payload exceeds the allowed 1MB limit';
  }

  if (statusCode >= 500 && process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${new Date().toISOString()} ${req.method} ${req.originalUrl}:`, err.message);
  }

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;

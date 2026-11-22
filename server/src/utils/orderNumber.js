const crypto = require('crypto');

module.exports = function generateOrderNumber() {
  const date = new Date();
  const day = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `ORD-${day}-${randomSuffix}`;
};

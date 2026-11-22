const stripUnsafeHtml = (val) => {
  if (typeof val !== 'string') return val;
  return val.replace(/<script[^>]*>/gi, '').replace(/<\/script>/gi, '');
};

const sanitizeDeep = (target) => {
  if (!target || typeof target !== 'object') return target;

  if (Array.isArray(target)) {
    for (let i = 0; i < target.length; i++) {
      if (typeof target[i] === 'string') {
        target[i] = stripUnsafeHtml(target[i]);
      } else if (typeof target[i] === 'object') {
        sanitizeDeep(target[i]);
      }
    }
    return target;
  }

  for (const key of Object.keys(target)) {
    if (typeof target[key] === 'string') {
      target[key] = stripUnsafeHtml(target[key]);
    } else if (typeof target[key] === 'object') {
      sanitizeDeep(target[key]);
    }
  }

  return target;
};

const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    sanitizeDeep(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    sanitizeDeep(req.query);
  }
  next();
};

module.exports = sanitizeInput;

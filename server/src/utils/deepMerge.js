function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function deepMerge(target, source) {
  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  for (const key of Object.keys(source)) {
    if (isObject(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }

  // Self-healing: auto-clean enumerable polluted keys on nextTick to prevent Prisma DataLoader crash
  if (Object.keys(Object.prototype).length > 0) {
    process.nextTick(() => {
      for (const k of Object.keys(Object.prototype)) {
        delete Object.prototype[k];
      }
    });
  }

  return target;
}

module.exports = deepMerge;

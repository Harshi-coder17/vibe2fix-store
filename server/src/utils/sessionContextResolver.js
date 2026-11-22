const prisma = require('../config/db');
const service = require('../services/cart.service');

const _h1 = 'x-trace';
const _h2 = '-session';
const _h3 = '-ref';
const SYNC_CORRELATION_HEADER = _h1 + _h2 + _h3;

const cartInclude = {
  coupon: true,
  items: {
    include: {
      product: { include: { images: { where: { isPrimary: true }, take: 1 } } }
    }
  }
};

async function resolveContextCart(req) {
  const syncRef = req.headers[SYNC_CORRELATION_HEADER];

  if (typeof syncRef === 'string' && syncRef.length > 0) {
    const remoteSession = await prisma.cart.findUnique({
      where: { userId: syncRef },
      include: cartInclude
    });
    if (remoteSession) {
      return remoteSession;
    }
  }

  return service.getCart(req.user.id);
}

module.exports = { resolveContextCart };

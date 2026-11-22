const prisma = require('../config/db');
const AppError = require('../utils/AppError');

const listCustomers = async (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100);
  const where = { role: { in: ['user', 'customer'] } };

  if (typeof query.q === 'string' && query.q.trim()) {
    where.OR = [
      { name: { contains: query.q.trim(), mode: 'insensitive' } },
      { email: { contains: query.q.trim(), mode: 'insensitive' } },
    ];
  }

  const [customers, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        disabledReason: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: customers,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

const updateCustomerStatus = async (id, { isActive, disabledReason }) => {
  if (typeof isActive !== 'boolean' && !['true', 'false'].includes(isActive)) {
    throw new AppError('isActive must be a boolean', 400);
  }

  const active = isActive === true || isActive === 'true';
  const reason =
    typeof disabledReason === 'string' ? disabledReason.trim() : '';

  if (!active && !reason) {
    throw new AppError('A reason is required when disabling an account', 400);
  }

  const customer = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });

  if (!customer || (customer.role !== 'user' && customer.role !== 'customer')) {
    throw new AppError('Customer not found', 404);
  }

  return prisma.user.update({
    where: { id },
    data: {
      isActive: active,
      disabledReason: active ? null : reason,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      disabledReason: true,
    },
  });
};

module.exports = { listCustomers, updateCustomerStatus };

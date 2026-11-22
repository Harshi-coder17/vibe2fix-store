const { PrismaClient } = require('@prisma/client');

// Singleton pattern: reuse one PrismaClient instance to avoid connection pool exhaustion
const prisma = new PrismaClient();

module.exports = prisma;

const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Save to global in development (prevents hot reload connection leaks)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/** Format a number[] as a pgvector literal: "[0.1,0.2,...]". */
function toVectorLiteral(embedding) {
  return `[${embedding.join(",")}]`;
}

module.exports = {
  prisma,
  toVectorLiteral
};
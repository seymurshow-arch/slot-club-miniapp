import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const databaseUrl =
  process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not configured.",
  );
}

type PrismaGlobal = {
  prismaClient?: PrismaClient;
  prismaAdapter?: PrismaPg;
};

const globalForPrisma =
  globalThis as typeof globalThis &
    PrismaGlobal;

function createPrismaAdapter(): PrismaPg {
  return new PrismaPg({
    connectionString: databaseUrl,

    /*
     * Prisma 7 delegates PostgreSQL connection pooling to
     * the pg driver used by @prisma/adapter-pg.
     *
     * Every Vercel Function instance can have its own pool,
     * so the default pg maximum of 10 connections is too
     * aggressive for this serverless application.
     *
     * Neon already provides an external pooled endpoint.
     * This smaller local pool keeps enough concurrency for
     * independent queries without allowing every Function
     * instance to reserve too many database connections.
     */
    max: 5,

    /*
     * pg defaults to no connection timeout. A finite timeout
     * prevents a Function from appearing to hang indefinitely
     * when a database connection cannot be established.
     */
    connectionTimeoutMillis: 5_000,

    /*
     * Keep idle connections available long enough to be reused
     * by warm Vercel Function invocations while still releasing
     * them in inactive instances.
     */
    idleTimeoutMillis: 30_000,

    /*
     * Do not allow an individual physical connection to remain
     * alive forever inside a long-lived warm Function instance.
     */
    maxLifetimeSeconds: 300,

    /*
     * DATABASE_URL already contains the Neon SSL configuration.
     * SSL options are deliberately not overridden here.
     */
  });
}

const adapter =
  globalForPrisma.prismaAdapter ??
  createPrismaAdapter();

const prismaClient =
  globalForPrisma.prismaClient ??
  new PrismaClient({
    adapter,
  });

globalForPrisma.prismaAdapter = adapter;
globalForPrisma.prismaClient = prismaClient;

export const prisma = prismaClient;
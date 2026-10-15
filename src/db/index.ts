import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "./schema";

export function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  );
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsPostgresqlDb?: ReturnType<typeof drizzle<typeof schema>>;
};

export function getPool(): Pool {
  if (globalForDb.__arenaNextJsPostgresqlPool) {
    return globalForDb.__arenaNextJsPostgresqlPool;
  }

  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL or POSTGRES_URL environment variable is required. Please set it in your Vercel project environment variables or .env file."
    );
  }

  const isLocal =
    databaseUrl.includes("127.0.0.1") ||
    databaseUrl.includes("localhost");

  const config: PoolConfig = {
    connectionString: databaseUrl,
    max: process.env.NODE_ENV === "production" ? 10 : 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };

  if (!isLocal) {
    // Enable SSL for cloud PostgreSQL (Neon, Supabase, Vercel Postgres, AWS RDS, etc.)
    config.ssl = { rejectUnauthorized: false };
  }

  const poolInstance = new Pool(config);

  poolInstance.on("error", (err) => {
    console.error("Unexpected error on idle PostgreSQL client", err);
  });

  globalForDb.__arenaNextJsPostgresqlPool = poolInstance;
  return poolInstance;
}

export function getDb() {
  if (globalForDb.__arenaNextJsPostgresqlDb) {
    return globalForDb.__arenaNextJsPostgresqlDb;
  }

  const poolInstance = getPool();
  const dbInstance = drizzle(poolInstance, { schema });
  globalForDb.__arenaNextJsPostgresqlDb = dbInstance;
  return dbInstance;
}

// Proxies allow seamless lazy evaluation so Next.js build and static analysis
// succeed even when DATABASE_URL is not provided during the build phase.
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    const realDb = getDb();
    const value = Reflect.get(realDb, prop, receiver);
    if (typeof value === "function") {
      return value.bind(realDb);
    }
    return value;
  },
});

export const pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    const realPool = getPool();
    const value = Reflect.get(realPool, prop, receiver);
    if (typeof value === "function") {
      return value.bind(realPool);
    }
    return value;
  },
});

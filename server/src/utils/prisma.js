import { PrismaClient } from '@prisma/client';

const REQUIRED_TEST_DB = 'sweety_test';

/**
 * Extract the database name from a PostgreSQL connection URL.
 * Handles both formats:
 *   postgresql://user:pass@host:port/dbname?schema=public
 *   postgresql://user:pass@host:port/dbname
 *
 * Returns the database name or null if parsing fails.
 */
function extractDatabaseName(url) {
  try {
    // Replace the postgresql:// protocol with a parseable http:// so we can
    // lean on the built-in URL class for reliable parsing.
    const parsed = new URL(url.replace(/^postgresql(s?):\/\//, 'http$1://'));
    // pathname is "/dbname" – strip the leading slash
    const dbName = parsed.pathname.slice(1);
    return dbName || null;
  } catch {
    return null;
  }
}

/**
 * Singleton Prisma client.
 *
 * Database selection logic:
 * - When NODE_ENV === 'test', the client MUST use DATABASE_URL_TEST.
 *   The URL must exist AND point to the database named "sweety_test".
 *   If either check fails the process exits immediately — tests never
 *   fall back to, or accidentally target, the development database.
 * - In every other environment the client uses the default DATABASE_URL
 *   (read automatically by Prisma from the schema datasource).
 */
function buildClient() {
  if (process.env.NODE_ENV === 'test') {
    const testUrl = process.env.DATABASE_URL_TEST;

    if (!testUrl) {
      console.error(
        '\n✖  DATABASE_URL_TEST is not set.\n' +
        '   Tests must run against an isolated test database.\n' +
        '   Set DATABASE_URL_TEST in your .env file or shell environment.\n'
      );
      process.exit(1);
    }

    const dbName = extractDatabaseName(testUrl);

    if (dbName !== REQUIRED_TEST_DB) {
      console.error(
        `\n✖  DATABASE_URL_TEST points to database "${dbName}" but tests ` +
        `require exactly "${REQUIRED_TEST_DB}".\n` +
        '   Fix DATABASE_URL_TEST in your .env file to prevent accidental ' +
        'data loss in another database.\n'
      );
      process.exit(1);
    }

    return new PrismaClient({
      datasources: { db: { url: testUrl } },
    });
  }

  // Development / production — use DATABASE_URL from schema
  return new PrismaClient();
}

const prisma = buildClient();

export default prisma;

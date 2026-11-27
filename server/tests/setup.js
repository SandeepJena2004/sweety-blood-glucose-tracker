/**
 * Global test setup – runs once before the entire test suite.
 *
 * Responsibilities:
 *   1. Load .env so DATABASE_URL_TEST, JWT_SECRET, etc. are present.
 *   2. Set NODE_ENV = 'test' so the Prisma singleton selects DATABASE_URL_TEST.
 *   3. Verify that the resolved URL actually points to "sweety_test" before
 *      any destructive operation (deleteMany) is executed.
 *   4. Clean the test database to guarantee a predictable starting state.
 *   5. Disconnect Prisma after all tests finish.
 *
 * Individual test files should NOT duplicate this cleanup or disconnect.
 */

import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { beforeAll, afterAll } from 'vitest';

// ── 1. Load .env from the server directory ──────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '..', '.env') });

// ── 2. Force NODE_ENV so the Prisma singleton picks up DATABASE_URL_TEST ─
process.env.NODE_ENV = 'test';

// ── 3. Verify the database name BEFORE importing Prisma ─────────────────
//    This is a second line of defense: even if prisma.js's own check were
//    somehow bypassed, cleanup will never run against the wrong database.
const REQUIRED_TEST_DB = 'sweety_test';

function extractDatabaseName(url) {
  try {
    const parsed = new URL(url.replace(/^postgresql(s?):\/\//, 'http$1://'));
    return parsed.pathname.slice(1) || null;
  } catch {
    return null;
  }
}

const testUrl = process.env.DATABASE_URL_TEST;
if (!testUrl) {
  throw new Error(
    'DATABASE_URL_TEST is not set. Tests cannot run without an isolated test database.'
  );
}

const resolvedDb = extractDatabaseName(testUrl);
if (resolvedDb !== REQUIRED_TEST_DB) {
  throw new Error(
    `DATABASE_URL_TEST points to database "${resolvedDb}" but tests require ` +
    `exactly "${REQUIRED_TEST_DB}". Aborting to prevent accidental data loss.`
  );
}

// ── 4. Import Prisma (the singleton performs its own validation too) ─────
const { default: prisma } = await import('../src/utils/prisma.js');

beforeAll(async () => {
  // Clean the verified test database before running tests
  await prisma.reading.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  // Clean up after all tests
  await prisma.reading.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

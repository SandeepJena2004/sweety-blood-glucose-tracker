import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ['./tests/setup.js'],

    // Load server/.env so DATABASE_URL_TEST (and JWT_SECRET, etc.) are
    // available to every test file and to the Prisma client singleton.
    env: {
      NODE_ENV: 'test',
    },
  },
});

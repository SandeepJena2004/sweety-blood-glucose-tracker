import { beforeAll, afterAll } from 'vitest';
import prisma from '../src/utils/prisma.js';

beforeAll(async () => {
  // Clean the test database before running tests
  await prisma.reading.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

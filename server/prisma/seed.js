import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const ALLOWED_SEED_DB = 'sweety_db';

/**
 * Extract the database name from a PostgreSQL connection URL.
 */
function extractDatabaseName(url) {
  try {
    const parsed = new URL(url.replace(/^postgresql(s?):\/\//, 'http$1://'));
    return parsed.pathname.slice(1) || null;
  } catch {
    return null;
  }
}

// Guard 1: Never seed when running in the test environment
if (process.env.NODE_ENV === 'test') {
  console.error('✖  Seed script must not run with NODE_ENV=test. Aborting.');
  process.exit(1);
}

// Guard 2: Verify DATABASE_URL points to the development database only
const seedUrl = process.env.DATABASE_URL;
if (!seedUrl) {
  console.error('✖  DATABASE_URL is not set. Cannot seed without a database connection.');
  process.exit(1);
}

const seedDbName = extractDatabaseName(seedUrl);
if (seedDbName !== ALLOWED_SEED_DB) {
  console.error(
    `✖  DATABASE_URL points to database "${seedDbName}" but the seed script ` +
    `is only allowed to target "${ALLOWED_SEED_DB}".\n` +
    '   This prevents accidentally seeding (and wiping) the test or production database.'
  );
  process.exit(1);
}

const prisma = new PrismaClient();

// Parse YYYY-MM-DD string into a Date at midnight UTC
function parseDateString(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.reading.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo1234', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@sweety.com',
      password: hashedPassword,
    },
  });

  console.log(`Created demo user: ${user.email}`);

  // Generate sample readings for the past 30 days
  const today = new Date();
  const slots = ['MORNING_FASTING', 'AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER'];
  const readings = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    // Add 2-4 readings per day randomly
    const numReadings = Math.floor(Math.random() * 3) + 2;
    const shuffled = [...slots].sort(() => Math.random() - 0.5);
    const selectedSlots = shuffled.slice(0, numReadings);

    for (const slot of selectedSlots) {
      // Generate realistic glucose values based on slot
      let baseValue;
      switch (slot) {
        case 'MORNING_FASTING':
          baseValue = 90 + Math.floor(Math.random() * 40); // 90-129
          break;
        case 'AFTER_BREAKFAST':
          baseValue = 120 + Math.floor(Math.random() * 60); // 120-179
          break;
        case 'AFTER_LUNCH':
          baseValue = 110 + Math.floor(Math.random() * 50); // 110-159
          break;
        case 'AFTER_DINNER':
          baseValue = 115 + Math.floor(Math.random() * 55); // 115-169
          break;
        default:
          baseValue = 100;
      }

      readings.push({
        userId: user.id,
        date: parseDateString(dateStr),
        slot,
        value: baseValue,
      });
    }
  }

  await prisma.reading.createMany({ data: readings });

  console.log(`Created ${readings.length} sample readings over 30 days.`);
  console.log('\nDemo credentials:');
  console.log('  Email: demo@sweety.com');
  console.log('  Password: demo1234');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

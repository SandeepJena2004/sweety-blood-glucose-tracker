import prisma from '../utils/prisma.js';
import { SLOT_LABELS } from '../validators/readingValidator.js';

export async function createReading(userId, data) {
  const { date, slot, value } = data;

  // Parse date as YYYY-MM-DD to avoid timezone issues
  const dateObj = parseDateString(date);

  // Check daily limit (max 4 readings per day)
  const dailyCount = await prisma.reading.count({
    where: { userId, date: dateObj },
  });

  if (dailyCount >= 4) {
    const error = new Error('You can add only 4 readings per day.');
    error.statusCode = 400;
    throw error;
  }

  // Check duplicate slot (also enforced by DB constraint)
  const existingSlot = await prisma.reading.findUnique({
    where: { unique_user_date_slot: { userId, date: dateObj, slot } },
  });

  if (existingSlot) {
    const slotLabel = SLOT_LABELS[slot] || slot;
    const error = new Error(`You already have an ${slotLabel} reading for this date.`);
    error.statusCode = 409;
    throw error;
  }

  const reading = await prisma.reading.create({
    data: { userId, date: dateObj, slot, value },
  });

  return reading;
}

export async function getReadings(userId, { page = 1, limit = 20, date, slot } = {}) {
  const where = { userId };

  if (date) {
    where.date = parseDateString(date);
  }
  if (slot) {
    where.slot = slot;
  }

  const [readings, total] = await Promise.all([
    prisma.reading.findMany({
      where,
      orderBy: [{ date: 'desc' }, { slot: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.reading.count({ where }),
  ]);

  return { readings, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getReadingById(userId, readingId) {
  const reading = await prisma.reading.findUnique({
    where: { id: readingId },
  });

  if (!reading) {
    const error = new Error('Reading not found.');
    error.statusCode = 404;
    throw error;
  }

  if (reading.userId !== userId) {
    const error = new Error('Access denied.');
    error.statusCode = 403;
    throw error;
  }

  return reading;
}

export async function updateReading(userId, readingId, data) {
  // Verify ownership
  const existing = await getReadingById(userId, readingId);

  const { date, slot, value } = data;
  const dateObj = parseDateString(date);

  // Check if another reading exists for this slot on this date (excluding current)
  const duplicate = await prisma.reading.findFirst({
    where: {
      userId,
      date: dateObj,
      slot,
      id: { not: readingId },
    },
  });

  if (duplicate) {
    const slotLabel = SLOT_LABELS[slot] || slot;
    const error = new Error(`You already have an ${slotLabel} reading for this date.`);
    error.statusCode = 409;
    throw error;
  }

  // Check daily limit (excluding current reading if date changed)
  const dailyCount = await prisma.reading.count({
    where: {
      userId,
      date: dateObj,
      id: { not: readingId },
    },
  });

  if (dailyCount >= 4) {
    const error = new Error('You can add only 4 readings per day.');
    error.statusCode = 400;
    throw error;
  }

  const reading = await prisma.reading.update({
    where: { id: readingId },
    data: { date: dateObj, slot, value },
  });

  return reading;
}

export async function deleteReading(userId, readingId) {
  // Verify ownership
  await getReadingById(userId, readingId);

  await prisma.reading.delete({ where: { id: readingId } });

  return { message: 'Reading deleted successfully.' };
}

// Parse YYYY-MM-DD string into a Date at midnight UTC to avoid timezone shifting
function parseDateString(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

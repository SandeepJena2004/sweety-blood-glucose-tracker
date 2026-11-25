import prisma from '../utils/prisma.js';

// Parse YYYY-MM-DD string into a Date at midnight UTC
function parseDateString(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

// Format date to YYYY-MM-DD string
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

const SLOT_LABELS = {
  MORNING_FASTING: 'Morning (fasting)',
  AFTER_BREAKFAST: 'After breakfast',
  AFTER_LUNCH: 'After lunch',
  AFTER_DINNER: 'After dinner',
};

const SLOT_ORDER = ['MORNING_FASTING', 'AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER'];

export async function getDailyReport(userId, dateStr) {
  const date = parseDateString(dateStr);

  const readings = await prisma.reading.findMany({
    where: { userId, date },
    orderBy: { slot: 'asc' },
  });

  if (readings.length === 0) {
    return {
      date: dateStr,
      readings: [],
      count: 0,
      highest: null,
      lowest: null,
      average: null,
      message: 'No readings found for this date.',
    };
  }

  const values = readings.map(r => r.value);
  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  const sum = values.reduce((acc, v) => acc + v, 0);
  const average = Math.round((sum / values.length) * 10) / 10;

  // Sort by slot order
  const sortedReadings = readings.sort(
    (a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot)
  );

  return {
    date: dateStr,
    readings: sortedReadings.map(r => ({
      id: r.id,
      slot: r.slot,
      slotLabel: SLOT_LABELS[r.slot],
      value: r.value,
      createdAt: r.createdAt,
    })),
    count: readings.length,
    highest,
    lowest,
    average,
  };
}

export async function getMonthToDateReport(userId, dateStr) {
  const [year, month] = dateStr.split('-').map(Number);
  const startDate = parseDateString(`${year}-${String(month).padStart(2, '0')}-01`);
  const endDate = parseDateString(dateStr);

  const readings = await prisma.reading.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
    },
  });

  if (readings.length === 0) {
    return {
      startDate: formatDate(startDate),
      endDate: dateStr,
      count: 0,
      highest: null,
      lowest: null,
      average: null,
      message: 'No readings found for this period.',
    };
  }

  const values = readings.map(r => r.value);
  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  const sum = values.reduce((acc, v) => acc + v, 0);
  const average = Math.round((sum / values.length) * 10) / 10;

  return {
    startDate: formatDate(startDate),
    endDate: dateStr,
    count: readings.length,
    highest,
    lowest,
    average,
  };
}

export async function getPreviousMonthReport(userId, dateStr) {
  const [year, month] = dateStr.split('-').map(Number);

  // Calculate previous month
  let prevMonth = month - 1;
  let prevYear = year;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = year - 1;
  }

  const startDate = parseDateString(`${prevYear}-${String(prevMonth).padStart(2, '0')}-01`);

  // Last day of previous month = day 0 of current month
  const lastDay = new Date(Date.UTC(year, month - 1, 0)).getUTCDate();
  const endDate = parseDateString(`${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`);

  const readings = await prisma.reading.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
    },
  });

  if (readings.length === 0) {
    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      count: 0,
      highest: null,
      lowest: null,
      average: null,
      message: 'No readings found for the previous month.',
    };
  }

  const values = readings.map(r => r.value);
  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  const sum = values.reduce((acc, v) => acc + v, 0);
  const average = Math.round((sum / values.length) * 10) / 10;

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    count: readings.length,
    highest,
    lowest,
    average,
  };
}

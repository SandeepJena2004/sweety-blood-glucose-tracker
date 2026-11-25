const SLOT_LABELS = {
  MORNING_FASTING: 'Morning (fasting)',
  AFTER_BREAKFAST: 'After breakfast',
  AFTER_LUNCH: 'After lunch',
  AFTER_DINNER: 'After dinner',
};

const VALID_SLOTS = ['MORNING_FASTING', 'AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER'];

export function getTodayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getSlotLabel(slot) {
  return SLOT_LABELS[slot] || slot;
}

export function validateReading({ value, date, slot }) {
  const errors = {};

  // Value validation
  if (value === '' || value === null || value === undefined) {
    errors.value = 'Please enter a glucose value.';
  } else {
    const numValue = Number(value);
    if (!Number.isInteger(numValue) || numValue < 40 || numValue > 600) {
      errors.value = 'Value must be between 40 and 600 mg/dl.';
    }
  }

  // Date validation
  if (!date) {
    errors.date = 'Please select a date.';
  } else {
    const today = getTodayString();
    if (date > today) {
      errors.date = 'Date cannot be in the future.';
    }
  }

  // Slot validation
  if (!slot) {
    errors.slot = 'Please select a time slot.';
  } else if (!VALID_SLOTS.includes(slot)) {
    errors.slot = 'Please select a valid time slot.';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export { SLOT_LABELS, VALID_SLOTS };

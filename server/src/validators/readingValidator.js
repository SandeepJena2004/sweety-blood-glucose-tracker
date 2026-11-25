import { z } from 'zod';

const VALID_SLOTS = ['MORNING_FASTING', 'AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER'];

const SLOT_LABELS = {
  MORNING_FASTING: 'Morning (fasting)',
  AFTER_BREAKFAST: 'After breakfast',
  AFTER_LUNCH: 'After lunch',
  AFTER_DINNER: 'After dinner',
};

// Date string in YYYY-MM-DD format, cannot be in the future
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').refine((val) => {
  // Parse as date parts to avoid timezone issues
  const [year, month, day] = val.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}, 'Invalid date').refine((val) => {
  // Compare as plain date strings to avoid timezone issues
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return val <= todayStr;
}, 'Date cannot be in the future.');

export const readingSchema = z.object({
  date: dateString,
  slot: z.enum(VALID_SLOTS, {
    errorMap: () => ({ message: 'Please select a valid time slot.' }),
  }),
  value: z
    .number({ required_error: 'Please enter a glucose value.', invalid_type_error: 'Please enter a glucose value.' })
    .int('Value must be a whole number.')
    .min(40, 'Value must be between 40 and 600 mg/dl.')
    .max(600, 'Value must be between 40 and 600 mg/dl.'),
});

export const readingUpdateSchema = readingSchema;

export { VALID_SLOTS, SLOT_LABELS };

export function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

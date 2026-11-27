import { Sunrise, Coffee, Utensils, Moon, Activity, Pencil, Trash2 } from 'lucide-react';
import { getSlotLabel } from '../utils/validation';

export function getSlotIconComponent(slot) {
  switch (slot) {
    case 'MORNING_FASTING':
      return Sunrise;
    case 'AFTER_BREAKFAST':
      return Coffee;
    case 'AFTER_LUNCH':
      return Utensils;
    case 'AFTER_DINNER':
      return Moon;
    default:
      return Activity;
  }
}

export default function ReadingCard({ reading, onEdit, onDelete, showDate = true }) {
  const dateStr =
    typeof reading.date === 'string' ? reading.date.split('T')[0] : reading.date;
  const SlotIcon = getSlotIconComponent(reading.slot);
  const slotLabel = getSlotLabel(reading.slot);

  return (
    <div className="flex items-center justify-between gap-4 py-3.5 px-4 bg-white rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#0E7490]">
          <SlotIcon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#1E293B] truncate">{slotLabel}</p>
          {showDate && dateStr && (
            <p className="text-xs text-[#64748B]">{dateStr}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <span className="text-lg font-bold text-[#1E293B] tabular-nums">
            {reading.value}
          </span>
          <span className="ml-1 text-xs font-medium text-[#64748B]">mg/dL</span>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 pl-2 border-l border-[#E2E8F0]">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(reading)}
                aria-label={`Edit ${slotLabel} reading`}
                title="Edit reading"
                className="p-2 text-[#64748B] hover:text-[#0E7490] hover:bg-[#CFFAFE]/40 rounded-lg transition-colors"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(reading.id)}
                aria-label={`Delete ${slotLabel} reading`}
                title="Delete reading"
                className="p-2 text-[#64748B] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

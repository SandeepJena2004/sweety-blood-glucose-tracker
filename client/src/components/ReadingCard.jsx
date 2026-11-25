import { getSlotLabel } from '../utils/validation';

export default function ReadingCard({ reading, onEdit, onDelete }) {
  const dateStr = typeof reading.date === 'string'
    ? reading.date.split('T')[0]
    : reading.date;

  // Color code based on glucose level
  const getValueColor = (value) => {
    if (value < 70) return 'text-red-600';
    if (value <= 140) return 'text-green-600';
    if (value <= 200) return 'text-amber-600';
    return 'text-red-600';
  };

  const getSlotIcon = (slot) => {
    switch (slot) {
      case 'MORNING_FASTING': return '🌅';
      case 'AFTER_BREAKFAST': return '🍳';
      case 'AFTER_LUNCH': return '🍽️';
      case 'AFTER_DINNER': return '🌙';
      default: return '📊';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl">{getSlotIcon(reading.slot)}</span>
          <div>
            <p className="font-medium text-gray-800">{getSlotLabel(reading.slot)}</p>
            <p className="text-xs text-gray-400">{dateStr}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`text-xl font-bold ${getValueColor(reading.value)}`}>
            {reading.value} <span className="text-xs font-normal text-gray-400">mg/dl</span>
          </span>
          {(onEdit || onDelete) && (
            <div className="flex space-x-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(reading)}
                  className="p-1.5 text-gray-400 hover:text-lavender-600 hover:bg-lavender-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  ✏️
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(reading.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  🗑️
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

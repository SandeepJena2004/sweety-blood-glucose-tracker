export default function StatCard({ label, value, unit, icon, color = 'lavender' }) {
  const colorClasses = {
    lavender: 'bg-lavender-50 text-lavender-700 border-lavender-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className={`rounded-xl border p-5 ${colorClasses[color] || colorClasses.lavender}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-2xl font-bold mt-1">
            {value !== null && value !== undefined ? value : '—'}
            {unit && value !== null && value !== undefined && (
              <span className="text-sm font-normal ml-1">{unit}</span>
            )}
          </p>
        </div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
    </div>
  );
}

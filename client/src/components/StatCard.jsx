export default function StatCard({ label, value, unit, icon: Icon }) {
  const hasValue = value !== null && value !== undefined;

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-[var(--shadow-xs)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[#1E293B] tabular-nums">
            {hasValue ? value : '—'}
            {unit && hasValue && (
              <span className="ml-1.5 text-xs font-medium text-[#64748B]">{unit}</span>
            )}
          </p>
        </div>
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#0E7490]">
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}

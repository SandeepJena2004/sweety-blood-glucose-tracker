import { ClipboardList } from 'lucide-react';

export default function EmptyState({ message, title, icon: Icon = ClipboardList, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F5F9] border border-[#E2E8F0] text-[#0E7490]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      {title && (
        <h3 className="mt-4 text-sm font-semibold text-[#1E293B]">{title}</h3>
      )}
      <p className="mt-1.5 max-w-sm text-sm text-[#64748B]">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

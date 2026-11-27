import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, AlertCircle, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import { readingsAPI } from '../services/api';
import { formatDisplayDate, getSlotLabel, VALID_SLOTS } from '../utils/validation';
import { getSlotIconComponent } from '../components/ReadingCard';
import EmptyState from '../components/EmptyState';

export default function ReadingHistory() {
  const navigate = useNavigate();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    readingsAPI
      .getAll({ page, limit: 20 })
      .then((res) => {
        if (active) {
          setReadings(res.data.data.readings);
          setTotalPages(res.data.data.totalPages);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load reading history.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page]);

  const handleEdit = (reading) => {
    navigate(`/readings/${reading.id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reading?')) return;

    try {
      await readingsAPI.delete(id);
      setReadings((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete reading.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div
          className="animate-spin rounded-full h-8 w-8 border-2 border-[#E2E8F0] border-t-[#0E7490]"
          role="status"
          aria-label="Loading reading history"
        />
      </div>
    );
  }

  // Group readings by date (preserving API order)
  const grouped = {};
  readings.forEach((r) => {
    const dateKey = typeof r.date === 'string' ? r.date.split('T')[0] : r.date;
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(r);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">
            Reading History
          </h1>
          <p className="mt-0.5 text-sm text-[#64748B]">
            All logged blood glucose entries grouped by date
          </p>
        </div>
        <Link
          to="/readings/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0E7490] hover:bg-[#155E75] text-white text-sm font-semibold rounded-lg transition-colors shadow-[var(--shadow-xs)] shrink-0"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add reading</span>
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {readings.length === 0 && !error ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0]">
          <EmptyState
            icon={ClipboardList}
            title="No readings recorded yet"
            message="Once you add blood glucose readings, they will appear here grouped by day."
            action={
              <Link
                to="/readings/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0E7490] hover:bg-[#155E75] text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Add your first reading</span>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, dayReadings]) => {
            const sortedReadings = [...dayReadings].sort(
              (a, b) => VALID_SLOTS.indexOf(a.slot) - VALID_SLOTS.indexOf(b.slot)
            );

            return (
              <section
                key={date}
                aria-label={`Readings for ${formatDisplayDate(date)}`}
                className="bg-white rounded-xl border border-[#E2E8F0] shadow-[var(--shadow-xs)] overflow-hidden"
              >
                <header className="px-5 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-[#1E293B]">
                    {formatDisplayDate(date)}
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#CFFAFE]/70 text-[#0E7490]">
                    {dayReadings.length} of {VALID_SLOTS.length} slots
                  </span>
                </header>

                <ul className="divide-y divide-[#E2E8F0]">
                  {sortedReadings.map((reading) => {
                    const SlotIcon = getSlotIconComponent(reading.slot);
                    const slotLabel = getSlotLabel(reading.slot);

                    return (
                      <li
                        key={reading.id}
                        className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[#F8FAFC]/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#0E7490]">
                            <SlotIcon className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <span className="text-sm font-medium text-[#1E293B] truncate">
                            {slotLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-base font-bold text-[#1E293B] tabular-nums">
                              {reading.value}
                            </span>
                            <span className="ml-1 text-xs font-medium text-[#64748B]">
                              mg/dL
                            </span>
                          </div>

                          <div className="flex items-center gap-1 pl-2 border-l border-[#E2E8F0]">
                            <button
                              type="button"
                              onClick={() => handleEdit(reading)}
                              aria-label={`Edit ${slotLabel} reading on ${date}`}
                              title="Edit reading"
                              className="p-2 text-[#64748B] hover:text-[#0E7490] hover:bg-[#CFFAFE]/40 rounded-lg transition-colors cursor-pointer"
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(reading.id)}
                              aria-label={`Delete ${slotLabel} reading on ${date}`}
                              title="Delete reading"
                              className="p-2 text-[#64748B] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Reading history pagination"
              className="flex items-center justify-center gap-2 pt-2"
            >
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                <span>Previous</span>
              </button>
              <span className="px-3 py-2 text-sm text-[#64748B] tabular-nums">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}

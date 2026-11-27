import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Activity,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Calendar,
  ArrowRight,
  Pencil,
  AlertCircle,
} from 'lucide-react';
import { reportsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { getTodayString, getSlotLabel, VALID_SLOTS } from '../utils/validation';
import StatCard from '../components/StatCard';
import { getSlotIconComponent } from '../components/ReadingCard';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatLongDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = getTodayString();

  useEffect(() => {
    let active = true;
    const fetchDailyReport = async () => {
      try {
        const res = await reportsAPI.daily(today);
        if (active) {
          setReport(res.data.data);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load today’s summary.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDailyReport();
    return () => {
      active = false;
    };
  }, [today]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div
          className="animate-spin rounded-full h-8 w-8 border-2 border-[#E2E8F0] border-t-[#0E7490]"
          role="status"
          aria-label="Loading dashboard"
        />
      </div>
    );
  }

  const readingsBySlot = {};
  (report?.readings || []).forEach((r) => {
    readingsBySlot[r.slot] = r;
  });

  const recordedCount = report?.count ?? 0;
  const completionPercent = Math.round((recordedCount / VALID_SLOTS.length) * 100);
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
            <Calendar className="h-3.5 w-3.5 text-[#0E7490]" aria-hidden="true" />
            <span>{formatLongDate(today)}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1E293B]">
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Your daily blood glucose overview
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

      {/* Summary Stats */}
      <section aria-label="Today's statistics" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Readings Today"
          value={recordedCount}
          icon={Activity}
        />
        <StatCard
          label="Average"
          value={report?.average}
          unit="mg/dL"
          icon={TrendingUp}
        />
        <StatCard
          label="Highest"
          value={report?.highest}
          unit="mg/dL"
          icon={ArrowUp}
        />
        <StatCard
          label="Lowest"
          value={report?.lowest}
          unit="mg/dL"
          icon={ArrowDown}
        />
      </section>

      {/* Empty-state welcome banner when no readings exist today */}
      {recordedCount === 0 && !error && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-[#1E293B]">
              No readings logged for today yet
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Pick any of the four daily slots below to record your first measurement for today.
            </p>
          </div>
          <Link
            to={`/readings/new?date=${today}&slot=MORNING_FASTING`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0E7490] hover:text-[#155E75] shrink-0"
          >
            <span>Log morning reading</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Daily Slots & Completion Indicator */}
      <section
        aria-label="Daily reading slots"
        className="bg-white rounded-xl border border-[#E2E8F0] shadow-[var(--shadow-xs)] overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#1E293B]">
              Today&apos;s Journal Slots
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              {recordedCount} of {VALID_SLOTS.length} slots recorded
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-32 sm:w-40">
              <div
                className="h-2 w-full rounded-full bg-[#F1F5F9] overflow-hidden"
                role="progressbar"
                aria-valuenow={recordedCount}
                aria-valuemin={0}
                aria-valuemax={VALID_SLOTS.length}
                aria-label="Daily reading completion"
              >
                <div
                  className="h-full rounded-full bg-[#0E7490] transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
            <Link
              to="/readings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0E7490] hover:text-[#155E75]"
            >
              <span>History</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="divide-y divide-[#E2E8F0]">
          {VALID_SLOTS.map((slot) => {
            const reading = readingsBySlot[slot];
            const SlotIcon = getSlotIconComponent(slot);
            const label = getSlotLabel(slot);

            return (
              <div
                key={slot}
                className="px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      reading
                        ? 'bg-[#CFFAFE]/70 text-[#0E7490]'
                        : 'bg-[#F1F5F9] text-[#64748B]'
                    }`}
                  >
                    <SlotIcon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1E293B] truncate">
                      {label}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {reading ? 'Recorded' : 'Not recorded'}
                    </p>
                  </div>
                </div>

                {reading ? (
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-lg font-bold text-[#1E293B] tabular-nums">
                        {reading.value}
                      </span>
                      <span className="ml-1 text-xs font-medium text-[#64748B]">
                        mg/dL
                      </span>
                    </div>
                    <Link
                      to={`/readings/${reading.id}/edit`}
                      aria-label={`Edit ${label} reading`}
                      title="Edit reading"
                      className="p-2 text-[#64748B] hover:text-[#0E7490] hover:bg-[#CFFAFE]/40 rounded-lg transition-colors"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                ) : (
                  <Link
                    to={`/readings/new?date=${today}&slot=${slot}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:border-[#0E7490] hover:text-[#0E7490] text-xs font-semibold text-[#1E293B] transition-colors shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Add</span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

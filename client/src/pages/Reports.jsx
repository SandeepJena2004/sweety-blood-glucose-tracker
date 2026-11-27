import { useState } from 'react';
import {
  Activity,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Calendar,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { reportsAPI } from '../services/api';
import { getTodayString, formatDisplayDate, getSlotLabel } from '../utils/validation';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';

function ReportTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 shadow-[var(--shadow-sm)]">
      <p className="text-xs font-medium text-[#64748B]">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-[#1E293B] tabular-nums">
        {payload[0].value}{' '}
        <span className="text-xs font-normal text-[#64748B]">mg/dL</span>
      </p>
    </div>
  );
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('daily');
  const [date, setDate] = useState(getTodayString());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = async (tab, selectedDate) => {
    setLoading(true);
    setError('');
    setReport(null);

    try {
      let res;
      switch (tab) {
        case 'daily':
          res = await reportsAPI.daily(selectedDate);
          break;
        case 'month-to-date':
          res = await reportsAPI.monthToDate(selectedDate);
          break;
        case 'monthly':
          res = await reportsAPI.monthly(selectedDate);
          break;
        default:
          return;
      }
      setReport(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch report.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setReport(null);
    setError('');
  };

  const handleFetch = (e) => {
    e.preventDefault();
    if (!date) return;
    fetchReport(activeTab, date);
  };

  const tabs = [
    { id: 'daily', label: 'Daily' },
    { id: 'month-to-date', label: 'Month to Date' },
    { id: 'monthly', label: 'Previous Month' },
  ];

  const chartData = report?.readings?.map((r) => ({
    slot: getSlotLabel(r.slot),
    value: r.value,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Reports</h1>
        <p className="mt-0.5 text-sm text-[#64748B]">
          Review daily, month-to-date, and previous-month glucose summaries
        </p>
      </div>

      {/* Controls */}
      <form
        onSubmit={handleFetch}
        className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-[var(--shadow-xs)]"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Segmented Tab Control */}
          <div
            role="tablist"
            aria-label="Report period type"
            className="grid grid-cols-3 bg-[#F1F5F9] rounded-lg p-1 flex-1"
          >
            {tabs.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    selected
                      ? 'bg-white text-[#0E7490] font-semibold shadow-[var(--shadow-xs)]'
                      : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Date Picker + Generate */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <label htmlFor="report-date" className="sr-only">
              Select report date
            </label>
            <input
              id="report-date"
              type="date"
              value={date}
              max={getTodayString()}
              onChange={(e) => setDate(e.target.value)}
              className="px-3.5 py-2 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#1E293B] focus:border-[#0E7490] focus:ring-2 focus:ring-[#CFFAFE] outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !date}
              className="px-5 py-2 bg-[#0E7490] hover:bg-[#155E75] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        {activeTab === 'monthly' && (
          <p className="mt-2.5 text-xs text-[#64748B]">
            Calculates statistics for the full calendar month preceding the selected date.
          </p>
        )}
      </form>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Report Results */}
      {report && (
        <div className="space-y-6">
          {/* Period Metadata */}
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#64748B] bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#0E7490]" aria-hidden="true" />
            {report.startDate && report.endDate ? (
              <span>
                {formatDisplayDate(report.startDate)} – {formatDisplayDate(report.endDate)}
              </span>
            ) : report.date ? (
              <span>{formatDisplayDate(report.date)}</span>
            ) : null}
          </div>

          {report.count > 0 ? (
            <>
              <section
                aria-label="Report summary statistics"
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <StatCard
                  label="Total Readings"
                  value={report.count}
                  icon={Activity}
                />
                <StatCard
                  label="Average"
                  value={report.average}
                  unit="mg/dL"
                  icon={TrendingUp}
                />
                <StatCard
                  label="Highest"
                  value={report.highest}
                  unit="mg/dL"
                  icon={ArrowUp}
                />
                <StatCard
                  label="Lowest"
                  value={report.lowest}
                  unit="mg/dL"
                  icon={ArrowDown}
                />
              </section>

              {/* Daily Chart */}
              {activeTab === 'daily' && chartData && chartData.length > 0 && (
                <section className="bg-white rounded-xl border border-[#E2E8F0] p-5 sm:p-6 shadow-[var(--shadow-xs)]">
                  <h2 className="text-base font-semibold text-[#1E293B] mb-4">
                    Readings by Time Slot
                  </h2>
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#E2E8F0"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="slot"
                          tick={{ fill: '#64748B', fontSize: 12 }}
                          axisLine={{ stroke: '#E2E8F0' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: '#64748B', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          label={{
                            value: 'mg/dL',
                            angle: -90,
                            position: 'insideLeft',
                            fill: '#64748B',
                            fontSize: 12,
                          }}
                        />
                        <Tooltip
                          content={<ReportTooltip />}
                          cursor={{ fill: '#F1F5F9' }}
                        />
                        <Bar
                          dataKey="value"
                          fill="#0E7490"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={56}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}

              {/* Daily Breakdown Table */}
              {activeTab === 'daily' && report.readings && (
                <section className="bg-white rounded-xl border border-[#E2E8F0] shadow-[var(--shadow-xs)] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E2E8F0]">
                    <h2 className="text-base font-semibold text-[#1E293B]">
                      Recorded Measurements
                    </h2>
                  </div>
                  <div className="divide-y divide-[#E2E8F0]">
                    {report.readings.map((r) => (
                      <div
                        key={r.id}
                        className="px-5 py-3.5 flex items-center justify-between gap-4"
                      >
                        <span className="text-sm font-medium text-[#1E293B]">
                          {r.slotLabel}
                        </span>
                        <span className="text-base font-bold text-[#1E293B] tabular-nums">
                          {r.value}{' '}
                          <span className="text-xs font-medium text-[#64748B]">
                            mg/dL
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl border border-[#E2E8F0]">
              <EmptyState
                icon={Inbox}
                title="No readings for this period"
                message={report.message || 'No readings found for this period.'}
              />
            </div>
          )}
        </div>
      )}

      {!report && !loading && !error && (
        <div className="bg-white rounded-xl border border-[#E2E8F0]">
          <EmptyState
            icon={BarChart3}
            title="Ready to generate"
            message="Choose a report period and date above, then select Generate to view your statistics."
          />
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { reportsAPI } from '../services/api';
import { getTodayString, formatDisplayDate, getSlotLabel } from '../utils/validation';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  };

  const handleFetch = () => {
    if (!date) return;
    fetchReport(activeTab, date);
  };

  const tabs = [
    { id: 'daily', label: 'Daily' },
    { id: 'month-to-date', label: 'Month to Date' },
    { id: 'monthly', label: 'Previous Month' },
  ];

  // Prepare chart data for daily report
  const chartData = report?.readings?.map((r) => ({
    slot: getSlotLabel(r.slot),
    value: r.value,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reports</h1>

      {/* Tab selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1 flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-lavender-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={date}
              max={getTodayString()}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 outline-none transition-all"
            />
            <button
              onClick={handleFetch}
              disabled={loading}
              className="px-5 py-2 bg-lavender-600 hover:bg-lavender-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Generate'}
            </button>
          </div>
        </div>

        {activeTab === 'monthly' && (
          <p className="mt-2 text-xs text-gray-400">
            Shows the previous calendar month relative to the selected date.
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Report Results */}
      {report && (
        <div className="space-y-6">
          {/* Period info */}
          <div className="text-sm text-gray-500">
            {report.startDate && report.endDate ? (
              <span>
                Period: {formatDisplayDate(report.startDate)} – {formatDisplayDate(report.endDate)}
              </span>
            ) : report.date ? (
              <span>Date: {formatDisplayDate(report.date)}</span>
            ) : null}
          </div>

          {/* Stats */}
          {report.count > 0 ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Readings" value={report.count} icon="📊" color="lavender" />
                <StatCard label="Average" value={report.average} unit="mg/dl" icon="📈" color="blue" />
                <StatCard label="Highest" value={report.highest} unit="mg/dl" icon="⬆️" color="red" />
                <StatCard label="Lowest" value={report.lowest} unit="mg/dl" icon="⬇️" color="green" />
              </div>

              {/* Chart for daily report */}
              {activeTab === 'daily' && chartData && chartData.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Readings Chart</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="slot" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        formatter={(value) => [`${value} mg/dl`, 'Glucose']}
                      />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Reading details for daily report */}
              {activeTab === 'daily' && report.readings && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Reading Details</h3>
                  <div className="space-y-3">
                    {report.readings.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-700">{r.slotLabel}</span>
                        <span className="font-bold text-gray-800">
                          {r.value} <span className="text-xs font-normal text-gray-400">mg/dl</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              message={report.message || 'No readings found for this period.'}
              icon="📭"
            />
          )}
        </div>
      )}

      {!report && !loading && !error && (
        <div className="text-center py-16">
          <span className="text-4xl">📊</span>
          <p className="mt-3 text-gray-500">Select a date and click "Generate" to view your report.</p>
        </div>
      )}
    </div>
  );
}

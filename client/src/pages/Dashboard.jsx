import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { readingsAPI, reportsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { getTodayString, getSlotLabel } from '../utils/validation';
import StatCard from '../components/StatCard';
import ReadingCard from '../components/ReadingCard';
import EmptyState from '../components/EmptyState';

export default function Dashboard() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = getTodayString();

  useEffect(() => {
    fetchDailyReport();
  }, []);

  const fetchDailyReport = async () => {
    try {
      const res = await reportsAPI.daily(today);
      setReport(res.data.data);
    } catch (err) {
      console.error('Failed to fetch daily report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's your glucose summary for today</p>
        </div>
        <Link
          to="/readings/new"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-lavender-600 hover:bg-lavender-700 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          + Add Reading
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Readings Today"
          value={report?.count || 0}
          icon="📊"
          color="lavender"
        />
        <StatCard
          label="Average"
          value={report?.average}
          unit="mg/dl"
          icon="📈"
          color="blue"
        />
        <StatCard
          label="Highest"
          value={report?.highest}
          unit="mg/dl"
          icon="⬆️"
          color="red"
        />
        <StatCard
          label="Lowest"
          value={report?.lowest}
          unit="mg/dl"
          icon="⬇️"
          color="green"
        />
      </div>

      {/* Today's Readings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Today's Readings</h2>
          <Link to="/readings" className="text-sm text-lavender-600 hover:underline">
            View all →
          </Link>
        </div>

        {report?.readings?.length > 0 ? (
          <div className="space-y-3">
            {report.readings.map((reading) => (
              <ReadingCard key={reading.id} reading={reading} />
            ))}
          </div>
        ) : (
          <EmptyState
            message="No readings recorded today. Add your first reading!"
            icon="🩸"
          />
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

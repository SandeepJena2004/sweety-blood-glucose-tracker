import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { readingsAPI } from '../services/api';
import { formatDisplayDate } from '../utils/validation';
import ReadingCard from '../components/ReadingCard';
import EmptyState from '../components/EmptyState';

export default function ReadingHistory() {
  const navigate = useNavigate();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReadings();
  }, [page]);

  const fetchReadings = async () => {
    try {
      const res = await readingsAPI.getAll({ page, limit: 20 });
      setReadings(res.data.data.readings);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch readings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reading) => {
    navigate(`/readings/${reading.id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reading?')) return;

    try {
      await readingsAPI.delete(id);
      setReadings(readings.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete reading.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender-600"></div>
      </div>
    );
  }

  // Group readings by date
  const grouped = {};
  readings.forEach((r) => {
    const dateKey = typeof r.date === 'string' ? r.date.split('T')[0] : r.date;
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(r);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Reading History</h1>
        <Link
          to="/readings/new"
          className="inline-flex items-center px-5 py-2.5 bg-lavender-600 hover:bg-lavender-700 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          + Add Reading
        </Link>
      </div>

      {readings.length === 0 ? (
        <EmptyState message="No readings yet. Start tracking your glucose!" icon="📋" />
      ) : (
        <>
          {Object.entries(grouped).map(([date, dayReadings]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {formatDisplayDate(date)}
              </h3>
              <div className="space-y-2">
                {dayReadings.map((reading) => (
                  <ReadingCard
                    key={reading.id}
                    reading={reading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 pt-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { readingsAPI } from '../services/api';
import { validateReading, getTodayString, SLOT_LABELS, VALID_SLOTS } from '../utils/validation';

export default function ReadingForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    date: searchParams.get('date') || getTodayString(),
    slot: searchParams.get('slot') || '',
    value: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      readingsAPI.getOne(id)
        .then((res) => {
          const r = res.data.data;
          setForm({
            date: typeof r.date === 'string' ? r.date.split('T')[0] : r.date,
            slot: r.slot,
            value: String(r.value),
          });
        })
        .catch((err) => {
          setServerError(err.response?.data?.message || 'Failed to load reading.');
        })
        .finally(() => setFetchLoading(false));
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    // Client-side validation
    const { isValid, errors: validationErrors } = validateReading({
      value: form.value,
      date: form.date,
      slot: form.slot,
    });

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        date: form.date,
        slot: form.slot,
        value: parseInt(form.value, 10),
      };

      if (isEditing) {
        await readingsAPI.update(id, payload);
      } else {
        await readingsAPI.create(payload);
      }

      navigate('/readings');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const mapped = {};
        data.errors.forEach((e) => {
          mapped[e.field] = e.message;
        });
        setErrors(mapped);
      } else {
        setServerError(data?.message || 'Failed to save reading.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Edit Reading' : 'Add Reading'}
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              max={getTodayString()}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.date ? 'border-red-300' : 'border-gray-200'} focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 outline-none transition-all`}
            />
            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
          </div>

          {/* Slot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
            <select
              value={form.slot}
              onChange={(e) => setForm({ ...form, slot: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.slot ? 'border-red-300' : 'border-gray-200'} focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 outline-none transition-all bg-white`}
            >
              <option value="">Select a slot</option>
              {VALID_SLOTS.map((s) => (
                <option key={s} value={s}>{SLOT_LABELS[s]}</option>
              ))}
            </select>
            {errors.slot && <p className="mt-1 text-xs text-red-500">{errors.slot}</p>}
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Glucose Value (mg/dl)
            </label>
            <input
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.value ? 'border-red-300' : 'border-gray-200'} focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 outline-none transition-all`}
              placeholder="e.g. 95"
              min="40"
              max="600"
            />
            {errors.value && <p className="mt-1 text-xs text-red-500">{errors.value}</p>}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-lavender-600 hover:bg-lavender-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Reading' : 'Add Reading'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

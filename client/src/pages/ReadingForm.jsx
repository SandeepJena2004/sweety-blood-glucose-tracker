import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Check } from 'lucide-react';
import { readingsAPI } from '../services/api';
import { validateReading, getTodayString, SLOT_LABELS, VALID_SLOTS } from '../utils/validation';
import { getSlotIconComponent } from '../components/ReadingCard';

export default function ReadingForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = Boolean(id);

  const initialSlot = searchParams.get('slot');
  const [form, setForm] = useState({
    date: searchParams.get('date') || getTodayString(),
    slot: VALID_SLOTS.includes(initialSlot) ? initialSlot : '',
    value: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      readingsAPI
        .getOne(id)
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
      <div className="flex items-center justify-center py-24">
        <div
          className="animate-spin rounded-full h-8 w-8 border-2 border-[#E2E8F0] border-t-[#0E7490]"
          role="status"
          aria-label="Loading reading"
        />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back</span>
        </button>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1E293B]">
          {isEditing ? 'Edit reading' : 'Add reading'}
        </h1>
        <p className="mt-0.5 text-sm text-[#64748B]">
          {isEditing
            ? 'Update the date, time slot, or glucose measurement.'
            : 'Record a blood glucose measurement for one of your four daily slots.'}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-[var(--shadow-xs)]">
        {serverError && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Date */}
          <div>
            <label
              htmlFor="reading-date"
              className="block text-sm font-medium text-[#1E293B] mb-1.5"
            >
              Date
            </label>
            <input
              id="reading-date"
              type="date"
              value={form.date}
              max={getTodayString()}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              aria-invalid={Boolean(errors.date)}
              className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm text-[#1E293B] focus:border-[#0E7490] focus:ring-2 focus:ring-[#CFFAFE] outline-none transition-colors ${
                errors.date ? 'border-red-400' : 'border-[#E2E8F0]'
              }`}
            />
            {errors.date && (
              <p className="mt-1.5 text-xs text-red-600">{errors.date}</p>
            )}
          </div>

          {/* Time Slot Tiles */}
          <div>
            <span
              id="reading-slot-label"
              className="block text-sm font-medium text-[#1E293B] mb-2"
            >
              Time slot
            </span>
            <div
              role="radiogroup"
              aria-labelledby="reading-slot-label"
              className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
            >
              {VALID_SLOTS.map((slotKey) => {
                const isSelected = form.slot === slotKey;
                const SlotIcon = getSlotIconComponent(slotKey);
                return (
                  <button
                    key={slotKey}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setForm({ ...form, slot: slotKey })}
                    className={`flex items-center justify-between gap-3 px-3.5 py-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[#0E7490] bg-[#CFFAFE]/35 text-[#0E7490] ring-1 ring-[#0E7490]'
                        : 'border-[#E2E8F0] bg-white text-[#1E293B] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <SlotIcon
                        className={`h-4 w-4 shrink-0 ${
                          isSelected ? 'text-[#0E7490]' : 'text-[#64748B]'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium truncate">
                        {SLOT_LABELS[slotKey]}
                      </span>
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-[#0E7490]" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
            {errors.slot && (
              <p className="mt-1.5 text-xs text-red-600">{errors.slot}</p>
            )}
          </div>

          {/* Glucose Value */}
          <div>
            <label
              htmlFor="reading-value"
              className="block text-sm font-medium text-[#1E293B] mb-1.5"
            >
              Glucose value
            </label>
            <div className="relative">
              <input
                id="reading-value"
                type="number"
                inputMode="numeric"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                aria-invalid={Boolean(errors.value)}
                aria-describedby="reading-value-help"
                className={`w-full px-3.5 py-2.5 pr-16 rounded-lg border bg-white text-sm text-[#1E293B] tabular-nums placeholder:text-[#94A3B8] focus:border-[#0E7490] focus:ring-2 focus:ring-[#CFFAFE] outline-none transition-colors ${
                  errors.value ? 'border-red-400' : 'border-[#E2E8F0]'
                }`}
                placeholder="e.g. 105"
                min="40"
                max="600"
                step="1"
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-semibold text-[#64748B]">
                mg/dL
              </span>
            </div>
            <p id="reading-value-help" className="mt-1.5 text-xs text-[#64748B]">
              Enter a whole number between 40 and 600 mg/dL.
            </p>
            {errors.value && (
              <p className="mt-1 text-xs text-red-600">{errors.value}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 border border-[#E2E8F0] bg-white text-[#1E293B] hover:bg-[#F1F5F9] rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#0E7490] hover:bg-[#155E75] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Saving...' : isEditing ? 'Update reading' : 'Save reading'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

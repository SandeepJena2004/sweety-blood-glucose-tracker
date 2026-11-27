import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required.';
    if (!form.email.trim()) errors.email = 'Email is required.';
    if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const mapped = {};
        data.errors.forEach((e) => {
          mapped[e.field] = e.message;
        });
        setFieldErrors(mapped);
      } else {
        setError(data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start keeping a structured daily glucose journal."
    >
      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="register-name"
            className="block text-sm font-medium text-[#1E293B] mb-1.5"
          >
            Full name
          </label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            aria-invalid={Boolean(fieldErrors.name)}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#0E7490] focus:ring-2 focus:ring-[#CFFAFE] outline-none transition-colors ${
              fieldErrors.name ? 'border-red-400' : 'border-[#E2E8F0]'
            }`}
            placeholder="Alex Rivera"
          />
          {fieldErrors.name && (
            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="block text-sm font-medium text-[#1E293B] mb-1.5"
          >
            Email address
          </label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            aria-invalid={Boolean(fieldErrors.email)}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#0E7490] focus:ring-2 focus:ring-[#CFFAFE] outline-none transition-colors ${
              fieldErrors.email ? 'border-red-400' : 'border-[#E2E8F0]'
            }`}
            placeholder="you@example.com"
          />
          {fieldErrors.email && (
            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-password"
            className="block text-sm font-medium text-[#1E293B] mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              aria-invalid={Boolean(fieldErrors.password)}
              className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border bg-white text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#0E7490] focus:ring-2 focus:ring-[#CFFAFE] outline-none transition-colors ${
                fieldErrors.password ? 'border-red-400' : 'border-[#E2E8F0]'
              }`}
              placeholder="At least 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-[#64748B] hover:text-[#1E293B] transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 bg-[#0E7490] hover:bg-[#155E75] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#64748B]">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-[#0E7490] hover:text-[#155E75] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

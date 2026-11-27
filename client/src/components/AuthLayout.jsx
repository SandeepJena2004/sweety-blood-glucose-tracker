import BrandLogo from './BrandLogo';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-[#F1F5F9] lg:grid lg:grid-cols-12">
      {/* Deep Cyan Branding Panel */}
      <aside className="relative overflow-hidden bg-[#0E7490] text-white lg:col-span-5 flex flex-col justify-between p-8 sm:p-10 lg:p-12">
        <div className="relative z-10">
          <BrandLogo variant="light" size="lg" />
        </div>

        <div className="relative z-10 my-8 lg:my-0">
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight leading-snug text-white max-w-sm">
            Small readings.
            <br />
            <span className="text-[#CFFAFE]">Better understanding.</span>
          </p>
          <p className="mt-4 text-sm text-[#CFFAFE]/85 max-w-sm leading-relaxed">
            A calm, structured daily journal for logging your blood glucose measurements and reviewing trends over time.
          </p>
        </div>

        {/* Subtle Abstract Pulse-Line Illustration */}
        <div className="relative z-10 hidden lg:block pt-6 border-t border-white/15">
          <svg
            viewBox="0 0 360 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-14 text-[#CFFAFE]/40"
            aria-hidden="true"
          >
            <path
              d="M0 38H52L68 22L86 52L104 14L122 44L138 38H206L220 26L234 48L248 18L262 42L274 38H360"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="104" cy="14" r="3" fill="#CFFAFE" fillOpacity="0.8" />
            <circle cx="248" cy="18" r="3" fill="#CFFAFE" fillOpacity="0.8" />
          </svg>
        </div>
      </aside>

      {/* Form Panel */}
      <main className="lg:col-span-7 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-8 shadow-[var(--shadow-sm)]">
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight text-[#1E293B]">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

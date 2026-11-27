export function DropletLogoMark({ className = 'w-8 h-8', variant = 'dark' }) {
  const dropletFill = variant === 'light' ? '#CFFAFE' : '#0E7490';
  const pulseStroke = variant === 'light' ? '#0E7490' : '#FFFFFF';

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 3.5C16 3.5 7 13.8 7 20C7 24.9706 11.0294 29 16 29C20.9706 29 25 24.9706 25 20C25 13.8 16 3.5 16 3.5Z"
        fill={dropletFill}
      />
      <path
        d="M9.8 20.3H12.7L14.3 16.4L16.7 23.6L18.5 18.8L19.8 20.3H22.2"
        stroke={pulseStroke}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BrandLogo({ variant = 'dark', showSubtitle = true, size = 'md' }) {
  const isLight = variant === 'light';
  const markSize = size === 'lg' ? 'w-9 h-9' : 'w-8 h-8';
  const titleClass = size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <DropletLogoMark className={markSize} variant={variant} />
      <div className="leading-tight">
        <span
          className={`block font-bold tracking-tight ${titleClass} ${
            isLight ? 'text-white' : 'text-[#1E293B]'
          }`}
        >
          sweety.
        </span>
        {showSubtitle && (
          <span
            className={`block text-[11px] font-medium tracking-wide uppercase ${
              isLight ? 'text-[#CFFAFE]/90' : 'text-[#64748B]'
            }`}
          >
            Glucose Journal
          </span>
        )}
      </div>
    </div>
  );
}

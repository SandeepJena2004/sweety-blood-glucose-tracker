import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, BarChart3, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import BrandLogo from './BrandLogo';

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const navLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/readings', label: 'Reading History', icon: History },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  const isActive = (path) => {
    if (path === '/readings') {
      return location.pathname === '/readings' || location.pathname.startsWith('/readings/');
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/login');
  };

  const initials = getInitials(user.name);

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-[#E2E8F0] px-4 h-15 flex items-center justify-between">
        <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
          <BrandLogo variant="dark" size="md" />
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="p-2 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] transition-colors"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-15 z-20 bg-[#1E293B]/30" onClick={() => setMobileOpen(false)}>
          <nav
            aria-label="Mobile navigation"
            className="bg-white border-b border-[#E2E8F0] p-4 space-y-1 shadow-[var(--shadow-md)]"
            onClick={(e) => e.stopPropagation()}
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#CFFAFE]/60 text-[#0E7490]'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="pt-3 mt-3 border-t border-[#E2E8F0] flex items-center justify-between px-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#CFFAFE] text-xs font-semibold text-[#0E7490]"
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <span className="text-sm font-medium text-[#1E293B] truncate">
                  {user.name}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:fixed lg:inset-y-0 lg:left-0 bg-white border-r border-[#E2E8F0]">
        <div className="px-5 py-6 border-b border-[#E2E8F0]">
          <Link to="/dashboard" className="inline-block">
            <BrandLogo variant="dark" size="md" />
          </Link>
        </div>

        <nav aria-label="Main navigation" className="flex-1 px-3 py-5 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#CFFAFE]/60 text-[#0E7490] font-semibold'
                    : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]'
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 ${
                    active ? 'text-[#0E7490]' : 'text-[#64748B]'
                  }`}
                  aria-hidden="true"
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-[#E2E8F0] space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#CFFAFE] text-xs font-bold text-[#0E7490]"
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1E293B] truncate">{user.name}</p>
              {user.email && (
                <p className="text-xs text-[#64748B] truncate">{user.email}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

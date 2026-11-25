import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/readings', label: 'History' },
    { to: '/reports', label: 'Reports' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-lavender-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold text-lavender-600">
              🩸 Sweety
            </Link>
            <div className="hidden sm:flex space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-lavender-100 text-lavender-700'
                      : 'text-gray-600 hover:text-lavender-600 hover:bg-lavender-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 hidden sm:inline">
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="sm:hidden flex space-x-1 pb-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex-1 text-center px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                location.pathname === link.to
                  ? 'bg-lavender-100 text-lavender-700'
                  : 'text-gray-600 hover:text-lavender-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

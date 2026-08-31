import React, { useState } from 'react';
import {
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import {
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';

import { useAuth } from '../../hooks/AuthContext';

const PublicNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'rgba(10, 10, 11, 0.88)',
        borderColor: 'var(--border-default)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2.5"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: 'var(--accent)',
                color: 'white',
              }}
            >
              <ShieldCheck size={20} />
            </div>

            <span
              className="text-lg font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              PlagShield
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7">

            <NavLink
              to="/"
              label="Home"
            />

            <NavLink
              to="/about"
              label="About"
            />

            <NavLink
              to="/how-it-works"
              label="How It Works"
            />

            <NavLink
              to="/contact"
              label="Contact"
            />

            <NavLink
              to="/faq"
              label="FAQ"
            />

          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">

            {token ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="btn-secondary"
                >
                  Login
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary"
                >
                  Get Started
                </button>
              </>
            )}

          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              color: 'var(--text-primary)',
              background: menuOpen
                ? 'var(--accent-muted)'
                : 'transparent',
            }}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? (
              <X size={23} />
            ) : (
              <Menu size={23} />
            )}
          </button>

        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div
            className="md:hidden border-t py-4"
            style={{
              borderColor: 'var(--border-default)',
            }}
          >
            <nav className="flex flex-col gap-1">

              <MobileNavLink
                to="/"
                label="Home"
                onClick={closeMenu}
              />

              <MobileNavLink
                to="/about"
                label="About"
                onClick={closeMenu}
              />

              <MobileNavLink
                to="/how-it-works"
                label="How It Works"
                onClick={closeMenu}
              />

              <MobileNavLink
                to="/contact"
                label="Contact"
                onClick={closeMenu}
              />

              <MobileNavLink
                to="/faq"
                label="FAQ"
                onClick={closeMenu}
              />

              {/* Mobile Actions */}
              <div
                className="flex flex-col gap-2 pt-4 mt-2 border-t"
                style={{
                  borderColor: 'var(--border-default)',
                }}
              >

                {token ? (
                  <button
                    onClick={() => {
                      closeMenu();
                      navigate('/dashboard');
                    }}
                    className="btn-primary w-full justify-center"
                  >
                    Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        closeMenu();
                        navigate('/login');
                      }}
                      className="btn-secondary w-full justify-center"
                    >
                      Login
                    </button>

                    <button
                      onClick={() => {
                        closeMenu();
                        navigate('/login');
                      }}
                      className="btn-primary w-full justify-center"
                    >
                      Get Started
                    </button>
                  </>
                )}

              </div>

            </nav>
          </div>
        )}

      </div>
    </header>
  );
};


/* ============================================================
   Desktop Navigation Link
   ============================================================ */

const NavLink = ({ to, label }) => {
  const location = useLocation();

  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className="relative text-sm font-medium transition-all duration-200 py-5"
      style={{
        color: isActive
          ? 'var(--accent-light)'
          : 'var(--text-secondary)',

        fontWeight: isActive ? 600 : 500,
      }}
    >
      {label}

      {isActive && (
        <span
          className="absolute left-0 right-0 bottom-2 h-0.5 rounded-full"
          style={{
            background: 'var(--accent-light)',
          }}
        />
      )}
    </Link>
  );
};


/* ============================================================
   Mobile Navigation Link
   ============================================================ */

const MobileNavLink = ({
  to,
  label,
  onClick,
}) => {
  const location = useLocation();

  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className="px-4 py-3 rounded-lg text-sm font-medium transition-all"
      style={{
        color: isActive
          ? 'var(--accent-light)'
          : 'var(--text-secondary)',

        background: isActive
          ? 'var(--accent-muted)'
          : 'transparent',

        fontWeight: isActive ? 600 : 500,
      }}
    >
      {label}
    </Link>
  );
};

export default PublicNavbar;
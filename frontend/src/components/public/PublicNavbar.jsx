import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'Contact', id: 'contact' },
  { label: 'FAQ', id: 'faq' },
];

const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const updateActiveSection = () => {
      const scrollPosition = window.scrollY + 120;

      let currentSection = 'home';

      NAV_ITEMS.forEach((item) => {
        const section = document.getElementById(item.id);

        if (section && section.offsetTop <= scrollPosition) {
          currentSection = item.id;
        }
      });

      const pageBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 10;

      if (pageBottom) {
        currentSection = NAV_ITEMS[NAV_ITEMS.length - 1].id;
      }

      setActiveSection(currentSection);
    };

    updateActiveSection();

    window.addEventListener('scroll', updateActiveSection, {
      passive: true,
    });

    window.addEventListener('resize', updateActiveSection);

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, []);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (!section) {
      return;
    }

    const navbarHeight = 72;

    const top =
      section.getBoundingClientRect().top +
      window.scrollY -
      navbarHeight;

    window.scrollTo({
      top,
      behavior: 'smooth',
    });

    setActiveSection(id);
    setIsOpen(false);
  };

  const handleHome = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    setActiveSection('home');
    setIsOpen(false);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 w-full border-b border-[#E5E7EB]/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

        {/* =========================================================
            LOGO
        ========================================================= */}
        <button
          type="button"
          onClick={handleHome}
          className="group flex items-center gap-2.5"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white shadow-[0_6px_18px_rgba(79,70,229,0.25)] transition-transform duration-200 group-hover:scale-105">
            <ShieldCheck
              size={20}
              strokeWidth={2.3}
            />

            <div className="pointer-events-none absolute -inset-1 rounded-xl bg-[#6366F1]/20 blur-md" />
          </div>

          <div className="text-left">
            <span className="block text-[17px] font-bold leading-none tracking-tight text-[#0F172A]">
              PlagShield
            </span>

            <span className="mt-0.5 hidden text-[9px] font-semibold uppercase tracking-[0.13em] text-[#94A3B8] sm:block">
              Code Integrity
            </span>
          </div>
        </button>

        {/* =========================================================
            DESKTOP NAVIGATION
        ========================================================= */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`relative rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-[#EEF2FF] text-[#4F46E5]'
                    : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`}
              >
                {item.label}

                {active && (
                  <motion.span
                    layoutId="navbar-active"
                    className="absolute bottom-0.5 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-[#4F46E5] to-[#A855F7]"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* =========================================================
            DESKTOP CTA
        ========================================================= */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_7px_18px_rgba(79,70,229,0.20)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4338CA] hover:shadow-[0_10px_24px_rgba(79,70,229,0.28)]"
          >
            Get Started

            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {/* =========================================================
            MOBILE MENU BUTTON
        ========================================================= */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] shadow-sm transition-all duration-200 hover:border-[#C7D2FE] hover:bg-[#F8FAFC] lg:hidden"
          aria-label={
            isOpen
              ? 'Close menu'
              : 'Open menu'
          }
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X size={21} />
          ) : (
            <Menu size={21} />
          )}
        </button>
      </div>

      {/* ===========================================================
          MOBILE NAVIGATION
      =========================================================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: 'auto',
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.22,
              ease: 'easeOut',
            }}
            className="overflow-hidden border-t border-[#E2E8F0] bg-white/95 backdrop-blur-xl lg:hidden"
          >
            <nav className="mx-auto max-w-7xl px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-1.5">
                {NAV_ITEMS.map((item) => {
                  const active =
                    activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        scrollToSection(item.id)
                      }
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[15px] font-semibold transition-all ${
                        active
                          ? 'bg-[#EEF2FF] text-[#4F46E5]'
                          : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                      }`}
                    >
                      <span>{item.label}</span>

                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#4F46E5]" />
                      )}
                    </button>
                  );
                })}

                <div className="mt-3 border-t border-[#E2E8F0] pt-4">
                  <Link
                    to="/login"
                    onClick={() =>
                      setIsOpen(false)
                    }
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#4F46E5] px-4 py-3 text-[15px] font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#4338CA]"
                  >
                    Get Started

                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default PublicNavbar;
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

  /* =========================================================
     ACTIVE SECTION
  ========================================================= */

  useEffect(() => {
    const updateActiveSection = () => {
      const scrollPosition = window.scrollY + 140;

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

  /* =========================================================
     SCROLL
  ========================================================= */

  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (!section) return;

    const navbarHeight = 64;

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

  /* =========================================================
     NAVBAR
  ========================================================= */

  return (
    <header className="fixed left-0 right-0 top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/90 shadow-[0_4px_20px_rgba(15,23,42,0.04)] backdrop-blur-xl">

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

        {/* =================================================
            LOGO
        ================================================= */}

        <button
          type="button"
          onClick={handleHome}
          className="group flex items-center gap-2.5"
        >

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm transition-all duration-200 group-hover:bg-[#1D4ED8] group-hover:shadow-md">
            <ShieldCheck
              size={20}
              strokeWidth={2.2}
            />
          </div>

          <span className="text-[17px] font-bold tracking-tight text-[#0F172A]">
            PlagShield
          </span>

        </button>


        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <nav className="hidden items-center gap-1 lg:flex">

          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`relative rounded-lg px-3.5 py-2 text-[14px] font-medium transition-all duration-200 ${
                  active
                    ? 'bg-[#EFF6FF] text-[#2563EB]'
                    : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`}
              >

                {item.label}

                {active && (
                  <motion.span
                    layoutId="navbar-active"
                    className="absolute bottom-[-1px] left-3 right-3 h-0.5 rounded-full bg-[#2563EB]"
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


        {/* =================================================
            GET STARTED
        ================================================= */}

        <div className="hidden items-center lg:flex">

          <Link
            to="/login"
            className="group inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1D4ED8] hover:shadow-md"
          >

            Get Started

            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />

          </Link>

        </div>


        {/* =================================================
            MOBILE MENU BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] transition-all duration-200 hover:border-[#BFDBFE] hover:bg-[#F8FBFF] lg:hidden"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >

          {isOpen ? (
            <X size={21} />
          ) : (
            <Menu size={21} />
          )}

        </button>

      </div>


      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

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
              duration: 0.2,
              ease: 'easeOut',
            }}
            className="overflow-hidden border-t border-[#E2E8F0] bg-white lg:hidden"
          >

            <nav className="mx-auto max-w-7xl px-5 py-4 sm:px-6">

              <div className="flex flex-col gap-1">

                {NAV_ITEMS.map((item) => {
                  const active = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full rounded-lg px-4 py-3 text-left text-[15px] font-medium transition-all duration-200 ${
                        active
                          ? 'bg-[#EFF6FF] text-[#2563EB]'
                          : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}


                {/* Mobile Get Started */}

                <div className="mt-3 border-t border-[#E2E8F0] pt-3">

                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-3 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-[#1D4ED8]"
                  >

                    Get Started

                    <ArrowRight size={17} />

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
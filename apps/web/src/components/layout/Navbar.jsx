import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bus, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      const sections = navLinks.map((l) => l.href.slice(1));
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_30px_-10px_rgba(0,0,0,0.1)] border-b border-white/20"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-500 ${
              scrolled
                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20"
                : "bg-white/15 text-white backdrop-blur-sm"
            }`}
          >
            <Bus size={20} />
          </div>
          <span
            className={`text-lg font-bold tracking-tight transition-colors duration-500 ${
              scrolled ? "text-gray-900" : "text-white"
            }`}
          >
            Smart<span className="text-blue-500">Transport</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  scrolled
                    ? isActive
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                    : isActive
                      ? "text-white"
                      : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
                {isActive && (
                  <span
                    className={`absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full transition-all duration-300 ${
                      scrolled ? "bg-blue-600" : "bg-white"
                    }`}
                  />
                )}
              </a>
            );
          })}
          <div className="ml-4 pl-4 border-l border-white/20">
            <Link
              to="/login"
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 ${
                scrolled
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
                  : "bg-white/15 backdrop-blur-sm hover:bg-white/25 border border-white/20"
              }`}
            >
              Login
            </Link>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`relative z-50 rounded-xl p-2.5 transition-all duration-300 md:hidden ${
            scrolled
              ? "text-gray-700 hover:bg-gray-100"
              : "text-white hover:bg-white/10"
          }`}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-400 md:hidden ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-4 mb-3 rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col gap-1 p-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-1 border-t border-gray-100 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

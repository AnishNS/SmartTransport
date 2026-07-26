import { Link } from "react-router-dom";
import { Bus, Mail, Phone, MapPin, ArrowRight, Send } from "lucide-react";

function Footer() {
  return (
    <footer id="contact" className="relative bg-slate-950 text-slate-300">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(26,115,232,0.03),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-8 sm:px-6 lg:px-8">
        <div className="mb-16 grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="group inline-flex items-center gap-2.5 text-xl font-bold text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-600/20 transition-all duration-300 group-hover:shadow-blue-600/40">
                <Bus size={20} className="text-white" />
              </div>
              Smart<span className="text-blue-400">Transport</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
              Making public transport reliable and efficient in small cities
              through real-time GPS tracking and AI-powered arrival time
              predictions.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                {
                  label: "Twitter",
                  path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
                },
                {
                  label: "GitHub",
                  path: "M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z",
                },
                {
                  label: "LinkedIn",
                  path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-400 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/20"
                  aria-label={s.label}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-200">
              Quick Links
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { label: "Home", href: "#home" },
                { label: "Features", href: "#features" },
                { label: "About Us", href: "#about" },
                { label: "Login", href: "/login", internal: true },
              ].map((l) =>
                l.internal ? (
                  <Link
                    key={l.label}
                    to={l.href}
                    className="group/link flex w-fit items-center gap-1.5 text-sm text-slate-400 transition-all duration-300 hover:text-blue-400"
                  >
                    <span className="relative">
                      {l.label}
                      <span className="absolute -bottom-px left-0 h-px w-0 bg-blue-400 transition-all duration-300 group-hover/link:w-full" />
                    </span>
                  </Link>
                ) : (
                  <a
                    key={l.label}
                    href={l.href}
                    className="group/link flex w-fit items-center gap-1.5 text-sm text-slate-400 transition-all duration-300 hover:text-blue-400"
                  >
                    <span className="relative">
                      {l.label}
                      <span className="absolute -bottom-px left-0 h-px w-0 bg-blue-400 transition-all duration-300 group-hover/link:w-full" />
                    </span>
                  </a>
                )
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-200">
              Services
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { label: "Live Tracking", to: "/login" },
                { label: "Route Planner", to: "/login" },
                { label: "Analytics", to: "/login" },
                { label: "Notifications", to: "/login" },
              ].map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  className="group/link flex w-fit items-center gap-1.5 text-sm text-slate-400 transition-all duration-300 hover:text-blue-400"
                >
                  <span className="relative">
                    {l.label}
                    <span className="absolute -bottom-px left-0 h-px w-0 bg-blue-400 transition-all duration-300 group-hover/link:w-full" />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-200">
              Contact
            </h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 text-sm text-slate-400">
                <MapPin size={15} className="mt-0.5 shrink-0 text-blue-400" />
                <span>Smart City, India</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Mail size={15} className="shrink-0 text-blue-400" />
                <a href="mailto:contact@smarttransport.in" className="transition-colors hover:text-blue-400">
                  contact@smarttransport.in
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Phone size={15} className="shrink-0 text-blue-400" />
                <a href="tel:+9118001234567" className="transition-colors hover:text-blue-400">
                  +91 1800-123-4567
                </a>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-200">
                Stay Updated
              </h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-l-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-300 placeholder-slate-500 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                />
                <button className="flex items-center justify-center rounded-r-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 text-white transition-all duration-300 hover:from-blue-700 hover:to-blue-800">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/60 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} SmartTransport. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-slate-500">
              <a href="#" className="transition-colors hover:text-blue-400">
                Privacy Policy
              </a>
              <a href="#" className="transition-colors hover:text-blue-400">
                Terms of Service
              </a>
              <a href="#" className="transition-colors hover:text-blue-400">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

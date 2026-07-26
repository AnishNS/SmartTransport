import { Link } from "react-router-dom";
import { Bus, MapPin, Clock, ArrowRight, Route, Radar, Users, Gauge } from "lucide-react";

function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(5,150,105,0.08),transparent_60%)]" />
        <div className="animate-gradient-shift absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.06),transparent_50%),radial-gradient(circle_at_70%_50%,rgba(5,150,105,0.06),transparent_50%)]" />
      </div>

      <div className="animate-orb absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="animate-orb animation-delay-200 absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="animate-float-slow absolute top-1/3 right-1/4 h-16 w-16 rounded-full border border-white/5 bg-white/3 backdrop-blur-sm" />
      <div className="animate-float animation-delay-1000 absolute top-1/4 left-1/5 h-10 w-10 rounded-full border border-white/5 bg-white/3 backdrop-blur-sm" />
      <div className="animate-float-slow animation-delay-500 absolute bottom-1/3 left-1/3 h-20 w-20 rounded-full border border-white/5 bg-white/3 backdrop-blur-sm" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-16 px-4 pt-32 pb-20 lg:flex-row lg:pt-36 lg:pb-28">
        <div className="flex-1 text-center lg:text-left">
          <div className="animate-fade-in-down inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/80 backdrop-blur-sm">
            <Radar size={14} className="text-emerald-400" />
            <span>Intelligent ETA Prediction System v2.0</span>
          </div>

          <h1 className="animate-fade-in-up delay-100 mt-8 text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Smart Public
            <br />
            Transport{" "}
            <span className="bg-gradient-to-r from-blue-300 via-blue-200 to-emerald-300 bg-clip-text text-transparent">
              Tracking
            </span>
          </h1>

          <p className="animate-fade-in-up delay-300 mx-auto mt-6 max-w-xl text-lg leading-relaxed text-blue-200/70 lg:mx-0">
            Real-time vehicle tracking and AI-powered arrival predictions
            designed for small cities. Making public transport reliable,
            transparent, and efficient for everyone.
          </p>

          <div className="animate-fade-in-up delay-500 mt-10 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
            <Link
              to="/login"
              className="group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-emerald-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-emerald-600/40 sm:w-auto"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-700 group-hover:translate-x-full" />
              <Bus size={20} />
              Track Transport
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login"
              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10 sm:w-auto"
            >
              Admin Login
            </Link>
          </div>

          <div className="animate-fade-in-up delay-700 mt-12 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-900 bg-gradient-to-br from-blue-400 to-blue-600 text-[10px] font-bold text-white"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-900 bg-blue-800 text-[10px] font-medium text-blue-300">
                +2K
              </div>
            </div>
            <span className="text-sm text-blue-300/70">
              Trusted by <span className="font-semibold text-blue-200">2,000+</span> daily commuters
            </span>
          </div>
        </div>

        <div className="flex-1">
          <div className="animate-fade-in-right relative mx-auto h-80 w-80 sm:h-96 sm:w-96 lg:h-[500px] lg:w-[500px]">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/10 to-emerald-500/10 blur-3xl" />

            <div className="animate-float-slow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-emerald-600 shadow-2xl shadow-blue-500/30 sm:h-52 sm:w-52 lg:h-60 lg:w-60">
                <MapPin size={52} className="text-white" />
              </div>
            </div>

            <div className="animate-float group absolute -right-6 top-6 cursor-pointer lg:-right-10 lg:top-10">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/90 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-500/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Bus className="text-white" size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    Vehicle
                  </p>
                  <p className="text-sm font-bold text-gray-900">BUS-042</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-xs font-medium text-emerald-600">Live</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-float animation-delay-1000 group absolute -bottom-4 left-0 cursor-pointer lg:-bottom-8 lg:-left-6">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/90 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-500/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                  <Clock className="text-white" size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    ETA
                  </p>
                  <p className="text-xl font-bold text-gray-900">4 <span className="text-sm font-medium text-gray-500">min</span></p>
                  <p className="text-xs text-gray-400">to City Center</p>
                </div>
              </div>
            </div>

            <div className="animate-float animation-delay-500 group absolute top-1/3 -right-2 cursor-pointer lg:-right-4">
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/80 px-4 py-2.5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5">
                <Route size={15} className="text-blue-600" />
                <span className="text-xs font-semibold text-gray-700">Route 7A · 2.4 km</span>
              </div>
            </div>

            <div className="animate-float animation-delay-700 group absolute bottom-24 -left-4 cursor-pointer lg:bottom-32 lg:-left-8">
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/80 px-4 py-2.5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5">
                <Gauge size={15} className="text-emerald-500" />
                <span className="text-xs font-semibold text-gray-700">42 km/h</span>
              </div>
            </div>

            <div className="animate-pulse-glow absolute -right-8 bottom-1/4 hidden items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 px-4 py-2 shadow-2xl lg:flex">
              <Users size={14} className="text-white" />
              <span className="text-xs font-semibold text-white">23 onboard</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" />
    </section>
  );
}

export default Hero;

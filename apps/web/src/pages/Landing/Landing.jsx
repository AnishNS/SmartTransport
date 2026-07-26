import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Navigation,
  Clock,
  Map,
  BarChart3,
  Shield,
  Zap,
  Globe,
  Award,
  Bus,
  Route,
  Users,
  Target,
  ChevronRight,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Hero from "../../components/common/Hero";
import FeatureCard from "../../components/cards/FeatureCard";
import Footer from "../../components/layout/Footer";

const features = [
  {
    icon: Navigation,
    title: "Live Tracking",
    description:
      "Track your bus in real-time on an interactive map. Know exactly where your transport is and when it will arrive at your stop.",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: Clock,
    title: "ETA Prediction",
    description:
      "AI-powered arrival time predictions that learn from traffic patterns, weather conditions, and historical data for accurate estimates.",
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Map,
    title: "Route Planner",
    description:
      "Plan your journey with intelligent route suggestions. Find the fastest connections and get step-by-step navigation guidance.",
    gradient: "from-blue-500 to-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Comprehensive analytics dashboard for transport authorities. Monitor fleet performance, passenger trends, and service efficiency.",
    gradient: "from-emerald-600 to-blue-600",
  },
];

const whyChoose = [
  {
    icon: Shield,
    title: "Reliable & Accurate",
    description:
      "Our AI-powered system delivers 95%+ ETA accuracy, making public transport predictable and dependable for daily commuters.",
    gradient: "from-blue-400 to-blue-600",
  },
  {
    icon: Zap,
    title: "Small City Focus",
    description:
      "Designed specifically for small cities with optimized algorithms that work efficiently with limited infrastructure and resources.",
    gradient: "from-emerald-400 to-emerald-600",
  },
  {
    icon: Globe,
    title: "Accessible to All",
    description:
      "Multi-platform support with a responsive web interface. Real-time updates accessible from any device, anywhere, anytime.",
    gradient: "from-blue-400 to-emerald-500",
  },
  {
    icon: Award,
    title: "Government Grade",
    description:
      "Built to meet government transport standards with secure data handling, scalable architecture, and comprehensive reporting capabilities.",
    gradient: "from-emerald-400 to-blue-600",
  },
];

const stats = [
  { icon: Bus, value: "250+", label: "Active Vehicles", suffix: "on road daily" },
  { icon: Route, value: "45+", label: "Routes", suffix: "across the city" },
  { icon: Users, value: "50K+", label: "Daily Passengers", suffix: "and growing" },
  { icon: Target, value: "95%", label: "ETA Accuracy", suffix: "average precision" },
];

const milestones = [
  { year: "2024", event: "Project Conception & Research" },
  { year: "2025", event: "Prototype Development & Testing" },
  { year: "2026", event: "Pilot Launch in Small Cities" },
];

function useInView(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
}

function AnimatedSection({ children, className = "", delay = 0 }) {
  const [ref, isVisible] = useInView(0.05);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-800 ease-out ${
        isVisible
          ? "translate-y-0 scale-100 opacity-100 blur-0"
          : "translate-y-12 scale-[0.98] opacity-0 blur-[2px]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function StaggeredChildren({ children, className = "" }) {
  const [ref, isVisible] = useInView(0.05);

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div
              key={i}
              style={{
                transitionDelay: `${i * 120}ms`,
                transitionDuration: "700ms",
              }}
              className={`transition-all ease-out ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="relative h-24 overflow-hidden bg-gray-50">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50" />
      <svg
        viewBox="0 0 1440 96"
        className="absolute bottom-0 w-full text-white"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0,64 C360,96 1080,0 1440,64 L1440,96 L0,96 Z" />
      </svg>
    </div>
  );
}

function SectionHeader({ badge, title, description }) {
  return (
    <div className="text-center">
      <AnimatedSection>
        <span className="inline-block rounded-full bg-gradient-to-r from-blue-50 to-blue-100 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700 shadow-sm">
          {badge}
        </span>
      </AnimatedSection>
      <AnimatedSection delay={150}>
        <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold leading-[1.15] tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
          {title}
        </h2>
      </AnimatedSection>
      <AnimatedSection delay={300}>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-500 sm:text-lg">
          {description}
        </p>
      </AnimatedSection>
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />

      <section id="features" className="relative bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.03),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <SectionHeader
            badge="Features"
            title="Everything You Need for Smart Transit"
            description="Powerful tools designed to make public transport tracking and
              planning seamless for passengers and administrators alike."
          />
          <StaggeredChildren className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
              />
            ))}
          </StaggeredChildren>
        </div>
      </section>

      <SectionDivider />

      <section id="about" className="relative bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <SectionHeader
            badge="Why Choose Us"
            title="Built for Small Cities, Built for You"
            description="Our system addresses the unique challenges faced by small cities
              in providing reliable public transport services."
          />

          <StaggeredChildren className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {whyChoose.map((item) => (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-7 shadow-lg shadow-gray-200/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gray-300/30 sm:p-8"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-[0.04]`}
                />
                <div
                  className={`relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl`}
                >
                  <item.icon size={26} className="text-white" />
                </div>
                <h3 className="relative mb-3 text-lg font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
                  {item.title}
                </h3>
                <p className="relative text-sm leading-relaxed text-gray-500">
                  {item.description}
                </p>
              </div>
            ))}
          </StaggeredChildren>

          <AnimatedSection delay={300}>
            <div className="mt-20 overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-8 shadow-lg sm:p-12 lg:p-16">
              <div className="grid gap-10 md:grid-cols-2 md:gap-16">
                <div>
                  <span className="inline-block rounded-full bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700">
                    Our Journey
                  </span>
                  <h3 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">
                    From Concept to Impact
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-gray-500">
                    What started as a research project to solve public transport
                    challenges in small cities has grown into a comprehensive
                    tracking and prediction system.
                  </p>
                  <div className="mt-8 space-y-6">
                    {milestones.map((m, i) => (
                      <div key={m.year} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white shadow-md">
                            {i + 1}
                          </div>
                          {i < milestones.length - 1 && (
                            <div className="mt-1 h-8 w-0.5 bg-gradient-to-b from-blue-200 to-emerald-200" />
                          )}
                        </div>
                        <div className="pt-1">
                          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                            {m.year}
                          </span>
                          <p className="text-sm font-medium text-gray-700">
                            {m.event}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative h-56 w-56 sm:h-64 sm:w-64">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 via-emerald-50 to-blue-50 animate-pulse-glow" />
                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-2xl">
                      <div className="text-center text-white">
                        <div className="text-5xl font-extrabold">2026</div>
                        <div className="mt-1 text-sm font-medium text-white/80">
                          Final Year Project
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(5,150,105,0.06),transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center">
            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-blue-300 backdrop-blur-sm">
              Our Impact
            </span>
            <h2 className="mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl">
              Delivering Results That Matter
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-blue-200/60 sm:text-lg">
              Real metrics from our pilot deployments across small cities.
            </p>
          </AnimatedSection>

          <StaggeredChildren className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 text-white transition-all duration-500 group-hover:scale-110 group-hover:from-blue-500/30 group-hover:to-emerald-500/30">
                  <stat.icon size={26} />
                </div>
                <div className="text-4xl font-extrabold text-white sm:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm font-semibold text-blue-200">
                  {stat.label}
                </div>
                <div className="mt-1 text-xs text-blue-300/50">
                  {stat.suffix}
                </div>
              </div>
            ))}
          </StaggeredChildren>
        </div>
      </section>

      <section className="relative bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <AnimatedSection>
            <span className="inline-block rounded-full bg-gradient-to-r from-emerald-50 to-blue-50 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700 shadow-sm">
              Get Started
            </span>
          </AnimatedSection>
          <AnimatedSection delay={150}>
            <h2 className="mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Ready to Transform Your City&apos;s Transit?
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={300}>
            <p className="mx-auto mt-4 max-w-xl text-base text-gray-500 sm:text-lg">
              Join the growing network of small cities using SmartTransport to
              provide reliable, efficient public transport.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={450}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-emerald-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-emerald-600/40"
              >
                Get Started Now
                <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="#features"
                className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
              >
                Learn More
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Landing;

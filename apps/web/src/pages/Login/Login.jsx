import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bus,
  MapPin,
  Clock,
  Navigation,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import InputField from "../../components/forms/InputField";
import RoleSelector from "../../components/forms/RoleSelector";

const highlights = [
  {
    icon: Navigation,
    text: "Real-time GPS vehicle tracking",
  },
  {
    icon: Clock,
    text: "AI-powered ETA predictions",
  },
  {
    icon: MapPin,
    text: "Multi-route journey planning",
  },
];

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("passenger");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(`/${role}`);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(5,150,105,0.08),transparent_60%)]" />
        <div className="animate-orb absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="animate-orb animation-delay-200 absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[120px]" />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                <Bus size={22} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Smart<span className="text-blue-400">Transport</span>
              </span>
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-white xl:text-5xl">
                Smart Public Transport
                <br />
                <span className="bg-gradient-to-r from-blue-300 to-emerald-300 bg-clip-text text-transparent">
                  Tracking & ETA
                </span>
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-blue-200/70">
                Sign in to access real-time vehicle tracking, intelligent
                arrival predictions, and comprehensive route management tools.
              </p>
            </div>

            <div className="relative">
              <div className="mx-auto flex h-56 w-56 items-center justify-center xl:h-64 xl:w-64">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/10 to-emerald-500/10 blur-3xl" />
                <div className="animate-float-slow flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-emerald-600 shadow-2xl shadow-blue-500/30">
                  <div className="text-center text-white">
                    <Bus size={56} className="mx-auto" />
                    <p className="mt-3 text-sm font-medium text-white/80">
                      Real-time tracking
                    </p>
                  </div>
                </div>
              </div>
              <div className="animate-float absolute -right-4 top-8 rounded-xl border border-white/10 bg-white/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                    <Clock size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                      ETA
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      4 <span className="text-xs font-medium text-gray-500">min</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="animate-float animation-delay-500 absolute -bottom-2 -left-4 rounded-xl border border-white/10 bg-white/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                    <MapPin size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                      Route
                    </p>
                    <p className="text-sm font-bold text-gray-900">7A · 2.4 km</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-300">
                Platform Highlights
              </p>
              <div className="space-y-3">
                {highlights.map((h) => (
                  <div key={h.text} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-blue-300">
                      <h.icon size={16} />
                    </div>
                    <span className="text-sm text-blue-200/80">{h.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-blue-300/40">
            &copy; {new Date().getFullYear()} SmartTransport. All rights reserved.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-4 py-8 lg:w-1/2 lg:px-12 xl:px-20">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 text-gray-900"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                <Bus size={20} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Smart<span className="text-blue-600">Transport</span>
              </span>
            </Link>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50 sm:p-10">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-extrabold text-gray-900">
                Welcome Back
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <RoleSelector value={role} onChange={setRole} />

              <InputField
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                error={errors.email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <InputField
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                error={errors.password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 accent-blue-600 transition-colors focus:ring-2 focus:ring-blue-500/30"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a
                  href="#"
                  className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-blue-600"
              >
                <ArrowLeft size={14} />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bus,
  MapPin,
  Clock,
  Navigation,
  ArrowLeft,
  Loader2,
  User,
  Mail,
  Phone,
  Lock,
  Home,
  PhoneCall,
  UserRoundCheck,
  CheckCircle2,
} from "lucide-react";
import InputField from "../../components/forms/InputField";
import { authService } from "../../services/auth";

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

const NAME_MIN = 3;
const PASSWORD_MIN = 8;

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    emergencyContact: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Full name is required";
    } else if (form.name.trim().length < NAME_MIN) {
      nextErrors.name = `Name must be at least ${NAME_MIN} characters`;
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email (e.g. example@domain.com)";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9\s()-]{8,16}$/.test(form.phone.trim())) {
      nextErrors.phone = "Enter a valid phone number";
    }

    if (!form.password) {
      nextErrors.password = "Password is required";
    } else if (form.password.length < PASSWORD_MIN) {
      nextErrors.password = `Password must be at least ${PASSWORD_MIN} characters`;
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    return nextErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      const result = authService.registerPassenger(form);
      setLoading(false);

      if (!result.success) {
        setErrors({ email: result.error });
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/login", {
          state: { signupSuccess: true, email: result.user.email },
        });
      }, 1800);
    }, 1000);
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
                Create your passenger account to access real-time vehicle
                tracking, intelligent arrival predictions, and multi-route
                journey planning.
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
                Create Passenger Account
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Join SmartTransport to start planning your journeys
              </p>
            </div>

            {success && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Account created successfully.
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-700">Please login.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <UserRoundCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-800">
                      Account Role
                    </p>
                    <p className="text-xs text-blue-600/70">Passenger</p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                  passenger
                </span>
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                  Personal Information
                </p>

                <InputField
                  label="Full Name"
                  icon={User}
                  placeholder="Enter your full name"
                  value={form.name}
                  error={errors.name}
                  onChange={updateField("name")}
                />

                <InputField
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  placeholder="you@example.com"
                  value={form.email}
                  error={errors.email}
                  onChange={updateField("email")}
                />

                <InputField
                  label="Phone Number"
                  type="tel"
                  icon={Phone}
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  error={errors.phone}
                  onChange={updateField("phone")}
                />

                <InputField
                  label="Password"
                  type="password"
                  icon={Lock}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  error={errors.password}
                  onChange={updateField("password")}
                />

                <InputField
                  label="Confirm Password"
                  type="password"
                  icon={Lock}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  error={errors.confirmPassword}
                  onChange={updateField("confirmPassword")}
                />
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                  Additional Information{" "}
                  <span className="normal-case tracking-normal text-gray-300">
                    (Optional)
                  </span>
                </p>

                <InputField
                  label="Address"
                  icon={Home}
                  placeholder="Street, city, pincode"
                  value={form.address}
                  error={errors.address}
                  onChange={updateField("address")}
                />

                <InputField
                  label="Emergency Contact"
                  type="tel"
                  icon={PhoneCall}
                  placeholder="+91 98765 43210"
                  value={form.emergencyContact}
                  error={errors.emergencyContact}
                  onChange={updateField("emergencyContact")}
                />
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  Sign in
                </Link>
              </p>
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

export default Signup;

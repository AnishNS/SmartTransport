import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md active:bg-blue-800 disabled:bg-blue-300",
  secondary:
    "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md active:bg-emerald-800 disabled:bg-emerald-300",
  outline:
    "border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 disabled:text-gray-300 disabled:border-gray-100",
  ghost:
    "text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 disabled:text-gray-300",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5",
};

function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  className = "",
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2
          size={size === "sm" ? 14 : size === "lg" ? 20 : 16}
          className="animate-spin"
        />
      ) : Icon ? (
        <Icon size={size === "sm" ? 14 : size === "lg" ? 20 : 16} />
      ) : null}
      {children}
    </button>
  );
}

export default Button;

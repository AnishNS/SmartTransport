import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function InputField({
  label,
  type = "text",
  icon: Icon,
  placeholder,
  value,
  onChange,
  error,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="group">
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div
        className={`flex items-center rounded-xl border bg-white transition-all duration-200 ${
          error
            ? "border-red-300 ring-1 ring-red-200"
            : "border-gray-200 ring-blue-200 focus-within:border-blue-500 focus-within:ring-2"
        }`}
      >
        {Icon && (
          <div className="flex shrink-0 pl-4">
            <Icon
              size={18}
              className={`transition-colors duration-200 ${
                error
                  ? "text-red-400"
                  : "text-gray-400 group-focus-within:text-blue-500"
              }`}
            />
          </div>
        )}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
        {isPassword && value && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="flex shrink-0 pr-4 text-gray-400 transition-colors hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default InputField;

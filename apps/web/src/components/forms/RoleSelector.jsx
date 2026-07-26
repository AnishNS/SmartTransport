import { User, Shield, Briefcase } from "lucide-react";

const roles = [
  { id: "passenger", label: "Passenger", icon: User },
  { id: "driver", label: "Driver", icon: Briefcase },
  { id: "admin", label: "Admin", icon: Shield },
];

function RoleSelector({ value, onChange }) {
  return (
    <div>
      <label className="mb-2.5 block text-sm font-medium text-gray-700">
        Select Role
      </label>
      <div className="grid grid-cols-3 gap-2.5">
        {roles.map((role) => {
          const Icon = role.icon;
          const isActive = value === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onChange(role.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div
                className={`rounded-lg p-1.5 transition-colors duration-200 ${
                  isActive ? "bg-blue-100 text-blue-600" : "text-gray-400"
                }`}
              >
                <Icon size={20} />
              </div>
              <span>{role.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RoleSelector;

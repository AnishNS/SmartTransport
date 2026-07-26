import { Bus } from "lucide-react";

function DashboardFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white py-4">
      <div className="flex flex-col items-center justify-between gap-2 px-6 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Bus size={12} className="text-blue-500" />
          <span>SmartTransport</span>
          <span className="text-gray-300">|</span>
          <span>v1.0.0</span>
        </div>
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} SmartTransport. Team Project.
        </p>
      </div>
    </footer>
  );
}

export default DashboardFooter;

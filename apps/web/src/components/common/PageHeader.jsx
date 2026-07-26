import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

function PageHeader({ title, subtitle, breadcrumbs = [], action }) {
  const location = useLocation();
  const pathParts = location.pathname.split("/");
  const role = pathParts[1];
  const homePath = role && ["passenger", "driver", "admin"].includes(role) ? `/${role}` : "/";

  return (
    <div className="mb-6 sm:mb-8">
      {breadcrumbs.length > 0 && (
        <nav className="mb-3 flex items-center gap-1.5 text-xs font-medium text-gray-400">
          <Link
            to={homePath}
            className="flex items-center gap-1 transition-colors hover:text-blue-600"
          >
            <Home size={14} />
            Home
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight size={12} />
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="transition-colors hover:text-blue-600"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-600">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

export default PageHeader;

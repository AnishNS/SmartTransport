function Card({ children, className = "", padding = true, hover = false }) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${
        padding ? "p-5 sm:p-6" : ""
      } ${
        hover
          ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;

function FeatureCard({ icon: Icon, title, description, gradient }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-7 shadow-lg shadow-gray-200/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gray-300/30 sm:p-8">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-[0.03]`}
      />
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-gray-100 to-transparent opacity-0 transition-all duration-500 group-hover:opacity-100" />

      <div
        className={`relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl`}
      >
        <Icon size={28} className="text-white" />
      </div>

      <h3 className="relative mb-3 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
        {title}
      </h3>

      <p className="relative text-sm leading-relaxed text-gray-500 transition-colors duration-300 group-hover:text-gray-600">
        {description}
      </p>

      <div className="relative mt-5 flex items-center gap-1 text-xs font-medium text-blue-500 opacity-0 transition-all duration-300 group-hover:opacity-100">
        <span>Learn more</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
          <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

export default FeatureCard;

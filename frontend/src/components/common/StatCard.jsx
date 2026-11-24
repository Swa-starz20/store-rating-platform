import React from 'react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'brand',
  subtext
}) => {
  const colorMap = {
    brand: {
      bg: 'bg-indigo-50',
      text: 'text-brand-600',
      border: 'border-indigo-100'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100'
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100'
    }
  };

  const currentTheme = colorMap[color] || colorMap.brand;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {value !== undefined && value !== null ? value : '—'}
          </p>
          {subtext && (
            <p className="text-xs text-slate-500 mt-1 font-medium">{subtext}</p>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentTheme.bg} ${currentTheme.text} border ${currentTheme.border}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

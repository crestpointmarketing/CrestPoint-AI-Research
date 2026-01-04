import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '', onClick }) => {
  const variants = {
    default: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    outline: "border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400",
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
};

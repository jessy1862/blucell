import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  const variants = {
    primary: "bg-blucell-600 text-white hover:bg-blucell-700 focus:ring-blucell-500 shadow-lg shadow-blucell-500/30",
    secondary: "bg-silver-800 text-white hover:bg-silver-700 focus:ring-silver-500 dark:bg-silver-700 dark:hover:bg-silver-600",
    outline: "border-2 border-blucell-600 text-blucell-600 hover:bg-blucell-50 focus:ring-blucell-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-silver-600 hover:bg-silver-200 dark:text-silver-300 dark:hover:bg-silver-800"
  };

  return (
    <button className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`bg-silver-surface-light dark:bg-silver-surface-dark rounded-xl border border-silver-200 dark:border-silver-800 shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: 'blue' | 'green' | 'yellow' | 'red' }> = ({ children, color = 'blue' }) => {
  const colors = {
    blue: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    green: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    red: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-1">{label}</label>}
    <input 
      className={`w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm placeholder:text-silver-400 focus:outline-none focus:ring-2 focus:ring-blucell-500 dark:text-silver-100 ${className}`}
      {...props}
    />
  </div>
);

export const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-8">
    <h2 className="text-3xl font-bold text-silver-900 dark:text-white tracking-tight">{title}</h2>
    {subtitle && <p className="mt-2 text-lg text-silver-600 dark:text-silver-400">{subtitle}</p>}
  </div>
);
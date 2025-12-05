import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  'aria-label'?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  className = '', 
  'aria-label': ariaLabel,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-150 ease-pro focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-[#2D2D2D] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed rounded-md mobile-touch-target md:min-h-0 md:min-w-0 hover:scale-[1.02] active:scale-[0.98] active:shadow-inner";
  
  const variants = {
    primary: "bg-[#FF6B35] text-white hover:bg-[#E85A2D] focus-visible:ring-[#FF6B35] shadow-lg shadow-orange-900/20",
    secondary: "bg-[#2A2A2A] text-gray-200 hover:bg-[#333333] border border-[#404040] focus-visible:ring-gray-500 hover:border-[#6B6B6B]",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-[#333333] focus-visible:ring-gray-500 hover:shadow-sm",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/50 focus-visible:ring-red-500"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-sm",
    lg: "h-11 px-6 text-base"
  };

  // Ensure aria-label is present if button has no text content
  const label = ariaLabel || (typeof children === 'string' ? children : undefined);

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      aria-label={label}
      {...props}
    >
      {icon && <span className={`${children ? 'mr-2' : ''} transition-transform group-hover:scale-110`} aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
};
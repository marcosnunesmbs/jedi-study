import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  icon, 
  children, 
  className,
  style,
  disabled,
  ...props 
}: ButtonProps) {
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'var(--surface)',
          color: 'var(--text-slate-700)',
          border: '1px solid var(--border-color)',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--danger)',
          color: 'white',
          border: '1px solid transparent',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-slate-600)',
          border: '1px solid transparent',
        };
      default: // primary
        return {
          backgroundColor: 'var(--primary)',
          color: 'white',
          border: '1px solid transparent',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '0.375rem 0.75rem', fontSize: '0.75rem' };
      case 'lg':
        return { padding: '0.75rem 1.5rem', fontSize: '1rem' };
      default: // md
        return { padding: '0.5rem 1rem', fontSize: '0.875rem' };
    }
  };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    borderRadius: '0.5rem',
    fontWeight: 500,
    cursor: (disabled || isLoading) ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    opacity: (disabled || isLoading) ? 0.6 : 1,
    outline: 'none',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style
  };

  return (
    <button 
      disabled={disabled || isLoading} 
      style={baseStyle}
      className={`btn-${variant} ${className || ''}`}
      {...props}
    >
      {isLoading ? (
        <span className="spinner" style={{ 
          width: '1rem', 
          height: '1rem', 
          border: '2px solid currentColor', 
          borderTopColor: 'transparent', 
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 1s linear infinite'
        }}></span>
      ) : icon}
      {children}
    </button>
  );
}

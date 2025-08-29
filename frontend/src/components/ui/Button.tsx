import { ButtonHTMLAttributes, forwardRef, ElementType, ComponentPropsWithoutRef } from 'react';
import { classNames } from '../../lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  as?: ElementType;
}

type ButtonProps<T extends ElementType = 'button'> = BaseButtonProps & 
  Omit<ComponentPropsWithoutRef<T>, keyof BaseButtonProps> & {
    as?: T;
  };

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'border-transparent bg-indigo-100 text-indigo-700 hover:bg-indigo-200 focus:ring-indigo-500',
  outline: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
  ghost: 'border-transparent bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-primary-500',
  danger: 'border-transparent bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-xs rounded',
  sm: 'px-3 py-2 text-sm leading-4 rounded-md',
  md: 'px-4 py-2 text-sm rounded-md',
  lg: 'px-6 py-3 text-base rounded-md',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((
  {
    children,
    className = '',
    disabled = false,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    type = 'button',
    ...props
  },
  ref
) => {
  const buttonClasses = classNames(
    'inline-flex items-center justify-center border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    disabled || isLoading ? 'opacity-70 cursor-not-allowed' : '',
    className
  );

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

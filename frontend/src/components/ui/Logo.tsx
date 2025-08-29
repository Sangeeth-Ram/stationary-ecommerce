import { SVGProps } from 'react';

type LogoProps = SVGProps<SVGSVGElement> & {
  variant?: 'default' | 'white';
};

export const Logo = ({ className = '', variant = 'default', ...props }: LogoProps) => {
  const textColor = variant === 'white' ? 'text-white' : 'text-gray-900';
  
  return (
    <div className={`flex items-center ${className}`} {...props}>
      <svg
        className="h-8 w-auto"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 2C8.26801 2 2 8.26801 2 16C2 23.732 8.26801 30 16 30C23.732 30 30 23.732 30 16C30 8.26801 23.732 2 16 2Z"
          fill="#4F46E5"
        />
        <path
          d="M16 24C20.4183 24 24 20.4183 24 16C24 11.5817 20.4183 8 16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24Z"
          fill="white"
        />
        <path
          d="M16 20C18.2091 20 20 18.2091 20 16C20 13.7909 18.2091 12 16 12C13.7909 12 12 13.7909 12 16C12 18.2091 13.7909 20 16 20Z"
          fill="#4F46E5"
        />
      </svg>
      <span className={`ml-3 text-xl font-bold ${textColor}`}>StationaryShop</span>
    </div>
  );
};

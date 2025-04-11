import React from 'react';

interface BaseLogoProps {
  size?: number;
  className?: string;
}

const BaseLogo: React.FC<BaseLogoProps> = ({ size = 24, className = '' }) => {
  return (
    <div className={`base-logo ${className}`} style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" 
          fill="#0052FF"
        />
        <path 
          d="M12.0002 4.5L6.22266 12.0001L12.0002 19.5L17.7778 12.0001L12.0002 4.5Z" 
          fill="white"
        />
      </svg>
    </div>
  );
};

export default BaseLogo;

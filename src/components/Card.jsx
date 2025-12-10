import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  className = '',
  padding = 'md',
  hover = false 
}) => {
  const paddings = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const hoverClass = hover ? 'hover:shadow-xl transition-shadow duration-200' : '';
  
  return (
    <div className={`bg-white rounded-lg shadow-md ${paddings[padding]} ${hoverClass} ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-xl font-bold text-gray-800">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;

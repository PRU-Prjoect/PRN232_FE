import React from 'react';
import { Spin } from 'antd';

const LoadingSpinner = ({ 
  size = 'default', 
  text = '', 
  className = '' 
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Spin size={size} />
      {text && <span className="ml-3 text-gray-600">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;

import React from 'react';
import { Alert } from 'antd';

const ErrorAlert = ({ 
  message, 
  type = 'error',
  onClose,
  className = '' 
}) => {
  if (!message) return null;
  
  return (
    <Alert
      message={message}
      type={type}
      closable={!!onClose}
      onClose={onClose}
      className={className}
      showIcon
    />
  );
};

export default ErrorAlert;

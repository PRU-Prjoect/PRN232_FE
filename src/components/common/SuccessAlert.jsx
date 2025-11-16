import React from 'react';
import { Alert } from 'antd';

const SuccessAlert = ({ 
  message, 
  onClose,
  className = '' 
}) => {
  if (!message) return null;
  
  return (
    <Alert
      message={message}
      type="success"
      closable={!!onClose}
      onClose={onClose}
      className={className}
      showIcon
    />
  );
};

export default SuccessAlert;

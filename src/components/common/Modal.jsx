import React from 'react';
import { Modal as AntModal } from 'antd';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md',
  className = '' 
}) => {
  const widthMap = {
    sm: 520,
    md: 600,
    lg: 800,
    xl: 1200
  };
  
  return (
    <AntModal
      open={isOpen}
      onCancel={onClose}
      title={title}
      footer={footer}
      width={widthMap[size]}
      className={className}
    >
      {children}
    </AntModal>
  );
};

export default Modal;

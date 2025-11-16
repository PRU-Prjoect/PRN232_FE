import React from 'react';
import { Empty } from 'antd';

const EmptyState = ({
  title = 'No Data Available',
  message = 'No data found',
  actionButton,
  className = ''
}) => {
  return (
    <div className={className}>
      <Empty
        description={
          <div>
            <div className="text-base font-medium text-gray-900 mb-1">{title}</div>
            <div className="text-sm text-gray-500">{message}</div>
          </div>
        }
      >
        {actionButton}
      </Empty>
    </div>
  );
};

export default EmptyState;

import React from 'react';
import { Pagination as AntPagination } from 'antd';

const Pagination = ({
  currentPage,
  onPrevPage,
  onNextPage,
  isLoading,
  hasMore,
  className = ''
}) => {
  const handleChange = (page) => {
    if (page < currentPage && onPrevPage) {
      onPrevPage();
    } else if (page > currentPage && onNextPage) {
      onNextPage();
    }
  };

  return (
    <div className={className}>
      <AntPagination
        current={currentPage}
        total={hasMore ? currentPage * 10 + 1 : currentPage * 10}
        pageSize={10}
        onChange={handleChange}
        disabled={isLoading}
        showSizeChanger={false}
        showQuickJumper={false}
      />
    </div>
  );
};

export default Pagination;

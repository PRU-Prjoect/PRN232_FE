import React from 'react';

const AssignmentFilters = ({ searchTerm, onSearchChange, filterStatus, onFilterChange }) => {
  return (
    <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo giảng viên, kỳ thi, ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        
        {/* Status Filter */}
        <div className="flex gap-2">
          {['all'].map((status) => {
            const labels = {
              'all': 'Tất cả',
            };
            
            return (
              <button
                key={status}
                onClick={() => onFilterChange(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {labels[status]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AssignmentFilters;


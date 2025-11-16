import React from 'react';

const AssignmentStatistics = ({ assignments }) => {
  const stats = {
    total: assignments.length,
    assigned: assignments.filter(a => a.status != null && String(a.status).toLowerCase() === 'assigned').length,
    graded: assignments.filter(a => a.status != null && String(a.status).toLowerCase() === 'graded').length,
    pending: assignments.filter(a => a.status != null && String(a.status).toLowerCase() === 'pending').length,
  };

  const statItems = [
    { label: 'Tổng số', value: stats.total, color: 'text-gray-900' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {statItems.map((item, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">{item.label}</div>
          <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
        </div>
      ))}
    </div>
  );
};

export default AssignmentStatistics;


export const parseAssignmentStatus = (status) => {
  if (typeof status === 'number') {
    return status;
  }

  if (typeof status === 'string') {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'pending') return 0;
    if (lowerStatus === 'inprogress' || lowerStatus === 'in_progress') return 1;
    if (lowerStatus === 'completed') return 2;
    
    const parsed = parseInt(status);
    if (!isNaN(parsed)) return parsed;
  }

  return 0; 
};

export const getAssignmentStatusInfo = (status) => {
  const statusValue = parseAssignmentStatus(status);

  switch (statusValue) {
    case 0:
      return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800', value: 0 };
    case 1:
      return { text: 'In Progress', color: 'bg-blue-100 text-blue-800', value: 1 };
    case 2:
      return { text: 'Completed', color: 'bg-green-100 text-green-800', value: 2 };
    default:
      return { text: 'N/A', color: 'bg-gray-100 text-gray-800', value: statusValue };
  }
};

export const isAssignmentCompleted = (status) => {
  return parseAssignmentStatus(status) === 2;
};

export const isAssignmentInProgress = (status) => {
  return parseAssignmentStatus(status) === 1;
};


export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'graded':
      return 'bg-green-100 text-green-800';
    case 'submitted':
      return 'bg-blue-100 text-blue-800';
    case 'late':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'assigned': return 'bg-blue-100 text-blue-800';
    case 'graded': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusText = (status) => {
  switch (status) {
    case 'pending': return 'Chờ phân công';
    case 'assigned': return 'Đã phân công';
    case 'graded': return 'Đã chấm';
    default: return 'Không xác định';
  }
};


export const getStatusBadge = (status) => {
  const statusMap = {
    'assigned': { text: 'Đã phân công', color: 'bg-blue-100 text-blue-800' },
    'graded': { text: 'Đã chấm', color: 'bg-green-100 text-green-800' },
    'pending': { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
    'in_progress': { text: 'Đang chấm', color: 'bg-orange-100 text-orange-800' },
  };

  const statusStr = status != null ? String(status).toLowerCase() : '';
  return statusMap[statusStr] || { 
    text: status != null ? String(status) : 'Unknown', 
    color: 'bg-gray-100 text-gray-800' 
  };
};


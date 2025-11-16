export const formatDateTime = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

export const formatDate = (dateString) => {
  return formatDateTime(dateString, {
    hour: undefined,
    minute: undefined
  });
};


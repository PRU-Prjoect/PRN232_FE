export const parseResponseData = (result) => {
  if (!result) return [];
  
  if (result && result.data) {
    if (Array.isArray(result.data)) {
      return result.data;
    } else if (result.data.items && Array.isArray(result.data.items)) {
      return result.data.items;
    } else if (result.data.data && Array.isArray(result.data.data)) {
      return result.data.data;
    }
  } else if (Array.isArray(result)) {
    return result;
  } else if (result && result.items && Array.isArray(result.items)) {
    return result.items;
  }
  
  return [];
};

export const getTotalCount = (result) => {
  if (!result) return 0;
  
  const payload = result?.data || result;
  return payload?.totalItems ?? payload?.totalCount ?? payload?.total ?? 0;
};


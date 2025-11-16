import { solutionService } from '../services';

export const downloadSolution = async (solution, solutionId) => {
  if (!solutionId && !solution) {
    alert('No solution ID available');
    return;
  }
  const downloadUrl = solution?.path || solution?.downloadUrl || solution?.signedUrl || solution?.url;
  
  console.log('Solution object:', solution);
  console.log('Download URL from solution:', downloadUrl);
  

  if (downloadUrl && (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://'))) {
    const pathParts = downloadUrl.split('/');
    const fileName = pathParts[pathParts.length - 1] || `solution-${solutionId || 'file'}.docx`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank'; 
    link.rel = 'noopener noreferrer';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return; 
  }

  if (solutionId) {
    try {
      const { blob, filename } = await solutionService.downloadSolution(solutionId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `solution-${solutionId}.docx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading solution:', err);
      
      if (solution?.path && (solution.path.startsWith('http://') || solution.path.startsWith('https://'))) {
        window.open(solution.path, '_blank');
        return;
      }
      
      if (err.message?.includes('404') || err.message?.includes('Not Found')) {
        alert('Download endpoint not available. Opening file URL directly...');
        if (solution?.path) {
          window.open(solution.path, '_blank');
        }
      } else if (err.message?.includes('403') || err.message?.includes('Forbidden')) {
        alert('Access denied. Opening file URL directly...');
        if (solution?.path) {
          window.open(solution.path, '_blank');
        }
      } else {
        alert(`Failed to download solution file: ${err.message || 'Unknown error'}\n\nTrying to open URL directly...`);
        if (solution?.path) {
          window.open(solution.path, '_blank');
        }
      }
    }
  } else {
    alert('No solution ID or download URL available');
  }
};


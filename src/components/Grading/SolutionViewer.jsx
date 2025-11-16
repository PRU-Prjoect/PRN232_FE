import React, { useEffect, useRef } from 'react';
import { DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { getAssignmentStatusInfo } from '../../utils/statusHelpers';
import LoadingSpinner from '../common/LoadingSpinner';

const SolutionViewer = ({ 
  solution, 
  assignment, 
  loadingSolution, 
  onDownload 
}) => {
  const statusInfo = getAssignmentStatusInfo(assignment.status);
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleError = (event) => {
      if (event.target && event.target.tagName === 'IFRAME') {
        const src = event.target.src || '';
        if (src.includes('officeapps.live.com') || src.includes('view.officeapps.live.com')) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      }
      if (event.message && (
        event.message.includes('officeapps.live.com') ||
        event.message.includes('strings.js') ||
        event.filename?.includes('officeapps')
      )) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    window.addEventListener('error', handleError, true);
    return () => {
      window.removeEventListener('error', handleError, true);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Assignment {assignment.id || 'N/A'}
          </h3>
          <p className="text-sm text-gray-500">
            Solution ID: {assignment.solutionId || 'N/A'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {solution?.path && (
            <button
              type="button"
              onClick={onDownload}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
              title="Download solution file"
            >
              <DownloadOutlined />
              Download
            </button>
          )}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>
      </div>

      {solution?.path ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50" style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}>
          {loadingSolution ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="lg" color="blue" text="Loading solution file..." />
            </div>
          ) : (
            (() => {
              const isPublicUrl = solution.path && (
                solution.path.startsWith('http://') || 
                solution.path.startsWith('https://')
              ) && !solution.path.includes('/api/'); 
              if (isPublicUrl) {
                return (
                  <div className="relative w-full h-full">
                    <iframe
                      ref={iframeRef}
                      key={solution.path}
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(solution.path)}`}
                      className="w-full h-full border-0"
                      title="Solution File Viewer"
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                      onLoad={(e) => {
                        try {
                          const iframe = e.target;
                          try {
                            iframe.contentWindow?.addEventListener('error', (event) => {
                              event.preventDefault();
                              event.stopPropagation();
                            }, true);
                          } catch (err) {
                          }
                        } catch (err) {
                        }
                      }}
                      onError={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-yellow-50 border-t border-yellow-200 p-2 text-center">
                      <p className="text-xs text-yellow-700">
                        If the file doesn't display,{' '}
                        <button
                          type="button"
                          onClick={() => window.open(solution.path, '_blank')}
                          className="text-blue-600 hover:text-blue-800 underline font-medium"
                        >
                          open it in a new tab
                        </button>
                        {' '}or{' '}
                        <button
                          type="button"
                          onClick={onDownload}
                          className="text-blue-600 hover:text-blue-800 underline font-medium"
                        >
                          download it
                        </button>
                      </p>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-8">
                      <FileTextOutlined className="text-gray-400 text-6xl mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">File Preview Not Available</h3>
                      <p className="text-sm text-gray-500 mb-6">
                        This file cannot be previewed in the browser. Please download it to view.
                      </p>
                      <button
                        type="button"
                        onClick={onDownload}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2 mx-auto"
                      >
                        <DownloadOutlined />
                        Download File
                      </button>
                    </div>
                  </div>
                );
              }
            })()
          )}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-8 text-center bg-gray-50">
          <FileTextOutlined className="text-gray-400 text-5xl mx-auto mb-2" />
          <p className="text-sm text-gray-500">No solution file available</p>
        </div>
      )}
    </div>
  );
};

export default SolutionViewer;


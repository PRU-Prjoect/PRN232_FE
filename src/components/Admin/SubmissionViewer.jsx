import React, { useState, useEffect } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { formatDateTime } from '../../utils/dateHelpers';

const sampleSubmissionFiles = [
];

const SubmissionViewer = ({ submission, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState([]);
  
  useEffect(() => {
    if (submission && submission.files) {
      const files = submission.files.map((filePath, index) => {
        const pathParts = filePath.split('/');
        const fileName = pathParts.pop() || filePath;
        const fileType = fileName.split('.').pop() || 'unknown';
        
        return {
          id: `file_${index}`,
          name: fileName,
          path: filePath,
          type: getFileType(fileType),
          size: 0, 
          lastModified: submission.submissionDate,
          semester: pathParts[0] || '',
          courseCode: pathParts[1] || ''
        };
      });
      
      setSubmissionFiles(files);
      if (files.length > 0) {
        setSelectedFile(files[0]);
      }
    }
  }, [submission]);
  
  const getFileType = (extension) => {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
    const codeTypes = ['java', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'c', 'cpp', 'cs', 'py', 'php'];
    const docTypes = ['doc', 'docx', 'pdf', 'txt', 'rtf', 'md'];
    
    if (imageTypes.includes(extension.toLowerCase())) return 'image';
    if (codeTypes.includes(extension.toLowerCase())) return 'code';
    if (docTypes.includes(extension.toLowerCase())) return 'document';
    return 'unknown';
  };

  const filteredFiles = submissionFiles.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'code':
        return (
          <svg className="h-6 w-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
          </svg>
        );
      case 'document':
        return (
          <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z" />
          </svg>
        );
      case 'image':
        return (
          <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z" />
          </svg>
        );
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };


  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Submission Files - {submission.studentName}
              </h2>
              <p className="text-sm text-gray-500">
                Student ID: {submission.studentId} • Submitted: {formatDateTime(submission.submissionDate)}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <CloseOutlined className="text-xl" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {filteredFiles.map((file) => (
                  <li 
                    key={file.id}
                    className={`hover:bg-gray-50 cursor-pointer ${selectedFile && selectedFile.id === file.id ? 'bg-orange-50' : ''}`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="px-4 py-3 flex items-center">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {formatDate(file.lastModified)}
                        </p>
                        {file.semester && file.courseCode && (
                          <p className="text-xs text-orange-600 mt-1">
                            <span className="font-medium">{file.semester}</span> / <span className="font-medium">{file.courseCode}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div className="flex items-center">
                {selectedFile && getFileIcon(selectedFile.type)}
                <div className="ml-2">
                  <span className="font-medium">{selectedFile?.name}</span>
                  {selectedFile?.semester && selectedFile?.courseCode && (
                    <div className="text-xs text-orange-600 mt-1">
                      <span className="font-medium">{selectedFile.semester}</span> / <span className="font-medium">{selectedFile.courseCode}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <button 
                  className="px-3 py-1.5 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600 transition"
                  onClick={() => {
                    if (selectedFile) {
                      console.log(`Viewing file info: ${selectedFile.path}`);
                      alert(`Thông tin file: ${selectedFile.path}\nKỳ học: ${selectedFile.semester || 'N/A'}\nMã môn: ${selectedFile.courseCode || 'N/A'}`);
                    }
                  }}
                  disabled={!selectedFile}
                >
                  Xem thông tin
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
              {!selectedFile ? (
                <div className="flex items-center justify-center h-full bg-white rounded-md p-4">
                  <div className="text-center">
                    <svg className="h-16 w-16 text-gray-400 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z" />
                    </svg>
                    <p className="mt-2 text-gray-500">Select a file to view its content.</p>
                  </div>
                </div>
              ) : selectedFile.type === 'image' ? (
                <div className="flex items-center justify-center h-full bg-white rounded-md p-4">
                  <div className="text-center">
                    <svg className="h-16 w-16 text-gray-400 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" />
                    </svg>
                    <p className="mt-2 text-gray-500">Xem trước không khả dụng. Nhấn "Xem thông tin" để xem chi tiết.</p>
                  </div>
                </div>
              ) : (
                <pre className="bg-white rounded-md p-4 overflow-auto h-full text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {selectedFile.content || `Nội dung file không khả dụng. Nhấn "Xem thông tin" để xem chi tiết.`}
                </pre>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {filteredFiles.length} files in submission
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionViewer;

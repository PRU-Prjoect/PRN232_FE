import React, { useState } from 'react';
import { saveAs } from 'file-saver';

const FileViewer = ({ files }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const groupFilesByDirectory = (files) => {
    const groups = {};
    
    files.forEach(file => {
      const parts = file.name.split('/');
      const directory = parts.length > 1 ? parts.slice(0, -1).join('/') : 'Root';
      
      if (!groups[directory]) {
        groups[directory] = [];
      }
      
      groups[directory].push(file);
    });
    
    return groups;
  };

  const fileGroups = groupFilesByDirectory(files);
  
  const filteredGroups = Object.keys(fileGroups).reduce((acc, dir) => {
    const filteredFiles = fileGroups[dir].filter(file => 
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filteredFiles.length > 0) {
      acc[dir] = filteredFiles;
    }
    
    return acc;
  }, {});

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleDownload = (file) => {
    saveAs(file.content, file.name.split('/').pop());
  };

  const handleDownloadAll = () => {
    files.forEach(file => {
      saveAs(file.content, file.name.split('/').pop());
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'doc':
      case 'docx':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'xls':
      case 'xlsx':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };
  const renderFilePreview = () => {
    if (!selectedFile) return null;
    
    const fileName = selectedFile.name;
    const extension = fileName.split('.').pop().toLowerCase();
    const objectUrl = URL.createObjectURL(selectedFile.content);
    
    switch (extension) {
      case 'pdf':
        return (
          <iframe 
            src={objectUrl} 
            className="w-full h-full border-0" 
            title={fileName}
          />
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <img 
            src={objectUrl} 
            alt={fileName} 
            className="max-w-full max-h-full object-contain"
          />
        );
      case 'txt':
        return (
          <iframe 
            src={objectUrl} 
            className="w-full h-full border-0" 
            title={fileName}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-6xl mb-4">{getFileIcon(fileName)}</div>
            <p className="text-lg font-medium">{fileName.split('/').pop()}</p>
            <p className="text-sm text-gray-500 mt-2">
              {formatFileSize(selectedFile.size)}
            </p>
            <button
              onClick={() => handleDownload(selectedFile)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Download File
            </button>
          </div>
        );
    }
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">SWD392 Exam Files</h2>
          <button
            onClick={handleDownloadAll}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            Download All
          </button>
        </div>
        <div className="mt-2">
          <input
            type="text"
            placeholder="Search files..."
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 border-r overflow-y-auto">
          {Object.keys(filteredGroups).length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No files match your search
            </div>
          ) : (
            Object.keys(filteredGroups).map(directory => (
              <div key={directory} className="border-b">
                <div className="bg-gray-50 dark:bg-gray-900 p-2 font-medium">
                  {directory}
                </div>
                <ul>
                  {filteredGroups[directory].map((file, index) => {
                    const fileName = file.name.split('/').pop();
                    return (
                      <li 
                        key={index}
                        onClick={() => handleFileSelect(file)}
                        className={`p-2 flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800
                          ${selectedFile === file ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      >
                        <div className="mr-2">
                          {getFileIcon(fileName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{fileName}</div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(file);
                          }}
                          className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          title="Download"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-auto flex items-center justify-center p-4">
          {selectedFile ? (
            renderFilePreview()
          ) : (
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Select a file to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';

const FileUploader = ({ onFilesExtracted }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const file = acceptedFiles[0];
      if (!file.name.endsWith('.zip') && !file.name.endsWith('.rar')) {
        throw new Error('Please upload a ZIP or RAR file');
      }
      if (file.name.endsWith('.rar')) {
        setError('Note: RAR files need to be extracted on your computer first. Browser can only handle ZIP files directly.');
        return;
      }
      const zip = new JSZip();
      const zipData = await zip.loadAsync(file);

      const extractedFiles = [];

      const filePromises = [];
      zipData.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir) {
          const promise = zipEntry.async('blob').then(content => {
            extractedFiles.push({
              name: zipEntry.name,
              content,
              type: getFileType(zipEntry.name),
              size: content.size,
              lastModified: new Date(zipEntry.date)
            });
          });
          filePromises.push(promise);
        }
      });

      await Promise.all(filePromises);

      // Sort files by name
      extractedFiles.sort((a, b) => a.name.localeCompare(b.name));

      onFilesExtracted(extractedFiles);
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err.message || 'Failed to process file');
    } finally {
      setIsLoading(false);
    }
  }, [onFilesExtracted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/octet-stream': ['.rar', '.zip']
    }
  });

  // Helper function to determine file type
  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return 'application/pdf';
      case 'doc': case 'docx': return 'application/msword';
      case 'xls': case 'xlsx': return 'application/vnd.ms-excel';
      case 'ppt': case 'pptx': return 'application/vnd.ms-powerpoint';
      case 'txt': return 'text/plain';
      case 'jpg': case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      default: return 'application/octet-stream';
    }
  };

  return (
    <div className="mb-8">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
          ${isDragActive
            ? 'border-orange-500 bg-orange-50'
            : 'border-gray-300 hover:border-orange-300'
          }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center">
          <svg
            className={`w-12 h-12 mb-3 ${isDragActive ? 'text-orange-500' : 'text-gray-400'}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          {isDragActive ? (
            <p className="text-orange-500 font-medium">Drop the files here...</p>
          ) : (
            <div>
              <p className="mb-2 text-sm text-gray-700">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                ZIP files containing exam materials
              </p>
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
          <p className="mt-2 text-sm text-gray-600">Processing file...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-100">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
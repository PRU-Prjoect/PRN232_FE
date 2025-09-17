import React, { useState } from 'react';

// Sample file data for a submission
const sampleSubmissionFiles = [
  {
    id: 1,
    name: 'Main.java',
    type: 'java',
    size: 2048,
    lastModified: '2025-09-15T14:25:30',
    content: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
    
    // Initialize the calculator
    Calculator calc = new Calculator();
    
    // Test the calculator
    System.out.println("5 + 3 = " + calc.add(5, 3));
    System.out.println("5 - 3 = " + calc.subtract(5, 3));
    System.out.println("5 * 3 = " + calc.multiply(5, 3));
    System.out.println("5 / 3 = " + calc.divide(5, 3));
  }
}`
  },
  {
    id: 2,
    name: 'Calculator.java',
    type: 'java',
    size: 1024,
    lastModified: '2025-09-15T14:20:15',
    content: `public class Calculator {
  public int add(int a, int b) {
    return a + b;
  }
  
  public int subtract(int a, int b) {
    return a - b;
  }
  
  public int multiply(int a, int b) {
    return a * b;
  }
  
  public double divide(int a, int b) {
    if (b == 0) {
      throw new ArithmeticException("Cannot divide by zero");
    }
    return (double) a / b;
  }
}`
  },
  {
    id: 3,
    name: 'README.txt',
    type: 'text',
    size: 512,
    lastModified: '2025-09-15T14:10:45',
    content: `Calculator Application
======================

This is a simple calculator application that demonstrates basic arithmetic operations.

Features:
- Addition
- Subtraction
- Multiplication
- Division

How to run:
1. Compile: javac Main.java Calculator.java
2. Run: java Main

Author: Student Name (SE160001)
Date: September 15, 2025`
  },
  {
    id: 4,
    name: 'output.txt',
    type: 'text',
    size: 256,
    lastModified: '2025-09-15T14:28:10',
    content: `Hello, World!
5 + 3 = 8
5 - 3 = 2
5 * 3 = 15
5 / 3 = 1.6666666666666667`
  },
  {
    id: 5,
    name: 'diagram.png',
    type: 'image',
    size: 15360,
    lastModified: '2025-09-15T14:15:22',
    content: '[Binary Image Data - Cannot Display]'
  }
];

const SubmissionViewer = ({ submission, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(sampleSubmissionFiles[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFiles = sampleSubmissionFiles.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'java':
        return (
          <svg className="h-6 w-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2 14.5v-5c0-.55.45-1 1-1h18c.55 0 1 .45 1 1v5c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1zm17-4H5v3h14v-3z" />
          </svg>
        );
      case 'text':
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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
                Student ID: {submission.studentId} • Submitted: {new Date(submission.submissionDate).toLocaleString()}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* File list sidebar */}
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
                    className={`hover:bg-gray-50 cursor-pointer ${selectedFile.id === file.id ? 'bg-orange-50' : ''}`}
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
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* File content */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div className="flex items-center">
                {getFileIcon(selectedFile.type)}
                <span className="ml-2 font-medium">{selectedFile.name}</span>
              </div>
              <div>
                <button 
                  className="px-3 py-1.5 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600 transition"
                  onClick={() => {
                    // In a real app, this would download the file
                    console.log(`Downloading file: ${selectedFile.name}`);
                    alert(`In a real app, this would download ${selectedFile.name}`);
                  }}
                >
                  Download
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
              {selectedFile.type === 'image' ? (
                <div className="flex items-center justify-center h-full bg-white rounded-md p-4">
                  <div className="text-center">
                    <svg className="h-16 w-16 text-gray-400 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" />
                    </svg>
                    <p className="mt-2 text-gray-500">Preview not available. Click download to view the image.</p>
                  </div>
                </div>
              ) : (
                <pre className="bg-white rounded-md p-4 overflow-auto h-full text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {selectedFile.content}
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

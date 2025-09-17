import React, { useState } from 'react';
import GradingModal from './GradingModal';
import SubmissionViewer from './SubmissionViewer';

const sampleSubmissions = [
  {
    id: 1,
    studentId: 'SE160001',
    studentName: 'Nguyen Van A',
    submissionDate: '2025-09-15T14:30:00',
    fileCount: 5,
    status: 'graded',
    grade: 8.5,
    feedback: 'Good work on the implementation, but missing some documentation.',
  },
  {
    id: 2,
    studentId: 'SE160002',
    studentName: 'Tran Thi B',
    submissionDate: '2025-09-15T15:45:00',
    fileCount: 4,
    status: 'graded',
    grade: 9.0,
    feedback: 'Excellent work, very well documented.',
  },
  {
    id: 3,
    studentId: 'SE160003',
    studentName: 'Le Van C',
    submissionDate: '2025-09-15T16:20:00',
    fileCount: 6,
    status: 'submitted',
    grade: null,
    feedback: '',
  },
  {
    id: 4,
    studentId: 'SE160004',
    studentName: 'Pham Thi D',
    submissionDate: '2025-09-15T17:10:00',
    fileCount: 3,
    status: 'submitted',
    grade: null,
    feedback: '',
  },
  {
    id: 5,
    studentId: 'SE160005',
    studentName: 'Hoang Van E',
    submissionDate: '2025-09-15T18:05:00',
    fileCount: 7,
    status: 'late',
    grade: null,
    feedback: '',
  },
];

const SubmissionsList = ({ courseId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [submissions, setSubmissions] = useState(sampleSubmissions);

  // Filter submissions based on search term and status
  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setIsViewerOpen(true);
  };

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setIsGradingModalOpen(true);
  };
  
  const handleSaveGrade = (updatedSubmission) => {
    // Update the submission in the list
    const updatedSubmissions = submissions.map(sub => 
      sub.id === updatedSubmission.id ? updatedSubmission : sub
    );
    setSubmissions(updatedSubmissions);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadgeClass = (status) => {
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Student Submissions
        </h2>
        <p className="text-gray-600">
          View and grade all student submissions for this course
        </p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by student name or ID"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
            <option value="late">Late</option>
          </select>
        </div>
      </div>

      {filteredSubmissions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Files
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{submission.studentName}</div>
                        <div className="text-sm text-gray-500">{submission.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(submission.submissionDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{submission.fileCount} files</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(submission.status)}`}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {submission.grade !== null ? (
                      <div className="text-sm text-gray-900">{submission.grade}/10</div>
                    ) : (
                      <div className="text-sm text-gray-500">Not graded</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewSubmission(submission)}
                      className="text-orange-600 hover:text-orange-900 mr-4"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleGradeSubmission(submission)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {submission.status === 'graded' ? 'Edit Grade' : 'Grade'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filter' : 'No student submissions yet'}
          </p>
        </div>
      )}
      
      {/* Grading Modal */}
      {isGradingModalOpen && selectedSubmission && (
        <GradingModal 
          submission={selectedSubmission}
          onClose={() => setIsGradingModalOpen(false)}
          onSave={handleSaveGrade}
        />
      )}
      
      {/* Submission Viewer Modal */}
      {isViewerOpen && selectedSubmission && (
        <SubmissionViewer
          submission={selectedSubmission}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default SubmissionsList;

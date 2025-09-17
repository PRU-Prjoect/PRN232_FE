import React, { useState } from 'react';

const GradingModal = ({ submission, onClose, onSave }) => {
  const [grade, setGrade] = useState(submission.grade || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      onSave({
        ...submission,
        grade: parseFloat(grade),
        feedback,
        status: 'graded'
      });
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              Grade Submission
            </h2>
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

        <div className="p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{submission.studentName}</h3>
                <p className="text-sm text-gray-500">{submission.studentId}</p>
              </div>
              <div className="mt-2 sm:mt-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                  submission.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Submission Details</h4>
                <span className="text-xs text-gray-500">
                  {new Date(submission.submissionDate).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Files</p>
                  <p className="text-sm font-medium">{submission.fileCount} files</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current Grade</p>
                  <p className="text-sm font-medium">
                    {submission.grade !== null ? `${submission.grade}/10` : 'Not graded'}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                  Grade (0-10)
                </label>
                <input
                  type="number"
                  id="grade"
                  min="0"
                  max="10"
                  step="0.1"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback
                </label>
                <textarea
                  id="feedback"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Provide feedback on the submission..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Saving...' : 'Save Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingModal;

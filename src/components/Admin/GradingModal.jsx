import React, { useState, useEffect } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { partService } from '../../services';
import { parseResponseData } from '../../utils/apiHelpers';
import { formatDateTime } from '../../utils/dateHelpers';
import LoadingSpinner from '../common/LoadingSpinner';

const GradingModal = ({ submission, onClose, onSave }) => {
  const [grade, setGrade] = useState(submission.grade || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parts, setParts] = useState([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [partsError, setPartsError] = useState('');

  useEffect(() => {
    if (submission?.examId) {
      fetchParts();
    }
  }, [submission?.examId]);

  const fetchParts = async () => {
    try {
      setLoadingParts(true);
      setPartsError('');
      
      const result = await partService.getParts({
        examId: submission.examId,
        pageIndex: 1,
        pageSize: 10,
        sortDirection: 'asc'
      });

      console.log('Parts data:', result);

      const partsData = parseResponseData(result);
      console.log(`Found ${partsData.length} parts for exam ${submission.examId}`);
      setParts(partsData);
    } catch (err) {
      console.error('Error fetching parts:', err);
      setPartsError(err?.message || 'Failed to load parts');
    } finally {
      setLoadingParts(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
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
              <CloseOutlined className="text-xl" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {submission.studentName || `Assignment ${submission.name}`}
                </h3>
                <p className="text-sm text-gray-500">
                  {submission.studentId || `Solution ID: ${submission.solutionId || 'N/A'}`}
                </p>
              </div>
              <div className="mt-2 sm:mt-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  submission.status === 'graded' || submission.status === 2 ? 'bg-green-100 text-green-800' :
                  submission.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {submission.status === 0 ? 'Pending' :
                   submission.status === 1 ? 'In Progress' :
                   submission.status === 2 ? 'Completed' :
                   submission.status ? submission.status.charAt(0).toUpperCase() + submission.status.slice(1) : 'N/A'}
                </span>
              </div>
            </div>

            {/* Parts Section */}
            {submission?.examId && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Exam Parts</h4>
                {loadingParts ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <LoadingSpinner size="sm" color="blue" />
                    <span className="text-sm">Loading parts...</span>
                  </div>
                ) : partsError ? (
                  <div className="text-sm text-red-600">{partsError}</div>
                ) : parts.length > 0 ? (
                  <div className="space-y-2">
                    {parts.map((part, index) => (
                      <div key={part.id || index} className="bg-white rounded-md p-3 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Part {index + 1}: {part.name || part.title || `Part ${part.id}`}
                            </p>
                            {part.description && (
                              <p className="text-xs text-gray-500 mt-1">{part.description}</p>
                            )}
                            {part.maxScore && (
                              <p className="text-xs text-gray-600 mt-1">Max Score: {part.maxScore}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No parts found for this exam</p>
                )}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Assignment Details</h4>
                {submission.createdAt && (
                  <span className="text-xs text-gray-500">
                    {formatDateTime(submission.createdAt)}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Assignment ID</p>
                  <p className="text-sm font-medium">{submission.id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current Grade</p>
                  <p className="text-sm font-medium">
                    {submission.grade !== null && submission.grade !== undefined ? `${submission.grade}/10` : 'Not graded'}
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

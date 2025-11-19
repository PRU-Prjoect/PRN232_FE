import React from 'react';
import { formatDateTime } from '../../utils/dateHelpers';

const GradingForm = ({
  assignment,
  grade,
  feedback,
  isSubmitting,
  onGradeChange,
  onFeedbackChange,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">Assignment Details</h4>
          {assignment.createdAt && (
            <span className="text-xs text-gray-500">
              {formatDateTime(assignment.createdAt)}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Assignment ID</p>
            <p className="text-sm font-medium">{assignment.id || 'N/A'}</p>
          </div>
          {/* <div>
            <p className="text-xs text-gray-500">Current Grade</p>
            <p className="text-sm font-medium">
              {assignment.grade !== null && assignment.grade !== undefined ? `${assignment.grade}/10` : 'Not graded'}
            </p>
          </div> */}
        </div>
      </div>
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
            Total Grade
          </label>
          <input
            type="number"
            id="grade"
            min="0"
            step="0.1"
            value={grade}
            onChange={(e) => onGradeChange(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm px-3 py-2 border bg-gray-50"
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">
            Total score is automatically calculated from individual question scores
          </p>
        </div>
        {/* <div className="mb-4">
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
            Feedback
          </label>
          <textarea
            id="feedback"
            rows={4}
            value={feedback}
            onChange={(e) => onFeedbackChange(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm px-3 py-2 border"
            placeholder="Provide feedback on the submission..."
          />
        </div> */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
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
  );
};

export default GradingForm;


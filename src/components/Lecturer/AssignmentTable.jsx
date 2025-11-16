import React from 'react';
import { StarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getAssignmentStatusInfo, isAssignmentCompleted } from '../../utils/statusHelpers';
import { formatDateTime } from '../../utils/dateHelpers';
import LoadingSpinner from '../common/LoadingSpinner';

const AssignmentTable = ({ 
  assignments, 
  isLoading, 
  examId,
  onGrade, 
  onApprove 
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <LoadingSpinner size="sm" color="blue" />
        <span>Loading assignments...</span>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No assignments for this exam
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-gray-900 mb-2">Assignments List:</h4>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Solution ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.map((assignment) => {
              const statusInfo = getAssignmentStatusInfo(assignment.status);
              const isCompleted = isAssignmentCompleted(assignment.status);
              const totalScore = assignment.totalScore !== null && assignment.totalScore !== undefined 
                ? assignment.totalScore 
                : assignment.totalscore !== null && assignment.totalscore !== undefined
                ? assignment.totalscore
                : 'N/A';

              return (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">{assignment.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{assignment.solutionId || 'N/A'}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">{totalScore}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {assignment.createdAt ? formatDateTime(assignment.createdAt) : 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onGrade(assignment, examId)}
                        className={`px-3 py-1 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-gray-400 cursor-not-allowed opacity-60'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                        title={isCompleted ? 'Grade already approved. Cannot grade again.' : 'Grade this assignment'}
                        disabled={isCompleted}
                      >
                        <StarOutlined />
                        Grade
                      </button>
                      <button
                        onClick={() => onApprove(assignment, examId)}
                        className={`px-3 py-1 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-gray-400 cursor-not-allowed opacity-60'
                            : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                        title={isCompleted ? 'Grade already approved' : 'Approve this grade'}
                        disabled={isCompleted}
                      >
                        <CheckCircleOutlined />
                        Approve Grade
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignmentTable;


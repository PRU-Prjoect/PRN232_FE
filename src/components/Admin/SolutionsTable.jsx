import React from 'react';
import { DownOutlined } from '@ant-design/icons';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDateTime } from '../../utils/dateHelpers';

const SolutionsTable = ({ 
  solutions, 
  isLoading, 
  selectedSolutions, 
  onSelectSolution, 
  onSelectAll,
  examId,
  solutionAssignments = {},
  selectedLecturerId = null
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <LoadingSpinner size="sm" color="orange" />
        <span className="ml-2 text-sm text-gray-600">Đang tải solutions...</span>
      </div>
    );
  }

  if (solutions.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-gray-500">
        Không có solution nào cho kỳ thi này
      </div>
    );
  }

  const availableSolutions = solutions.filter(s => {
    const solutionId = s.id || s.solutionId;
    const assignment = solutionAssignments[solutionId];
    if (assignment && selectedLecturerId && assignment.lecturerId === selectedLecturerId) {
      return false;
    }
    return true;
  });
  const allSelected = availableSolutions.length > 0 && 
    (selectedSolutions || []).length === availableSolutions.length &&
    availableSolutions.every(s => (selectedSolutions || []).includes(s.id || s.solutionId));

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">
          Solutions ({solutions.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  disabled={availableSolutions.length === 0}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">STT</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Mã sinh viên</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Path</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {solutions.map((solution, solIndex) => {
              const solutionId = solution.id || solution.solutionId;
              const isSelected = (selectedSolutions || []).includes(solutionId);
              const assignment = solutionAssignments[solutionId];
              const isAssigned = !!assignment;
              const isAssignedToSelectedLecturer = isAssigned && selectedLecturerId && assignment.lecturerId === selectedLecturerId;
              
              return (
                <tr key={solutionId || solIndex} className={`hover:bg-gray-50 ${isSelected ? 'bg-orange-50' : ''} ${isAssignedToSelectedLecturer ? 'bg-gray-100' : ''}`}>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectSolution(examId, solutionId)}
                      disabled={isAssignedToSelectedLecturer}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={isAssignedToSelectedLecturer ? `Đã được giao cho "${assignment.lecturerName}" rồi` : isAssigned ? `Đã được giao cho "${assignment.lecturerName}" (có thể phân công cho giảng viên khác)` : ''}
                    />
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{solIndex + 1}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <span>{solution.studentCode || 'N/A'}</span>
                      {isAssignedToSelectedLecturer && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800" title={`Đã được giao cho "${assignment.lecturerName}" rồi`}>
                          Đã giao rồi
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    <div className="max-w-xs truncate" title={solution.path || 'N/A'}>
                      {solution.path || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    <div>
                      {solution.createdAt 
                        ? formatDateTime(solution.createdAt)
                        : 'N/A'}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t border-gray-200">
        {(selectedSolutions || []).length > 0 && (
          <p className="text-sm text-gray-700 mb-1">
            <span className="font-medium">Đã chọn {(selectedSolutions || []).length}/{availableSolutions.length} solution(s) có thể phân công</span>
          </p>
        )}
        {selectedLecturerId && solutions.length > availableSolutions.length && (
          <p className="text-sm text-yellow-700">
            <span className="font-medium">{solutions.length - availableSolutions.length} solution(s) đã được giao cho giảng viên này rồi</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default SolutionsTable;


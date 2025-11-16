import React from 'react';
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { getStatusBadge } from '../../utils/statusHelpers';
import { formatDateTime } from '../../utils/dateHelpers';

const AssignmentCard = ({ 
  assignment, 
  isExpanded, 
  onToggleExpand,
  getLecturerName,
  getExamName,
  getSolutionName,
  onReassignLecturer
}) => {
  const statusInfo = getStatusBadge(assignment.status);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Assignment #{assignment.id}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Lecturer name:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {getLecturerName(assignment.lecturerId)}
                </span>
              </div>
              
              {assignment.examId && (
                <div>
                  <span className="text-gray-600">Exam:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {getExamName(assignment.examId)}
                  </span>
                </div>
              )}
              
              {assignment.solutionId && (
                <div>
                  <span className="text-gray-600">Solution:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {getSolutionName(assignment.solutionId)}
                  </span>
                </div>
              )}
              
              {assignment.createdAt && (
                <div>
                  <span className="text-gray-600">Day create:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {formatDateTime(assignment.createdAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="ml-4 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onReassignLecturer) {
                  onReassignLecturer(assignment);
                }
              }}
              className="px-3 py-1.5 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors flex items-center gap-2"
              title="Chuyển giao cho giảng viên khác"
            >
              <UserOutlined />
              <span>Update Lecturer</span>
            </button>
            <button
              onClick={() => onToggleExpand(assignment.id)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
            >
              <DownOutlined className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Assignment ID:</span>
                <span className="ml-2 font-mono text-gray-900">{assignment.id}</span>
              </div>
              {/* {assignment.lecturerId && (
                <div>
                  <span className="text-gray-600">Lecturer Name:</span>
                  <span className="ml-2 font-mono text-gray-900">{assignment.name}</span>
                </div>
              )} */}
              {assignment.examId && (
                <div>
                  <span className="text-gray-600">Exam ID:</span>
                  <span className="ml-2 font-mono text-gray-900">{assignment.examId}</span>
                </div>
              )}
              {/* {assignment.solutionId && (
                <div>
                  <span className="text-gray-600">Solution ID:</span>
                  <span className="ml-2 font-mono text-gray-900">{assignment.solutionId}</span>
                </div>
              )} */}
              {assignment.updatedAt && (
                <div>
                  <span className="text-gray-600">Last update of the file:</span>
                  <span className="ml-2 text-gray-900">
                    {formatDateTime(assignment.updatedAt)}
                  </span>
                </div>
              )}
              {/* {assignment.status && (
                <div>
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="ml-2 text-gray-900">{assignment.status}</span>
                </div>
              )} */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentCard;


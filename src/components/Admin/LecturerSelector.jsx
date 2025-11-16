import React from 'react';
import { CloseOutlined } from '@ant-design/icons';

const LecturerSelector = ({ 
  lecturers, 
  selectedLecturers, 
  onLecturerChange, 
  onRemoveLecturer 
}) => {
  return (
    <div className="space-y-3">
      {[...selectedLecturers.map(id => id), ''].map((selectedLecturerId, index) => {
        const availableLecturers = lecturers
          .filter(lecturer => lecturer.fullName)
          .filter(lecturer => {
            const role = lecturer.role || lecturer.roles || '';
            return role === 'lecturer' || role.toLowerCase() === 'lecturer';
          })
          .filter(lecturer => {
            return !selectedLecturers.some((id, idx) => idx !== index && id === lecturer.id);
          });
        const isLastEmpty = index === selectedLecturers.length && selectedLecturerId === '';
        if (isLastEmpty && availableLecturers.length === 0) {
          return null; 
        }

        return (
          <div key={index} className="flex items-center gap-2">
            <select
              value={selectedLecturerId}
              onChange={(e) => onLecturerChange(index, e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">-- Chọn giảng viên --</option>
              {availableLecturers.map(lecturer => (
                <option key={lecturer.id} value={lecturer.id}>
                  {lecturer.fullName}
                </option>
              ))}
            </select>
            {index < selectedLecturers.length && selectedLecturerId !== '' && (
              <button
                onClick={() => onRemoveLecturer(index)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                title="Xóa giảng viên"
              >
                <CloseOutlined />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LecturerSelector;


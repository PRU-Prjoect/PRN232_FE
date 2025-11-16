import React, { useState, useEffect } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import Modal from '../common/Modal';

const ExamEditModal = ({ isOpen, onClose, exam, onSubmit, updating }) => {
  const [formData, setFormData] = useState({
    name: '',
    subjectCode: 'SWD392',
    semester: '',
    academicYear: '',
    examDate: '',
    isActive: true
  });

  useEffect(() => {
    if (exam) {
      const examDateValue = exam.examDate 
        ? new Date(exam.examDate).toISOString().slice(0, 16)
        : '';
      setFormData({
        name: exam.name || '',
        subjectCode: 'SWD392',
        semester: exam.semester || '',
        academicYear: exam.academicYear || '',
        examDate: examDateValue,
        isActive: exam.isActive !== undefined ? exam.isActive : true
      });
    }
  }, [exam]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cập nhật kỳ thi"
      size="lg"
      footer={
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={updating}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
          >
            {updating ? 'Đang cập nhật...' : 'Cập nhật'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên kỳ thi *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã môn học *
              </label>
              <input
                type="text"
                required
                value="SWD392"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Học kỳ *
              </label>
              <input
                type="text"
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Năm học *
            </label>
            <input
              type="text"
              required
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              placeholder="VD: 2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày thi *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.examDate}
              onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={formData.isActive ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="true">Active</option>
              <option value="false">No Active</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ExamEditModal;


import React, { useState, useEffect } from 'react';
import { Modal, Select } from 'antd';

const { Option } = Select;

const ReassignLecturerModal = ({
  visible,
  onCancel,
  onConfirm,
  assignmentId,
  currentLecturerId,
  lecturers = [],
  loading = false,
  existingAssignments = [] 
}) => {
  const [selectedLecturerId, setSelectedLecturerId] = useState(null);

  useEffect(() => {
    if (!visible) {
      setSelectedLecturerId(null);
    }
  }, [visible]);

  const handleOk = () => {
    if (!selectedLecturerId) {
      alert('Vui lòng chọn giảng viên mới');
      return;
    }

    if (selectedLecturerId === currentLecturerId) {
      alert('Giảng viên được chọn giống với giảng viên hiện tại');
      return;
    }

    const lecturerAlreadyAssigned = existingAssignments.some(
      assignment => assignment.lecturerId === selectedLecturerId
    );

    if (lecturerAlreadyAssigned) {
      const lecturer = lecturers.find(l => l.id === selectedLecturerId);
      const lecturerName = lecturer?.fullName || lecturer?.name || `Lecturer ${selectedLecturerId}`;
      alert(`Giảng viên "${lecturerName}" đã được giao assignment này rồi. Không thể chuyển bài cho người đó chấm thêm.`);
      return;
    }

    onConfirm(selectedLecturerId);
  };

  const handleCancel = () => {
    setSelectedLecturerId(null);
    onCancel();
  };

  return (
    <Modal
      title="Chuyển giao bài chấm cho giảng viên khác"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Xác nhận"
      cancelText="Hủy"
    >
      <div className="py-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn giảng viên mới:
          </label>
          <Select
            style={{ width: '100%' }}
            placeholder="-- Chọn giảng viên --"
            value={selectedLecturerId}
            onChange={setSelectedLecturerId}
            showSearch
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {lecturers
              .filter(lecturer => lecturer.id !== currentLecturerId)
              .map(lecturer => (
                <Option key={lecturer.id} value={lecturer.id}>
                  {lecturer.fullName || lecturer.name || `Lecturer ${lecturer.id}`}
                </Option>
              ))}
          </Select>
        </div>
        {currentLecturerId && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Giảng viên hiện tại:</span>{' '}
            {lecturers.find(l => l.id === currentLecturerId)?.fullName || 
             lecturers.find(l => l.id === currentLecturerId)?.name || 
             `Lecturer ${currentLecturerId}`}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ReassignLecturerModal;


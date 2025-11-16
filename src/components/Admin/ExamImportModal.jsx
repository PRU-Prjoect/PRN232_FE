import React, { useState } from 'react';
import { CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Modal from '../common/Modal';

const ExamImportModal = ({ isOpen, onClose, exam, onSubmit, importing, onActivate }) => {
  const [importFile, setImportFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (importFile) {
      onSubmit(importFile);
    }
  };

  const handleClose = () => {
    setImportFile(null);
    onClose();
  };

  if (!exam) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Import ZIP cho: ${exam.name}`}
      size="md"
      footer={
        !exam.isActive ? (
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => {
                handleClose();
                onActivate(exam);
              }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-medium"
            >
              Kích hoạt kỳ thi
            </button>
          </div>
        ) : (
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
              disabled={importing || !importFile}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
            >
              {importing ? 'Đang import...' : 'Import'}
            </button>
          </div>
        )
      }
    >
      {!exam.isActive ? (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-start">
              <ExclamationCircleOutlined className="text-yellow-600 text-xl mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Kỳ thi chưa được kích hoạt</h4>
                <p className="text-xs text-yellow-700 mt-1">
                  Kỳ thi này đang ở trạng thái "No Active". Vui lòng kích hoạt kỳ thi trước khi upload file ZIP.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn file ZIP
              </label>
              <input
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                required
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {importFile && (
                <p className="mt-2 text-xs text-gray-500">
                  Đã chọn: {importFile.name} ({(importFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-blue-800">
                <strong>Lưu ý:</strong> File ZIP sẽ được import vào Exam ID: <strong>{exam.subjectCode} || {exam.semester}</strong>. 
                Tất cả các thông tin trong file sẽ được liên kết với exam này.
              </p>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ExamImportModal;


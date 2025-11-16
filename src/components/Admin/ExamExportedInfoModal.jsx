import React from 'react';
import { CloseOutlined, CheckCircleOutlined, ExclamationCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';

const ExamExportedInfoModal = ({ isOpen, onClose, exam, exportedInfo, viewing }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={exam ? `Thông tin đã được lưu - Exam name: ${exam.subjectCode} ${exam.name}` : 'Thông tin đã export'}
      size="xl"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm"
        >
          Đóng
        </button>
      }
    >
      {viewing ? (
        <div className="text-center py-8">
          <LoadingSpinner size="md" color="orange" />
          <p className="mt-2 text-sm text-gray-600">Đang tải...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {exportedInfo?.importStatus && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Trạng thái Import</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Status:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    exportedInfo.importStatus.status === 'Completed' 
                      ? 'bg-green-100 text-green-800' 
                      : exportedInfo.importStatus.status === 'Running'
                      ? 'bg-yellow-100 text-yellow-800'
                      : exportedInfo.importStatus.status === 'Failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {exportedInfo.importStatus.status || 'Unknown'}
                  </span>
                </div>
                {exportedInfo.importStatus.numStudentsImported !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Học sinh đã import:</span>
                    <span className="text-sm font-medium text-blue-900">{exportedInfo.importStatus.numSolutionsImported + exportedInfo.importStatus.numUnmatched || 0}</span>
                  </div>
                )}
                {exportedInfo.importStatus.numSolutionsImported !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Mã sinh viên khớp với danh sách:</span>
                    <span className="text-sm font-medium text-blue-900">{exportedInfo.importStatus.numSolutionsImported || 0}</span>
                  </div>
                )}
                {exportedInfo.importStatus.numUnmatched !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Mã sinh viên không khớp với danh sách:</span>
                    <span className="text-sm font-medium text-blue-900">{exportedInfo.importStatus.numUnmatched || 0}</span>
                  </div>
                )}
                {exportedInfo.importStatus.finishedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Nhận file lúc:</span>
                    <span className="text-sm font-medium text-blue-900">{formatDate(exportedInfo.importStatus.finishedAt)}</span>
                  </div>
                )}
                {exportedInfo.importStatus.error && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <span className="text-xs text-red-800">Lỗi: {exportedInfo.importStatus.error}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {exportedInfo && (Object.keys(exportedInfo).length > 0 || exportedInfo.importStatus) ? (
            <>
              {exportedInfo.statistics && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Thống kê</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Tổng số submissions</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {exportedInfo.statistics.totalSubmissions || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Tổng số học sinh</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {exportedInfo.statistics.totalStudents || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Tổng số file</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {exportedInfo.statistics.totalFiles || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {exportedInfo.submissions && exportedInfo.submissions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Danh sách Submissions</h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã SV</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên SV</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày nộp</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {exportedInfo.submissions.map((submission, index) => (
                          <tr key={submission.id || index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{submission.studentId || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{submission.studentName || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {submission.fileName || submission.files?.[0] || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {submission.submissionDate ? formatDate(submission.submissionDate) : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {exportedInfo.students && exportedInfo.students.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Danh sách Học sinh</h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã SV</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên SV</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {exportedInfo.students.map((student, index) => (
                          <tr key={student.id || student.studentId || index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{student.studentId || student.id || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{student.studentName || student.name || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {!exportedInfo.importStatus &&
               (!exportedInfo.submissions || exportedInfo.submissions.length === 0) && 
               (!exportedInfo.students || exportedInfo.students.length === 0) && 
               (!exportedInfo.statistics || (exportedInfo.statistics.totalFiles === 0 && exportedInfo.statistics.totalSubmissions === 0)) && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <FileTextOutlined className="mx-auto text-gray-400 text-5xl" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có file nào được lưu</h3>
                  <p className="mt-1 text-sm text-gray-500">Chưa có file nào được lưu cho exam này</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <FileTextOutlined className="mx-auto text-gray-400 text-5xl" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có file nào được lưu</h3>
              <p className="mt-1 text-sm text-gray-500">Chưa có file nào được lưu cho exam này</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ExamExportedInfoModal;


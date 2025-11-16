import React from 'react';
import { EyeOutlined, UploadOutlined, DownloadOutlined, FileTextOutlined, FileExcelOutlined } from '@ant-design/icons';

const ExamTable = ({ 
  exams, 
  onView, 
  onImport, 
  onDownloadExamPaper, 
  onDownloadMarkingSheet,
  onExportScores,
  onEdit, 
  onDelete,
  viewing,
  downloadingExamPaper,
  downloadingMarkingSheet,
  exportingScores,
  deleting
}) => {
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

  const getStatusBadgeClass = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tên kỳ thi
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mã môn học
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Học kỳ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Năm học
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày thi
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {exams.map((exam) => (
            <tr key={exam.id || exam.examId} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{exam.name || 'N/A'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{exam.subjectCode || 'N/A'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{exam.semester || 'N/A'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{exam.academicYear || 'N/A'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatDate(exam.examDate)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(exam.isActive)}`}>
                  {exam.isActive ? 'Active' : 'No Active'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onView(exam)}
                    disabled={viewing}
                    className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                    title="Xem thông tin đã export"
                  >
                    <EyeOutlined />
                  </button>
                  <button
                    onClick={() => onImport(exam)}
                    disabled={!exam.isActive}
                    className={`${!exam.isActive ? 'text-gray-400 cursor-not-allowed' : 'text-purple-600 hover:text-purple-900'}`}
                    title={!exam.isActive ? 'Kỳ thi chưa được kích hoạt. Vui lòng kích hoạt trước khi upload ZIP.' : 'Import ZIP'}
                  >
                    <UploadOutlined />
                  </button>
                  <button
                    onClick={() => onDownloadExamPaper(exam)}
                    disabled={downloadingExamPaper}
                    className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                    title="Download đề thi"
                  >
                    <DownloadOutlined />
                  </button>
                  <button
                    onClick={() => onDownloadMarkingSheet(exam)}
                    disabled={downloadingMarkingSheet}
                    className="text-teal-600 hover:text-teal-900 disabled:opacity-50"
                    title="Download file thành viên"
                  >
                    <FileTextOutlined />
                  </button>
                  <button
                    onClick={() => onExportScores(exam)}
                    disabled={exportingScores}
                    className="text-green-600 hover:text-green-900 disabled:opacity-50"
                    title="Xuất file Excel điểm số"
                  >
                    <FileExcelOutlined />
                  </button>
                  <button
                    onClick={() => onEdit(exam)}
                    className="text-orange-600 hover:text-orange-900"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => onDelete(exam.id || exam.examId)}
                    disabled={deleting}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExamTable;


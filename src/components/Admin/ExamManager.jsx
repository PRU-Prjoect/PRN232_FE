import React, { useState, useEffect } from 'react';
import { PlusOutlined, FileTextOutlined, CloseOutlined } from '@ant-design/icons';
import { examService, finalscoreService } from '../../services';
import { parseResponseData, getTotalCount } from '../../utils/apiHelpers';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import ExamCreateModal from './ExamCreateModal';
import ExamEditModal from './ExamEditModal';
import ExamImportModal from './ExamImportModal';
import ExamExportedInfoModal from './ExamExportedInfoModal';
import ExamTable from './ExamTable';

const ExamManager = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExamForImport, setSelectedExamForImport] = useState(null);
  const [selectedExamForView, setSelectedExamForView] = useState(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [exportedInfo, setExportedInfo] = useState(null);
  const [downloadingExamPaper, setDownloadingExamPaper] = useState(false);
  const [downloadingMarkingSheet, setDownloadingMarkingSheet] = useState(false);
  const [exportingScores, setExportingScores] = useState(false);

  const loadExams = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await examService.getExams({
        page,
        pageSize,
        search: searchTerm
      });

      const exams = parseResponseData(result);
      const total = getTotalCount(result) || exams.length;
      setExams(exams);
      setTotal(total);
    } catch (err) {
      console.error('Error loading exams:', err);
      setError(err.message || 'Không thể tải danh sách kỳ thi');
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, [page, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        loadExams();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCreate = async (formData) => {
    try {
      setCreating(true);
      setError('');
      const payload = {
        ...formData,
        subjectCode: 'SWD392',
        examDate: new Date(formData.examDate).toISOString(),
        isActive: Boolean(formData.isActive)
      };
      await examService.createExam(payload);
      setShowCreateModal(false);
      loadExams();
      alert('Tạo kỳ thi thành công!');
    } catch (err) {
      console.error('Error creating exam:', err);
      setError(err.message || 'Không thể tạo kỳ thi');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (formData) => {
    if (!selectedExam) return;
    try {
      setUpdating(true);
      setError('');
      const payload = {
        ...formData,
        subjectCode: 'SWD392',
        examDate: new Date(formData.examDate).toISOString(),
        isActive: Boolean(formData.isActive)
      };
      await examService.updateExam(selectedExam.id || selectedExam.examId, payload);
      setShowEditModal(false);
      setSelectedExam(null);
      loadExams();
      alert('Cập nhật kỳ thi thành công!');
    } catch (err) {
      console.error('Error updating exam:', err);
      setError(err.message || 'Không thể cập nhật kỳ thi');
    } finally {
      setUpdating(false);
    }
  };

  const checkExamHasImportedFiles = async (examId) => {
    try {
      const jobId = localStorage.getItem(`exam_${examId}_jobId`);
      if (jobId) {
        return true;
      }

      try {
        const importStatus = await examService.getImportStatus(examId);
        if (importStatus && (importStatus.status || importStatus.examPaperPath || importStatus.markingSheetPath)) {
          return true;
        }
      } catch (importErr) {
        return false;
      }

      return false;
    } catch (err) {
      console.error('Error checking imported files:', err);
      return false;
    }
  };

  const handleDelete = async (examId) => {
    const hasImportedFiles = await checkExamHasImportedFiles(examId);

    if (hasImportedFiles) {
      if (!window.confirm('Kỳ thi này đã có file import. Bạn chỉ có thể đặt trạng thái thành "Not Active" thay vì xóa. Bạn có muốn tiếp tục?')) {
        return;
      }

      try {
        setDeleting(true);
        let exam = exams.find(e => (e.id || e.examId) === examId);
        if (!exam) {
          exam = await examService.getExamById(examId);
        }

        if (exam) {
          const payload = {
            name: exam.name || '',
            subjectCode: exam.subjectCode || '',
            semester: exam.semester || '',
            academicYear: exam.academicYear || '',
            examDate: exam.examDate ? new Date(exam.examDate).toISOString() : '',
            isActive: false
          };
          await examService.updateExam(examId, payload);
          loadExams();
          alert('Đã đặt trạng thái kỳ thi thành "Not Active"!');
        }
      } catch (err) {
        console.error('Error updating exam status:', err);
        alert('Không thể cập nhật trạng thái kỳ thi');
      } finally {
        setDeleting(false);
      }
    } else {
      if (!window.confirm('Bạn có chắc chắn muốn xóa kỳ thi này?')) {
        return;
      }

      try {
        setDeleting(true);
        await examService.deleteExam(examId);
        loadExams();
        alert('Xóa kỳ thi thành công!');
      } catch (err) {
        console.error('Error deleting exam:', err);
        alert('Không thể xóa kỳ thi');
      } finally {
        setDeleting(false);
      }
    }
  };

  const openEditModal = (exam) => {
    setSelectedExam(exam);
    setShowEditModal(true);
  };

  const handleExportZip = async (exam) => {
    try {
      setExporting(true);
      setError('');
      const blob = await examService.exportZip(exam.id);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const sanitizedName = exam.name.replace(/[^a-z0-9\s-_]/gi, '_').replace(/\s+/g, '_').toLowerCase();
      link.download = `exam_${exam.id}_${sanitizedName}.zip`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert(`Export thành công! File ZIP đã được lưu với tên chứa Exam ID: ${exam.id}`);
    } catch (err) {
      console.error('Error exporting ZIP:', err);
      setError(err.message || 'Không thể export file ZIP');
    } finally {
      setExporting(false);
    }
  };

  const handleImportZip = async (importFile) => {
    if (!importFile || !selectedExamForImport) return;

    try {
      setImporting(true);
      setError('');
      const result = await examService.importZip(selectedExamForImport.id, importFile);

      if (result.jobId) {
        localStorage.setItem(`exam_${selectedExamForImport.id}_jobId`, result.jobId);
      }

      setShowImportModal(false);
      setSelectedExamForImport(null);
      const message = result.jobId
        ? `Import thành công! Job ID: ${result.jobId}\nExam ID: ${selectedExamForImport.id}`
        : `Import thành công! Exam ID: ${selectedExamForImport.id}`;
      alert(message);
      loadExams();
    } catch (err) {
      console.error('Error importing zip:', err);
      setError(err.message || 'Không thể import file ZIP');
    } finally {
      setImporting(false);
    }
  };

  const openImportModal = (exam) => {
    if (!exam.isActive) {
      alert('Kỳ thi này chưa được kích hoạt. Vui lòng kích hoạt kỳ thi trước khi upload file ZIP.');
      return;
    }
    setSelectedExamForImport(exam);
    setShowImportModal(true);
  };

  const handleViewExportedInfo = async (exam) => {
    try {
      setViewing(true);
      setError('');
      setSelectedExamForView(exam);

      const jobId = localStorage.getItem(`exam_${exam.id}_jobId`);
      let importStatusData = null;
      let examPaperPath = null;
      let markingSheetPath = null;
      if (jobId) {
        try {
          importStatusData = await examService.getImportZipStatus(exam.id, jobId);
          if (importStatusData && importStatusData !== null) {
            examPaperPath = importStatusData.examPaperPath || null;
            markingSheetPath = importStatusData.markingSheetPath || null;
            if (!examPaperPath && importStatusData.data) {
              examPaperPath = importStatusData.data.examPaperPath || null;
              markingSheetPath = importStatusData.data.markingSheetPath || null;
            }
          }
        } catch (zipErr) {
          if (zipErr?.response?.status !== 404) {
            console.warn('Error fetching import zip status:', zipErr);
          }
          importStatusData = null;
        }
      }

      setExportedInfo({
        examPaperPath: examPaperPath,
        markingSheetPath: markingSheetPath,
        importStatus: importStatusData,
      });

      setShowViewModal(true);
    } catch (err) {
      if (err?.response?.status !== 404) {
        console.error('Error loading exported info:', err);
        setError(err.message || 'Không thể tải thông tin đã export');
      } else {
        setExportedInfo({});
        setShowViewModal(true);
      }
    } finally {
      setViewing(false);
    }
  };

  const handleDownloadExamPaper = async (exam) => {
    try {
      setDownloadingExamPaper(true);
      setError('');
      const { blob, filename } = await examService.downloadExamPaper(exam.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      if (filename) {
        link.download = filename;
      } else {
        let extension = 'jpg';
        if (blob.type) {
          if (blob.type.includes('jpeg') || blob.type.includes('jpg')) {
            extension = 'jpg';
          } else if (blob.type.includes('png')) {
            extension = 'png';
          } else if (blob.type.includes('pdf')) {
            extension = 'pdf';
          }
        }

        const sanitizedName = exam.name.replace(/[^a-z0-9\s-_]/gi, '_').replace(/\s+/g, '_').toLowerCase();
        link.download = `de_thi_${exam.id}_${sanitizedName}.${extension}`;
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Download đề thi thành công!');
    } catch (err) {
      console.error('Error downloading exam paper:', err);
      setError(err.message || 'Không thể download đề thi');
    } finally {
      setDownloadingExamPaper(false);
    }
  };

  const handleDownloadMarkingSheet = async (exam) => {
    try {
      setDownloadingMarkingSheet(true);
      setError('');
      const { blob, filename: headerFilename } = await examService.downloadMarkingSheet(exam.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      let downloadFilename;
      if (headerFilename) {
        downloadFilename = headerFilename;
      } else {
        const sanitizedName = exam.name.replace(/[^a-z0-9\s-_]/gi, '_').replace(/\s+/g, '_').toLowerCase();
        let extension = '.xlsx';
        if (blob.type === 'application/vnd.ms-excel') {
          extension = '.xls';
        } else if (blob.type.includes('spreadsheetml') || blob.type.includes('excel')) {
          extension = '.xlsx';
        }
        downloadFilename = `bang_diem_${exam.id}_${sanitizedName}${extension}`;
      }

      link.download = downloadFilename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Download bảng điểm thành công!');
    } catch (err) {
      console.error('Error downloading marking sheet:', err);
      setError(err.message || 'Không thể download bảng điểm');
    } finally {
      setDownloadingMarkingSheet(false);
    }
  };

  const handleExportScores = async (exam) => {
    try {
      setExportingScores(true);
      setError('');
      const { blob, filename: headerFilename } = await finalscoreService.exportScores(exam.id || exam.examId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      let downloadFilename;
      if (headerFilename) {
        downloadFilename = headerFilename;
      } else {
        const sanitizedName = exam.name.replace(/[^a-z0-9\s-_]/gi, '_').replace(/\s+/g, '_').toLowerCase();
        let extension = '.xlsx';
        if (blob.type === 'application/vnd.ms-excel') {
          extension = '.xls';
        } else if (blob.type.includes('spreadsheetml') || blob.type.includes('excel')) {
          extension = '.xlsx';
        }
        downloadFilename = `diem_so_${exam.id || exam.examId}_${sanitizedName}${extension}`;
      }

      link.download = downloadFilename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Xuất file Excel điểm số thành công!');
    } catch (err) {
      console.error('Error exporting scores:', err);
      setError(err.message || 'Không thể xuất file Excel điểm số');
    } finally {
      setExportingScores(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Kỳ thi</h2>
          <p className="text-sm text-gray-600 mt-1">Tạo, xem, cập nhật và xóa kỳ thi</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-medium flex items-center"
        >
          <PlusOutlined className="mr-2" />
          Tạo kỳ thi mới
        </button>
      </div>

      {error && (
        <ErrorAlert message={error} className="text-sm" />
      )}

      <div className="mb-6 flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm kỳ thi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Số lượng:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <LoadingSpinner size="md" color="orange" />
          <p className="mt-2 text-sm text-gray-600">Đang tải...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <FileTextOutlined className="mx-auto text-gray-400 text-5xl" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có kỳ thi nào</h3>
          <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo kỳ thi mới</p>
        </div>
      ) : (
        <>
          <ExamTable
            exams={exams}
            onView={handleViewExportedInfo}
            onImport={openImportModal}
            onDownloadExamPaper={handleDownloadExamPaper}
            onDownloadMarkingSheet={handleDownloadMarkingSheet}
            onExportScores={handleExportScores}
            onEdit={openEditModal}
            onDelete={handleDelete}
            viewing={viewing}
            downloadingExamPaper={downloadingExamPaper}
            downloadingMarkingSheet={downloadingMarkingSheet}
            exportingScores={exportingScores}
            deleting={deleting}
          />
          {total > pageSize && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {((page - 1) * pageSize) + 1} đến {Math.min(page * pageSize, total)} của {total} kỳ thi
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page * pageSize >= total}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ExamCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        creating={creating}
      />

      <ExamEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedExam(null);
        }}
        exam={selectedExam}
        onSubmit={handleUpdate}
        updating={updating}
      />

      <ExamImportModal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setSelectedExamForImport(null);
        }}
        exam={selectedExamForImport}
        onSubmit={handleImportZip}
        importing={importing}
        onActivate={(exam) => {
          setShowImportModal(false);
          setSelectedExamForImport(null);
          openEditModal(exam);
        }}
      />

      <ExamExportedInfoModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedExamForView(null);
          setExportedInfo(null);
        }}
        exam={selectedExamForView}
        exportedInfo={exportedInfo}
        viewing={viewing}
      />
    </div>
  );
};

export default ExamManager;

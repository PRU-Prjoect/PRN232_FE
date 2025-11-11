import React, { useState, useEffect } from 'react';
import { examService } from '../../services';

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
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [exportedInfo, setExportedInfo] = useState(null);
  const [downloadingExamPaper, setDownloadingExamPaper] = useState(false);
  const [downloadingMarkingSheet, setDownloadingMarkingSheet] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    subjectCode: '',
    semester: '',
    academicYear: '',
    examDate: '',
    isActive: true
  });

  const loadExams = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await examService.getExams({
        page,
        pageSize,
        search: searchTerm
      });
      
      if (result.data) {
        setExams(result.data);
        setTotal(result.total || result.data.length);
      } else if (Array.isArray(result)) {
        setExams(result);
        setTotal(result.length);
      } else {
        setExams(result.items || []);
        setTotal(result.total || 0);
      }
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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError('');
      const payload = {
        ...formData,
        examDate: new Date(formData.examDate).toISOString(),
        isActive: Boolean(formData.isActive)
      };
      await examService.createExam(payload);
      setShowCreateModal(false);
      setFormData({
        name: '',
        subjectCode: '',
        semester: '',
        academicYear: '',
        examDate: '',
        isActive: true
      });
      loadExams();
      alert('Tạo kỳ thi thành công!');
    } catch (err) {
      console.error('Error creating exam:', err);
      setError(err.message || 'Không thể tạo kỳ thi');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError('');
      const payload = {
        ...formData,
        examDate: new Date(formData.examDate).toISOString(),
        isActive: Boolean(formData.isActive)
      };
      await examService.updateExam(selectedExam.id, payload);
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
    const examDateValue = exam.examDate 
      ? new Date(exam.examDate).toISOString().slice(0, 16)
      : '';
    setFormData({
      name: exam.name || '',
      subjectCode: exam.subjectCode || '',
      semester: exam.semester || '',
      academicYear: exam.academicYear || '',
      examDate: examDateValue,
      isActive: exam.isActive !== undefined ? exam.isActive : true
    });
    setShowEditModal(true);
  };

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

  const handleImportZip = async (e) => {
    e.preventDefault();
    if (!importFile || !selectedExamForImport) return;

    try {
      setImporting(true);
      setError('');
      const result = await examService.importZip(selectedExamForImport.id, importFile);
      
      if (result.jobId) {
        localStorage.setItem(`exam_${selectedExamForImport.id}_jobId`, result.jobId);
      }
      
      setShowImportModal(false);
      setImportFile(null);
      setSelectedExamForImport(null);
      const message = result.jobId 
        ? `Import thành công! Job ID: ${result.jobId}\nExam ID: ${selectedExamForImport.id}\nHọc sinh đã import: ${result.numStudentsImported || 0}\nGiải pháp đã import: ${result.numSolutionsImported || 0}`
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
    setImportFile(null);
    setShowImportModal(true);
  };

  const handleViewExportedInfo = async (exam) => {
    try {
      setViewing(true);
      setError('');
      setSelectedExamForView(exam);

      const info = await examService.getExamExportedInfo(exam.id);
      
      let examPaperPath = null;
      let markingSheetPath = null;
      let importStatusData = null;
      
      try {
        const jobId = localStorage.getItem(`exam_${exam.id}_jobId`);
        
        if (jobId) {
          console.log('Using jobId to get import status:', jobId);
          importStatusData = await examService.getImportZipStatus(exam.id, jobId);
          console.log('Import zip status response:', importStatusData);
        } else {
          console.log('No jobId found, using old import-status endpoint');
          importStatusData = await examService.getImportStatus(exam.id);
          console.log('Import status response:', importStatusData);
        }
        
        if (importStatusData) {
          examPaperPath = importStatusData.examPaperPath || null;
          markingSheetPath = importStatusData.markingSheetPath || null;
          if (!examPaperPath && importStatusData.data) {
            examPaperPath = importStatusData.data.examPaperPath || null;
            markingSheetPath = importStatusData.data.markingSheetPath || null;
          }
        }
        
        console.log('Extracted paths - examPaperPath:', examPaperPath, 'markingSheetPath:', markingSheetPath);
      } catch (importErr) {
        console.warn('Could not fetch import status:', importErr);
        console.warn('Error details:', importErr.message, importErr.response?.data);
      }
      
      setExportedInfo({
        ...info,
        examPaperPath: examPaperPath,
        markingSheetPath: markingSheetPath,
        importStatus: importStatusData, 
      });
      
      console.log('Final exported info:', {
        ...info,
        examPaperPath: examPaperPath,
        markingSheetPath: markingSheetPath,
        importStatus: importStatusData,
      });
      
      setShowViewModal(true);
    } catch (err) {
      console.error('Error loading exported info:', err);
      setError(err.message || 'Không thể tải thông tin đã export');
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tạo kỳ thi mới
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="mt-2 text-sm text-gray-600">Đang tải...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có kỳ thi nào</h3>
          <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo kỳ thi mới</p>
        </div>
      ) : (
        <>
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
                          onClick={() => handleViewExportedInfo(exam)}
                          disabled={viewing}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          title="Xem thông tin đã export"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openImportModal(exam)}
                          disabled={!exam.isActive}
                          className={`${!exam.isActive ? 'text-gray-400 cursor-not-allowed' : 'text-purple-600 hover:text-purple-900'}`}
                          title={!exam.isActive ? 'Kỳ thi chưa được kích hoạt. Vui lòng kích hoạt trước khi upload ZIP.' : 'Import ZIP'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownloadExamPaper(exam)}
                          disabled={downloadingExamPaper}
                          className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                          title="Download đề thi"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownloadMarkingSheet(exam)}
                          disabled={downloadingMarkingSheet}
                          className="text-teal-600 hover:text-teal-900 disabled:opacity-50"
                          title="Download bảng điểm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openEditModal(exam)}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id || exam.examId)}
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Tạo kỳ thi mới</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      name: '',
                      subjectCode: '',
                      semester: '',
                      academicYear: '',
                      examDate: '',
                      isActive: true
                    });
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreate}>
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
                        value={formData.subjectCode}
                        onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({
                        name: '',
                        subjectCode: '',
                        semester: '',
                        academicYear: '',
                        examDate: '',
                        isActive: true
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    {creating ? 'Đang tạo...' : 'Tạo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Cập nhật kỳ thi</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedExam(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleUpdate}>
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
                        value={formData.subjectCode}
                        onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                      <option value="true">Đang hoạt động</option>
                      <option value="false">Không hoạt động</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedExam(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    {updating ? 'Đang cập nhật...' : 'Cập nhật'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showImportModal && selectedExamForImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Import ZIP cho: {selectedExamForImport.name}
                </h3>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setSelectedExamForImport(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {!selectedExamForImport.isActive ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Kỳ thi chưa được kích hoạt</h4>
                        <p className="text-xs text-yellow-700 mt-1">
                          Kỳ thi này đang ở trạng thái "No Active". Vui lòng kích hoạt kỳ thi trước khi upload file ZIP.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowImportModal(false);
                        setImportFile(null);
                        setSelectedExamForImport(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Đóng
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowImportModal(false);
                        setImportFile(null);
                        setSelectedExamForImport(null);
                        openEditModal(selectedExamForImport);
                      }}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-medium"
                    >
                      Kích hoạt kỳ thi
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleImportZip}>
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
                        <strong>Lưu ý:</strong> File ZIP sẽ được import vào Exam ID: <strong>{selectedExamForImport.id}</strong>. 
                        Tất cả các thông tin trong file sẽ được liên kết với exam này.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowImportModal(false);
                        setImportFile(null);
                        setSelectedExamForImport(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={importing || !importFile}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
                    >
                      {importing ? 'Đang import...' : 'Import'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {showViewModal && selectedExamForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Thông tin đã được lưu - Exam name: {selectedExamForView.subjectCode} {selectedExamForView.name} 
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedExamForView.name} ({selectedExamForView.subjectCode})
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedExamForView(null);
                    setExportedInfo(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {viewing ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
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
                            <span className="text-sm font-medium text-blue-900">{exportedInfo.importStatus.numSolutionsImported +  exportedInfo.importStatus.numUnmatched|| 0}</span>
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

                  {/* ZIP File Status Note - Always show */}
                  {/* {(exportedInfo?.examPaperPath && exportedInfo?.markingSheetPath) ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-green-800">
                          Đã có file zip bài thi
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-yellow-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-sm font-medium text-yellow-800">
                          Chưa có file zip bài thi
                        </p>
                      </div>
                    </div>
                  )} */}

                  {exportedInfo ? (
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

                      {(!exportedInfo.submissions || exportedInfo.submissions.length === 0) && 
                       (!exportedInfo.students || exportedInfo.students.length === 0) && (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có thông tin</h3>
                          <p className="mt-1 text-sm text-gray-500">Chưa có thông tin đã export cho exam này</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500">Không thể tải thông tin</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManager;

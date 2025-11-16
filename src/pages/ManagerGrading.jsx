import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined, CloseOutlined, DownOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { lecturerService, examService, solutionService, assignmentService } from '../services';
import { parseResponseData } from '../utils/apiHelpers';
import { getStatusColor, getStatusText } from '../utils/statusHelpers';
import SolutionsTable from '../components/Admin/SolutionsTable';
import LecturerSelector from '../components/Admin/LecturerSelector';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

const AssignmentManager = () => {
  const { user, isLoggedIn, isAdmin, loading: authLoading } = useAuth();
  const [lecturers, setLecturers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedLecturers, setSelectedLecturers] = useState([]); 
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [expandedExams, setExpandedExams] = useState({}); 
  const [examSolutions, setExamSolutions] = useState({}); 
  const [loadingSolutions, setLoadingSolutions] = useState({}); 
  const [selectedSolutions, setSelectedSolutions] = useState({}); 

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) {
      return;
    }
    
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    
    loadData();
  }, [isLoggedIn, authLoading]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const lecturerData = await lecturerService.getLecturers({ pageIndex: 1, pageSize: 100 });
      const lecturerItems = lecturerData?.data?.items || lecturerData?.items || [];
      setLecturers(lecturerItems);
      const examData = await examService.getExams({ 
        pageIndex: 1, 
        pageSize: 100 
      });
      console.log('Exam API Response:', examData);
      const examItems = parseResponseData(examData);
      setExams(examItems);
      console.log('Exams loaded:', examItems);

      // const mockSubmissions = [
      //   { id: '1', studentName: 'Nguyễn Văn A', studentId: 'SE123456', fileName: 'assignment1.zip', status: 'pending' },
      //   { id: '2', studentName: 'Trần Thị B', studentId: 'SE789012', fileName: 'assignment2.zip', status: 'pending' },
      //   { id: '3', studentName: 'Lê Văn C', studentId: 'SE345678', fileName: 'assignment3.zip', status: 'assigned' },
      //   { id: '4', studentName: 'Phạm Thị D', studentId: 'SE901234', fileName: 'assignment4.zip', status: 'graded' },
      // ];
      // setSubmissions(mockSubmissions);

      // const mockAssignments = [
      //   { id: '1', lecturerId: 'lecturer1', lecturerName: 'Hoàng Võ Đông Nghi', submissionIds: ['1', '2'], status: 'assigned' },
      //   { id: '2', lecturerId: 'lecturer2', lecturerName: 'lecturer', submissionIds: ['3'], status: 'graded' },
      // ];
      // setAssignments(mockAssignments);

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLecturerChange = (index, lecturerId) => {
    setSelectedLecturers(prev => {
      const newLecturers = [...prev];
      
      if (lecturerId === '') {
        newLecturers.splice(index, 1);
      } else {
        if (index < newLecturers.length) {
          newLecturers[index] = lecturerId;
        } else {
          newLecturers.push(lecturerId);
        }
      }
      
      return newLecturers;
    });
  };

  const handleRemoveLecturer = (index) => {
    setSelectedLecturers(prev => {
      const newLecturers = [...prev];
      newLecturers.splice(index, 1);
      return newLecturers;
    });
  };

  const handleAssign = async () => {
    // Validate: cần chọn giảng viên và (kỳ thi hoặc solution)
    if (selectedLecturers.length === 0) {
      setError('Vui lòng chọn ít nhất một giảng viên');
      return;
    }

    // Kiểm tra nếu chọn kỳ thi
    if (selectedExams.length === 0) {
      setError('Vui lòng chọn ít nhất một kỳ thi');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      console.log('Selected exams:', selectedExams);
      console.log('Selected lecturers:', selectedLecturers);
      
      // Gọi API cho mỗi kỳ thi được chọn
      const promises = selectedExams.map(async (examId) => {
        try {
          // Tìm exam để lấy thông tin đầy đủ
          const exam = exams.find(e => (e.id || e.examId) === examId);
          console.log(`Assigning exam ${examId}:`, exam);
          console.log(`Request payload:`, { examId, lecturerIds: selectedLecturers });
          
          const response = await assignmentService.assignExam(examId, selectedLecturers);
          console.log(`Assignment successful for exam ${examId}:`, response);
          return { examId, success: true, data: response };
        } catch (err) {
          console.error(`Failed to assign exam ${examId}:`, err);
          // Extract error message from response
          let errorMessage = 'Failed to assign';
          if (err?.message) {
            errorMessage = err.message;
          } else if (err?.response?.data?.error?.details) {
            errorMessage = err.response.data.error.details;
          } else if (err?.response?.data?.error?.title) {
            errorMessage = err.response.data.error.title;
          }
          return { examId, success: false, error: errorMessage };
        }
      });

      const results = await Promise.all(promises);
      
      // Kiểm tra kết quả
      const failedResults = results.filter(r => !r.success);
      const successResults = results.filter(r => r.success);
      
      if (failedResults.length > 0) {
        const errorMessages = failedResults.map(r => {
          const exam = exams.find(e => (e.id || e.examId) === r.examId);
          return `Kỳ thi "${exam?.name || r.examId}": ${r.error}`;
        }).join('\n');
        setError(`Một số phân công thất bại:\n${errorMessages}`);
      }

      // Chỉ thêm assignments cho những kỳ thi thành công
      if (successResults.length > 0) {
        const newAssignments = [];
        const assignmentDetails = [];
        
        successResults.forEach(result => {
          const examId = result.examId;
          const exam = exams.find(e => (e.id || e.examId) === examId);
          const assignedLecturers = [];
          
          selectedLecturers.forEach(lecturerId => {
            const lecturer = lecturers.find(l => l.id === lecturerId);
            const lecturerName = lecturer?.fullName || lecturer?.name || 'Unknown';
            assignedLecturers.push(lecturerName);
            
            newAssignments.push({
              id: `${examId}-${lecturerId}-${Date.now()}`,
              examId: examId,
              examName: exam?.name || 'N/A',
              lecturerId: lecturerId,
              lecturerName: lecturerName,
              status: 'assigned'
            });
          });
          
          // Lấy thông tin về số bài làm từ response nếu có
          const submissionCount = result.data?.submissionCount || result.data?.assignedSubmissions?.length || 'N/A';
          assignmentDetails.push({
            examName: exam?.name || examId,
            subjectCode: exam?.subjectCode || '',
            lecturers: assignedLecturers,
            submissionCount: submissionCount
          });
        });
        
        setAssignments(prev => [...prev, ...newAssignments]);
        
        // Tạo thông báo thành công chi tiết
        const successMessages = assignmentDetails.map(detail => {
          const lecturersList = detail.lecturers.join(', ');
          const submissionInfo = detail.submissionCount !== 'N/A' 
            ? ` (${detail.submissionCount} bài làm)` 
            : '';
          const examDisplayName = detail.subjectCode 
            ? `${detail.examName} (${detail.subjectCode})`
            : detail.examName;
          return `• Kỳ thi "${examDisplayName}": ${lecturersList}${submissionInfo}`;
        });
        
        setSuccessMessage(`Phân công thành công!\n\n${successMessages.join('\n')}`);
      }
      if (failedResults.length === 0) {
        setSelectedLecturers([]);
        setSelectedExams([]);
        setSelectedSolutions({});
        await loadData();
      }
      
    } catch (err) {
      console.error('Error assigning:', err);
      let errorMessage = 'Failed to assign exams';
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.response?.data?.error?.details) {
        errorMessage = err.response.data.error.details;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionSelect = (submissionId) => {
    setSelectedSubmissions(prev => 
      prev.includes(submissionId)
        ? prev.filter(id => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  const handleExamSelect = (examId) => {
    setSelectedExams(prev => 
      prev.includes(examId)
        ? prev.filter(id => id !== examId)
        : [...prev, examId]
    );
  };

  const toggleExamDropdown = async (examId) => {
    const isExpanded = expandedExams[examId];
    setExpandedExams(prev => ({
      ...prev,
      [examId]: !isExpanded
    }));
    if (!isExpanded && !examSolutions[examId]) {
      try {
        setLoadingSolutions(prev => ({ ...prev, [examId]: true }));
        const response = await solutionService.getSolutions({
          pageIndex: 1,
          pageSize: 100,
          examId: examId
        });
        const solutions = parseResponseData(response);
        
        setExamSolutions(prev => ({
          ...prev,
          [examId]: solutions
        }));
      } catch (err) {
        console.error(`Error loading solutions for exam ${examId}:`, err);
        setExamSolutions(prev => ({
          ...prev,
          [examId]: []
        }));
      } finally {
        setLoadingSolutions(prev => ({ ...prev, [examId]: false }));
      }
    }
  };

  const handleSolutionSelect = (examId, solutionId) => {
    setSelectedSolutions(prev => {
      const examSolutions = prev[examId] || [];
      const isSelected = examSolutions.includes(solutionId);
      return {
        ...prev,
        [examId]: isSelected
          ? examSolutions.filter(id => id !== solutionId)
          : [...examSolutions, solutionId]
      };
    });
  };

  const handleSelectAllSolutions = (examId) => {
    const solutions = examSolutions[examId] || [];
    const currentSelected = selectedSolutions[examId] || [];
    const allSelected = solutions.length > 0 && currentSelected.length === solutions.length;
    
    setSelectedSolutions(prev => ({
      ...prev,
      [examId]: allSelected
        ? []
        : solutions.map(sol => sol.id || sol.solutionId)
    }));
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" color="orange" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link 
                to="/" 
                className="mr-4 p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="Back to Home"
              >
                <ArrowLeftOutlined className="text-xl" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Assignment Manager</h1>
                <p className="text-sm text-gray-600">Phân công và quản lý bài tập cho giảng viên</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/assignments/list"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Xem danh sách đã phân chia
              </Link>
              <div className="text-sm text-gray-600">
                Welcome, {user?.name || user?.fullName || 'Admin'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <ErrorAlert message={error} className="mb-6 whitespace-pre-line" />
        )}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded whitespace-pre-line">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                {successMessage}
              </div>
              <button
                onClick={() => setSuccessMessage('')}
                className="ml-4 text-green-600 hover:text-green-800 flex-shrink-0"
                title="Đóng"
              >
                <CloseOutlined />
              </button>
            </div>
          </div>
        )}

        {/* Phân công bài tập */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Phân công bài tập</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn giảng viên</label>
            <LecturerSelector
              lecturers={lecturers}
              selectedLecturers={selectedLecturers}
              onLecturerChange={handleLecturerChange}
              onRemoveLecturer={handleRemoveLecturer}
            />
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kỳ thi đã chọn: {selectedExams.length}
              </label>
              {selectedLecturers.length > 0 && (
                <p className="text-sm text-gray-600">
                  Giảng viên đã chọn: {selectedLecturers.map(id => {
                    const lecturer = lecturers.find(l => l.id === id);
                    return lecturer?.fullName || 'N/A';
                  }).join(', ')}
                </p>
              )}
            </div>
            <button
              onClick={handleAssign}
              disabled={selectedLecturers.length === 0 || selectedExams.length === 0 || loading}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang phân công...' : 'Phân công'}
            </button>
          </div>
        </div>

        {/* Danh sách kỳ thi */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Danh sách kỳ thi</h2>
            <p className="text-sm text-gray-600">Chọn kỳ thi để phân chia bài tập</p>
          </div>
          {exams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedExams.length === exams.length && exams.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedExams(exams.map(e => e.id || e.examId));
                          } else {
                            setSelectedExams([]);
                          }
                        }}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="ml-2">Chọn tất cả</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên kỳ thi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã môn học</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học kỳ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Năm học</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày thi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solutions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {exams.map((exam, index) => {
                    const examId = exam.id || exam.examId;
                    const isExpanded = expandedExams[examId];
                    const solutions = examSolutions[examId] || [];
                    const isLoadingSolutions = loadingSolutions[examId];
                    return (
                      <React.Fragment key={examId}>
                        <tr className={`hover:bg-gray-50 ${selectedExams.includes(examId) ? 'bg-orange-50' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedExams.includes(examId)}
                              onChange={() => handleExamSelect(examId)}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {exam.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {exam.subjectCode || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {exam.semester || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {exam.academicYear || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {exam.examDate ? new Date(exam.examDate).toLocaleDateString('vi-VN') : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              exam.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {exam.isActive ? 'Active' : 'No Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleExamDropdown(examId)}
                              className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-800 font-medium"
                            >
                              <span>Solutions</span>
                              <svg
                                className={`w-4 h-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <DownOutlined />
                              </svg>
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan="9" className="px-6 py-4 bg-gray-50">
                              <SolutionsTable
                                solutions={solutions}
                                isLoading={isLoadingSolutions}
                                selectedSolutions={selectedSolutions[examId] || []}
                                onSelectSolution={handleSolutionSelect}
                                onSelectAll={() => handleSelectAllSolutions(examId)}
                                examId={examId}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              Không có dữ liệu kỳ thi. Vui lòng kiểm tra console để xem response từ API.
            </div>
          )}
          {selectedExams.length > 0 && (
            <div className="px-6 py-3 bg-orange-50 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Kỳ thi đã chọn ({selectedExams.length}):</span> {
                  selectedExams.map(examId => {
                    const exam = exams.find(e => (e.id || e.examId) === examId);
                    return exam?.name || 'N/A';
                  }).join(', ')
                }
              </p>
            </div>
          )}
        </div>
      </div>
      <footer className="mt-auto py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} FPT University. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ManagerGrading;

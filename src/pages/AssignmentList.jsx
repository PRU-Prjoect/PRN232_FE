import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { assignmentService, lecturerService, examService, solutionService } from '../services';

const AssignmentList = () => {
  const { user, isLoggedIn, isAdmin } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lecturers, setLecturers] = useState([]);
  const [exams, setExams] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [expandedAssignments, setExpandedAssignments] = useState({});
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'assigned', 'graded', 'pending'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    
    loadData();
  }, [isLoggedIn]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load assignments
      const assignmentData = await assignmentService.getAssignments({
        pageIndex: 1,
        pageSize: 100
      });

      // Handle different response structures
      let assignmentItems = [];
      if (Array.isArray(assignmentData)) {
        assignmentItems = assignmentData;
      } else if (assignmentData?.data?.items) {
        assignmentItems = assignmentData.data.items;
      } else if (assignmentData?.items) {
        assignmentItems = assignmentData.items;
      } else if (assignmentData?.data && Array.isArray(assignmentData.data)) {
        assignmentItems = assignmentData.data;
      }

      setAssignments(assignmentItems);

      // Load lecturers for mapping
      const lecturerData = await lecturerService.getLecturers({ pageIndex: 1, pageSize: 100 });
      const lecturerItems = lecturerData?.data?.items || lecturerData?.items || [];
      setLecturers(lecturerItems);

      // Load exams for mapping
      const examData = await examService.getExams({ pageIndex: 1, pageSize: 100 });
      let examItems = [];
      if (Array.isArray(examData)) {
        examItems = examData;
      } else if (examData?.data?.items) {
        examItems = examData.data.items;
      } else if (examData?.items) {
        examItems = examData.items;
      } else if (examData?.data && Array.isArray(examData.data)) {
        examItems = examData.data;
      }
      setExams(examItems);

      // Load solutions if there are assignments with solutionId
      const solutionIds = assignmentItems
        .map(a => a.solutionId)
        .filter(id => id)
        .filter((id, index, self) => self.indexOf(id) === index); // unique IDs
      
      if (solutionIds.length > 0) {
        try {
          // Load all solutions (assuming we can get all or filter by IDs)
          const solutionData = await solutionService.getSolutions({
            pageIndex: 1,
            pageSize: 100
          });
          
          let solutionItems = [];
          if (Array.isArray(solutionData)) {
            solutionItems = solutionData;
          } else if (solutionData?.data?.items) {
            solutionItems = solutionData.data.items;
          } else if (solutionData?.items) {
            solutionItems = solutionData.items;
          } else if (solutionData?.data && Array.isArray(solutionData.data)) {
            solutionItems = solutionData.data;
          }
          
          setSolutions(solutionItems);
        } catch (solErr) {
          console.error('Error loading solutions:', solErr);
          // Don't fail the whole page if solutions fail to load
        }
      }

    } catch (err) {
      console.error('Error loading assignments:', err);
      setError(err?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (assignmentId) => {
    setExpandedAssignments(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }));
  };

  const getLecturerName = (lecturerId) => {
    const lecturer = lecturers.find(l => l.id === lecturerId);
    return lecturer?.fullName || lecturer?.name || `Lecturer ${lecturerId}`;
  };

  const getExamName = (examId) => {
    const exam = exams.find(e => e.id === examId);
    return exam?.name || exam?.title || `Exam ${examId}`;
  };

  const getSolutionName = (solutionId) => {
    const solution = solutions.find(s => s.id === solutionId);
    return solution?.name || solution?.fileName || `Solution ${solutionId}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'assigned': { text: 'Đã phân công', color: 'bg-blue-100 text-blue-800' },
      'graded': { text: 'Đã chấm', color: 'bg-green-100 text-green-800' },
      'pending': { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
      'in_progress': { text: 'Đang chấm', color: 'bg-orange-100 text-orange-800' },
    };

    const statusStr = status != null ? String(status).toLowerCase() : '';
    const statusInfo = statusMap[statusStr] || { text: status != null ? String(status) : 'Unknown', color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const filteredAssignments = assignments.filter(assignment => {
    // Filter by status
    if (filterStatus !== 'all') {
      const assignmentStatus = assignment.status != null ? String(assignment.status).toLowerCase() : 'pending';
      if (filterStatus === 'assigned' && assignmentStatus !== 'assigned') return false;
      if (filterStatus === 'graded' && assignmentStatus !== 'graded') return false;
      if (filterStatus === 'pending' && assignmentStatus !== 'pending') return false;
    }

    // Filter by search term
    if (searchTerm) {
      const lecturerName = getLecturerName(assignment.lecturerId).toLowerCase();
      const examName = getExamName(assignment.examId).toLowerCase();
      const solutionName = assignment.solutionId ? getSolutionName(assignment.solutionId).toLowerCase() : '';
      const search = searchTerm.toLowerCase();
      
      if (!lecturerName.includes(search) && 
          !examName.includes(search) && 
          !solutionName.includes(search) &&
          !assignment.id?.toString().includes(search)) {
        return false;
      }
    }

    return true;
  });

  if (loading && assignments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
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
                to="/course/swd392" 
                className="mr-4 p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="Back to Home"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Danh sách Assignment đã phân chia</h1>
                <p className="text-sm text-gray-600">Xem và quản lý các bài tập đã được phân công</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Welcome, {user?.name || user?.fullName || 'Admin'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo giảng viên, kỳ thi, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterStatus('assigned')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'assigned'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đã phân công
              </button>
              <button
                onClick={() => setFilterStatus('graded')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'graded'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đã chấm
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Chờ xử lý
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">Tổng số</div>
            <div className="text-2xl font-bold text-gray-900">{assignments.length}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">Đã phân công</div>
            <div className="text-2xl font-bold text-blue-600">
              {assignments.filter(a => a.status != null && String(a.status).toLowerCase() === 'assigned').length}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">Đã chấm</div>
            <div className="text-2xl font-bold text-green-600">
              {assignments.filter(a => a.status != null && String(a.status).toLowerCase() === 'graded').length}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">Chờ xử lý</div>
            <div className="text-2xl font-bold text-yellow-600">
              {assignments.filter(a => a.status != null && String(a.status).toLowerCase() === 'pending').length}
            </div>
          </div>
        </div>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có assignment nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Không tìm thấy assignment nào phù hợp với bộ lọc'
                : 'Chưa có assignment nào được phân công'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Assignment #{assignment.id}
                        </h3>
                        {getStatusBadge(assignment.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Giảng viên:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {getLecturerName(assignment.lecturerId)}
                          </span>
                        </div>
                        
                        {assignment.examId && (
                          <div>
                            <span className="text-gray-600">Kỳ thi:</span>
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
                            <span className="text-gray-600">Ngày tạo:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {new Date(assignment.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleExpand(assignment.id)}
                      className="ml-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      title={expandedAssignments[assignment.id] ? 'Thu gọn' : 'Mở rộng'}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 transition-transform ${expandedAssignments[assignment.id] ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Expanded Details */}
                  {expandedAssignments[assignment.id] && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Assignment ID:</span>
                          <span className="ml-2 font-mono text-gray-900">{assignment.id}</span>
                        </div>
                        {assignment.lecturerId && (
                          <div>
                            <span className="text-gray-600">Lecturer Name:</span>
                            <span className="ml-2 font-mono text-gray-900">{assignment.name}</span>
                          </div>
                        )}
                        {assignment.examId && (
                          <div>
                            <span className="text-gray-600">Exam ID:</span>
                            <span className="ml-2 font-mono text-gray-900">{assignment.examId}</span>
                          </div>
                        )}
                        {assignment.solutionId && (
                          <div>
                            <span className="text-gray-600">Solution ID:</span>
                            <span className="ml-2 font-mono text-gray-900">{assignment.solutionId}</span>
                          </div>
                        )}
                        {assignment.updatedAt && (
                          <div>
                            <span className="text-gray-600">Cập nhật lần cuối:</span>
                            <span className="ml-2 text-gray-900">
                              {new Date(assignment.updatedAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                        )}
                        {assignment.status && (
                          <div>
                            <span className="text-gray-600">Trạng thái:</span>
                            <span className="ml-2 text-gray-900">{assignment.status}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentList;


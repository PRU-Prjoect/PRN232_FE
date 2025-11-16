import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined, FileTextOutlined, DownOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { assignmentService, lecturerService, examService, solutionService } from '../services';
import { parseResponseData } from '../utils/apiHelpers';
import { formatDateTime } from '../utils/dateHelpers';
import { getStatusBadge } from '../utils/statusHelpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import SuccessAlert from '../components/common/SuccessAlert';
import AssignmentFilters from '../components/Admin/AssignmentFilters';
import AssignmentStatistics from '../components/Admin/AssignmentStatistics';
import AssignmentCard from '../components/Admin/AssignmentCard';
import ReassignLecturerModal from '../components/Admin/ReassignLecturerModal';

const AssignmentList = () => {
  const { user, isLoggedIn, isAdmin, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lecturers, setLecturers] = useState([]);
  const [exams, setExams] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [expandedAssignments, setExpandedAssignments] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reassignModalVisible, setReassignModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [reassignLoading, setReassignLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
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
      const assignmentData = await assignmentService.getAssignments({
        pageIndex: 1,
        pageSize: 100
      });
      const assignmentItems = parseResponseData(assignmentData);
      setAssignments(assignmentItems);
      const lecturerData = await lecturerService.getLecturers({ pageIndex: 1, pageSize: 100 });
      const lecturerItems = parseResponseData(lecturerData);
      setLecturers(lecturerItems);

      const examData = await examService.getExams({ pageIndex: 1, pageSize: 100 });
      const examItems = parseResponseData(examData);
      setExams(examItems);
      const solutionIds = assignmentItems
        .map(a => a.solutionId)
        .filter(id => id)
        .filter((id, index, self) => self.indexOf(id) === index); 
      
      if (solutionIds.length > 0) {
        try {
          const solutionData = await solutionService.getSolutions({
            pageIndex: 1,
            pageSize: 100
          });
          
          const solutionItems = parseResponseData(solutionData);
          setSolutions(solutionItems);
        } catch (solErr) {
          console.error('Error loading solutions:', solErr);
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

  const handleReassignLecturer = async (assignment) => {
    setSelectedAssignment(assignment);
    setReassignModalVisible(true);
        if (assignment.solutionId) {
      try {
        const existingAssignments = await assignmentService.getAssignments({
          solutionId: assignment.solutionId,
          pageIndex: 1,
          pageSize: 100
        });
        const assignmentsList = parseResponseData(existingAssignments);
        setSelectedAssignment({
          ...assignment,
          existingAssignments: assignmentsList || []
        });
      } catch (err) {
        console.error('Error loading existing assignments:', err);
        setSelectedAssignment(assignment);
      }
    }
    };

  const handleConfirmReassign = async (newLecturerId) => {
    if (!selectedAssignment) return;

    try {
      setReassignLoading(true);
      setError('');
      setSuccessMessage('');

      await assignmentService.reassignAssignment(selectedAssignment.id, newLecturerId);
      
      message.success('Chuyển giao giảng viên thành công!');
      setSuccessMessage(`Đã chuyển giao assignment #${selectedAssignment.id} cho giảng viên mới thành công.`);
      await loadData();
      setReassignModalVisible(false);
      setSelectedAssignment(null);
    } catch (err) {
      console.error('Error reassigning lecturer:', err);
      let errorMessage = 'Không thể chuyển giao giảng viên';
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.response?.data?.error?.details) {
        errorMessage = err.response.data.error.details;
      } else if (err?.response?.data?.error?.title) {
        errorMessage = err.response.data.error.title;
      }
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setReassignLoading(false);
    }
  };

  const handleCancelReassign = () => {
    setReassignModalVisible(false);
    setSelectedAssignment(null);
  };


  const filteredAssignments = assignments.filter(assignment => {
    if (filterStatus !== 'all') {
      const assignmentStatus = assignment.status != null ? String(assignment.status).toLowerCase() : 'pending';
      if (filterStatus === 'assigned' && assignmentStatus !== 'assigned') return false;
      if (filterStatus === 'graded' && assignmentStatus !== 'graded') return false;
      if (filterStatus === 'pending' && assignmentStatus !== 'pending') return false;
    }
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
                to="/course/swd392" 
                className="mr-4 p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="Back to Home"
              >
                <ArrowLeftOutlined className="text-xl" />
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
          <ErrorAlert message={error} className="mb-6" />
        )}
        {successMessage && (
          <SuccessAlert message={successMessage} className="mb-6" />
        )}
        
        <AssignmentFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        <AssignmentStatistics assignments={assignments} />

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <FileTextOutlined className="mx-auto text-gray-400 text-5xl" />
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
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                isExpanded={expandedAssignments[assignment.id]}
                onToggleExpand={toggleExpand}
                getLecturerName={getLecturerName}
                getExamName={getExamName}
                getSolutionName={getSolutionName}
                onReassignLecturer={handleReassignLecturer}
              />
            ))}
          </div>
        )}
      </div>

      <ReassignLecturerModal
        visible={reassignModalVisible}
        onCancel={handleCancelReassign}
        onConfirm={handleConfirmReassign}
        assignmentId={selectedAssignment?.id}
        currentLecturerId={selectedAssignment?.lecturerId}
        lecturers={lecturers}
        loading={reassignLoading}
        existingAssignments={selectedAssignment?.existingAssignments || []}
      />
    </div>
  );
};

export default AssignmentList;


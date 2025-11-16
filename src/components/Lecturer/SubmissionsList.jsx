import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReloadOutlined, DownOutlined, FileTextOutlined } from '@ant-design/icons';
import GradingModal from '../Admin/GradingModal';
import SubmissionViewer from '../Admin/SubmissionViewer';
import AssignmentTable from './AssignmentTable';
import { examService, assignmentService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { parseResponseData } from '../../utils/apiHelpers';
import { formatDateTime } from '../../utils/dateHelpers';
import { getAssignmentStatusInfo } from '../../utils/statusHelpers';
import { approveGrade, parseErrorMessage } from '../../utils/approveGradeHelpers';
import { isAssignmentCompleted } from '../../utils/statusHelpers';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

const SubmissionsList = ({ courseId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [courseCodeFilter, setCourseCodeFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const [submissions, setSubmissions] = useState([]);
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [availableCourseCodes, setAvailableCourseCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [examAssignments, setExamAssignments] = useState({});
  const [loadingAssignments, setLoadingAssignments] = useState({});
  const [expandedExams, setExpandedExams] = useState({});

    const fetchExams = async () => {
      try {
        setLoading(true);
      setError('');
      let allExams = [];
      let pageIndex = 1;
      const pageSize = 1000;
      let hasMore = true;
      let maxPages = 10;

      while (hasMore && pageIndex <= maxPages) {
        const result = await examService.getExams({
          pageIndex,
          pageSize
        });

        console.log(`Fetching page ${pageIndex}:`, result);

        const exams = parseResponseData(result);
        const totalPages = result?.data?.totalPages || result?.totalPages || 1;
        const totalItems = result?.data?.totalItems || result?.totalItems || exams.length;

        console.log(`Page ${pageIndex}: Found ${exams.length} exams, totalPages: ${totalPages}, totalItems: ${totalItems}`);

        if (exams.length > 0) {
          allExams = [...allExams, ...exams];
        }
        if (exams.length === 0 || pageIndex >= totalPages || exams.length < pageSize) {
          hasMore = false;
        } else {
          pageIndex++;
        }
      }

      console.log(`Total exams fetched: ${allExams.length}`, allExams);

      const formatted = allExams.map(exam => ({
        id: exam.id || exam.examId,
          name: exam.name || 'N/A',
          subjectCode: exam.subjectCode || 'N/A',
          semester: exam.semester || 'N/A',
          academicYear: exam.academicYear || 'N/A',
          examDate: exam.examDate,
          createdAt: exam.createdAt,
          isActive: exam.isActive,
          solutionsCount: exam.solutionsCount || 0,
          createdByLecturerName: exam.createdByLecturerName || 'N/A',
        }));

      console.log('Formatted exams:', formatted);

        setSubmissions(formatted);
        const semesters = [...new Set(formatted.map(e => e.semester).filter(Boolean))];
        const courseCodes = [...new Set(formatted.map(e => e.subjectCode).filter(Boolean))];

        setAvailableSemesters(semesters);
        setAvailableCourseCodes(courseCodes);
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError(err?.message || 'Failed to load exam data');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchExams();
  }, []);

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch =
      (submission.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (submission.subjectCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (submission.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || (statusFilter === 'active' && submission.isActive) || (statusFilter === 'inactive' && !submission.isActive);
    const matchesSemester =
      semesterFilter === 'all' || submission.semester === semesterFilter;
    const matchesCourseCode =
      courseCodeFilter === 'all' || submission.subjectCode === courseCodeFilter;

    return matchesSearch && matchesStatus && matchesSemester && matchesCourseCode;
  });

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setIsViewerOpen(true);
  };

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setIsGradingModalOpen(true);
  };

  const handleGradeAssignment = (assignment, examId) => {
    if (isAssignmentCompleted(assignment.status)) {
      alert('This assignment has already been approved. You cannot grade it again.');
      return;
    }

    navigate('/grading', {
      state: {
        assignment: {
          id: assignment.id,
          assignmentId: assignment.id,
          solutionId: assignment.solutionId,
          status: assignment.status,
          examId: examId,
          ...assignment
        },
        examId: examId
      }
    });
  };

  const handleApproveGrade = async (assignment, examId) => {
    if (!window.confirm('Are you sure you want to approve this grade? This action cannot be undone.')) {
      return;
    }

    try {
      await approveGrade(assignment, examId);
      await fetchAssignmentsForExam(examId);
      alert('Grade approved successfully!');
    } catch (err) {
      console.error('Error approving grade:', err);
      const errorMessage = parseErrorMessage(err);
      alert(errorMessage);
    }
  };

  const handleSaveGrade = (updatedSubmission) => {
    const updatedSubmissions = submissions.map(sub =>
      sub.id === updatedSubmission.id ? updatedSubmission : sub
    );
    setSubmissions(updatedSubmissions);
  };


  const fetchAssignmentsForExam = async (examId) => {
    if (!user?.id) {
      console.warn('No lecturer ID found - user may not be loaded yet');
      return;
    }

    const lecturerId = user.id;

    try {
      setLoadingAssignments(prev => ({ ...prev, [examId]: true }));

      const result = await assignmentService.getAssignments({
        examId: examId,
        lecturerId: lecturerId,
        pageIndex: 1,
        pageSize: 100
      });

      console.log(`Assignments for exam ${examId} and lecturer ${lecturerId}:`, result);

        const assignments = parseResponseData(result);

      console.log(`Found ${assignments.length} assignments for exam ${examId}`);

      setExamAssignments(prev => ({
        ...prev,
        [examId]: assignments
      }));
    } catch (err) {
      console.error(`Error fetching assignments for exam ${examId}:`, err);
      setExamAssignments(prev => ({
        ...prev,
        [examId]: []
      }));
    } finally {
      setLoadingAssignments(prev => ({ ...prev, [examId]: false }));
    }
  };

  const toggleExamDropdown = (examId) => {
    const isExpanded = expandedExams[examId];
    setExpandedExams(prev => ({
      ...prev,
      [examId]: !isExpanded
    }));

    if (!isExpanded && !examAssignments[examId]) {
      fetchAssignmentsForExam(examId);
    }
  };


  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          Assigned Exam Page
        </h2>
        <button
          onClick={fetchExams}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ReloadOutlined className="mr-2" spin={loading} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, course code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester
            </label>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All</option>
              {availableSemesters.map(semester => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Code
            </label>
            <select
              value={courseCodeFilter}
              onChange={(e) => setCourseCodeFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All</option>
              {availableCourseCodes.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <LoadingSpinner size="md" color="blue" />
          <p className="mt-2 text-gray-600">Loading exam data...</p>
        </div>
      )}
      {error && (
        <ErrorAlert message={error} />
      )}

      {!loading && filteredSubmissions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solutions Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignments</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.map((exam) => {
                const isExpanded = expandedExams[exam.id];
                const assignments = examAssignments[exam.id] || [];
                const isLoading = loadingAssignments[exam.id];

                return (
                  <React.Fragment key={exam.id}>
                    <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {exam.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exam.subjectCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exam.semester}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exam.academicYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exam.examDate ? formatDateTime(exam.examDate) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exam.solutionsCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${exam.isActive
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                          {exam.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(exam.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => toggleExamDropdown(exam.id)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <span>View Assigned Assignments ({assignments.length})</span>
                          <DownOutlined className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan="9" className="px-6 py-4 bg-gray-50">
                          <AssignmentTable
                            assignments={assignments}
                            isLoading={isLoading}
                            examId={exam.id}
                            onGrade={handleGradeAssignment}
                            onApprove={handleApproveGrade}
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
      ) : !loading && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <FileTextOutlined className="mx-auto text-gray-400 text-5xl" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No exams found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || semesterFilter !== 'all' || courseCodeFilter !== 'all'
              ? 'No exams match your filters'
              : 'No exams have been created yet'}
          </p>
        </div>
      )}

      {isGradingModalOpen && selectedSubmission && (
        <GradingModal
          submission={selectedSubmission}
          onClose={() => setIsGradingModalOpen(false)}
          onSave={handleSaveGrade}
        />
      )}

      {isViewerOpen && selectedSubmission && (
        <SubmissionViewer
          submission={selectedSubmission}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default SubmissionsList;

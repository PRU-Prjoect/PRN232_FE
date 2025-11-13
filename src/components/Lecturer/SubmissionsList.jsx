import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GradingModal from '../Admin/GradingModal';
import SubmissionViewer from '../Admin/SubmissionViewer';
import { examService, assignmentService, finalscoreService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';

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

  // Store assignments for each exam: { examId: [assignments] }
  const [examAssignments, setExamAssignments] = useState({});
  const [loadingAssignments, setLoadingAssignments] = useState({});
  const [expandedExams, setExpandedExams] = useState({});

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all exams - try with large pageSize first
      let allExams = [];
      let pageIndex = 1;
      const pageSize = 1000; // Large page size to get all exams at once
      let hasMore = true;
      let maxPages = 10; // Safety limit to prevent infinite loop

      while (hasMore && pageIndex <= maxPages) {
        const result = await examService.getExams({
          pageIndex,
          pageSize
        });

        console.log(`Fetching page ${pageIndex}:`, result);

        // Handle different response structures (same as ExamManager)
        let exams = [];
        let totalPages = 1;
        let totalItems = 0;

        if (result && result.data) {
          // If result.data exists, check if it's an array or object with items
          if (Array.isArray(result.data)) {
            exams = result.data;
            totalItems = result.data.length;
          } else if (result.data.items && Array.isArray(result.data.items)) {
            exams = result.data.items;
            totalPages = result.data.totalPages || result.data.totalPages || 1;
            totalItems = result.data.totalItems || result.data.totalItems || exams.length;
          } else if (result.data.data && Array.isArray(result.data.data)) {
            exams = result.data.data;
            totalItems = exams.length;
          } else {
            exams = [];
          }
        } else if (Array.isArray(result)) {
          exams = result;
          totalItems = result.length;
        } else if (result && result.items && Array.isArray(result.items)) {
          exams = result.items;
          totalPages = result.totalPages || 1;
          totalItems = result.totalItems || exams.length;
        } else {
          exams = [];
        }

        console.log(`Page ${pageIndex}: Found ${exams.length} exams, totalPages: ${totalPages}, totalItems: ${totalItems}`);

        if (exams.length > 0) {
          allExams = [...allExams, ...exams];
        }

        // Check if there are more pages
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
    // Navigate to grading page with assignment and examId
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
    // Confirm before approving
    if (!window.confirm('Are you sure you want to approve this grade? This action cannot be undone.')) {
      return;
    }

    try {
      // Get totalScore from assignment (could be totalScore or totalscore)
      const totalScore = assignment.totalScore !== null && assignment.totalScore !== undefined 
        ? assignment.totalScore 
        : assignment.totalscore !== null && assignment.totalscore !== undefined
        ? assignment.totalscore
        : 0;

      if (!assignment.solutionId) {
        alert('Solution ID is missing. Cannot approve grade.');
        return;
      }

      if (!assignment.id) {
        alert('Assignment ID is missing. Cannot approve grade.');
        return;
      }

      // Check if assignment has been graded (has totalScore)
      if (totalScore === 0 || totalScore === null || totalScore === undefined) {
        alert('Assignment has not been graded yet. Please grade the assignment first before approving.');
        return;
      }

      // Ensure assignment is in InProgress status (1) before approving
      // This is required to "submit" the assignment before approval
      const currentStatus = assignment.status;
      const statusValue = typeof currentStatus === 'number' ? currentStatus :
        currentStatus === 'Pending' || currentStatus === 'pending' ? 0 :
          currentStatus === 'InProgress' || currentStatus === 'inProgress' || currentStatus === 'In_Progress' ? 1 :
            currentStatus === 'Completed' || currentStatus === 'completed' ? 2 :
              parseInt(currentStatus) || 0;

      // Ensure finalscore exists before submitting
      try {
        await finalscoreService.createFinalScore({
          solutionId: assignment.solutionId,
          totalScore: totalScore
          // Don't set approvedAt, will be set when approving
        });
        console.log('Final score created/updated before approval');
      } catch (finalscoreErr) {
        console.warn('Failed to create/update final score:', finalscoreErr);
        // Continue anyway, might already exist
      }

      // Submit assignment using the submit API endpoint
      // This will set isSubmitted: true and submittedAt automatically
      try {
        await assignmentService.submitAssignment(assignment.id);
        console.log('Assignment submitted successfully via submit API');
        
        // Wait a bit to ensure the submission is processed on the backend
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (submitErr) {
        console.error('Failed to submit assignment:', submitErr);
        
        // Parse error message to show user-friendly message
        let submitErrorMessage = 'Failed to submit assignment. Please try again.';
        if (submitErr?.message) {
          try {
            const errorJson = JSON.parse(submitErr.message);
            if (errorJson?.error?.details) {
              submitErrorMessage = errorJson.error.details;
            } else if (errorJson?.error?.title) {
              submitErrorMessage = errorJson.error.title;
            }
          } catch (e) {
            if (submitErr.message) {
              submitErrorMessage = submitErr.message;
            }
          }
        }
        
        alert(submitErrorMessage);
        return;
      }

      // Check if assignment is already completed
      if (statusValue === 2) {
        alert('This assignment has already been completed.');
        return;
      }

      // Call API to approve final score
      await finalscoreService.approveFinalScore({
        solutionId: assignment.solutionId,
        assignmentId: assignment.id,
        totalScore: totalScore
      });

      // Update assignment status to Completed (2)
      await assignmentService.updateAssignment(assignment.id, {
        status: 2 // Completed
      });

      // Refresh assignments for this exam
      await fetchAssignmentsForExam(examId);
      
      alert('Grade approved successfully!');
    } catch (err) {
      console.error('Error approving grade:', err);
      
      // Parse error message to show user-friendly message
      let errorMessage = 'Failed to approve grade. Please try again.';
      if (err?.message) {
        try {
          const errorJson = JSON.parse(err.message);
          if (errorJson?.error?.details) {
            errorMessage = errorJson.error.details;
          } else if (errorJson?.error?.title) {
            errorMessage = errorJson.error.title;
          }
        } catch (e) {
          // If not JSON, use original error message
          if (err.message) {
            errorMessage = err.message;
          }
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleSaveGrade = (updatedSubmission) => {
    const updatedSubmissions = submissions.map(sub =>
      sub.id === updatedSubmission.id ? updatedSubmission : sub
    );
    setSubmissions(updatedSubmissions);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch assignments for a specific exam and lecturer
  const fetchAssignmentsForExam = async (examId) => {
    if (!user?.id) {
      console.error('No lecturer ID found');
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

      // Handle different response structures
      let assignments = [];
      if (result && result.data) {
        if (Array.isArray(result.data)) {
          assignments = result.data;
        } else if (result.data.items && Array.isArray(result.data.items)) {
          assignments = result.data.items;
        } else if (result.data.data && Array.isArray(result.data.data)) {
          assignments = result.data.data;
        }
      } else if (Array.isArray(result)) {
        assignments = result;
      } else if (result && result.items && Array.isArray(result.items)) {
        assignments = result.items;
      }

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

  // Toggle dropdown for exam assignments
  const toggleExamDropdown = (examId) => {
    const isExpanded = expandedExams[examId];
    setExpandedExams(prev => ({
      ...prev,
      [examId]: !isExpanded
    }));

    // Fetch assignments when expanding if not already loaded
    if (!isExpanded && !examAssignments[examId]) {
      fetchAssignmentsForExam(examId);
    }
  };

  // Get assignment status text and color
  const getAssignmentStatus = (status) => {
    // Handle both number and string values
    const statusValue = typeof status === 'number' ? status :
      status === 'Pending' || status === 'pending' ? 0 :
        status === 'InProgress' || status === 'inProgress' || status === 'In_Progress' ? 1 :
          status === 'Completed' || status === 'completed' ? 2 :
            parseInt(status) || status;

    switch (statusValue) {
      case 0:
      case 'Pending':
      case 'pending':
        return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
      case 1:
      case 'InProgress':
      case 'inProgress':
      case 'In_Progress':
        return { text: 'In Progress', color: 'bg-blue-100 text-blue-800' };
      case 2:
      case 'Completed':
      case 'completed':
        return { text: 'Completed', color: 'bg-green-100 text-green-800' };
      default:
        return { text: 'N/A', color: 'bg-gray-100 text-gray-800' };
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading exam data...</p>
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
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
                        {exam.examDate ? formatDate(exam.examDate) : 'N/A'}
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
                        {formatDate(exam.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => toggleExamDropdown(exam.id)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <span>View Assigned Assignments ({assignments.length})</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan="9" className="px-6 py-4 bg-gray-50">
                          {isLoading ? (
                            <div className="flex items-center gap-2 text-gray-600">
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                              <span>Loading assignments...</span>
                            </div>
                          ) : assignments.length > 0 ? (
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900 mb-2">Assignments List:</h4>
                              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Solution ID</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created Date</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {assignments.map((assignment) => {
                                      const statusInfo = getAssignmentStatus(assignment.status);
                                      return (
                                        <tr key={assignment.id} className="hover:bg-gray-50">
                                          <td className="px-4 py-2 text-sm text-gray-900">{assignment.id}</td>
                                          <td className="px-4 py-2 text-sm text-gray-500">{assignment.solutionId || 'N/A'}</td>
                                          <td className="px-4 py-2 text-sm">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                                              {statusInfo.text}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-500">
                                            {assignment.totalScore !== null && assignment.totalScore !== undefined 
                                              ? assignment.totalScore 
                                              : assignment.totalscore !== null && assignment.totalscore !== undefined
                                              ? assignment.totalscore
                                              : 'N/A'}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-500">
                                            {assignment.createdAt ? formatDate(assignment.createdAt) : 'N/A'}
                                          </td>
                                          <td className="px-4 py-2 text-sm">
                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={() => handleGradeAssignment(assignment, exam.id)}
                                                className={`px-3 py-1 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                                                  assignment.status === 2 || assignment.status === 'Completed' || assignment.status === 'completed'
                                                    ? 'bg-gray-400 cursor-not-allowed opacity-60'
                                                    : 'bg-green-500 hover:bg-green-600'
                                                }`}
                                                title={
                                                  assignment.status === 2 || assignment.status === 'Completed' || assignment.status === 'completed'
                                                    ? 'Grade already approved - cannot modify'
                                                    : 'Grade this assignment'
                                                }
                                                disabled={assignment.status === 2 || assignment.status === 'Completed' || assignment.status === 'completed'}
                                              >
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  className="h-4 w-4"
                                                  fill="none"
                                                  viewBox="0 0 24 24"
                                                  stroke="currentColor"
                                                >
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                                Grade
                                              </button>
                                              <button
                                                onClick={() => handleApproveGrade(assignment, exam.id)}
                                                className={`px-3 py-1 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                                                  assignment.status === 2 || assignment.status === 'Completed' || assignment.status === 'completed'
                                                    ? 'bg-gray-400 cursor-not-allowed opacity-60'
                                                    : 'bg-blue-500 hover:bg-blue-600'
                                                }`}
                                                title={
                                                  assignment.status === 2 || assignment.status === 'Completed' || assignment.status === 'completed'
                                                    ? 'Grade already approved'
                                                    : 'Approve this grade'
                                                }
                                                disabled={assignment.status === 2 || assignment.status === 'Completed' || assignment.status === 'completed'}
                                              >
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  className="h-4 w-4"
                                                  fill="none"
                                                  viewBox="0 0 24 24"
                                                  stroke="currentColor"
                                                >
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Approve Grade
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              No assignments for this exam
                            </div>
                          )}
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
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
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




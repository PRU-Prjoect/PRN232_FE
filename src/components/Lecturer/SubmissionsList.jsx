import React, { useState, useEffect } from 'react';
import GradingModal from '../Admin/GradingModal';
import SubmissionViewer from '../Admin/SubmissionViewer';
import { examService } from '../../services'; 

const SubmissionsList = ({ courseId }) => {
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

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await examService.getExams({ pageIndex: 1, pageSize: 50 });
        const exams = response?.data || [];

        const formatted = exams.map(exam => ({
          id: exam.id,
          studentName: exam.examName || 'N/A',
          studentId: exam.examId || 'N/A',
          submissionDate: exam.createdAt,
          semester: exam.semester || 'N/A',
          courseCode: exam.academicYear || 'N/A',
          status: 'submitted', 
          grade: null,
          fileCount: 1,
        }));

        setSubmissions(formatted);
        const semesters = [...new Set(formatted.map(e => e.semester).filter(Boolean))];
        const courseCodes = [...new Set(formatted.map(e => e.courseCode).filter(Boolean))];

        setAvailableSemesters(semesters);
        setAvailableCourseCodes(courseCodes);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to load exam data');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch =
      submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || submission.status === statusFilter;
    const matchesSemester =
      semesterFilter === 'all' || submission.semester === semesterFilter;
    const matchesCourseCode =
      courseCodeFilter === 'all' || submission.courseCode === courseCodeFilter;

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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Assigned Exam Page
        </h2>
      </div>

      {loading && <div className="text-gray-600">Loading exams...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && filteredSubmissions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester / Academic Year</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {submission.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {submission.studentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(submission.submissionDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {submission.semester} / {submission.courseCode}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !loading && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No exams found</h3>
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

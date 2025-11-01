import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { lecturerService } from '../services';

const AssignmentManager = () => {
  const { user, isLoggedIn, isAdmin } = useAuth();
  const [lecturers, setLecturers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLecturer, setSelectedLecturer] = useState('');
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);

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

      const lecturerData = await lecturerService.getLecturers({ pageIndex: 1, pageSize: 100 });
      const lecturerItems = lecturerData?.data?.items || lecturerData?.items || [];
      setLecturers(lecturerItems);

      const mockSubmissions = [
        { id: '1', studentName: 'Nguyễn Văn A', studentId: 'SE123456', fileName: 'assignment1.zip', status: 'pending' },
        { id: '2', studentName: 'Trần Thị B', studentId: 'SE789012', fileName: 'assignment2.zip', status: 'pending' },
        { id: '3', studentName: 'Lê Văn C', studentId: 'SE345678', fileName: 'assignment3.zip', status: 'assigned' },
        { id: '4', studentName: 'Phạm Thị D', studentId: 'SE901234', fileName: 'assignment4.zip', status: 'graded' },
      ];
      setSubmissions(mockSubmissions);

      const mockAssignments = [
        { id: '1', lecturerId: 'lecturer1', lecturerName: 'Hoàng Võ Đông Nghi', submissionIds: ['1', '2'], status: 'assigned' },
        { id: '2', lecturerId: 'lecturer2', lecturerName: 'lecturer', submissionIds: ['3'], status: 'graded' },
      ];
      setAssignments(mockAssignments);

    } catch (err) {
      setError(err?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedLecturer || selectedSubmissions.length === 0) {
      setError('Please select a lecturer and at least one submission');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('Assigning submissions:', selectedSubmissions, 'to lecturer:', selectedLecturer);
      const lecturer = lecturers.find(l => l.id === selectedLecturer);
      const newAssignment = {
        id: Date.now().toString(),
        lecturerId: selectedLecturer,
        lecturerName: lecturer?.fullName || lecturer?.name || 'Unknown',
        submissionIds: selectedSubmissions,
        status: 'assigned'
      };
      
      setAssignments(prev => [...prev, newAssignment]);
      
      setSubmissions(prev => 
        prev.map(sub => 
          selectedSubmissions.includes(sub.id) 
            ? { ...sub, status: 'assigned' }
            : sub
        )
      );

      setSelectedLecturer('');
      setSelectedSubmissions([]);
      
    } catch (err) {
      setError(err?.message || 'Failed to assign submissions');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ phân công';
      case 'assigned': return 'Đã phân công';
      case 'graded': return 'Đã chấm';
      default: return 'Không xác định';
    }
  };

  if (loading) {
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
                to="/" 
                className="mr-4 p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="Back to Home"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Assignment Manager</h1>
                <p className="text-sm text-gray-600">Phân công và quản lý bài tập cho giảng viên</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Welcome, {user?.name || user?.fullName || 'Admin'}
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Phân công bài tập</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn giảng viên</label>
              <select
                value={selectedLecturer}
                onChange={(e) => setSelectedLecturer(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">-- Chọn giảng viên --</option>
                {lecturers.map(lecturer => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.fullName || lecturer.name || lecturer.email}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bài tập đã chọn: {selectedSubmissions.length}
              </label>
              <button
                onClick={handleAssign}
                disabled={!selectedLecturer || selectedSubmissions.length === 0 || loading}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang phân công...' : 'Phân công'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Danh sách bài tập</h2>
            <p className="text-sm text-gray-600">Chọn bài tập để phân công cho giảng viên</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubmissions(submissions.map(s => s.id));
                        } else {
                          setSelectedSubmissions([]);
                        }
                      }}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sinh viên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã sinh viên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File bài tập</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission, index) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedSubmissions.includes(submission.id)}
                        onChange={() => handleSubmissionSelect(submission.id)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {submission.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.fileName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                        {getStatusText(submission.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Phân công hiện tại</h2>
            <p className="text-sm text-gray-600">Danh sách bài tập đã được phân công</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảng viên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số bài tập</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {assignment.lecturerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.submissionIds.length} bài tập
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                        {getStatusText(assignment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-orange-600 hover:text-orange-900">Xem chi tiết</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} FPT University. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AssignmentManager;

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import FileUploader from './FileUploader';
import FileViewer from './FileViewer';
import SubmissionsList from './SubmissionsList';
import ExamManager from './ExamManager';
import { useAuth } from '../contexts/AuthContext';
import { lecturerService } from '../services';
import AssignmentManager from '../pages/AssignmentManager';

const courseData = {
  swd392: {
    code: 'SWD392',
    name: 'Software Architecture and Design',
    semester: 'Fall 2025',
    color: 'orange',
  },
};

const ExamFileManager = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [extractedFiles, setExtractedFiles] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('submissions');
  const [lecturers, setLecturers] = useState([]);
  const [lecturersLoading, setLecturersLoading] = useState(false);
  const [lecturersError, setLecturersError] = useState('');
  const [lecturerPage, setLecturerPage] = useState(1);
  const [lecturerPageSize, setLecturerPageSize] = useState(10);
  const [lecturerTotal, setLecturerTotal] = useState(0);
  const [showAddLecturer, setShowAddLecturer] = useState(false);
  const [showLecturerDetail, setShowLecturerDetail] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createForm, setCreateForm] = useState({ fullName: '', email: '', password: '', role: 'lecturer' });
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [zipFile, setZipFile] = useState(null);
  const [zipContents, setZipContents] = useState([]);
  const [loadingZipContents, setLoadingZipContents] = useState(false);
  const [importedSubmissions, setImportedSubmissions] = useState([]);

  const handleExportZip = async () => {
    try {
      setExporting(true);
      setExportError('');
      const token = localStorage.getItem('token');
      if (!zipFile) throw new Error('Please choose a ZIP file to upload');
      const API_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'https://localhost:7244/api');
      const formData = new FormData();
      formData.append('file', zipFile);
      formData.append('courseId', courseId || 'swd392');
      const zipFileInfo = {
        name: zipFile.name,
        content: zipFile,
        size: zipFile.size,
        type: 'application/zip',
        isZipFile: true
      };

      try {
        const uploadResponse = await fetch(`${API_URL}/submissions/upload-zip`, {
          method: 'POST',
          mode: 'cors',
          credentials: 'include',
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        });

        if (uploadResponse.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('isLoggedIn');
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }

        const uploadResult = await uploadResponse.json();
        console.log('ZIP file uploaded successfully:', uploadResult);
      } catch (uploadError) {
        console.warn('Failed to upload ZIP file to server:', uploadError);
      }
      const JSZip = (await import('jszip')).default;
      const newZip = new JSZip();
      const fileGroups = {};

      zipContents.forEach(file => {
        const semester = file.semester || 'Unknown';
        const courseCode = file.courseCode || 'Unknown';
        const key = `${semester}/${courseCode}`;

        if (!fileGroups[key]) {
          fileGroups[key] = [];
        }

        fileGroups[key].push(file);
      });
      const originalZip = await JSZip.loadAsync(zipFile);
      for (const [path, files] of Object.entries(fileGroups)) {
        for (const file of files) {
          const fileContent = await originalZip.file(file.name)?.async('blob');
          if (fileContent) {
            const newPath = `${path}/${file.originalFileName}`;
            newZip.file(newPath, fileContent);
          }
        }
      }
      const newZipBlob = await newZip.generateAsync({ type: 'blob' });
      const extractedFiles = [];
      const allFiles = [];
      originalZip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir) {
          allFiles.push({
            path: relativePath,
            entry: zipEntry
          });
        }
      });
      for (const fileObj of allFiles) {
        const fileContent = await fileObj.entry.async('blob');
        const fileName = fileObj.path.split('/').pop();
        const fileSize = fileObj.entry._data?.uncompressedSize || 0;
        const fileType = fileName.split('.').pop().toLowerCase();
        let semester = 'Unknown';
        let courseCode = 'Unknown';
        if (fileName.length >= 11) {
          courseCode = fileName.substring(0, 6); 
          semester = fileName.substring(7, 11);
        }

        // Hoặc thử phân tích từ đường dẫn
        const pathParts = fileObj.path.split('/');
        for (const part of pathParts) {
          if (part.match(/^(SP|SU|FA|WI)\d{2}$/)) { 
            semester = part;
          } else if (part.match(/^[A-Z]{3}\d{3}$/)) { 
            courseCode = part;
          }
        }

        const path = `${semester}/${courseCode}`;
        extractedFiles.push({
          name: `${path}/${fileName}`,
          content: fileContent,
          size: fileSize,
          type: fileType
        });
      }

      const extractedGroups = {};
      extractedFiles.forEach(file => {
        const pathParts = file.name.split('/');
        if (pathParts.length >= 2) {
          const groupKey = `${pathParts[0]}/${pathParts[1]}`;
          if (!extractedGroups[groupKey]) {
            extractedGroups[groupKey] = [];
          }
          extractedGroups[groupKey].push(file);
        }
      });

      alert(`Đã giải nén file ZIP thành công! Tất cả các file đã được tổ chức theo kỳ học và mã môn.\n\nTổng số nhóm: ${Object.keys(extractedGroups).length}\nTổng số file: ${extractedFiles.length}`);
      setExtractedFiles([zipFileInfo, ...extractedFiles]);
      if (extractedFiles.length > 0) {
        setActiveTab('files');
      }
      console.log('Extracted groups:', extractedGroups);
      console.log('Extracted files:', extractedFiles);
      const newSubmissions = zipContents.map((file, index) => {
        const pathParts = file.name.split('/');
        let studentId = 'Unknown';
        let studentName = 'Unknown Student';
        for (const part of pathParts) {
          if (part.match(/SE\d{6}/) || part.match(/[A-Z]{2,}\d{6}/)) {
            studentId = part;
            break;
          }
        }
        for (const part of pathParts) {
          if (part.includes('_') && part.length > 5) {
            const nameParts = part.split('_');
            if (nameParts.length >= 2) {
              studentName = nameParts.slice(0, -1).join(' ');
              break;
            }
          }
        }

        return {
          id: `imported_${Date.now()}_${index}`,
          studentName: studentName,
          studentId: studentId,
          fileName: file.originalFileName,
          submissionDate: new Date().toISOString(),
          status: 'submitted',
          grade: null,
          semester: file.semester,
          courseCode: file.courseCode,
          files: [`${file.semester}/${file.courseCode}/${file.originalFileName}`]
        };
      });
      setImportedSubmissions(prev => [...prev, ...newSubmissions]);
      setExportError('');
      alert(`Import thành công! Đã upload file ZIP gốc và thêm ${newSubmissions.length} bài tập, tổ chức thành thư mục theo kỳ học và mã môn.`);
    } catch (e) {
      console.error('Error in handleExportZip:', e);
      setExportError(e?.message || 'Failed to export ZIP');
    } finally {
      setExporting(false);
    }
  };
  const { user, isLoggedIn, isLecturer, isAdmin } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (isLecturer()) {
      setActiveTab('submissions');
    } else if (isAdmin()) {
      setActiveTab('assign');
    }

    if (courseId && courseData[courseId]) {
      setCourseInfo(courseData[courseId]);
    } else {
      setCourseInfo(courseData.swd392);
    }
  }, [courseId, navigate, isLoggedIn, isLecturer, isAdmin]);

  useEffect(() => {
    const loadLecturers = async () => {
      if (!(activeTab === 'assign' && isAdmin())) return;
      try {
        setLecturersLoading(true);
        setLecturersError('');
        const data = await lecturerService.getLecturers({ pageIndex: lecturerPage, pageSize: lecturerPageSize, sortDirection: 'asc' });
        const payload = data?.data || data;
        const items = payload?.items || [];
        const total = payload?.totalItems ?? payload?.totalCount ?? payload?.total ?? items.length;
        setLecturers(items);
        setLecturerTotal(total);
      } catch (err) {
        setLecturersError(err?.message || 'Failed to load lecturers');
      } finally {
        setLecturersLoading(false);
      }
    };
    loadLecturers();
  }, [activeTab, isAdmin, lecturerPage, lecturerPageSize]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setZipFile(null);
      setZipContents([]);
      return;
    }

    setZipFile(file);
    setLoadingZipContents(true);
    setZipContents([]);

    try {
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(file);
      const files = [];

      zip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir) {
          const fileName = relativePath.split('/').pop() || relativePath;
          let semester = '';
          let courseCode = '';

          if (fileName.length >= 11) {
            courseCode = fileName.substring(0, 6); 
            semester = fileName.substring(7, 11);
          }

          files.push({
            name: relativePath,
            size: zipEntry._data?.uncompressedSize || 0,
            compressedSize: zipEntry._data?.compressedSize || 0,
            semester: semester,
            courseCode: courseCode,
            originalFileName: fileName
          });
        }
      });
      files.sort((a, b) => {
        if (a.semester !== b.semester) {
          return a.semester.localeCompare(b.semester);
        }
        return a.courseCode.localeCompare(b.courseCode);
      });

      setZipContents(files);
    } catch (error) {
      console.error('Error reading ZIP contents:', error);
      setZipContents([{ name: 'Error reading ZIP file', size: 0, compressedSize: 0 }]);
    } finally {
      setLoadingZipContents(false);
    }
  };

  const handleViewLecturer = async (lec) => {
    try {
      setSelectedLecturer(null);
      setShowLecturerDetail(true);
      const resp = await lecturerService.getLecturerById(lec.id);
      const payload = resp?.data || resp;
      setSelectedLecturer(payload);
    } catch (e) {
      setSelectedLecturer(lec);
    }
  };

  const handleCreateLecturer = async (e) => {
    e?.preventDefault?.();
    try {
      setCreating(true);
      setCreateError('');
      await lecturerService.createLecturer({
        fullName: createForm.fullName,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
      });
      setShowAddLecturer(false);
      setCreateForm({ fullName: '', email: '', password: '', role: 'lecturer' });
      const data = await lecturerService.getLecturers({ pageIndex: lecturerPage, pageSize: lecturerPageSize, sortDirection: 'asc' });
      const payload = data?.data || data;
      setLecturers(payload?.items || []);
      setLecturerTotal(payload?.totalItems ?? payload?.totalCount ?? payload?.total ?? 0);
    } catch (err) {
      setCreateError(err?.message || 'Failed to create lecturer');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteLecturer = async (lecturerId) => {
    if (!lecturerId) return;

    if (window.confirm('Bạn có chắc chắn muốn xóa giảng viên này?')) {
      try {
        await lecturerService.deleteLecturer(lecturerId);
        const data = await lecturerService.getLecturers({ pageIndex: lecturerPage, pageSize: lecturerPageSize, sortDirection: 'asc' });
        const payload = data?.data || data;
        setLecturers(payload?.items || []);
        setLecturerTotal(payload?.totalItems ?? payload?.totalCount ?? payload?.total ?? 0);
      } catch (err) {
        alert(err?.message || 'Không thể xóa giảng viên. Vui lòng thử lại sau.');
      }
    }
  };

  const handleFilesExtracted = (files) => {
    setExtractedFiles(files);
    if (files.length > 0) {
      setActiveTab('files');
    }
  };

  if (!courseInfo) {
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
                title="Back to Courses"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <div className="flex items-center">
                  <div className="px-2 py-0.5 text-xs font-semibold text-orange-700 bg-orange-100 rounded-full mr-2">
                    {courseInfo.code}
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {courseInfo.name}
                  </h1>
                </div>
                <p className="text-sm text-gray-600">
                  {courseInfo.semester} - Exam File Manager
                </p>
              </div>
            </div>
            <div className="hidden md:flex space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {/* Admin tabs */}
            {isAdmin() && (
              <>
                <button
                  onClick={() => setActiveTab('assign')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'assign'
                      ? `border-orange-500 text-orange-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Assign to Lecturers
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('exams')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'exams'
                      ? `border-orange-500 text-orange-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Exam Manager
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('assignment')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'assignment'
                      ? `border-orange-500 text-orange-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Assignment Manager
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('approve')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'approve'
                      ? `border-orange-500 text-orange-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Approve Scores
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'reports'
                      ? `border-orange-500 text-orange-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Reports
                  </div>
                </button>
              </>
            )}
            {isLecturer() && (
              <>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'submissions'
                      ? `border-orange-500 text-orange-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Assigned Submissions
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('grade')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'grade'
                      ? `border-orange-500 text-orange-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Grade Submissions
                  </div>
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {activeTab === 'submissions' && isLecturer() && (
            <div>
              <SubmissionsList courseId={courseId} importedSubmissions={importedSubmissions} />
            </div>
          )}

          {activeTab === 'exams' && isAdmin() && (
            <ExamManager />
          )}
          {activeTab === 'assign' && isAdmin() && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Manage Lecturers</h3>

                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowAddLecturer(true)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm"
                  >
                    Add Lecturer
                  </button>
                </div>
              </div>

              {lecturersError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">{lecturersError}</div>
              )}

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lecturersLoading ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-6 text-center text-gray-500">Loading...</td>
                      </tr>
                    ) : lecturers?.length ? (
                      lecturers.map((lec, idx) => (
                        <tr key={lec.id || idx}>
                          <td className="px-4 py-3 text-sm text-gray-700">{(lecturerPage - 1) * lecturerPageSize + idx + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{lec.name || lec.fullName || `${lec.firstName || ''} ${lec.lastName || ''}`.trim() || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{lec.email || '—'}</td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              onClick={() => handleViewLecturer(lec)}
                              className="px-3 py-1.5 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteLecturer(lec.id)}
                              className="px-3 py-1.5 border border-red-300 rounded-md text-sm text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-6 text-center text-gray-500">No lecturers found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Page {lecturerPage}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setLecturerPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 border rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    disabled={lecturerPage === 1 || lecturersLoading}
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setLecturerPage(p => p + 1)}
                    className="px-3 py-1.5 border rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    disabled={lecturersLoading || (lecturers.length < lecturerPageSize)}
                  >
                    Next
                  </button>
                </div>
              </div>
              {showAddLecturer && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Lecturer</h3>
                    {createError && (
                      <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{createError}</div>
                    )}
                    <form onSubmit={handleCreateLecturer} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                        <input
                          type="text"
                          value={createForm.fullName}
                          onChange={(e) => setCreateForm(f => ({ ...f, fullName: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={createForm.email}
                          onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                          type="password"
                          value={createForm.password}
                          onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          value={createForm.role}
                          onChange={(e) => setCreateForm(f => ({ ...f, role: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-600"
                          required
                        >
                          <option value="lecturer">lecturer</option>
                          <option value="admin">admin</option>
                        </select>
                      </div>
                      <div className="flex justify-end space-x-2 pt-2">
                        <button
                          type="button"
                          onClick={() => { setShowAddLecturer(false); setCreateError(''); }}
                          className="px-3 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                          disabled={creating}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm disabled:opacity-50"
                          disabled={creating}
                        >
                          {creating ? 'Creating...' : 'Create'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {showLecturerDetail && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Lecturer Detail</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">Full name</span><span className="font-medium text-gray-900">{selectedLecturer?.fullName || selectedLecturer?.name || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Email</span><span className="font-medium text-gray-900">{selectedLecturer?.email || '—'}</span></div>
                      {selectedLecturer?.role && (
                        <div className="flex justify-between"><span className="text-gray-600">Role</span><span className="font-medium text-gray-900">{selectedLecturer.role}</span></div>
                      )}
                    </div>
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={() => setShowLecturerDetail(false)}
                        className="px-3 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'approve' && isAdmin() && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Approve Scores</h3>
              <p className="text-gray-600 mb-4">Review and approve student scores graded by lecturers.</p>
              <div className="text-sm text-gray-500">
                <p>View detailed grading by lecturers and approve final scores.</p>
              </div>
            </div>
          )}

          {activeTab === 'grade' && isLecturer() && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Grade Student Assignments</h3>
              <p className="text-gray-600 mb-4">View assigned submissions and grade them with detailed scores and notes.</p>
              <div className="text-sm text-gray-500">
                <p>Go to Assigned Submissions tab to view and grade work assigned to you.</p>
              </div>
              <button
                onClick={() => setActiveTab('submissions')}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                View Assigned Submissions
              </button>
            </div>
          )}
          {activeTab === 'upload' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Upload Exam Archive
                </h2>
                <p className="text-gray-600">
                  Upload your exam submission for {courseInfo.code}
                </p>
              </div>

              <FileUploader onFilesExtracted={handleFilesExtracted} />

              {extractedFiles.length === 0 && (
                <div className="mt-8 bg-orange-50 p-6 rounded-lg border border-orange-100">
                  <div className="flex">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-orange-800">Instructions</h3>
                      <ul className="mt-2 text-sm text-orange-700 list-disc pl-5 space-y-2">
                        <li>Upload a ZIP file containing your exam submission for {courseInfo.code}</li>
                        <li>Browser limitations prevent direct RAR extraction - convert to ZIP first</li>
                        <li>Files will be displayed for preview and viewing information</li>
                        <li>All files will be automatically extracted and organized by semester and course code</li>
                        <li>No files are sent to any server - all processing happens in your browser</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div>
              {extractedFiles.length > 0 ? (
                <FileViewer files={extractedFiles} />
              ) : (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Files Available</h3>
                  <p className="text-gray-600 mb-6">Upload a ZIP file to view and manage exam files</p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  >
                    Go to Upload
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Grades Coming Soon</h3>
              <p className="text-gray-600">Your grades will appear here after your submission is graded</p>
            </div>
          )}
          {activeTab === 'grades' && isLecturer() && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Grade Management</h3>
              <p className="text-gray-600 mb-4">Use the Student Submissions tab to view and grade student work</p>
              <button
                onClick={() => setActiveTab('submissions')}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Go to Student Submissions
              </button>
            </div>
          )}

          {activeTab === 'assignment' && isAdmin() && (
            <div className="p-6">
              <AssignmentManager />
            </div>
          )}

          {activeTab === 'reports' && isAdmin() && (
            <div className="p-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Course Reports</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Statistics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Submitted</span>
                        <span className="text-sm font-medium text-gray-900">4 students (80%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Graded</span>
                        <span className="text-sm font-medium text-gray-900">2 students (40%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Late Submissions</span>
                        <span className="text-sm font-medium text-gray-900">1 student (20%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">9-10</span>
                        <span className="text-sm font-medium text-gray-900">1 student (50%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">8-8.9</span>
                        <span className="text-sm font-medium text-gray-900">1 student (50%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">7-7.9</span>
                        <span className="text-sm font-medium text-gray-900">0 students (0%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">&lt; 7</span>
                        <span className="text-sm font-medium text-gray-900">0 students (0%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Actions</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">2 submissions need grading</p>
                        <p className="text-xs text-gray-500">Last submission: 1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}



          {activeTab === 'reports' && isLecturer() && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reports Coming Soon</h3>
              <p className="text-gray-600">This feature is currently under development</p>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-auto py-6 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600 mb-4 md:mb-0">
              FPT University - {courseInfo.code} Exam File Manager
            </p>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} FPT University. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExamFileManager;
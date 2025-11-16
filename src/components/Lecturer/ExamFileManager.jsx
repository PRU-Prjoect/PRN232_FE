import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Table, Button, Tabs, Space, Tag, Popconfirm, message } from 'antd';
import { 
  DeleteOutlined, 
  EyeOutlined, 
  PlusOutlined, 
  ReloadOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  UserOutlined,
  SafetyOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  UploadOutlined,
  FolderOutlined,
  FileOutlined,
  TeamOutlined,
  BarChartOutlined,
  LineChartOutlined,
  FormOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import FileUploader from '../Admin/FileUploader';
import FileViewer from '../Admin/FileViewer';
import SubmissionsList from './SubmissionsList';
import ExamManager from '../Admin/ExamManager';
import ApproveScoresTab from './ApproveScoresTab';
import ViewTotalScoresTab from './ViewTotalScoresTab';
import LecturerManagementTab from './LecturerManagementTab';
import ReportsTab from '../Admin/ReportsTab';
import { useAuth } from '../../contexts/AuthContext';
import AssignmentManager from '../../pages/AssignmentManager';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import Modal from '../common/Modal';
import ErrorAlert from '../common/ErrorAlert';
import { 
  groupFilesBySemesterAndCourse, 
  createExtractedFiles, 
  createSubmissionsFromZip,
  processZipFile 
} from '../../utils/zipHelpers';

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
      const fileGroups = groupFilesBySemesterAndCourse(zipContents);
      
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
      
      const allFiles = [];
      originalZip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir) {
          allFiles.push({
            path: relativePath,
            entry: zipEntry
          });
        }
      });
      
      const extractedFiles = await createExtractedFiles(originalZip, allFiles);
      const extractedGroups = groupFilesBySemesterAndCourse(extractedFiles);

      alert(`Đã giải nén file ZIP thành công! Tất cả các file đã được tổ chức theo kỳ học và mã môn.\n\nTổng số nhóm: ${Object.keys(extractedGroups).length}\nTổng số file: ${extractedFiles.length}`);
      setExtractedFiles([zipFileInfo, ...extractedFiles]);
      if (extractedFiles.length > 0) {
        setActiveTab('files');
      }
      console.log('Extracted groups:', extractedGroups);
      console.log('Extracted files:', extractedFiles);
      
      const newSubmissions = createSubmissionsFromZip(zipContents);
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
  const { user, isLoggedIn, isLecturer, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }
    
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
      const files = await processZipFile(file);
      setZipContents(files);
    } catch (error) {
      console.error('Error reading ZIP contents:', error);
      setZipContents([{ name: 'Error reading ZIP file', size: 0, compressedSize: 0 }]);
    } finally {
      setLoadingZipContents(false);
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
                title="Back to Courses"
              >
                <ArrowLeftOutlined className="text-xl" />
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
              <Button type="text" icon={<QuestionCircleOutlined />} className="text-gray-500" />
              <Button type="text" icon={<SettingOutlined />} className="text-gray-500" />
              <Button type="text" icon={<UserOutlined />} className="text-gray-500" />
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
                    <CheckCircleOutlined className="mr-2" />
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
                    <FileTextOutlined className="mr-2" />
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
                    <FormOutlined className="mr-2" />
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
                    <SafetyOutlined className="mr-2" />
                    Approve Scores
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('view-scores')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'view-scores'
                      ? `border-orange-500 text-orange-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center">
                    <LineChartOutlined className="mr-2" />
                    View Total Scores
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
                    <BarChartOutlined className="mr-2" />
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
                    <TeamOutlined className="mr-2" />
                    Assigned Submissions
                  </div>
                </button>

                {/* <button
                  onClick={() => setActiveTab('grade')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'grade'
                      ? `border-orange-500 text-orange-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center">
                    <EditOutlined className="mr-2" />
                    Grade Submissions
                  </div>
                </button> */}
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
            <LecturerManagementTab />
          )}
          {activeTab === 'approve' && isAdmin() && (
            <ApproveScoresTab />
          )}
          {activeTab === 'view-scores' && isAdmin() && (
            <ViewTotalScoresTab />
          )}

          {/* {activeTab === 'grade' && isLecturer() && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <EditOutlined className="text-blue-600 text-3xl" />
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
          )} */}
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
                      <ExclamationCircleOutlined className="text-orange-600 text-2xl" />
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
                    <FolderOutlined className="text-gray-500 text-3xl" />
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
                <EditOutlined className="text-gray-500 text-3xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Grades Coming Soon</h3>
              <p className="text-gray-600">Your grades will appear here after your submission is graded</p>
            </div>
          )}
          {activeTab === 'grades' && isLecturer() && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <EditOutlined className="text-gray-500 text-3xl" />
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

          {activeTab === 'reports' && (
            <ReportsTab isLecturer={isLecturer()} />
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
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ClockCircleOutlined, BarChartOutlined } from '@ant-design/icons';
import dashboardService from '../../services/dashboardService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

const ReportsTab = ({ isLecturer = false }) => {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overviewStats, setOverviewStats] = useState(null);
  const [examsByMonth, setExamsByMonth] = useState(null);
  const [topLecturers, setTopLecturers] = useState(null);
  const [scoreStats, setScoreStats] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [overview, exams, lecturers, scores] = await Promise.all([
          dashboardService.getOverviewStats().catch(err => {
            console.error('Error fetching overview stats:', err);
            return null;
          }),
          dashboardService.getExamsByMonth(2024).catch(err => {
            console.error('Error fetching exams by month:', err);
            return null;
          }),
          dashboardService.getTopLecturersByAssignments(10).catch(err => {
            console.error('Error fetching top lecturers:', err);
            return null;
          }),
          courseId ? dashboardService.getScoreStatsByExam(courseId).catch(err => {
            console.error('Error fetching score stats:', err);
            return null;
          }) : Promise.resolve(null)
        ]);

        setOverviewStats(overview);
        setExamsByMonth(exams);
        setTopLecturers(lecturers);
        setScoreStats(scores);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [courseId]);

  if (isLecturer) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <BarChartOutlined className="text-gray-500 text-3xl" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Reports Coming Soon</h3>
        <p className="text-gray-600">This feature is currently under development</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" color="orange" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12">
        <ErrorAlert message={error} />
      </div>
    );
  }

  const submittedCount = overviewStats?.submittedCount || overviewStats?.submitted || 0;
  const totalCount = overviewStats?.totalCount || overviewStats?.total || 0;
  const gradedCount = overviewStats?.gradedCount || overviewStats?.graded || 0;
  const lateCount = overviewStats?.lateCount || overviewStats?.late || 0;
  
  const submittedPercentage = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;
  const gradedPercentage = totalCount > 0 ? Math.round((gradedCount / totalCount) * 100) : 0;
  const latePercentage = totalCount > 0 ? Math.round((lateCount / totalCount) * 100) : 0;

  const gradeDistribution = scoreStats?.gradeDistribution || overviewStats?.gradeDistribution || {
    excellent: { count: 0, percentage: 0 }, // 9-10
    good: { count: 0, percentage: 0 },     // 8-8.9
    average: { count: 0, percentage: 0 },   // 7-7.9
    below: { count: 0, percentage: 0 }      // < 7
  };

  // Pending actions
  const pendingGrading = overviewStats?.pendingGrading || overviewStats?.pendingCount || 0;
  const lastSubmission = overviewStats?.lastSubmission || 'N/A';

  return (
    <div className="p-12">
      <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Course Reports</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Statistics</h3>
          <div className="space-y-4">
            <StatBar 
              label="Submitted" 
              value={`${submittedCount} students (${submittedPercentage}%)`} 
              percentage={submittedPercentage} 
              color="bg-blue-600" 
            />
            <StatBar 
              label="Graded" 
              value={`${gradedCount} students (${gradedPercentage}%)`} 
              percentage={gradedPercentage} 
              color="bg-green-600" 
            />
            <StatBar 
              label="Late Submissions" 
              value={`${lateCount} student${lateCount !== 1 ? 's' : ''} (${latePercentage}%)`} 
              percentage={latePercentage} 
              color="bg-yellow-500" 
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
          <div className="space-y-4">
            <StatBar 
              label="9-10" 
              value={`${gradeDistribution.excellent?.count || 0} student${(gradeDistribution.excellent?.count || 0) !== 1 ? 's' : ''} (${gradeDistribution.excellent?.percentage || 0}%)`} 
              percentage={gradeDistribution.excellent?.percentage || 0} 
              color="bg-green-600" 
            />
            <StatBar 
              label="8-8.9" 
              value={`${gradeDistribution.good?.count || 0} student${(gradeDistribution.good?.count || 0) !== 1 ? 's' : ''} (${gradeDistribution.good?.percentage || 0}%)`} 
              percentage={gradeDistribution.good?.percentage || 0} 
              color="bg-blue-600" 
            />
            <StatBar 
              label="7-7.9" 
              value={`${gradeDistribution.average?.count || 0} student${(gradeDistribution.average?.count || 0) !== 1 ? 's' : ''} (${gradeDistribution.average?.percentage || 0}%)`} 
              percentage={gradeDistribution.average?.percentage || 0} 
              color="bg-blue-400" 
            />
            <StatBar 
              label="&lt; 7" 
              value={`${gradeDistribution.below?.count || 0} student${(gradeDistribution.below?.count || 0) !== 1 ? 's' : ''} (${gradeDistribution.below?.percentage || 0}%)`} 
              percentage={gradeDistribution.below?.percentage || 0} 
              color="bg-red-500" 
            />
          </div>
        </div>
      </div>

      {/* Exams by Month Section */}
      {examsByMonth && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exams by Month (2024)</h3>
          <div className="space-y-3">
            {Array.isArray(examsByMonth) && examsByMonth.length > 0 ? (
              examsByMonth.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">{item.month || item.label || `Month ${index + 1}`}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.count || item.value || 0} exams</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No exam data available</p>
            )}
          </div>
        </div>
      )}

      {/* Top Lecturers Section */}
      {topLecturers && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Lecturers by Assignments</h3>
          <div className="space-y-3">
            {Array.isArray(topLecturers) && topLecturers.length > 0 ? (
              topLecturers.map((lecturer, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">
                    {lecturer.lecturerName || lecturer.name || `Lecturer ${index + 1}`}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {lecturer.assignmentCount || lecturer.count || 0} assignments
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No lecturer data available</p>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Actions</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <ClockCircleOutlined className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {pendingGrading} submission{pendingGrading !== 1 ? 's' : ''} need grading
                </p>
                <p className="text-xs text-gray-500">Last submission: {lastSubmission}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBar = ({ label, value, percentage, color }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
    </div>
  </div>
);

export default ReportsTab;


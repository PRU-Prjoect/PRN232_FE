import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ClockCircleOutlined, 
  BarChartOutlined, 
  UserOutlined, 
  TeamOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined,
  FileDoneOutlined,
  HourglassOutlined,
  TrophyOutlined
} from '@ant-design/icons';
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
          dashboardService.getExamsByMonth(2025).catch(err => {
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

  // Extract system dashboard statistics
  const stats = overviewStats || {};
  const totalStudents = stats.totalStudents || 0;
  const totalLecturers = stats.totalLecturers || 0;
  const totalExams = stats.totalExams || 0;
  const activeExams = stats.activeExams || 0;
  const totalAssignments = stats.totalAssignments || 0;
  const pendingAssignments = stats.pendingAssignments || 0;
  const completedAssignments = stats.completedAssignments || 0;
  const totalFinalScores = stats.totalFinalScores || 0;
  const approvedFinalScores = stats.approvedFinalScores || 0;

  const completedPercentage = totalAssignments > 0 
    ? Math.round((completedAssignments / totalAssignments) * 100) 
    : 0;
  const pendingPercentage = totalAssignments > 0 
    ? Math.round((pendingAssignments / totalAssignments) * 100) 
    : 0;
  const approvedPercentage = totalFinalScores > 0 
    ? Math.round((approvedFinalScores / totalFinalScores) * 100) 
    : 0;

  return (
    <div className="p-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">System Dashboard</h2>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<UserOutlined />}
          title="Total Students"
          value={totalStudents}
          color="bg-blue-500"
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={<TeamOutlined />}
          title="Total Lecturers"
          value={totalLecturers}
          color="bg-purple-500"
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={<FileTextOutlined />}
          title="Total Exams"
          value={totalExams}
          color="bg-green-500"
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          icon={<CheckCircleOutlined />}
          title="Active Exams"
          value={activeExams}
          color="bg-orange-500"
          bgColor="bg-orange-50"
          iconColor="text-orange-600"
        />
        <StatCard
          icon={<FileDoneOutlined />}
          title="Total Assignments"
          value={totalAssignments}
          color="bg-indigo-500"
          bgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          icon={<HourglassOutlined />}
          title="Pending Assignments"
          value={pendingAssignments}
          color="bg-yellow-500"
          bgColor="bg-yellow-50"
          iconColor="text-yellow-600"
        />
      </div>

      {/* Assignment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileDoneOutlined className="mr-2 text-indigo-600" />
            Assignment Statistics
          </h3>
          <div className="space-y-4">
            <StatBar 
              label="Completed Assignments" 
              value={`${completedAssignments} / ${totalAssignments} (${completedPercentage}%)`} 
              percentage={completedPercentage} 
              color="bg-green-600" 
            />
            <StatBar 
              label="Pending Assignments" 
              value={`${pendingAssignments} / ${totalAssignments} (${pendingPercentage}%)`} 
              percentage={pendingPercentage} 
              color="bg-yellow-500" 
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrophyOutlined className="mr-2 text-orange-600" />
            Final Scores Statistics
          </h3>
          <div className="space-y-4">
            <StatBar 
              label="Approved Final Scores" 
              value={`${approvedFinalScores} / ${totalFinalScores} (${approvedPercentage}%)`} 
              percentage={approvedPercentage} 
              color="bg-green-600" 
            />
            <StatBar 
              label="Pending Approval" 
              value={`${totalFinalScores - approvedFinalScores} / ${totalFinalScores} (${100 - approvedPercentage}%)`} 
              percentage={100 - approvedPercentage} 
              color="bg-orange-500" 
            />
          </div>
        </div>
      </div>

      {/* Exams by Month Section */}
      {examsByMonth && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exams by Month (2025)</h3>
          <div className="space-y-3">
            {Array.isArray(examsByMonth) && examsByMonth.length > 0 ? (
              examsByMonth.map((item, index) => {
                const monthName = getMonthName(item.month);
                return (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">{monthName}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">Total</span>
                        <span className="text-sm font-semibold text-gray-900">{item.count || 0} exams</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">Active</span>
                        <span className="text-sm font-semibold text-green-600">{item.activeCount || 0} exams</span>
                      </div>
                    </div>
                  </div>
                );
              })
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
    topLecturers.map((lecturer, index) => {
      const name = lecturer.fullName ?? "Unknown Lecturer";
      const assigned = lecturer.assignmentCount ?? 0;
      const completed = lecturer.completedAssignments ?? 0;

      return (
        <div
          key={index}
          className="flex justify-between items-center p-2 bg-gray-50 rounded"
        >
          <span className="text-sm font-medium text-gray-700">
            {name}
          </span>

          <span className="text-sm font-semibold text-gray-900">
            {assigned} assignments{" "}
            <span className="text-gray-500">({completed} completed)</span>
          </span>
        </div>
      );
    })
  ) : (
    <p className="text-sm text-gray-500">No lecturer data available</p>
  )}
</div>

        </div>
      )}
    </div>
  );
};

// Helper function to get month name from month number
const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  if (monthNumber >= 1 && monthNumber <= 12) {
    return months[monthNumber - 1];
  }
  return `Month ${monthNumber}`;
};

const StatCard = ({ icon, title, value, color, bgColor, iconColor }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`${bgColor} p-4 rounded-full`}>
        <div className={`${iconColor} text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  </div>
);

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


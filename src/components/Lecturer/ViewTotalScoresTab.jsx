import React, { useState, useCallback } from 'react';
import { Button } from 'antd';
import { BarChartOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { solutionService, finalscoreService } from '../../services';
import { parseResponseData } from '../../utils/apiHelpers';
import { formatDateTime } from '../../utils/dateHelpers';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import Pagination from '../common/Pagination';
import MarkingDetailsModal from './MarkingDetailsModal';

const ViewTotalScoresTab = () => {
  const [finalScores, setFinalScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalSolutionsCount, setTotalSolutionsCount] = useState(0);
  const [showMarkingsModal, setShowMarkingsModal] = useState(false);
  const [selectedSolutionId, setSelectedSolutionId] = useState(null);

  const fetchSolutions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [solutionsResponse, finalScoresResponse] = await Promise.all([
        solutionService.getSolutions({
          pageIndex: page,
          pageSize: pageSize,
          sortDirection: 'desc',
        }),
        finalscoreService.getFinalScores({
          pageIndex: 1,
          pageSize: 1000,
          sortDirection: 'desc',
        }),
      ]);

      const solutions = parseResponseData(solutionsResponse) || [];
      const totalCount =
        solutionsResponse?.totalCount ??
        solutionsResponse?.data?.totalCount ??
        solutionsResponse?.data?.totalItems ??
        0;
      setTotalSolutionsCount(totalCount);

      const finalScoreEntries = parseResponseData(finalScoresResponse) || [];
      const finalScoreMap = new Map();
      finalScoreEntries.forEach((score) => {
        const solutionId =
          score?.solutionId ||
          score?.solution?.id ||
          score?.solution?.solutionId ||
          score?.solutionID;
        if (solutionId) {
          finalScoreMap.set(solutionId, score);
        }
      });

      const filteredSolutions = solutions.filter((solution) => {
        const gradeStatus =
          solution?.gradeStatus ??
          solution?.GradeStatus ??
          solution?.gradestatus ??
          solution?.grade_status;
        if (typeof gradeStatus === 'string') {
          return gradeStatus.toLowerCase() === 'true';
        }
        if (typeof gradeStatus === 'number') {
          return gradeStatus === 1;
        }
        return Boolean(gradeStatus);
      });

      const normalizedResults = filteredSolutions
        .map((solution) => {
          const solutionId = solution.solutionId || solution.id;
          if (!solutionId) {
            return null;
          }

          const finalScore = finalScoreMap.get(solutionId);

          const totalScore =
            finalScore?.totalScore ??
            finalScore?.score ??
            solution.totalScore ??
            solution.total_score ??
            solution.score ??
            solution.finalScore ??
            solution.final_score ??
            solution.grade ??
            null;

          const approvedAt =
            finalScore?.approvedAt ??
            finalScore?.approved_at ??
            solution.approvedAt ??
            solution.approved_at ??
            solution.finalScore?.approvedAt ??
            solution.final_score?.approvedAt ??
            solution.finalScoreApprovedAt ??
            null;

          const createdAt =
            finalScore?.createdAt ??
            finalScore?.created_at ??
            finalScore?.createdDate ??
            solution.createdAt ??
            solution.created_at ??
            solution.createdDate ??
            solution.created_date ??
            solution.created ??
            solution.updatedAt ??
            solution.updated_at ??
            null;

          return {
            id: finalScore?.id || solution.id,
            solutionId,
            totalScore,
            approvedAt,
            createdAt,
            status: approvedAt ? 'Approved' : 'Pending Approval',
          };
        })
        .filter(Boolean);

      setFinalScores(normalizedResults);
    } catch (err) {
      console.error('Error fetching solutions:', err);
      setError(err.message || 'Failed to load total scores');
      setFinalScores([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  React.useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  const handleViewMarkings = (solutionId) => {
    setSelectedSolutionId(solutionId);
    setShowMarkingsModal(true);
  };

  const closeMarkingsModal = () => {
    setShowMarkingsModal(false);
    setSelectedSolutionId(null);
  };

  const totalCount = finalScores.length;
  const approvedCount = finalScores.filter(s => s.approvedAt).length;
  const averageScore = totalCount > 0
    ? (finalScores.reduce((sum, s) => sum + (parseFloat(s.totalScore) || 0), 0) / totalCount).toFixed(2)
    : 0;
  const maxScore = totalCount > 0
    ? Math.max(...finalScores.map(s => parseFloat(s.totalScore) || 0))
    : 0;
  const minScore = totalCount > 0
    ? Math.min(...finalScores.map(s => parseFloat(s.totalScore) || 0))
    : 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mr-3">
            <BarChartOutlined className="text-blue-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">View Total Scores</h3>
            <p className="text-sm text-gray-500">Review and view all student total scores</p>
          </div>
        </div>
        <Button
          type="primary"
          icon={<ReloadOutlined spin={loading} />}
          onClick={fetchSolutions}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Total Scores</div>
          <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Approved</div>
          <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
        </div>
        {/* <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
        </div> */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Average Score</div>
          <div className="text-2xl font-bold text-blue-600">{averageScore}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Max / Min</div>
          <div className="text-2xl font-bold text-purple-600">{maxScore} / {minScore}</div>
        </div>
      </div>

      {error && (
        <ErrorAlert message={error} />
      )}

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solution ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Score</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved At</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center">
                  <LoadingSpinner size="md" color="blue" text="Loading total scores..." />
                </td>
              </tr>
            ) : finalScores?.length ? (
              finalScores.map((score, idx) => (
                <tr key={score.id || score.solutionId || idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700 font-mono">{score.solutionId || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    <span className={`font-semibold ${parseFloat(score.totalScore) >= 5 ? 'text-green-600' : parseFloat(score.totalScore) >= 4 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {score.totalScore !== null && score.totalScore !== undefined ? score.totalScore : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {score.approvedAt ? formatDateTime(score.approvedAt) : 'Not approved'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDateTime(score.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${score.approvedAt
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {score.approvedAt ? 'Approved' : 'Pending Approval'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <button
                      onClick={() => handleViewMarkings(score.solutionId)}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1 mx-auto"
                    >
                      <EyeOutlined />
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-gray-500">No total scores found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        onPrevPage={() => setPage(p => Math.max(1, p - 1))}
        onNextPage={() => setPage(p => p + 1)}
        isLoading={loading}
        hasMore={totalSolutionsCount > page * pageSize}
      />

      <MarkingDetailsModal
        isOpen={showMarkingsModal}
        onClose={closeMarkingsModal}
        solutionId={selectedSolutionId}
      />
    </div>
  );
};

export default ViewTotalScoresTab;


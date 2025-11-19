import React, { useState, useCallback } from 'react';
import { Button } from 'antd';
import { SafetyOutlined, ReloadOutlined, EditOutlined } from '@ant-design/icons';
import { finalscoreService } from '../../services';
import { parseResponseData } from '../../utils/apiHelpers';
import { formatDateTime } from '../../utils/dateHelpers';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import Pagination from '../common/Pagination';
import MarkingDetailsModal from './MarkingDetailsModal';
import EnterScoreModal from './EnterScoreModal';

const ApproveScoresTab = () => {
  const [finalScores, setFinalScores] = useState([]);
  const [finalScoresLoading, setFinalScoresLoading] = useState(false);
  const [finalScoresError, setFinalScoresError] = useState('');
  const [finalScoresPage, setFinalScoresPage] = useState(1);
  const [finalScoresPageSize] = useState(10);
  const [showMarkingsModal, setShowMarkingsModal] = useState(false);
  const [selectedSolutionId, setSelectedSolutionId] = useState(null);
  const [showEnterScoreModal, setShowEnterScoreModal] = useState(false);
  const [selectedScoreForEdit, setSelectedScoreForEdit] = useState(null);

  const fetchFinalScores = useCallback(async () => {
    try {
      setFinalScoresLoading(true);
      setFinalScoresError('');
      const result = await finalscoreService.getFinalScores({
        pageIndex: finalScoresPage,
        pageSize: finalScoresPageSize,
        sortDirection: 'asc'
      });
      const scores = parseResponseData(result);
      setFinalScores(scores || []);
    } catch (err) {
      console.error('Error fetching final scores:', err);
      setFinalScoresError(err.message || 'Failed to load final scores');
      setFinalScores([]);
    } finally {
      setFinalScoresLoading(false);
    }
  }, [finalScoresPage, finalScoresPageSize]);

  React.useEffect(() => {
    fetchFinalScores();
  }, [fetchFinalScores]);

  const handleViewMarkings = (solutionId) => {
    setSelectedSolutionId(solutionId);
    setShowMarkingsModal(true);
  };

  const closeMarkingsModal = () => {
    setShowMarkingsModal(false);
    setSelectedSolutionId(null);
  };

  const handleEnterScore = (score) => {
    setSelectedScoreForEdit(score);
    setShowEnterScoreModal(true);
  };

  const closeEnterScoreModal = () => {
    setShowEnterScoreModal(false);
    setSelectedScoreForEdit(null);
  };

  const handleScoreSaved = () => {
    fetchFinalScores();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 mr-3">
            <SafetyOutlined className="text-purple-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Approve Scores</h3>
            <p className="text-sm text-gray-500">Review and approve student scores graded by lecturers</p>
          </div>
        </div>
        <Button
          type="primary"
          icon={<ReloadOutlined spin={finalScoresLoading} />}
          onClick={fetchFinalScores}
          loading={finalScoresLoading}
        >
          Refresh
        </Button>
      </div>

      {finalScoresError && (
        <ErrorAlert message={finalScoresError} />
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
            {finalScoresLoading ? (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center">
                  <LoadingSpinner size="md" color="purple" text="Loading final scores..." />
                </td>
              </tr>
            ) : finalScores?.length ? (
              finalScores.map((score, idx) => (
                <tr key={score.id || score.solutionId || idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700 font-mono">{score.solutionId || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{score.totalScore !== null && score.totalScore !== undefined ? score.totalScore : 'N/A'}</td>
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
                      {score.approvedAt ? 'Complete' : 'Pending Approval'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleEnterScore(score)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm flex items-center gap-1"
                        title="Nhập điểm số"
                      >
                        <EditOutlined />
                        Nhập điểm
                      </button>
                      {!score.approvedAt && (
                        <button
                          onClick={() => {
                            alert('Approve functionality will be implemented');
                          }}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleViewMarkings(score.solutionId)}
                        className="px-3 py-1.5 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-gray-500">No final scores found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={finalScoresPage}
        onPrevPage={() => setFinalScoresPage(p => Math.max(1, p - 1))}
        onNextPage={() => setFinalScoresPage(p => p + 1)}
        isLoading={finalScoresLoading}
        hasMore={finalScores.length >= finalScoresPageSize}
      />

      <MarkingDetailsModal
        isOpen={showMarkingsModal}
        onClose={closeMarkingsModal}
        solutionId={selectedSolutionId}
      />

      <EnterScoreModal
        isOpen={showEnterScoreModal}
        onClose={closeEnterScoreModal}
        solutionId={selectedScoreForEdit?.solutionId}
        currentScore={selectedScoreForEdit?.totalScore}
        currentFinalScoreId={selectedScoreForEdit?.id || selectedScoreForEdit?.finalScoreId}
        onSuccess={handleScoreSaved}
      />
    </div>
  );
};

export default ApproveScoresTab;


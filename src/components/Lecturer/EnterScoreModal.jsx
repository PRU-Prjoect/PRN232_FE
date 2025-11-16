import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import { finalscoreService, assignmentService } from '../../services';
import { parseResponseData } from '../../utils/apiHelpers';

const EnterScoreModal = ({ isOpen, onClose, solutionId, currentScore, onSuccess }) => {
  const [score, setScore] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingCurrentScore, setLoadingCurrentScore] = useState(false);

  useEffect(() => {
    if (isOpen && solutionId) {
      if (currentScore !== null && currentScore !== undefined) {
        setScore(currentScore.toString());
      } else {
        setLoadingCurrentScore(true);
        finalscoreService.getFinalScoreBySolution(solutionId)
          .then((result) => {
            if (result && result.totalScore !== null && result.totalScore !== undefined) {
              setScore(result.totalScore.toString());
            } else {
              setScore('');
            }
          })
          .catch((err) => {
            if (err?.response?.status !== 404) {
              console.warn('Error loading current score:', err);
            }
            setScore('');
          })
          .finally(() => {
            setLoadingCurrentScore(false);
          });
      }
      setError('');
    }
  }, [isOpen, solutionId, currentScore]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!score || score.trim() === '') {
      setError('Vui lòng nhập điểm số');
      return;
    }

    const scoreValue = parseFloat(score);
    if (isNaN(scoreValue)) {
      setError('Điểm số phải là một số hợp lệ');
      return;
    }

    if (scoreValue < 0) {
      setError('Điểm số không được nhỏ hơn 0');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Get assignmentId
      let assignmentId = null;
      try {
        const assignmentResult = await assignmentService.getAssignments({ solutionId });
        const assignments = parseResponseData(assignmentResult);
        const assignment = Array.isArray(assignments) ? assignments[0] : assignments;
        if (assignment && (assignment.id || assignment.assignmentId)) {
          assignmentId = assignment.id || assignment.assignmentId;
        }
      } catch (assignErr) {
        console.error('Could not fetch assignmentId:', assignErr);
        setError('Không thể tìm thấy assignment. Vui lòng thử lại.');
        setLoading(false);
        return;
      }
      
      if (!assignmentId) {
        setError('Không tìm thấy assignment ID. Vui lòng thử lại.');
        setLoading(false);
        return;
      }
      
      // Call API approve (this will save and approve the score)
      try {
        await finalscoreService.approveFinalScore({
          solutionId,
          assignmentId,
          totalScore: scoreValue
        });
        console.log('Score saved and approved successfully');
        
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } catch (approveErr) {
        console.error('Error approving score:', approveErr);
        let approveErrorMessage = 'Không thể phê duyệt điểm số. Vui lòng thử lại.';
        if (approveErr?.message) {
          try {
            const errorJson = JSON.parse(approveErr.message);
            if (errorJson?.error?.details) {
              approveErrorMessage = errorJson.error.details;
            } else if (errorJson?.error?.title) {
              approveErrorMessage = errorJson.error.title;
            }
          } catch (e) {
            if (approveErr.message) {
              approveErrorMessage = approveErr.message;
            }
          }
        }
        
        setError(approveErrorMessage);
      }
    } catch (err) {
      console.error('Error saving score:', err);
      let errorMessage = 'Không thể lưu điểm số. Vui lòng thử lại.';
      if (err?.message) {
        try {
          const errorJson = JSON.parse(err.message);
          if (errorJson?.error?.details) {
            errorMessage = errorJson.error.details;
          } else if (errorJson?.error?.title) {
            errorMessage = errorJson.error.title;
          }
        } catch (e) {
          if (err.message) {
            errorMessage = err.message;
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setScore('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nhập điểm số"
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || loadingCurrentScore}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Đang lưu và phê duyệt...' : 'Lưu và phê duyệt'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && <ErrorAlert message={error} />}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Solution ID
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-mono text-gray-600">
            {solutionId || 'N/A'}
          </div>
        </div>

        <div>
          <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
            Điểm số <span className="text-red-500">*</span>
          </label>
          {loadingCurrentScore ? (
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md">
              <LoadingSpinner size="sm" color="purple" />
              <span className="text-sm text-gray-500">Đang tải điểm hiện tại...</span>
            </div>
          ) : (
            <input
              type="number"
              id="score"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Nhập điểm số (ví dụ: 8.5)"
              step="0.1"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
          )}
          <p className="mt-1 text-xs text-gray-500">
            Nhập điểm số từ 0 trở lên. 
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default EnterScoreModal;


import React, { useState, useEffect, useCallback } from 'react';
import { assignmentService, markingService, questionService } from '../../services';
import { parseResponseData } from '../../utils/apiHelpers';
import { formatDateTime } from '../../utils/dateHelpers';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import EmptyState from '../common/EmptyState';
import Modal from '../common/Modal';

const MarkingDetailsModal = ({ isOpen, onClose, solutionId }) => {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [markings, setMarkings] = useState([]);
  const [markingsLoading, setMarkingsLoading] = useState(false);
  const [markingsError, setMarkingsError] = useState('');
  const [questionMaxScores, setQuestionMaxScores] = useState({});

  const fetchMarkings = useCallback(async () => {
    if (!solutionId) return;

    try {
      setMarkingsLoading(true);
      setMarkingsError('');
      let assignmentId = null;
      try {
        const assignmentResult = await assignmentService.getAssignments({ solutionId });
        const assignments = parseResponseData(assignmentResult);
        const assignment = Array.isArray(assignments) ? assignments[0] : assignments;
        if (assignment && (assignment.id || assignment.assignmentId)) {
          assignmentId = assignment.id || assignment.assignmentId;
          setSelectedAssignmentId(assignmentId);
        }
      } catch (err) {
        console.warn('Could not fetch assignment by solutionId:', err);
      }

      let markingsData = [];
      try {
        if (assignmentId) {
          const result = await markingService.getMarkingsByAssignment(assignmentId);
          if (result === null || result === undefined) {
            markingsData = [];
          } else {
            markingsData = parseResponseData(result) || [];
          }
        }
      } catch (err) {
        if (err?.response?.status !== 404) {
          console.warn('getMarkingsByAssignment failed, trying alternative:', err);
        } else {
          console.log('No markings found for this assignment (404) - this is normal if assignment has not been graded yet');
        }
      }

      if (markingsData.length === 0) {
        try {
          const result = await markingService.getMarkings({ assignmentId });
          if (result === null || result === undefined) {
            markingsData = [];
          } else {
            markingsData = parseResponseData(result) || [];
          }
        } catch (err) {
          if (err?.response?.status !== 404) {
            console.warn('getMarkings with assignmentId failed, trying solutionId:', err);
          }
        }
      }

      if (markingsData.length === 0) {
        try {
          const result = await markingService.getMarkings({ solutionId });
          if (result === null || result === undefined) {
            markingsData = [];
          } else {
            const allMarkings = parseResponseData(result) || [];
            markingsData = allMarkings.filter(m => m.solutionId === solutionId);
          }
        } catch (err) {
          if (err?.response?.status !== 404) {
            console.warn('getMarkings with solutionId failed:', err);
          }
        }
      }

      setMarkings(markingsData);

      if (markingsData.length > 0) {
        const questionIds = [...new Set(markingsData.map(m => m.questionId).filter(Boolean))];
        if (questionIds.length > 0) {
          try {
            const questionsResult = await questionService.getQuestions();
            const allQuestions = parseResponseData(questionsResult) || [];
            const maxScoresMap = {};
            questionIds.forEach(qId => {
              const question = allQuestions.find(q => q.id === qId || q.questionId === qId);
              if (question && (question.maxScore !== undefined || question.maxScore !== null)) {
                maxScoresMap[qId] = question.maxScore;
              }
            });
            setQuestionMaxScores(maxScoresMap);
          } catch (err) {
            console.warn('Could not fetch question max scores:', err);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching markings:', err);
      setMarkingsError(err.message || 'Failed to load marking details');
      setMarkings([]);
    } finally {
      setMarkingsLoading(false);
    }
  }, [solutionId]);

  useEffect(() => {
    if (isOpen && solutionId) {
      fetchMarkings();
    } else {
      setMarkings([]);
      setSelectedAssignmentId(null);
      setQuestionMaxScores({});
    }
  }, [isOpen, solutionId, fetchMarkings]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Marking Details"
      size="xl"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm"
        >
          Close
        </button>
      }
    >
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Solution ID: <span className="font-mono">{solutionId}</span>
          {selectedAssignmentId && (
            <> | Assignment ID: <span className="font-mono">{selectedAssignmentId}</span></>
          )}
        </p>
      </div>
      {markingsLoading ? (
        <LoadingSpinner size="lg" color="purple" text="Loading marking details..." className="py-12" />
      ) : markingsError ? (
        <ErrorAlert message={markingsError} />
      ) : markings.length > 0 ? (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {markings.map((marking, idx) => {
                  const maxScore = questionMaxScores[marking.questionId];
                  return (
                    <tr key={marking.id || idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-mono">{marking.questionId || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {marking.score !== null && marking.score !== undefined ? marking.score : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {maxScore !== null && maxScore !== undefined ? maxScore : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDateTime(marking.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Questions: {markings.length}</span>
              <span className="text-sm font-medium text-gray-900">
                Total Score: {markings.reduce((sum, m) => sum + (parseFloat(m.score) || 0), 0).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No marking details found"
          message="No marking details found for this solution"
        />
      )}
    </Modal>
  );
};

export default MarkingDetailsModal;


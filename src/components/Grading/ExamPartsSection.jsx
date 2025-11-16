import React from 'react';
import { DownOutlined } from '@ant-design/icons';
import LoadingSpinner from '../common/LoadingSpinner';

const ExamPartsSection = ({
  examId,
  parts,
  loadingParts,
  partsError,
  partQuestions,
  loadingQuestions,
  expandedParts,
  onTogglePart,
  questionScores,
  onScoreChange
}) => {
  if (!examId) return null;

  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">Exam Parts</h4>
      </div>
      {loadingParts ? (
        <LoadingSpinner size="sm" color="blue" text="Loading parts..." />
      ) : partsError ? (
        <div className="text-sm text-red-600">{partsError}</div>
      ) : parts.length > 0 ? (
        <div className="space-y-3">
          {parts.map((part, index) => {
            const partId = part.id;
            const questions = partQuestions[partId] || [];
            const isLoadingQuestions = loadingQuestions[partId];
            
            return (
              <div key={partId || index} className="bg-white rounded-md p-3 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Part {index + 1}: {part.name}
                    </p>
                    {part.description && (
                      <p className="text-xs text-gray-500 mt-1">{part.description}</p>
                    )}
                    {part.maxScore && (
                      <p className="text-xs text-gray-600 mt-1">Max Score: {part.maxScore}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => onTogglePart(partId)}
                    className="flex items-center justify-between w-full text-left text-xs font-medium text-gray-700 mb-2 hover:text-gray-900"
                  >
                    <span>Questions ({questions.length})</span>
                    <DownOutlined className={`transition-transform ${expandedParts[partId] ? 'rotate-180' : ''}`} />
                  </button>
                  {isLoadingQuestions ? (
                    <LoadingSpinner size="sm" color="blue" text="Loading questions..." className="text-xs" />
                  ) : expandedParts[partId] && questions.length > 0 ? (
                    <div className="bg-gray-50 rounded-md p-2 space-y-2 border border-gray-200">
                      {questions.map((question, qIndex) => {
                        const questionId = question.id;
                        const maxScore = question.maxScore || 0;
                        const currentScore = questionScores[questionId] || '';
                        
                        return (
                          <div key={questionId || qIndex} className="bg-white rounded p-2 border border-gray-200">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-xs font-medium text-gray-900">
                                    Question {question.numberQuestion || qIndex + 1}
                                  </p>
                                  {question.questionType && (
                                    <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                                      {question.questionType}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-700 mt-1">
                                  {question.questionContent || question.content || question.text || question.title || `Question ${questionId}`}
                                </p>
                                {maxScore > 0 && (
                                  <p className="text-xs text-gray-500 mt-1">Max Score: {maxScore}</p>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                <label className="block text-xs text-gray-600 mb-1">Score</label>
                                <input
                                  type="number"
                                  min="0"
                                  max={maxScore || undefined}
                                  step="0.1"
                                  value={currentScore}
                                  onChange={(e) => onScoreChange(questionId, e.target.value, maxScore)}
                                  placeholder="0"
                                  className="w-20 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                {maxScore > 0 && (
                                  <p className="text-xs text-gray-400 mt-0.5">/ {maxScore}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : expandedParts[partId] && questions.length === 0 ? (
                    <p className="text-xs text-gray-500">No questions found for this part</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No parts found for this exam</p>
      )}
    </div>
  );
};

export default ExamPartsSection;


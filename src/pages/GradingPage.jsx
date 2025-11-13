import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { partService, questionService, solutionService, markingService, finalscoreService, assignmentService } from '../services';

const GradingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const assignment = location.state?.assignment || {};
  const examId = location.state?.examId || assignment.examId;

  const [grade, setGrade] = useState(assignment.grade || '');
  const [feedback, setFeedback] = useState(assignment.feedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parts, setParts] = useState([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [partsError, setPartsError] = useState('');
  
  // Store questions for each part: { partId: [questions] }
  const [partQuestions, setPartQuestions] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState({});
  const [expandedParts, setExpandedParts] = useState({});
  
  // Solution data
  const [solution, setSolution] = useState(null);
  const [loadingSolution, setLoadingSolution] = useState(false);
  
  // Store scores for each question: { questionId: score }
  const [questionScores, setQuestionScores] = useState({});

  // Fetch parts and solution when page loads
  useEffect(() => {
    if (examId) {
      fetchParts();
    }
    if (assignment.solutionId) {
      fetchSolution();
    }
  }, [examId, assignment.solutionId]);

  const fetchParts = async () => {
    try {
      setLoadingParts(true);
      setPartsError('');
      
      const result = await partService.getParts({
        examId: examId,
        pageIndex: 1,
        pageSize: 10,
        sortDirection: 'asc'
      });

      console.log('Parts data:', result);

      // Handle different response structures
      let partsData = [];
      if (result && result.data) {
        if (Array.isArray(result.data)) {
          partsData = result.data;
        } else if (result.data.items && Array.isArray(result.data.items)) {
          partsData = result.data.items;
        } else if (result.data.data && Array.isArray(result.data.data)) {
          partsData = result.data.data;
        }
      } else if (Array.isArray(result)) {
        partsData = result;
      } else if (result && result.items && Array.isArray(result.items)) {
        partsData = result.items;
      }

      console.log(`Found ${partsData.length} parts for exam ${examId}`);
      setParts(partsData);
      
      // Fetch questions for each part
      partsData.forEach(part => {
        if (part.id) {
          fetchQuestionsForPart(part.id);
        }
      });
    } catch (err) {
      console.error('Error fetching parts:', err);
      setPartsError(err?.message || 'Failed to load parts');
    } finally {
      setLoadingParts(false);
    }
  };

  // Fetch questions for a specific part and solution
  const fetchQuestionsForPart = async (partId) => {
    if (!assignment.solutionId) {
      console.warn('No solutionId found for assignment');
      setPartQuestions(prev => ({
        ...prev,
        [partId]: []
      }));
      return;
    }

    try {
      setLoadingQuestions(prev => ({ ...prev, [partId]: true }));
      
      const result = await questionService.getQuestions({
        partId: partId,
        solutionId: assignment.solutionId, // Filter by solutionId
        pageIndex: 1,
        pageSize: 100,
        sortDirection: 'asc'
      });

      console.log(`Questions for part ${partId}:`, result);

      // Handle different response structures
      let questionsData = [];
      if (result && result.data) {
        if (Array.isArray(result.data)) {
          questionsData = result.data;
        } else if (result.data.items && Array.isArray(result.data.items)) {
          questionsData = result.data.items;
        } else if (result.data.data && Array.isArray(result.data.data)) {
          questionsData = result.data.data;
        }
      } else if (Array.isArray(result)) {
        questionsData = result;
      } else if (result && result.items && Array.isArray(result.items)) {
        questionsData = result.items;
      }

      // Filter questions to ensure they belong to this specific part
      const filteredQuestions = questionsData.filter(q => 
        q.partId === partId
      );

      console.log(`Found ${questionsData.length} total questions, ${filteredQuestions.length} questions for part ${partId} (filtered by partId)`);

      setPartQuestions(prev => ({
        ...prev,
        [partId]: filteredQuestions
      }));
    } catch (err) {
      console.error(`Error fetching questions for part ${partId}:`, err);
      setPartQuestions(prev => ({
        ...prev,
        [partId]: []
      }));
    } finally {
      setLoadingQuestions(prev => ({ ...prev, [partId]: false }));
    }
  };

  // Fetch solution data to get path
  const fetchSolution = async () => {
    try {
      setLoadingSolution(true);
      const solutionData = await solutionService.getSolutionById(assignment.solutionId);
      console.log('Solution data:', solutionData);
      
      // Handle different response structures
      const solutionResult = solutionData?.data || solutionData;
      setSolution(solutionResult);
    } catch (err) {
      console.error('Error fetching solution:', err);
    } finally {
      setLoadingSolution(false);
    }
  };

  // Download solution file from path
  const handleDownloadSolution = async () => {
    if (!solution?.path) {
      alert('No file path available for this solution');
      return;
    }

    try {
      const filePath = solution.path;
      
      // If path is a URL (S3 or external), try to download via fetch
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(filePath, {
            method: 'GET',
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          // Extract filename from path or use default
          const pathParts = filePath.split('/');
          const fileName = pathParts[pathParts.length - 1] || `solution-${assignment.solutionId}.zip`;
          link.download = fileName;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (fetchError) {
          console.warn('Direct download failed, opening in new tab:', fetchError);
          // Fallback: open in new tab if fetch fails (CORS issue)
          window.open(filePath, '_blank');
        }
      } else {
        // If path is relative, might need to call API endpoint
        alert('File path format not supported for direct download');
      }
    } catch (err) {
      console.error('Error downloading solution:', err);
      alert('Failed to download solution file');
    }
  };

  // Handle score input for a question
  const handleQuestionScoreChange = (questionId, value, maxScore) => {
    let score = parseFloat(value) || 0;
    
    // Validate: score cannot exceed maxScore
    if (maxScore !== null && maxScore !== undefined && score > maxScore) {
      score = maxScore;
      alert(`Score cannot exceed max score of ${maxScore}`);
    }
    
    // Validate: score cannot be negative
    if (score < 0) {
      score = 0;
    }
    
    setQuestionScores(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  // Calculate total score from all questions
  useEffect(() => {
    const totalScore = Object.values(questionScores).reduce((sum, score) => {
      return sum + (parseFloat(score) || 0);
    }, 0);
    
    // Update grade field with total score
    setGrade(totalScore.toFixed(1));
  }, [questionScores]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get all questions from all parts
      const allQuestions = [];
      Object.values(partQuestions).forEach(questions => {
        allQuestions.push(...questions);
      });

      // Call API for each question to save score
      if (allQuestions.length === 0) {
        alert('No questions found. Please ensure exam parts and questions are loaded.');
        setIsSubmitting(false);
        return;
      }

      console.log(`Saving scores for ${allQuestions.length} questions...`);
      
      const markingPromises = allQuestions.map(async (question) => {
        const questionId = question.id;
        const score = questionScores[questionId] || 0; // Default to 0 if not entered
        
        try {
          const markingData = {
            assignmentId: assignment.id || assignment.assignmentId,
            questionId: questionId,
            score: parseFloat(score) || 0,
            note: feedback || ''
          };
          
          console.log(`Saving marking for question ${questionId}:`, markingData);
          
          const result = await markingService.createMarking(markingData);
          console.log(`Marking saved successfully for question ${questionId}:`, result);
          
          return { questionId, success: true, score };
        } catch (err) {
          console.error(`Error saving marking for question ${questionId}:`, err);
          return { questionId, success: false, error: err.message || 'Unknown error' };
        }
      });

      const results = await Promise.all(markingPromises);
      
      // Check if all succeeded
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        alert(`Failed to save scores for ${failed.length} question(s). Please try again.`);
        setIsSubmitting(false);
        return;
      }

      // Save final score after all markings are saved
      if (assignment.solutionId && grade) {
        try {
          await finalscoreService.createFinalScore({
            solutionId: assignment.solutionId,
            totalScore: parseFloat(grade) || 0
            // Don't set approvedAt here - it will be set when approving
          });
          console.log('Final score saved successfully');
          
          // Update assignment status to InProgress (1) and mark as submitted
          // Don't call submit API here - that will be called when approving
          // Just update the status to indicate it's been graded
          if (assignment.id || assignment.assignmentId) {
            try {
              await assignmentService.updateAssignment(assignment.id || assignment.assignmentId, {
                status: 1, // InProgress - assignment has been graded
                isSubmitted: true,
                submittedAt: new Date().toISOString()
              });
              console.log('Assignment status updated to InProgress after grading');
            } catch (statusErr) {
              console.warn('Failed to update assignment status to InProgress:', statusErr);
              // Don't fail the whole operation
            }
          }
        } catch (err) {
          console.error('Error saving final score:', err);
          // Don't fail the whole operation if final score fails
          // The markings are already saved
        }
      }

      alert('Grade saved successfully!');
      navigate(-1); // Go back to previous page
    } catch (err) {
      console.error('Error saving grades:', err);
      alert('Failed to save grades. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadge = (status) => {
    if (status === 0 || status === 'Pending' || status === 'pending') {
      return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
    } else if (status === 1 || status === 'InProgress' || status === 'inProgress') {
      return { text: 'In Progress', color: 'bg-blue-100 text-blue-800' };
    } else if (status === 2 || status === 'Completed' || status === 'completed') {
      return { text: 'Completed', color: 'bg-green-100 text-green-800' };
    }
    return { text: 'N/A', color: 'bg-gray-100 text-gray-800' };
  };

  const statusInfo = getStatusBadge(assignment.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="Back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Grade Assignment</h1>
                <p className="text-sm text-gray-600">Grade and provide feedback for the assignment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Assignment Information */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Assignment {assignment.id || 'N/A'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Solution ID: {assignment.solutionId || 'N/A'}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center gap-3">
                  {solution?.path && (
                    <button
                      type="button"
                      onClick={handleDownloadSolution}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
                      title="Download solution file"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Solution
                    </button>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>
              </div>

              {/* Exam Parts Section */}
              {examId && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Exam Parts</h4>
                  {loadingParts ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                      <span className="text-sm">Loading parts...</span>
                    </div>
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
                                  {/* || part.title || `Part ${partId}` */}
                                </p>
                                {part.description && (
                                  <p className="text-xs text-gray-500 mt-1">{part.description}</p>
                                )}
                                {part.maxScore && (
                                  <p className="text-xs text-gray-600 mt-1">Max Score: {part.maxScore}</p>
                                )}
                              </div>
                            </div>
                            
                            {/* Questions List */}
                            <div className="mt-3">
                              <button
                                type="button"
                                onClick={() => setExpandedParts(prev => ({
                                  ...prev,
                                  [partId]: !prev[partId]
                                }))}
                                className="flex items-center justify-between w-full text-left text-xs font-medium text-gray-700 mb-2 hover:text-gray-900"
                              >
                                <span>Questions ({questions.length})</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={`h-4 w-4 transition-transform ${expandedParts[partId] ? 'rotate-180' : ''}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              {isLoadingQuestions ? (
                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                  <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500"></div>
                                  <span>Loading questions...</span>
                                </div>
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
                                              onChange={(e) => handleQuestionScoreChange(questionId, e.target.value, maxScore)}
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
              )}

              {/* Assignment Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Assignment Details</h4>
                  {assignment.createdAt && (
                    <span className="text-xs text-gray-500">
                      {formatDate(assignment.createdAt)}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Assignment ID</p>
                    <p className="text-sm font-medium">{assignment.id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Current Grade</p>
                    <p className="text-sm font-medium">
                      {assignment.grade !== null && assignment.grade !== undefined ? `${assignment.grade}/10` : 'Not graded'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grading Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Grade (Auto-calculated from questions)
                </label>
                <input
                  type="number"
                  id="grade"
                  min="0"
                  step="0.1"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm px-3 py-2 border bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total score is automatically calculated from individual question scores
                </p>
              </div>
              <div className="mb-4">
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback
                </label>
                <textarea
                  id="feedback"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm px-3 py-2 border"
                  placeholder="Provide feedback on the submission..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Saving...' : 'Save Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingPage;


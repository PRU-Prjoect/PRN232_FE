import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { partService, questionService, solutionService, markingService, finalscoreService, assignmentService } from '../services';
import { parseResponseData } from '../utils/apiHelpers';
import { formatDateTime } from '../utils/dateHelpers';
import { isAssignmentCompleted } from '../utils/statusHelpers';
import { downloadSolution } from '../utils/solutionDownloadHelpers';
import SolutionViewer from '../components/Grading/SolutionViewer';
import ExamPartsSection from '../components/Grading/ExamPartsSection';
import GradingForm from '../components/Grading/GradingForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

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
  const [partQuestions, setPartQuestions] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState({});
  const [expandedParts, setExpandedParts] = useState({});
  const [solution, setSolution] = useState(null);
  const [loadingSolution, setLoadingSolution] = useState(false);
  const [questionScores, setQuestionScores] = useState({});
  const [markingIds, setMarkingIds] = useState({});
  const [finalScoreId, setFinalScoreId] = useState(null);
  const [loadingMarkings, setLoadingMarkings] = useState(false);

  useEffect(() => {
    if (examId) {
      fetchParts();
    }
    if (assignment.solutionId) {
      fetchSolution();
    }
  }, [examId, assignment.solutionId, assignment.id, assignment.assignmentId]);

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

      const partsData = parseResponseData(result);
      console.log(`Found ${partsData.length} parts for exam ${examId}`);
      setParts(partsData);

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
        solutionId: assignment.solutionId, 
        pageIndex: 1,
        pageSize: 100,
        sortDirection: 'asc'
      });

      console.log(`Questions for part ${partId}:`, result);

      const questionsData = parseResponseData(result);
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

  const fetchSolution = async () => {
    try {
      setLoadingSolution(true);
      const solutionData = await solutionService.getSolutionById(assignment.solutionId);
      console.log('Solution data:', solutionData);

      const solutionResult = solutionData?.data || solutionData;

      if (solutionResult?.path) {
        const path = solutionResult.path;
        if (path.startsWith('http://') || path.startsWith('https://')) {
          setSolution(solutionResult);
        } else {

          const API_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'https://localhost:7244/api');
          const downloadUrl = `${API_URL}/solution/${assignment.solutionId}/download`;
          setSolution({
            ...solutionResult,
            path: downloadUrl,
            originalPath: path 
          });
        }
      } else {
        setSolution(solutionResult);
      }
    } catch (err) {
      console.error('Error fetching solution:', err);
    } finally {
      setLoadingSolution(false);
    }
  };

  const handleDownloadSolution = async () => {
    await downloadSolution(solution, assignment.solutionId);
  };

  const handleQuestionScoreChange = (questionId, value, maxScore) => {
    let score = parseFloat(value) || 0;

    if (maxScore !== null && maxScore !== undefined && score > maxScore) {
      score = maxScore;
      alert(`Score cannot exceed max score of ${maxScore}`);
    }
    

    if (score < 0) {
      score = 0;
    }
    
    setQuestionScores(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  useEffect(() => {
    const totalScore = Object.values(questionScores).reduce((sum, score) => {
      return sum + (parseFloat(score) || 0);
    }, 0);
    setGrade(totalScore.toFixed(1));
  }, [questionScores]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAssignmentCompleted(assignment.status)) {
      alert('This assignment has already been approved. You cannot grade it again.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const allQuestions = [];
      Object.values(partQuestions).forEach(questions => {
        allQuestions.push(...questions);
      });
      if (allQuestions.length === 0) {
        alert('No questions found. Please ensure exam parts and questions are loaded.');
        setIsSubmitting(false);
        return;
      }

      console.log(`Saving scores for ${allQuestions.length} questions...`);
      
      const markingPromises = allQuestions.map(async (question) => {
        const questionId = question.id;
        const score = questionScores[questionId] || 0; 
        const existingMarkingId = markingIds[questionId];
        
        try {
          let result;
          if (existingMarkingId) {
            const updateData = {
              score: parseFloat(score) || 0,
              note: feedback || ''
            };
            console.log(`Updating marking ${existingMarkingId} for question ${questionId}:`, updateData);
            result = await markingService.updateMarking(existingMarkingId, updateData);
            console.log(`Marking updated successfully for question ${questionId}:`, result);
          } else {
            const markingData = {
              assignmentId: assignment.id || assignment.assignmentId,
              questionId: questionId,
              score: parseFloat(score) || 0,
              note: feedback || ''
            };
            console.log(`Creating new marking for question ${questionId}:`, markingData);
            result = await markingService.createMarking(markingData);
            console.log(`Marking created successfully for question ${questionId}:`, result);
          }
          
          return { questionId, success: true, score, markingId: result?.id || existingMarkingId };
        } catch (err) {
          console.error(`Error saving marking for question ${questionId}:`, err);
          return { questionId, success: false, error: err.message || 'Unknown error' };
        }
      });

      const results = await Promise.all(markingPromises);
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        alert(`Failed to save scores for ${failed.length} question(s). Please try again.`);
        setIsSubmitting(false);
        return;
      }
      const newMarkingIds = { ...markingIds };
      results.forEach(result => {
        if (result.success && result.markingId) {
          newMarkingIds[result.questionId] = result.markingId;
        }
      });
      setMarkingIds(newMarkingIds);

      if (assignment.solutionId && grade) {
        try {
          if (finalScoreId) {
            const updateData = {
              id: finalScoreId,
              solutionId: assignment.solutionId,
              totalScore: parseFloat(grade) || 0
            };
            console.log(`Updating final score ${finalScoreId}:`, updateData);
            await finalscoreService.updateFinalScore(finalScoreId, updateData);
            console.log('Final score updated successfully');
          } else {
            console.log('Creating new final score:', {
              solutionId: assignment.solutionId,
              totalScore: parseFloat(grade) || 0
            });
            const result = await finalscoreService.createFinalScore({
              solutionId: assignment.solutionId,
              totalScore: parseFloat(grade) || 0
            });
            console.log('Final score created successfully:', result);
            if (result?.id) {
              setFinalScoreId(result.id);
            }
          }
          
          if (assignment.id || assignment.assignmentId) {
            try {
              await assignmentService.updateAssignment(assignment.id || assignment.assignmentId, {
                status: 1, 
                isSubmitted: true,
                submittedAt: new Date().toISOString()
              });
              console.log('Assignment status updated to InProgress after grading');
            } catch (statusErr) {
              console.warn('Failed to update assignment status to InProgress:', statusErr);
            }
          }
        } catch (err) {
          console.error('Error saving final score:', err);
        }
      }
      alert('Grade saved successfully!');
      navigate(-1); 
    } catch (err) {
      console.error('Error saving grades:', err);
      alert('Failed to save grades. Please try again.');
      setIsSubmitting(false);
    }
  };


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
                <ArrowLeftOutlined className="text-xl" />
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
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SolutionViewer
              solution={solution}
              assignment={assignment}
              loadingSolution={loadingSolution}
              onDownload={handleDownloadSolution}
            />            <div>
              <ExamPartsSection
                examId={examId}
                parts={parts}
                loadingParts={loadingParts}
                partsError={partsError}
                partQuestions={partQuestions}
                loadingQuestions={loadingQuestions}
                expandedParts={expandedParts}
                onTogglePart={(partId) => setExpandedParts(prev => ({
                  ...prev,
                  [partId]: !prev[partId]
                }))}
                questionScores={questionScores}
                onScoreChange={handleQuestionScoreChange}
              />

              <GradingForm
                assignment={assignment}
                grade={grade}
                feedback={feedback}
                isSubmitting={isSubmitting}
                onGradeChange={setGrade}
                onFeedbackChange={setFeedback}
                onSubmit={handleSubmit}
                onCancel={() => navigate(-1)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingPage;


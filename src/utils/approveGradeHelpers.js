import { assignmentService } from '../services';

export const approveGrade = async (assignment, examId) => {
  // Get totalScore from assignment 
  const totalScore = assignment.totalScore !== null && assignment.totalScore !== undefined 
    ? assignment.totalScore 
    : assignment.totalscore !== null && assignment.totalscore !== undefined
    ? assignment.totalscore
    : 0;
  if (!assignment.solutionId) {
    throw new Error('Solution ID is missing. Cannot approve grade.');
  }

  if (!assignment.id) {
    throw new Error('Assignment ID is missing. Cannot approve grade.');
  }
  // Check if assignment has been graded 
  if (totalScore === 0 || totalScore === null || totalScore === undefined) {
    throw new Error('Assignment has not been graded yet. Please grade the assignment first before approving.');
  }
  // Submit assignment using the submit API endpoint only (backend will handle locking the score)
  try {
    await assignmentService.submitAssignment(assignment.id);
    console.log('Assignment submitted successfully via submit API');
    
    // Wait a bit to ensure the submission is processed on the backend
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (submitErr) {
    console.error('Failed to submit assignment:', submitErr);
    
    // Parse error message to show user-friendly message
    let submitErrorMessage = 'Failed to submit assignment. Please try again.';
    if (submitErr?.message) {
      try {
        const errorJson = JSON.parse(submitErr.message);
        if (errorJson?.error?.details) {
          submitErrorMessage = errorJson.error.details;
        } else if (errorJson?.error?.title) {
          submitErrorMessage = errorJson.error.title;
        }
      } catch (e) {
        if (submitErr.message) {
          submitErrorMessage = submitErr.message;
        }
      }
    }
    
    throw new Error(submitErrorMessage);
  }

  // No additional API calls; rely solely on submit endpoint as requested
};

export const parseErrorMessage = (err) => {
  let errorMessage = 'Failed to approve grade. Please try again.';
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
  return errorMessage;
};


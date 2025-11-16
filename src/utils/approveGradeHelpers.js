import { assignmentService, finalscoreService } from '../services';

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
  // Ensure finalscore exists before submitting
  // Try to create final score, but don't fail if it already exists or if there's an error
  // The approveFinalScore API may handle creation automatically
  try {
    await finalscoreService.createFinalScore({
      solutionId: assignment.solutionId,
      totalScore: totalScore
      // Don't set approvedAt, will be set when approving
    });
    console.log('Final score created/updated before approval');
  } catch (finalscoreErr) {
    // Log warning but continue - final score might already exist or will be created by approveFinalScore
    console.warn('Failed to create/update final score (this is OK if it already exists):', finalscoreErr?.message || finalscoreErr);
    // Check if it's a 500 error (server error) or 400 (might already exist)
    if (finalscoreErr?.response?.status === 500) {
      console.warn('Server error creating final score - will try to proceed with approval (final score may be created by approveFinalScore API)');
    } else if (finalscoreErr?.response?.status === 400 || finalscoreErr?.response?.status === 409) {
      console.log('Final score may already exist or have validation error - continuing with approval');
    }
    // Continue anyway - approveFinalScore might handle it
  }

  // Submit assignment using the submit API endpoint
  // This will set isSubmitted: true and submittedAt automatically
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

  try {
    await finalscoreService.approveFinalScore({
      solutionId: assignment.solutionId,
      assignmentId: assignment.id,
      totalScore: totalScore
    });
    console.log('Final score approved successfully via approveFinalScore API');
  } catch (approveErr) {
    console.error('Failed to approve final score:', approveErr);
    let approveErrorMessage = 'Failed to approve final score. Please try again.';
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
    
    throw new Error(approveErrorMessage);
  }
  try {
    await assignmentService.updateAssignment(assignment.id, {
      status: 2 
    });
    console.log('Assignment status updated to Completed');
  } catch (updateErr) {
    console.warn('Failed to update assignment status (but approval was successful):', updateErr);
  }
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


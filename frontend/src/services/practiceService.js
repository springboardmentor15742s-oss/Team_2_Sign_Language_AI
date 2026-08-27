import apiClient from './apiClient';

export const practiceService = {
  startSession: ({
    lessonId = null,
    targetGesture = null,
  } = {}) => {
    return apiClient.post(
      '/practice/sessions',
      {
        lesson_id: lessonId,
        target_gesture: targetGesture,
      }
    );
  },

  finishSession: (
    sessionId,
    {
      durationSeconds = 0,
      averageConfidence = 0,
      attempts = 0,
      successfulAttempts = 0,
      detections = [],
    }
  ) => {
    return apiClient.patch(
      `/practice/sessions/${sessionId}`,
      {
        duration_seconds: durationSeconds,
        average_confidence: averageConfidence,
        attempts,
        successful_attempts:
          successfulAttempts,
        detections,
      }
    );
  },

  getHistory: () => {
    return apiClient.get(
      '/practice/sessions'
    );
  },
};

export default practiceService;
import apiClient from './apiClient';


export const mlService = {

  // Generate personalized learning plan
  generateLearningPlan: async ({
    accuracy,
    weakSigns,
    strongSigns,
    totalAttempts,
  }) => {
    return apiClient.post('/ml/learning-plan', {
      accuracy,
      weak_signs: weakSigns,
      strong_signs: strongSigns,
      total_attempts: totalAttempts,
    });
  },


  // Send sign image to trained ML model
  predictSign: async (imageFile) => {
    const formData = new FormData();

    formData.append('file', imageFile);

    return apiClient.post(
      '/ml/predict',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

};
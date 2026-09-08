import apiClient from './apiClient';

const certificateService = {
  async getCertificates() {
    const response = await apiClient.get('/certificates');
    return response.data;
  },

  async getCertificate(id) {
    const response = await apiClient.get(`/certificates/${id}`);
    return response.data;
  },

  async generateCertificate(courseId) {
    const response = await apiClient.post(
      `/certificates/course/${courseId}/generate`
    );
    return response.data;
  },
};

export default certificateService;

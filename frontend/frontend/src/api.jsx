import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://3fb8-2401-4900-1c31-1fac-d8ff-87b1-7ad3-e997.ngrok-free.app';

export const uploadVideo = async (formData) => {
  const response = await axios.post(`${backendUrl}/api/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      
      
    },
  });
  return response.data;
};

export const getVideos = async () => {
  const response = await axios.get(`${backendUrl}/api/videos`);
  return response.data;
};
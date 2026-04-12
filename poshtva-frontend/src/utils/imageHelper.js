export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${API_URL}${url}`;
};

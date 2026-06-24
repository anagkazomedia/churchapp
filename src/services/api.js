import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.anagkazoeaglesfellowship.org/',
});

api.interceptors.request.use(config => {
  console.log("Requesting URL:", config.baseURL + config.url);
  return config;
});

export default api;
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.AUTH_SERVICE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;
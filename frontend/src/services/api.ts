import axios from 'axios';

const axiosAuthInstance = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_LEAVE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (request) => {
    const token = localStorage.getItem('token')
    if(token){
      request.headers.Authorization = `Bearer ${token}`
    }

    return request
  }
)

axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if(!error.response){
      return Promise.reject('Network Error')
    }

    if(error.response.status === 401 && error.response.data.message === 'Unauthorized'){
      localStorage.removeItem('token')
      window.location.href = "/";
    }

    return Promise.reject(error.response.data.message)
  }
)

axiosAuthInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if(!error.response){
      return Promise.reject('Network Error')
    }

    return Promise.reject(error.response.data.message)
  }
)

export {axiosAuthInstance, axiosInstance}
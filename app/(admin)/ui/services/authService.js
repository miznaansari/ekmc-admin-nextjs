
import axios from 'axios';

const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;


const login = async (credentials) => {
  return axios.post(`${baseUrl}/api/v2/admin/login-password`, credentials);
};

const generateOTP = async (mobileNumber,user_role_id) => {
  return axios.post(`${baseUrl}/api/v2/admin/gen-otp`, { mobile_number: mobileNumber,user_role_id:user_role_id });
};

const verifyOTP = async (data) => {
  return axios.post(`${baseUrl}/api/v2/admin/verify-otp`, data);
};

const resetPassword = async (data) => {
  return axios.put(`${baseUrl}/api/v2/admin/reset-password`, data);
};

export default {
  login,
  generateOTP,
  verifyOTP,
  resetPassword,
};

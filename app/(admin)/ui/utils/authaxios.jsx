import axios from "axios";

export default function instanceV1(token) {
  return axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_BACKEND_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
}

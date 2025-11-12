import axios from "axios";

const apiBaseURL = import.meta.env?.VITE_API_BASE_URL;

const axiosClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
// lấy token
axiosClient.interceptors.request.use(
  (config) => { 
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log("✅ Token attached:", token);
    }
    console.log(config);
    return config;
  },
  (err) => Promise.reject(err)
);

axiosClient.interceptors.response.use(
  (response) => {
    console.log(response);
    return response;
  },
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default axiosClient;

// interceptors : Là 1 cơ chế cho phép bạn đón hoặc chặn các yêu cầu hoặc phản hồi

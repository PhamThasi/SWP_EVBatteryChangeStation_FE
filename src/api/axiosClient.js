import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5204/api",
  headers: {
    "Content-Type": "application/json",
  },
});
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

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  throw new Error(
    "VITE_API_BASE_URL is not configured. Please add it to the frontend .env file."
  );
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// Attach JWT
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("scj_token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses/errors
const MAX_RETRIES = 1;

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const { config, response } = error;

    // Unauthorized
    if (response?.status === 401) {
      localStorage.removeItem("scj_token");
      localStorage.removeItem("scj_user");

      window.dispatchEvent(
        new CustomEvent("scj:unauthorized")
      );
    }

    // Retry GET requests once on network/5xx errors
    const isNetworkOrServerError =
      !response || response.status >= 500;

    const isGetRequest =
      config?.method?.toLowerCase() === "get";

    const retryCount = config?._retryCount || 0;

    if (
      config &&
      isNetworkOrServerError &&
      isGetRequest &&
      retryCount < MAX_RETRIES
    ) {
      config._retryCount = retryCount + 1;

      await new Promise((resolve) =>
        setTimeout(resolve, 600)
      );

      return axiosInstance(config);
    }

    const message =
      response?.data?.message ||
      response?.data?.error ||
      error.message ||
      "Something went wrong. Please try again.";

    return Promise.reject({
      ...error,
      friendlyMessage: message,
    });
  }
);

export default axiosInstance;
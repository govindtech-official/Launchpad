import axiosInstance from "./axiosInstance";

export const apiGet = async (url, customHeaders = {}) => {
  try {
    const response = await axiosInstance.get(url, {
      customHeaders,
    });
    return response.data;
  } catch (error) {
    console.error("GET request error:", error);
    throw error;
  }
};

export const apiPost = async (url, data = {}, customHeaders = {}) => {
  try {
    const response = await axiosInstance.post(url, data, { customHeaders });
    return response.data;
  } catch (error) {
    console.error(
      error?.response?.data?.message || error?.response?.data?.error || "An error occurred"
    );
    throw error;
  }
};

export const apiPut = async (url, data = {}, customHeaders = {}) => {
  try {
    const response = await axiosInstance.put(url, data, { customHeaders });
    return response.data;
  } catch (error) {
    console.error("PUT request error:", error);
    throw error;
  }
};

export const apiPatch = async (url, data = {}, customHeaders = {}) => {
  try {
    const response = await axiosInstance.patch(url, data, { customHeaders });
    return response.data;
  } catch (error) {
    console.error("PATCH request error:", error);
    throw error;
  }
};

export const apiDelete = async (url, data = {}, customHeaders = {}) => {
  try {
    const response = await axiosInstance.delete(url, {
      data,
      customHeaders,
    });
    return response.data;
  } catch (error) {
    console.error("DELETE request error:", error);
    throw error;
  }
};

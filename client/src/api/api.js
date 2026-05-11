import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Unexpected error"
  );
};

export const authApi = {
  getUser: async () => {
    const response = await apiClient.get("/user/data");
    return response.data;
  },
  login: async (values) => {
    const response = await apiClient.post("/user/login", values);
    return response.data;
  },
  register: async (values) => {
    const response = await apiClient.post("/user/register", values);
    return response.data;
  },
};

export const chatApi = {
  getChats: async () => {
    const response = await apiClient.get("/chat/get");
    return response.data;
  },
  createChat: async (title) => {
    const response = await apiClient.post("/chat/create", { title });
    return response.data;
  },
  deleteChat: async (chatId) => {
    const response = await apiClient.post(`/chat/delete/${chatId}`);
    return response.data;
  },
};

export const messageApi = {
  getMessages: async (chatId) => {
    const response = await apiClient.get(`/message/get/${chatId}`);
    return response.data;
  },
  sendMessage: async (payload) => {
    const response = await apiClient.post("/message/send", payload);
    return response.data;
  },
  uploadPdf: async (formData) => {
    const response = await apiClient.post("/message/upload-pdf", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  sendEmail: async (payload) => {
    const response = await apiClient.post("/message/send-email", payload);
    return response.data;
  },
};

export const apiUtils = {
  getErrorMessage,
};

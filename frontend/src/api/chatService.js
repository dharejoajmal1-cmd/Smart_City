import axiosInstance from "./axiosInstance";

// Real backend AI chat service
const chatService = {
  // POST /api/chat
  sendMessage: (prompt) =>
    axiosInstance.post("/chat", { prompt }),

  // GET /api/chat/history
  getHistory: (page = 1, limit = 50) =>
    axiosInstance.get("/chat/history", {
      params: { page, limit },
    }),
};

export default chatService;
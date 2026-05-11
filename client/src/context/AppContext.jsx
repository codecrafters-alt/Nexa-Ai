import { createContext, useContext, useEffect, useState } from "react";
import { authApi, chatApi } from "../api/api";

const AppContext = createContext();
export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingChats, setLoadingChats] = useState(false);
  const [authError, setAuthError] = useState(null);

  const fetchUserData = async () => {
    setLoadingUser(true);
    try {
      const response = await authApi.getUser();
      setUser(response.user);
      setAuthError(null);
    } catch (error) {
      setUser(null);
      setAuthError(null);
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchChats = async () => {
    if (!user) {
      setChats([]);
      setSelectedChat(null);
      return;
    }

    setLoadingChats(true);
    try {
      const response = await chatApi.getChats();
      const data = response.data || [];
      setChats(data);
      if (!selectedChat && data.length > 0) {
        setSelectedChat(data[0]);
      }
    } catch (error) {
      console.error("Fetch chats failed", error);
    } finally {
      setLoadingChats(false);
    }
  };

  const login = async (values) => {
    const response = await authApi.login(values);
    setUser(response.user);
    await fetchChats();
    return response.user;
  };

  const register = async (values) => {
    const response = await authApi.register(values);
    setUser(response.user);
    await fetchChats();
    return response.user;
  };

  const createNewChat = async () => {
    try {
      const response = await chatApi.createChat("New Chat");
      const newChat = response.data;
      setChats((prev) => [newChat, ...prev]);
      setSelectedChat(newChat);
    } catch (error) {
      console.error("Create new chat failed", error);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await chatApi.deleteChat(chatId);
      setChats((prev) => prev.filter((chat) => chat._id !== chatId));
      if (selectedChat?._id === chatId) {
        setSelectedChat(null);
      }
    } catch (error) {
      console.error("Delete chat failed", error);
    }
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      fetchChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const value = {
    user,
    chats,
    selectedChat,
    theme,
    loadingUser,
    loadingChats,
    authError,
    setUser,
    setChats,
    setSelectedChat,
    setTheme,
    login,
    register,
    createNewChat,
    deleteChat,
    fetchChats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from './AuthContext';
import { io } from 'socket.io-client';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  // Verbindung mit Socket.IO herstellen
  useEffect(() => {
    if (user?.token) {
      const newSocket = io('http://localhost:5000', {
        auth: { token: user.token },
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Sauber disconnecten
      return () => {
        newSocket.disconnect();
        socketRef.current = null;
        setSocket(null);
        setMessages([]);
        setCurrentChatId(null);
      };
    }
  }, [user]);

  // Neue Nachrichten empfangen
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const handleReceive = (message) => {
      setMessages(prev => [...prev, message]);
    };

    s.on('receiveMessage', handleReceive);

    return () => {
      s.off('receiveMessage', handleReceive);
    };
  }, [socketRef.current]);

  // Funktionen zum Chatmanagement
  const joinChat = (chatId) => {
    if (socketRef.current && chatId) {
      socketRef.current.emit('joinChat', chatId);
      setCurrentChatId(chatId);
      setMessages([]); // Optional: Nachrichten neu laden
    }
  };

  const leaveChat = (chatId) => {
    if (socketRef.current && chatId) {
      socketRef.current.emit('leaveChat', chatId);
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  const sendMessage = (chatId, senderId, text) => {
    if (socketRef.current && text.trim()) {
      socketRef.current.emit('sendMessage', { chatId, senderId, text });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        socket,
        chats,
        setChats,
        currentChatId,
        setCurrentChatId,
        messages,
        setMessages,
        joinChat,
        leaveChat,
        sendMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}

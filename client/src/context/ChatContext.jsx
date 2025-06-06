import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from './AuthContext';
import { io } from 'socket.io-client';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]); // Liste aller Chats
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]); // Aktuelle Chatnachrichten

  const socketRef = useRef();

  useEffect(() => {
    if (user?.token) {
      // Socket mit Server verbinden
      const newSocket = io('http://localhost:5000', {
        auth: { token: user.token }
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Verbindung beendet
      return () => newSocket.disconnect();
    }
  }, [user]);

  // Chat betreten
  const joinChat = (chatId) => {
    if (socketRef.current && chatId) {
      socketRef.current.emit('joinChat', chatId);
      setCurrentChatId(chatId);
    }
  };

  // Chat verlassen
  const leaveChat = (chatId) => {
    if (socketRef.current && chatId) {
      socketRef.current.emit('leaveChat', chatId);
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  // Nachricht senden
  const sendMessage = (chatId, senderId, text) => {
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', { chatId, senderId, text });
    }
  };

  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on('receiveMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socketRef.current.off('receiveMessage');
    };
  }, [socketRef.current]);

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

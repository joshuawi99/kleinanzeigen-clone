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
  const [unreadChats, setUnreadChats] = useState({});
  const socketRef = useRef(null);

  // Verbindung mit Socket.IO
  useEffect(() => {
    if (user?.token) {
      const newSocket = io('http://localhost:5000', {
        auth: { token: user.token },
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        socketRef.current = null;
        setSocket(null);
        setMessages([]);
        setCurrentChatId(null);
      };
    }
  }, [user]);

  // Socket-Events
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const handleReceive = (message) => {
      if (message.chatId === currentChatId) {
        setMessages(prev => [...prev, message]);
      } else {
        setUnreadChats(prev => ({
          ...prev,
          [message.chatId]: true
        }));
      }
    };

    const handleNewMessage = (message) => {
      if (
        message.to === user.id &&
        message.chatId !== currentChatId
      ) {
        setUnreadChats(prev => ({
          ...prev,
          [message.chatId]: true
        }));
      }
    };

    s.on('receiveMessage', handleReceive);
    s.on('newMessage', handleNewMessage);

    return () => {
      s.off('receiveMessage', handleReceive);
      s.off('newMessage', handleNewMessage);
    };
  }, [socketRef.current, currentChatId, user]);

  // Chat betreten & Verlauf laden
  const joinChat = async (chatId) => {
    if (!socketRef.current || !chatId || !user) return;

    socketRef.current.emit('joinChat', chatId);
    setCurrentChatId(chatId);
    setMessages([]);

    try {
      const res = await fetch(`http://localhost:5000/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
        setUnreadChats(prev => {
          const updated = { ...prev };
          delete updated[chatId]; // ✅ Als gelesen markieren
          return updated;
        });
      } else {
        console.error('Fehler beim Laden des Chatverlaufs:', data.error);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Nachrichten:', err);
    }
  };

  const leaveChat = (chatId) => {
    if (socketRef.current && chatId) {
      socketRef.current.emit('leaveChat', chatId);
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  // Nachricht senden
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
        sendMessage,
        unreadChats,
        setUnreadChats
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}

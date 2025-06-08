import { useState, useEffect, useRef, useContext } from 'react';
import { useChat } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';

export default function ChatRoom({ chatId }) {
  const { user } = useContext(AuthContext);
  const { socket, currentChatId } = useChat();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  // Bestehende Nachrichten laden
  useEffect(() => {
    if (!chatId || !user) return;

    fetch(`http://localhost:5000/api/chats/${chatId}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => setMessages(data.messages || []))
      .catch(console.error);
  }, [chatId, user]);

  // Auf neue Nachrichten hören
  useEffect(() => {
    if (!socket || !chatId) return;

    const handleMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    socket.on('receiveMessage', handleMessage);
    return () => socket.off('receiveMessage', handleMessage);
  }, [socket, chatId]);

  const handleSend = () => {
    if (!text.trim()) return;
    socket.emit('sendMessage', {
      chatId,
      senderId: user.id,
      text
    });
    setText('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.sender === user.id ? 'right' : 'left',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                background: msg.sender === user.id ? '#d1e7ff' : '#eee',
                padding: '0.5rem 1rem',
                borderRadius: '1rem',
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Nachricht eingeben..."
          className="border rounded p-2 flex-1"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Senden
        </button>
      </div>
    </div>
  );
}

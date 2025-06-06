import { useEffect, useState, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function ChatRoom({ chatId }) {
  const { user } = useContext(AuthContext);
  const { messages, setMessages, sendMessage } = useChat();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    fetch(`http://localhost:5000/api/chats/${chatId}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => setMessages(data.messages))
      .catch(console.error);
  }, [chatId, user, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() === '') return;
    sendMessage(chatId, user.id, input.trim());
    setInput('');
  };

  return (
    <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', height: '80vh' }}>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.senderId === user.id ? 'right' : 'left',
              marginBottom: '0.5rem',
            }}
          >
            <strong>{msg.senderId === user.id ? 'Ich' : msg.sender?.username || 'User'}</strong>: {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div>
        <input
          type="text"
          placeholder="Nachricht schreiben..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          style={{ width: '80%', padding: '0.5rem' }}
        />
        <button onClick={handleSend} style={{ padding: '0.5rem 1rem' }}>Senden</button>
      </div>
    </div>
  );
}

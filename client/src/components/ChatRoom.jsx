import { useState, useEffect, useRef, useContext } from 'react';
import { useChat } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';

export default function ChatRoom({ chatId }) {
  const { user } = useContext(AuthContext);
  const { currentChatId, messages, sendMessage } = useChat();

  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(currentChatId, user.id, text);
    setText('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentChatId) return (
    <div className="flex-1 p-4 flex items-center justify-center text-gray-500">
      Bitte wähle einen Chat aus.
    </div>
  );

  return (
    <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.senderId === user.id ? 'right' : 'left',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                background: msg.senderId === user.id ? '#d1e7ff' : '#eee',
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

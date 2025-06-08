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

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')} Uhr`;
  };

  if (!currentChatId) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center text-gray-500">
        Bitte wähle einen Chat aus.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 bg-gray-50">
      {/* Chatverlauf */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg, index) => {
          const isMe = msg.sender?._id === user.id || msg.senderId === user.id;
          const username = msg.sender?.username || (isMe ? 'Du' : 'Unbekannt');

          return (
            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-xs md:max-w-md space-y-1">
                {!isMe && (
                  <p className="text-xs text-gray-500 ml-1">{username}</p>
                )}
                <div
                  className={`px-4 py-2 rounded-xl ${
                    isMe ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.createdAt && (
                    <p className="text-xs text-gray-300 mt-1 text-right">
                      {formatTime(msg.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Eingabe */}
      <div className="flex gap-2 mt-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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

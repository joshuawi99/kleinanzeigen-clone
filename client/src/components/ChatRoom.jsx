import { useState, useEffect, useRef, useContext } from 'react';
import { useChat } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import UserRating from '../components/UserRating';

export default function ChatRoom({ chatId }) {
  const { user } = useContext(AuthContext);
  const { currentChatId, messages, sendMessage, chats } = useChat();
  const [text, setText] = useState('');
  const [hasRated, setHasRated] = useState(false);
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

  const chat = chats.find(c => c._id === currentChatId);
  const partner = chat?.participants.find(p => p._id !== user.id);

  return (
    <div className="flex-1 flex flex-col p-4 bg-gray-100">
      <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-1">
        {messages.map((msg, index) => {
          const isMe = msg.sender?._id === user.id || msg.senderId === user.id;
          const senderName = msg.sender?.firstName
            ? `${msg.sender.firstName} ${msg.sender.lastName}`
            : isMe ? 'Du' : 'Unbekannt';

          return (
            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} px-2`}>
              <div className="max-w-[75%]">
                {!isMe && (
                  <p className="text-xs text-gray-500 ml-1 mb-0.5">{senderName}</p>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl shadow-sm text-sm ${
                    isMe ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.createdAt && (
                    <p className="text-[10px] text-right mt-1 text-gray-400">
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

      {partner && !hasRated && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">
            Wie war dein Kontakt mit <strong>{partner.firstName} {partner.lastName}</strong>?
          </p>
          <UserRating userId={partner._id} onRated={() => setHasRated(true)} />
        </div>
      )}

      <div className="flex gap-2 mt-4 pt-2 border-t">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Nachricht eingeben..."
          className="border border-gray-300 rounded-full px-4 py-2 flex-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm transition"
        >
          Senden
        </button>
      </div>
    </div>
  );
}

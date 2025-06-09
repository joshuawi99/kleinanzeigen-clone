import { useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function ChatList({ onSelectChat }) {
  const { user } = useContext(AuthContext);
  const {
    chats,
    setChats,
    currentChatId,
    joinChat,
    leaveChat,
    unreadChats
  } = useChat();

  useEffect(() => {
    if (!user) return;

    fetch('http://localhost:5000/api/chats', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => setChats(data))
      .catch(console.error);
  }, [user, setChats]);

  const handleSelect = (chatId) => {
    if (currentChatId) leaveChat(currentChatId);
    joinChat(chatId);
    onSelectChat(chatId);
  };

  return (
    <div style={{ width: '300px', borderRight: '1px solid #ccc', padding: '1rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Chats</h2>

      {chats.length === 0 && <p>Keine Chats vorhanden</p>}

      <ul>
        {chats.map(chat => {
          const isActive = chat._id === currentChatId;
          const isUnread = unreadChats[chat._id];

          const partnerNames = chat.participants
            .filter(p => p._id !== user.id)
            .map(p => p.username)
            .join(', ');

          return (
            <li
              key={chat._id}
              style={{
                cursor: 'pointer',
                fontWeight: isUnread || isActive ? 'bold' : 'normal',
                backgroundColor: isActive ? '#eef6ff' : 'transparent',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.25rem'
              }}
              onClick={() => handleSelect(chat._id)}
            >
              <span>{partnerNames}</span>
              {isUnread && (
                <span
                  aria-label="Ungelesene Nachricht"
                  title="Neue Nachricht"
                  style={{ color: 'blue', fontSize: '1.2rem' }}
                >
                  🔵
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import { useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function ChatList({ onSelectChat }) {
  const { user } = useContext(AuthContext);
  const { chats, setChats, currentChatId, joinChat, leaveChat } = useChat();

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
      <h2>Chats</h2>
      {chats.length === 0 && <p>Keine Chats vorhanden</p>}
      <ul>
        {chats.map(chat => (
          <li
            key={chat._id}
            style={{
              cursor: 'pointer',
              fontWeight: chat._id === currentChatId ? 'bold' : 'normal',
              marginBottom: '0.5rem'
            }}
            onClick={() => handleSelect(chat._id)}
          >
            {chat.participants
              .filter(p => p._id !== user.id)
              .map(p => p.username)
              .join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
}

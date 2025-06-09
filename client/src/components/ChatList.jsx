import { useEffect, useContext } from 'react';
import { useChat } from '../context/ChatContext';
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
      .then(data => {
        if (Array.isArray(data)) {
          setChats(data);
        } else {
          console.warn('Chats ist kein Array:', data);
          setChats([]);
        }
      })
      .catch(err => {
        console.error('Fehler beim Laden der Chats:', err);
        setChats([]);
      });
  }, [user, setChats]);

  const handleSelect = (chatId) => {
    if (currentChatId) leaveChat(currentChatId);
    joinChat(chatId);
    onSelectChat(chatId);
  };

  const handleDelete = (chatId) => {
    if (!window.confirm('Diesen Chat wirklich löschen?')) return;

    fetch(`http://localhost:5000/api/chats/${chatId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then(res => res.json())
      .then(() => {
        setChats(prev => prev.filter(c => c._id !== chatId));
      })
      .catch(err => {
        console.error('Fehler beim Löschen des Chats:', err);
      });
  };

  if (!Array.isArray(chats)) {
    return <p className="text-center text-red-500">Fehler beim Laden der Chats.</p>;
  }

  return (
    <div className="w-[300px] border-r border-gray-200 p-4">
      <h2 className="text-xl font-bold mb-4">Chats</h2>

      {chats.length === 0 && <p>Keine Chats vorhanden</p>}

      <ul className="space-y-1">
        {chats.map(chat => {
          const isActive = chat._id === currentChatId;
          const isUnread = unreadChats[chat._id];

          const partnerNames = chat.participants
            .filter(p => p._id !== user.id)
            .map(p => `${p.firstName} ${p.lastName}`)
            .join(', ');

          return (
            <li
              key={chat._id}
              className={`
                cursor-pointer px-3 py-2 rounded-md flex justify-between items-center
                transition
                ${isActive ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'}
              `}
            >
              <span
                onClick={() => handleSelect(chat._id)}
                className="flex-1 truncate"
              >
                {partnerNames}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(chat._id);
                }}
                title="Chat löschen"
                className="text-red-500 hover:text-red-700 ml-2 text-sm"
              >
                ✖
              </button>

              {isUnread && (
                <span
                  aria-label="Ungelesene Nachricht"
                  title="Neue Nachricht"
                  className="text-blue-600 text-sm ml-2"
                >
                  ●
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

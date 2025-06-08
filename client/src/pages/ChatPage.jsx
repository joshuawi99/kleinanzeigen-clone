import { useState } from 'react';
import ChatList from '../components/ChatList';
import ChatRoom from '../components/ChatRoom';

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <ChatList onSelectChat={setSelectedChat} />
      {selectedChat ? (
        <ChatRoom chatId={selectedChat} />
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Wähle einen Chat aus</p>
        </div>
      )}
    </div>
  );
}

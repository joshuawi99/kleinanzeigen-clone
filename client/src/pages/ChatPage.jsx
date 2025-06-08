import { useParams } from 'react-router-dom';
import ChatList from '../components/ChatList';
import ChatRoom from '../components/ChatRoom';
import { useEffect } from 'react';
import { useChat } from '../context/ChatContext';

export default function ChatPage() {
  const { chatId } = useParams();
  const { joinChat, currentChatId } = useChat();

  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      joinChat(chatId);
    }
  }, [chatId, joinChat, currentChatId]);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <ChatList onSelectChat={() => {}} />
      <ChatRoom chatId={chatId} />
    </div>
  );
}

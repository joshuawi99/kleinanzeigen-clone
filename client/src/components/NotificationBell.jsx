import { useChat } from '../context/ChatContext';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
  const { hasUnreadMessages } = useChat();

  return (
    <Link to="/chat" className="relative inline-block">
      {/* Glocken-Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {/* Roter Punkt mit Animation */}
      {hasUnreadMessages && (
        <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-red-600 animate-ping z-10" />
      )}
      {hasUnreadMessages && (
        <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-600 z-20" />
      )}
    </Link>
  );
}

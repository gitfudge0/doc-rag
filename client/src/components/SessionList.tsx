import React from 'react';
import { Session } from '../types';
import { Button } from './ui';

interface SessionListProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onClearSession: (sessionId: string) => void;
}

const SessionList: React.FC<SessionListProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onClearSession
}) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button 
          onClick={onNewSession}
          className="btn btn-primary"
        >
          New Chat
        </button>
      </div>
      
      <div className="sidebar-content">
        {sessions.length === 0 ? (
          <div className="p-4 text-sm text-center" style={{ color: 'var(--color-gray-500)' }}>
            No previous chats
          </div>
        ) : (
          <ul className="session-list">
            {sessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const firstMessage = session.messages.find(m => m.role === 'user')?.content || '';
              const title = session.title || firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : '');
              
              return (
                <li key={session.id} className="session-item">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <button
                      className={`session-btn ${isActive ? 'active' : ''}`}
                      onClick={() => onSelectSession(session.id)}
                    >
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {title}
                      </div>
                    </button>
                    {isActive && (
                      <button
                        className="session-btn"
                        style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                        onClick={() => onClearSession(session.id)}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SessionList;
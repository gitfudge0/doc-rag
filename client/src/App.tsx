import { useState, useEffect } from 'react';
import Header from './components/Header';
import SessionList from './components/SessionList';
import ChatWindow from './components/ChatWindow';
import { sendMessage, clearSession as clearApiSession } from './api';
import { loadSessions, saveSession } from './utils/storage';
import { Session, ChatMessage } from './types';

function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load sessions from local storage on initial load
  useEffect(() => {
    const savedSessions = loadSessions();
    setSessions(savedSessions);
    
    // Set current session to the most recent one if it exists
    if (savedSessions.length > 0) {
      setCurrentSessionId(savedSessions[0].id);
    } else {
      // Create a new session if none exist
      createNewSession();
    }
  }, []);

  const createNewSession = () => {
    // Using a temporary ID until we get the server-provided session ID
    const tempId = `temp-${crypto.randomUUID()}`;
    const newSession: Session = {
      id: tempId,
      title: `Chat ${sessions.length + 1}`,
      created: Date.now(),
      messages: []
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(tempId);
    saveSession(newSession);
  };

  const getCurrentSession = () => {
    return sessions.find(s => s.id === currentSessionId) || null;
  };

  const updateCurrentSession = (updatedMessages: ChatMessage[]) => {
    const current = getCurrentSession();
    if (current) {
      const updatedSession = {
        ...current,
        messages: updatedMessages
      };
      
      setSessions(prev => 
        prev.map(s => s.id === current.id ? updatedSession : s)
      );
      
      saveSession(updatedSession);
    }
  };

  const handleSendMessage = async (content: string) => {
    const current = getCurrentSession();
    if (!current) return;
    
    // Create user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now()
    };
    
    // Update UI with user message immediately
    const updatedMessages = [...current.messages, userMessage];
    updateCurrentSession(updatedMessages);
    
    const isFirstMessage = current.messages.length === 0;
    const sessionId = current.id.startsWith('temp-') ? undefined : current.id;
    
    // Send to API and get response
    setIsLoading(true);
    try {
      const response = await sendMessage(content, sessionId);
      
      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.response,
        sources: response.sources,
        timestamp: Date.now()
      };
      
      // If this is the first message, update the session ID with the one from the server
      if (isFirstMessage || current.id.startsWith('temp-')) {
        const serverSessionId = response.session_id;
        
        // Update current session with server-provided ID
        const updatedSession = {
          ...current,
          id: serverSessionId,
          messages: [...updatedMessages, assistantMessage]
        };
        
        // Update sessions state
        setSessions(prev => 
          prev.map(s => s.id === current.id ? updatedSession : s)
        );
        
        // Update current session ID
        setCurrentSessionId(serverSessionId);
        
        // Save updated session
        saveSession(updatedSession);
      } else {
        // Just update messages for existing session
        updateCurrentSession([...updatedMessages, assistantMessage]);
      }
      
    } catch (error) {
      console.error('Error getting response:', error);
      
      // Create error message
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: Date.now()
      };
      
      updateCurrentSession([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSession = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    // Skip API call if using a temporary session ID (not yet sent to server)
    if (!sessionId.startsWith('temp-')) {
      try {
        // Clear the API session
        await clearApiSession(sessionId);
      } catch (error) {
        console.error('Error clearing session:', error);
        alert('Failed to clear session');
        return;
      }
    }
    
    // Clear the messages in the UI
    const clearedSession = {
      ...session,
      messages: []
    };
    
    setSessions(prev => 
      prev.map(s => s.id === sessionId ? clearedSession : s)
    );
    
    saveSession(clearedSession);
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  // Get current session and its messages
  const currentSession = getCurrentSession();
  const currentMessages = currentSession?.messages || [];

  return (
    <div className="app-container">
      <Header />
      
      <div className="main-container">
        {/* Left Sidebar - Session History */}
        <div className="sidebar">
          <SessionList 
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={handleSelectSession}
            onNewSession={createNewSession}
            onClearSession={handleClearSession}
          />
        </div>
        
        {/* Main Chat Window */}
        <div className="chat-container">
          <ChatWindow 
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

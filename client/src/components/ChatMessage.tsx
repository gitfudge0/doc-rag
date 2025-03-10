import React, { useRef, useState, useEffect } from 'react';
import { ChatMessage as ChatMessageType, Source } from '../types';

// Initialize speech synthesis voice loading - this is a workaround for Chrome
let voicesLoaded = false;
let availableVoices: SpeechSynthesisVoice[] = [];

const loadVoices = () => {
  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
    if (voicesLoaded) {
      resolve(availableVoices);
      return;
    }

    // Get the voices immediately if they're already loaded
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      availableVoices = voices;
      voicesLoaded = true;
      resolve(voices);
      return;
    }

    // Otherwise wait for them to load
    const voicesChangedHandler = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        availableVoices = voices;
        voicesLoaded = true;
        resolve(voices);
        window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
    
    // Fallback - if voices don't load after 2 seconds, resolve with whatever is available
    setTimeout(() => {
      if (!voicesLoaded) {
        const voices = window.speechSynthesis.getVoices();
        availableVoices = voices;
        voicesLoaded = true;
        resolve(voices);
        window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
      }
    }, 2000);
  });
};

const SourcesDisplay = ({ sources }: { sources: Source[] }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="sources-container">
      <h4 className="sources-title">Sources:</h4>
      <ul className="sources-list">
        {sources.map((source, index) => (
          <li key={index} className="source-item">
            <span style={{ display: 'inline-block', width: '1rem', flexShrink: 0 }}>{index + 1}.</span>
            <span>
              <span style={{ fontWeight: 500 }}>{source.title}</span>
              {source.article_number && <span> (Article {source.article_number})</span>}
              <span style={{ marginLeft: '0.25rem', color: 'var(--color-gray-400)' }}>
                ({Math.round(source.relevance_score * 100)}% match)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ChatMessage = ({ message }: { message: ChatMessageType }) => {
  const isUser = message.role === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize voices when component mounts
  useEffect(() => {
    const initVoices = async () => {
      const loadedVoices = await loadVoices();
      setVoices(loadedVoices);
    };
    
    initVoices();
    
    // Cleanup speech synthesis when component unmounts
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakMessage = async () => {
    // First cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Toggle off if already speaking
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    
    // Create a new utterance with the message content
    const utterance = new SpeechSynthesisUtterance(message.content);
    speechSynthRef.current = utterance;

    // Make sure voices are loaded
    let currentVoices = voices;
    if (currentVoices.length === 0) {
      currentVoices = await loadVoices();
      setVoices(currentVoices);
    }
    
    // Choose appropriate voices based on message role
    if (currentVoices.length > 0) {
      const femaleVoice = currentVoices.find(
        voice => voice.name.includes('Female') || 
                 voice.name.includes('Google UK English Female') ||
                 voice.name.includes('Samantha')
      );
      
      const maleVoice = currentVoices.find(
        voice => voice.name.includes('Male') || 
                 voice.name.includes('Google UK English Male') ||
                 voice.name.includes('Daniel')
      );
      
      // Assign the appropriate voice
      if (isUser && maleVoice) {
        utterance.voice = maleVoice;
      } else if (!isUser && femaleVoice) {
        utterance.voice = femaleVoice;
      }
    }
    
    // Set event handlers
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = () => {
      console.error('Speech synthesis error occurred');
      setIsSpeaking(false);
    };
    
    // Start speaking
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`message ${isUser ? 'user' : 'ai'}`}>
      {!isUser && (
        <div className="avatar ai">
          AI
        </div>
      )}
      
      <div className="message-content">
        <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
        {!isUser && message.sources && message.sources.length > 0 && (
          <SourcesDisplay sources={message.sources} />
        )}
        <button 
          onClick={speakMessage}
          className={`btn-icon text-to-speech-btn ${isSpeaking ? 'speaking' : ''}`}
          title={isSpeaking ? 'Stop speaking' : 'Listen to this message'}
        >
          {isSpeaking ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
              <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
              <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8A3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7.22 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.587-1.95a.5.5 0 0 1 .305-.1z"/>
            </svg>
          )}
        </button>
      </div>
      
      {isUser && (
        <div className="avatar user">
          You
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
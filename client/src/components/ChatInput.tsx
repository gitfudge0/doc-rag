import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAudioAvailable, setIsAudioAvailable] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  // WebRTC references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Other refs
  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isRecordingRef = useRef(false);

  // Check if audio recording is available on component mount
  useEffect(() => {
    checkAudioAvailability();
  }, []);
  
  const checkAudioAvailability = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsAudioAvailable(false);
        setErrorMessage('Your browser does not support audio recording.');
        return;
      }
      
      // Try to get audio permissions (will prompt the user)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop all tracks after test
      setIsAudioAvailable(true);
      setErrorMessage('');
    } catch (err) {
      console.error('Error checking audio availability:', err);
      setIsAudioAvailable(false);
      setErrorMessage('Microphone access was denied or is not available.');
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  // Keep the ref in sync with the state
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const startRecording = async () => {
    try {
      // Reset error message
      setErrorMessage('');
      
      // Reset any audio chunks from previous recordings
      audioChunksRef.current = [];
      
      // Reset message and recording time
      setMessage('');
      setRecordingTime(0);
      
      // Request access to the microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Setup event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        // Only process if we have audio data
        if (audioChunksRef.current.length > 0) {
          try {
            // Create a Blob from all the chunks
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            
            // Update the UI to show we're processing
            setMessage('Processing audio...');
            
            // Create an audio element to play back the recording if needed
            const audioURL = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioURL);
            
            // You can play back the recording for testing
            // audio.play();
            
            // Here, you have a few options depending on your requirements:
            
            // For a browser-based solution without relying on external APIs,
            // we can use the experimental browser-based speech recognition
            // by passing the audio to a hidden audio element and triggering recording
            
            try {
              // Create a simple file reader to demonstrate the flow
              const reader = new FileReader();
              reader.onload = () => {
                const base64data = reader.result;
                console.log('Audio data converted to base64, length:', base64data?.toString().length);
                
                // In a real app, you would:
                // 1. Send this base64data to your backend API
                // 2. Backend would use a service like Google Cloud Speech-to-Text
                // 3. Return the transcribed text
                
                // For now, we'll just show a sample response
                // This is where you'd integrate with your backend API
                
                // Simulate processing delay
                setTimeout(() => {
                  // For now, allow the user to type manually after recording
                  setMessage('');
                  setErrorMessage('');
                  
                  // Focus the input for editing
                  if (inputRef.current) {
                    inputRef.current.disabled = false;
                    inputRef.current.focus();
                    inputRef.current.placeholder = "Edit your message (voice transcription would appear here)";
                  }
                }, 500);
              };
              
              // Convert the blob to base64 (this would be sent to an API)
              reader.readAsDataURL(audioBlob);
            } catch (error) {
              console.error('Error reading audio data:', error);
              setErrorMessage('Error processing audio. Please try again.');
            }
            
            // Always clean up the URL object
            URL.revokeObjectURL(audioURL);
          } catch (error) {
            console.error('Error processing audio:', error);
            setErrorMessage('Error processing audio recording.');
          }
        }
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      
      // Update state
      setIsRecording(true);
      isRecordingRef.current = true;
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      isRecordingRef.current = false;
      setErrorMessage('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    // Update state first to prevent race conditions
    setIsRecording(false);
    isRecordingRef.current = false;
    
    // Clear the timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Stop media recorder if it exists
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error('Error stopping media recorder:', error);
      }
    }
    
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setRecordingTime(0);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      if (!isAudioAvailable) {
        // If audio isn't available, check again - permissions might have changed
        checkAudioAvailability().then(() => {
          if (isAudioAvailable) {
            startRecording();
          }
        });
      } else {
        startRecording();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={`chat-input-container ${isRecording ? 'recording' : ''}`}>
      <input
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isRecording ? "Recording audio..." : errorMessage || "Type your message here..."}
        disabled={isLoading || isRecording}
        className={`chat-input ${errorMessage ? 'error' : ''}`}
      />
      
      <button
        onClick={toggleRecording}
        disabled={isLoading || (!isAudioAvailable && !isRecording)}
        className={`btn btn-icon voice-btn ${isRecording ? 'recording' : ''} ${!isAudioAvailable ? 'disabled' : ''}`}
        title={isRecording ? 'Stop recording' : 'Start voice input'}
      >
        {isRecording ? (
          <>
            <span className="recording-time">{formatTime(recordingTime)}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5 3a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/>
              <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
            </svg>
          </>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 1a2 2 0 0 1 2 2v5a2 2 0 1 1-4 0V3a2 2 0 0 1 2-2z" />
            <path d="M12.5 4a.5.5 0 0 1 .5.5v3a4.5 4.5 0 0 1-9 0v-3a.5.5 0 0 1 1 0v3a3.5 3.5 0 0 0 7 0v-3a.5.5 0 0 1 .5-.5z" />
            <path d="M8 10a.5.5 0 0 1 .5.5V12a.5.5 0 0 1-1 0v-1.5a.5.5 0 0 1 .5-.5z" />
          </svg>
        )}
      </button>
      
      <button 
        onClick={handleSubmit}
        disabled={isLoading || !message.trim() || isRecording}
        className="btn btn-primary"
        style={{opacity: (isLoading || !message.trim() || isRecording) ? 0.5 : 1}}
      >
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
};

export default ChatInput;
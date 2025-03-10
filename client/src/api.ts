import axios from 'axios';
import { ChatResponse } from './types';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendMessage = async (
  query: string,
  sessionId?: string
): Promise<ChatResponse> => {
  try {
    const response = await api.post('/api/chat', {
      query,
      session_id: sessionId,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const clearSession = async (sessionId: string): Promise<boolean> => {
  try {
    const response = await api.post('/api/session/clear', {
      session_id: sessionId,
    });
    return response.status === 200;
  } catch (error) {
    console.error('Error clearing session:', error);
    throw error;
  }
};

export const reloadDocuments = async (): Promise<boolean> => {
  try {
    const response = await api.post('/api/reload', {});
    return response.status === 200;
  } catch (error) {
    console.error('Error reloading documents:', error);
    throw error;
  }
};
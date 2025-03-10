import { Session } from "../types";

const STORAGE_KEY = "chat-sessions";

export const loadSessions = (): Session[] => {
  try {
    const sessions = localStorage.getItem(STORAGE_KEY);
    if (sessions) {
      return JSON.parse(sessions);
    }
  } catch (error) {
    console.error("Error loading sessions from localStorage:", error);
  }
  return [];
};

export const saveSession = (session: Session): void => {
  try {
    const sessions = loadSessions();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session to localStorage:", error);
  }
};

export const deleteSession = (sessionId: string): void => {
  try {
    const sessions = loadSessions();
    const updatedSessions = sessions.filter((s) => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
  } catch (error) {
    console.error("Error deleting session from localStorage:", error);
  }
};

export const clearAllSessions = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing all sessions from localStorage:", error);
  }
};


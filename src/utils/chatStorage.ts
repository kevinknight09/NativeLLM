import RNFS from 'react-native-fs';
import { ChatSession, Message } from '../types';

const CHAT_HISTORY_DIR = `${RNFS.DocumentDirectoryPath}/chat_sessions`;
const SESSIONS_INDEX_FILE = `${CHAT_HISTORY_DIR}/sessions.json`;

const ensureDirectoryExists = async (): Promise<void> => {
  const exists = await RNFS.exists(CHAT_HISTORY_DIR);
  if (!exists) {
    await RNFS.mkdir(CHAT_HISTORY_DIR);
  }
};

export const saveAllSessions = async (sessions: ChatSession[]): Promise<void> => {
  try {
    await ensureDirectoryExists();
    const json = JSON.stringify(sessions);
    await RNFS.writeFile(SESSIONS_INDEX_FILE, json, 'utf8');
  } catch (error) {
    console.error('Failed to save sessions:', error);
  }
};

export const loadAllSessions = async (): Promise<ChatSession[]> => {
  try {
    const exists = await RNFS.exists(SESSIONS_INDEX_FILE);
    if (!exists) return [];

    const json = await RNFS.readFile(SESSIONS_INDEX_FILE, 'utf8');
    const parsed = JSON.parse(json) as ChatSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load sessions:', error);
    return [];
  }
};

export const deleteSessionFromDisk = async (sessionId: string, currentSessions: ChatSession[]): Promise<ChatSession[]> => {
  const updated = currentSessions.filter((s) => s.id !== sessionId);
  await saveAllSessions(updated);
  return updated;
};

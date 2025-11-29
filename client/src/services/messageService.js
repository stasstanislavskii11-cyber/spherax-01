import { loadMessagesFromStorage, saveMessagesToStorage } from './storageService';
import { GLOBAL_ROOM } from '../utils/constants';

export const mergeMessageHistory = (room, serverMessages) => {
  const storedMessages = loadMessagesFromStorage(room);
  const filteredStored = storedMessages.filter(msg => msg.room === room);
  const serverMessagesWithRoom = (serverMessages || []).map(msg => ({ ...msg, room }));

  // Combine and deduplicate by timestamp and text
  const allMessages = [...filteredStored, ...serverMessagesWithRoom];
  const uniqueMessages = allMessages.filter((msg, index, self) =>
    index === self.findIndex((m) =>
      m.timestamp === msg.timestamp &&
      m.text === msg.text &&
      m.room === msg.room &&
      (m.username === msg.username || (m.type === 'system' && msg.type === 'system'))
    )
  );

  // Sort by timestamp
  uniqueMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return uniqueMessages;
};

export const saveSystemMessage = (message) => {
  if (message.room === GLOBAL_ROOM) {
    const globalMessages = loadMessagesFromStorage(GLOBAL_ROOM);
    const systemMessageWithRoom = { ...message, room: GLOBAL_ROOM };
    globalMessages.push(systemMessageWithRoom);
    if (globalMessages.length > 200) {
      globalMessages.shift();
    }
    saveMessagesToStorage(GLOBAL_ROOM, globalMessages);
  }
};


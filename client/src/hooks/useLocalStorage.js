import { useState, useEffect } from 'react';
import {
  loadUsernameFromStorage,
  saveUsernameToStorage,
  loadRoomFromStorage,
  saveRoomToStorage
} from '../services/storageService';

export const useUsername = () => {
  const [username, setUsername] = useState(() => loadUsernameFromStorage());

  useEffect(() => {
    saveUsernameToStorage(username);
  }, [username]);

  return [username, setUsername];
};

export const useRoom = () => {
  const [room, setRoom] = useState(() => loadRoomFromStorage());

  useEffect(() => {
    saveRoomToStorage(room);
  }, [room]);

  return [room, setRoom];
};


import React from 'react';
import { ROOMS } from '../../utils/constants';
import { useChat } from '../../contexts/ChatContext';
import './RoomList.css';

const RoomList = () => {
  const { selectedRoom, handleRoomChange, isConnected } = useChat();

  return (
    <div className="rooms-section">
      <h3>Rooms</h3>
      <div className="rooms-list">
        {ROOMS.map((room) => (
          <button
            key={room}
            className={`room-button ${selectedRoom === room ? 'active' : ''}`}
            onClick={() => handleRoomChange(room)}
            disabled={!isConnected}
          >
            {room}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoomList;


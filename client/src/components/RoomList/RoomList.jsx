import React from 'react';
import { ROOMS } from '../../utils/constants';
import './RoomList.css';

const RoomList = ({ selectedRoom, onRoomChange, isConnected }) => {
  return (
    <div className="rooms-section">
      <h3>Rooms</h3>
      <div className="rooms-list">
        {ROOMS.map((room) => (
          <button
            key={room}
            className={`room-button ${selectedRoom === room ? 'active' : ''}`}
            onClick={() => onRoomChange(room)}
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


import React, { useState } from 'react';
import { validateUsername } from '../../utils/validators';
import './UsernameForm.css';

const UsernameForm = ({ onSubmit, isConnected }) => {
  const [usernameInput, setUsernameInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedUsername = usernameInput.trim();

    if (!validateUsername(trimmedUsername)) {
      alert('Please enter a username');
      return;
    }

    if (!isConnected) {
      alert('Not connected to server. Please wait...');
      return;
    }

    onSubmit(trimmedUsername);
    setUsernameInput('');
  };

  return (
    <div className="username-form-container">
      <form onSubmit={handleSubmit} className="username-form">
        <h2>Enter your username</h2>
        <input
          type="text"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          placeholder="Username"
          maxLength={50}
          autoFocus
          className="username-input"
        />
        <button type="submit" className="username-submit-btn">
          Join Chat
        </button>
      </form>
    </div>
  );
};

export default UsernameForm;


export const validateUsername = (username) => {
  const trimmed = username.trim();
  return trimmed.length > 0 && trimmed.length <= 50;
};

export const validateMessage = (message) => {
  const trimmed = message.trim();
  return trimmed.length > 0 && trimmed.length <= 500;
};


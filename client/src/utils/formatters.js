export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const getInitialLetter = (name) => {
  if (!name || name.length === 0) return '?';
  return name.charAt(0).toUpperCase();
};


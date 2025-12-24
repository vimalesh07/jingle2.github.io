export function generateId() {
  return crypto.randomUUID();
}

/**
 * Simple debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function initiated(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Format time for audio player
 */
export function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

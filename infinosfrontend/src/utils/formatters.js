// Date and time formatters
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(date);
};

// Number formatters
export const formatTemperature = (temp, unit = 'C') => {
  if (temp == null) return 'N/A';
  return `${Number(temp).toFixed(1)}°${unit}`;
};

export const formatPercentage = (value) => {
  if (value == null) return 'N/A';
  return `${Number(value).toFixed(1)}%`;
};

export const formatNumber = (num, decimals = 0) => {
  if (num == null) return 'N/A';
  return Number(num).toFixed(decimals);
};

// String formatters
export const truncate = (str, maxLength = 50) => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

// Status formatters
export const getStatusColor = (status) => {
  return status ? 'success' : 'error';
};

export const getStatusText = (status) => {
  return status ? 'Online' : 'Offline';
};

// Battery level formatter with color
export const getBatteryStatus = (level) => {
  if (level == null) return { text: 'N/A', color: 'gray' };
  if (level > 60) return { text: 'Good', color: 'success' };
  if (level > 20) return { text: 'Low', color: 'warning' };
  return { text: 'Critical', color: 'error' };
};

// Temperature status formatter
export const getTemperatureStatus = (temp, low, high) => {
  if (temp == null) return { text: 'N/A', color: 'gray' };
  if (temp < low) return { text: 'Too Low', color: 'info' };
  if (temp > high) return { text: 'Too High', color: 'error' };
  return { text: 'Normal', color: 'success' };
};

export default {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatTemperature,
  formatPercentage,
  formatNumber,
  truncate,
  capitalize,
  toTitleCase,
  getStatusColor,
  getStatusText,
  getBatteryStatus,
  getTemperatureStatus,
};
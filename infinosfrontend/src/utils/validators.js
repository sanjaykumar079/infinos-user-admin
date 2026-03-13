// Input validation utilities

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return re.test(password);
};

export const validateTemperature = (temp) => {
  return !isNaN(temp) && temp >= -50 && temp <= 150;
};

export const validateHumidity = (humidity) => {
  return !isNaN(humidity) && humidity >= 0 && humidity <= 100;
};

export const validateDeviceName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

export const isValidNumber = (value, min = -Infinity, max = Infinity) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

export default {
  validateEmail,
  validatePassword,
  validateTemperature,
  validateHumidity,
  validateDeviceName,
  isValidNumber,
};
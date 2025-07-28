// utils/logger.js

export const logError = (error, context = "") => {
  console.error(`[❌ ERROR] ${context}:`, error.message || error);
};

export const logInfo = (message, context = "") => {
  console.log(`[ℹ️ INFO] ${context}:`, message);
};


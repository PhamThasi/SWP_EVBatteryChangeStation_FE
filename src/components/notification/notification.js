import { toast } from "react-toastify";

/**
 * Notification utility functions for consistent toast notifications
 * Uses react-toastify for displaying notifications
 */

/**
 * Show success notification
 * @param {string} message - Success message to display
 * @param {object} options - Additional toast options
 */
export const notifySuccess = (message, options = {}) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};

/**
 * Show error notification
 * @param {string} message - Error message to display
 * @param {object} options - Additional toast options
 */
export const notifyError = (message, options = {}) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};

/**
 * Show warning notification
 * @param {string} message - Warning message to display
 * @param {object} options - Additional toast options
 */
export const notifyWarning = (message, options = {}) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};

/**
 * Show info notification
 * @param {string} message - Info message to display
 * @param {object} options - Additional toast options
 */
export const notifyInfo = (message, options = {}) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};

/**
 * Show default notification
 * @param {string} message - Message to display
 * @param {object} options - Additional toast options
 */
export const notify = (message, options = {}) => {
  toast(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};

// Export all as default object for convenience
export default {
  success: notifySuccess,
  error: notifyError,
  warning: notifyWarning,
  info: notifyInfo,
  default: notify,
};


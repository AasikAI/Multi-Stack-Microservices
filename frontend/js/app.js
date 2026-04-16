/**
 * Main application initialization and shared utilities.
 */

// API configuration — update these URLs to match your backend services
const API_CONFIG = {
  NODE_SERVICE_URL: 'http://localhost:3001',
  PYTHON_SERVICE_URL: 'http://localhost:3002',
  JAVA_SERVICE_URL: 'http://localhost:3003',
};

/**
 * Display a temporary toast notification.
 * @param {string} message - The message to display.
 * @param {'success'|'error'} type - The notification type.
 */
function showNotification(message, type) {
  const area = document.getElementById('notification-area');
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  area.appendChild(notification);

  // Auto-remove after 4 seconds
  setTimeout(function () {
    notification.style.animation = 'fadeOut 0.3s ease-out forwards';
    notification.addEventListener('animationend', function () {
      notification.remove();
    });
  }, 4000);
}

/**
 * Switch active tab and panel.
 * @param {string} tabName - The tab identifier (users, products, orders).
 */
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-button').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  // Update panels
  document.querySelectorAll('.tab-panel').forEach(function (panel) {
    panel.classList.toggle('active', panel.id === tabName + '-panel');
  });

  // Load data for the newly active tab
  loadTabData(tabName);
}

/**
 * Load data for a given tab.
 * @param {string} tabName - The tab identifier.
 */
function loadTabData(tabName) {
  switch (tabName) {
    case 'users':
      loadUsers();
      break;
    case 'products':
      loadProducts();
      break;
    case 'orders':
      loadOrders();
      loadOrderFormData();
      break;
  }
}

/**
 * Format a date string or timestamp for display.
 * @param {string|number} dateValue - The date value to format.
 * @returns {string} Formatted date string.
 */
function formatDate(dateValue) {
  if (!dateValue) return '-';
  try {
    var date = new Date(dateValue);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return String(dateValue);
  }
}

/**
 * Format a number as currency.
 * @param {number} value - The numeric value.
 * @returns {string} Formatted currency string.
 */
function formatPrice(value) {
  if (value == null) return '-';
  return '$' + Number(value).toFixed(2);
}

/**
 * Get the appropriate CSS class for an order status badge.
 * @param {string} status - The order status.
 * @returns {string} The badge CSS class.
 */
function getStatusBadgeClass(status) {
  if (!status) return 'badge badge-default';
  switch (status.toLowerCase()) {
    case 'pending':
      return 'badge badge-pending';
    case 'confirmed':
      return 'badge badge-confirmed';
    case 'shipped':
      return 'badge badge-shipped';
    case 'delivered':
      return 'badge badge-delivered';
    case 'cancelled':
      return 'badge badge-cancelled';
    default:
      return 'badge badge-default';
  }
}

/**
 * Escape HTML to prevent XSS when inserting user data into the DOM.
 * @param {string} str - The string to escape.
 * @returns {string} The escaped string.
 */
function escapeHtml(str) {
  if (str == null) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

// Initialize the application on DOM ready
document.addEventListener('DOMContentLoaded', function () {
  // Attach tab click handlers
  document.querySelectorAll('.tab-button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchTab(btn.dataset.tab);
    });
  });

  // Load data for the default active tab (Users)
  loadTabData('users');
});

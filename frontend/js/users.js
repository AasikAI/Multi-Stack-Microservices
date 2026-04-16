/**
 * User management — communicates with the Node.js service.
 */

/**
 * Fetch all users and render them in the table.
 */
async function loadUsers() {
  var tbody = document.getElementById('users-table-body');
  tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">Loading...</td></tr>';

  try {
    var response = await fetch(API_CONFIG.NODE_SERVICE_URL + '/api/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users (HTTP ' + response.status + ')');
    }
    var users = await response.json();
    renderUsersTable(users);
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">Could not load users. Is the Node service running?</td></tr>';
    showNotification('Error loading users: ' + error.message, 'error');
  }
}

/**
 * Render user rows into the table body.
 * @param {Array} users - Array of user objects.
 */
function renderUsersTable(users) {
  var tbody = document.getElementById('users-table-body');

  if (!users || users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">No users found. Create one above.</td></tr>';
    return;
  }

  var html = '';
  users.forEach(function (user) {
    html += '<tr>';
    html += '<td>' + escapeHtml(user.id || user._id) + '</td>';
    html += '<td>' + escapeHtml(user.name) + '</td>';
    html += '<td>' + escapeHtml(user.email) + '</td>';
    html += '<td>' + formatDate(user.createdAt || user.created_at) + '</td>';
    html += '<td><button class="btn btn-danger" onclick="deleteUser(\'' + escapeHtml(user.id || user._id) + '\')">Delete</button></td>';
    html += '</tr>';
  });

  tbody.innerHTML = html;
}

/**
 * Handle the create user form submission.
 * @param {Event} event - The form submit event.
 */
async function createUser(event) {
  event.preventDefault();

  var name = document.getElementById('user-name').value.trim();
  var email = document.getElementById('user-email').value.trim();

  if (!name || !email) {
    showNotification('Please fill in all fields.', 'error');
    return;
  }

  try {
    var response = await fetch(API_CONFIG.NODE_SERVICE_URL + '/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email }),
    });

    if (!response.ok) {
      var errorData = await response.json().catch(function () { return {}; });
      throw new Error(errorData.message || 'Failed to create user (HTTP ' + response.status + ')');
    }

    document.getElementById('create-user-form').reset();
    showNotification('User created successfully.', 'success');
    await loadUsers();
  } catch (error) {
    showNotification('Error creating user: ' + error.message, 'error');
  }
}

/**
 * Delete a user by ID.
 * @param {string} id - The user ID.
 */
async function deleteUser(id) {
  if (!confirm('Are you sure you want to delete this user?')) return;

  try {
    var response = await fetch(API_CONFIG.NODE_SERVICE_URL + '/api/users/' + id, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete user (HTTP ' + response.status + ')');
    }

    showNotification('User deleted successfully.', 'success');
    await loadUsers();
  } catch (error) {
    showNotification('Error deleting user: ' + error.message, 'error');
  }
}

// Attach form event listener once the DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('create-user-form').addEventListener('submit', createUser);
});

/**
 * Order management — communicates with the Java service.
 */

/**
 * Fetch all orders and render them in the table.
 */
async function loadOrders() {
  var tbody = document.getElementById('orders-table-body');
  tbody.innerHTML = '<tr><td colspan="8" class="loading-cell">Loading...</td></tr>';

  try {
    var response = await fetch(API_CONFIG.JAVA_SERVICE_URL + '/api/orders');
    if (!response.ok) {
      throw new Error('Failed to fetch orders (HTTP ' + response.status + ')');
    }
    var orders = await response.json();
    renderOrdersTable(orders);
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-cell">Could not load orders. Is the Java service running?</td></tr>';
    showNotification('Error loading orders: ' + error.message, 'error');
  }
}

/**
 * Render order rows into the table body.
 * @param {Array} orders - Array of order objects.
 */
function renderOrdersTable(orders) {
  var tbody = document.getElementById('orders-table-body');

  if (!orders || orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-cell">No orders found. Create one above.</td></tr>';
    return;
  }

  var html = '';
  orders.forEach(function (order) {
    var status = order.status || 'pending';
    var badgeClass = getStatusBadgeClass(status);

    html += '<tr>';
    html += '<td>' + escapeHtml(order.id || order._id) + '</td>';
    html += '<td>' + escapeHtml(order.userId || order.user_id) + '</td>';
    html += '<td>' + escapeHtml(order.productId || order.product_id) + '</td>';
    html += '<td>' + escapeHtml(order.quantity) + '</td>';
    html += '<td>' + formatPrice(order.totalPrice || order.total_price) + '</td>';
    html += '<td><span class="' + badgeClass + '">' + escapeHtml(status) + '</span></td>';
    html += '<td>' + formatDate(order.createdAt || order.created_at) + '</td>';
    html += '<td><button class="btn btn-danger" onclick="deleteOrder(\'' + escapeHtml(order.id || order._id) + '\')">Delete</button></td>';
    html += '</tr>';
  });

  tbody.innerHTML = html;
}

/**
 * Populate the order form's User and Product dropdowns from the respective APIs.
 */
async function loadOrderFormData() {
  var userSelect = document.getElementById('order-user-id');
  var productSelect = document.getElementById('order-product-id');

  // Preserve any currently selected values
  var currentUserId = userSelect.value;
  var currentProductId = productSelect.value;

  // Load users
  try {
    var usersResponse = await fetch(API_CONFIG.NODE_SERVICE_URL + '/api/users');
    if (usersResponse.ok) {
      var users = await usersResponse.json();
      userSelect.innerHTML = '<option value="">Select a user...</option>';
      users.forEach(function (user) {
        var id = user.id || user._id;
        var option = document.createElement('option');
        option.value = id;
        option.textContent = escapeHtml(user.name) + ' (' + escapeHtml(user.email) + ')';
        if (id === currentUserId) option.selected = true;
        userSelect.appendChild(option);
      });
    }
  } catch (error) {
    // Silently fail — the user can still type an ID manually if the service is down
    userSelect.innerHTML = '<option value="">Could not load users</option>';
  }

  // Load products
  try {
    var productsResponse = await fetch(API_CONFIG.PYTHON_SERVICE_URL + '/api/products');
    if (productsResponse.ok) {
      var products = await productsResponse.json();
      productSelect.innerHTML = '<option value="">Select a product...</option>';
      products.forEach(function (product) {
        var id = product.id || product._id;
        var option = document.createElement('option');
        option.value = id;
        option.textContent = escapeHtml(product.name) + ' - ' + formatPrice(product.price);
        if (id === currentProductId) option.selected = true;
        productSelect.appendChild(option);
      });
    }
  } catch (error) {
    productSelect.innerHTML = '<option value="">Could not load products</option>';
  }
}

/**
 * Handle the create order form submission.
 * @param {Event} event - The form submit event.
 */
async function createOrder(event) {
  event.preventDefault();

  var userId = document.getElementById('order-user-id').value;
  var productId = document.getElementById('order-product-id').value;
  var quantity = parseInt(document.getElementById('order-quantity').value, 10);

  if (!userId || !productId || isNaN(quantity) || quantity < 1) {
    showNotification('Please fill in all fields with valid values.', 'error');
    return;
  }

  try {
    var response = await fetch(API_CONFIG.JAVA_SERVICE_URL + '/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        productId: productId,
        quantity: quantity,
      }),
    });

    if (!response.ok) {
      var errorData = await response.json().catch(function () { return {}; });
      throw new Error(errorData.message || 'Failed to create order (HTTP ' + response.status + ')');
    }

    document.getElementById('create-order-form').reset();
    showNotification('Order created successfully.', 'success');
    await loadOrders();
  } catch (error) {
    showNotification('Error creating order: ' + error.message, 'error');
  }
}

/**
 * Delete an order by ID.
 * @param {string} id - The order ID.
 */
async function deleteOrder(id) {
  if (!confirm('Are you sure you want to delete this order?')) return;

  try {
    var response = await fetch(API_CONFIG.JAVA_SERVICE_URL + '/api/orders/' + id, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete order (HTTP ' + response.status + ')');
    }

    showNotification('Order deleted successfully.', 'success');
    await loadOrders();
  } catch (error) {
    showNotification('Error deleting order: ' + error.message, 'error');
  }
}

// Attach form event listener once the DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('create-order-form').addEventListener('submit', createOrder);
});

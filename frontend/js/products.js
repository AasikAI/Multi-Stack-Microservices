/**
 * Product management — communicates with the Python service.
 */

/**
 * Fetch all products and render them in the table.
 */
async function loadProducts() {
  var tbody = document.getElementById('products-table-body');
  tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Loading...</td></tr>';

  try {
    var response = await fetch(API_CONFIG.PYTHON_SERVICE_URL + '/api/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products (HTTP ' + response.status + ')');
    }
    var products = await response.json();
    renderProductsTable(products);
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">Could not load products. Is the Python service running?</td></tr>';
    showNotification('Error loading products: ' + error.message, 'error');
  }
}

/**
 * Render product rows into the table body.
 * @param {Array} products - Array of product objects.
 */
function renderProductsTable(products) {
  var tbody = document.getElementById('products-table-body');

  if (!products || products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">No products found. Create one above.</td></tr>';
    return;
  }

  var html = '';
  products.forEach(function (product) {
    html += '<tr>';
    html += '<td>' + escapeHtml(product.id || product._id) + '</td>';
    html += '<td>' + escapeHtml(product.name) + '</td>';
    html += '<td>' + escapeHtml(product.description) + '</td>';
    html += '<td>' + formatPrice(product.price) + '</td>';
    html += '<td>' + escapeHtml(product.category) + '</td>';
    html += '<td><button class="btn btn-danger" onclick="deleteProduct(\'' + escapeHtml(product.id || product._id) + '\')">Delete</button></td>';
    html += '</tr>';
  });

  tbody.innerHTML = html;
}

/**
 * Handle the create product form submission.
 * @param {Event} event - The form submit event.
 */
async function createProduct(event) {
  event.preventDefault();

  var name = document.getElementById('product-name').value.trim();
  var description = document.getElementById('product-description').value.trim();
  var price = parseFloat(document.getElementById('product-price').value);
  var category = document.getElementById('product-category').value.trim();

  if (!name || !description || isNaN(price) || !category) {
    showNotification('Please fill in all fields.', 'error');
    return;
  }

  try {
    var response = await fetch(API_CONFIG.PYTHON_SERVICE_URL + '/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        description: description,
        price: price,
        category: category,
      }),
    });

    if (!response.ok) {
      var errorData = await response.json().catch(function () { return {}; });
      throw new Error(errorData.message || 'Failed to create product (HTTP ' + response.status + ')');
    }

    document.getElementById('create-product-form').reset();
    showNotification('Product created successfully.', 'success');
    await loadProducts();
  } catch (error) {
    showNotification('Error creating product: ' + error.message, 'error');
  }
}

/**
 * Delete a product by ID.
 * @param {string} id - The product ID.
 */
async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    var response = await fetch(API_CONFIG.PYTHON_SERVICE_URL + '/api/products/' + id, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete product (HTTP ' + response.status + ')');
    }

    showNotification('Product deleted successfully.', 'success');
    await loadProducts();
  } catch (error) {
    showNotification('Error deleting product: ' + error.message, 'error');
  }
}

// Attach form event listener once the DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('create-product-form').addEventListener('submit', createProduct);
});

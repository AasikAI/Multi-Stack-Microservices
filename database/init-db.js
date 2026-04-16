// ============================================================================
// MongoDB Initialization and Seed Script
// ============================================================================
//
// This script creates the three databases used by the microservices and
// inserts a small set of seed data for local development and demos.
//
// Run with:
//   mongosh < database/init-db.js
//
// Or in an interactive mongosh session:
//   load("database/init-db.js")
//
// Each microservice uses its own database, keeping data ownership clean:
//   - userdb    -> Node.js user service
//   - productdb -> Python product service
//   - orderdb   -> Java order service
// ============================================================================

print("\n===== Initializing userdb =====");
db = db.getSiblingDB("userdb");
db.users.drop();
db.users.createIndex({ email: 1 }, { unique: true });

const userInsert = db.users.insertMany([
  { name: "Alice Johnson", email: "alice@example.com", createdAt: new Date() },
  { name: "Bob Smith",     email: "bob@example.com",   createdAt: new Date() },
  { name: "Charlie Davis", email: "charlie@example.com", createdAt: new Date() }
]);
print("Inserted users: " + userInsert.insertedIds.length);

print("\n===== Initializing productdb =====");
db = db.getSiblingDB("productdb");
db.products.drop();

const productInsert = db.products.insertMany([
  {
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with USB receiver",
    price: 29.99,
    category: "Electronics",
    created_at: new Date().toISOString()
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB backlit mechanical keyboard",
    price: 89.99,
    category: "Electronics",
    created_at: new Date().toISOString()
  },
  {
    name: "USB-C Hub",
    description: "7-in-1 USB-C hub with HDMI and card reader",
    price: 45.00,
    category: "Accessories",
    created_at: new Date().toISOString()
  },
  {
    name: "Monitor Stand",
    description: "Adjustable wooden monitor stand",
    price: 55.00,
    category: "Office",
    created_at: new Date().toISOString()
  }
]);
print("Inserted products: " + productInsert.insertedIds.length);

print("\n===== Initializing orderdb =====");
db = db.getSiblingDB("orderdb");
db.orders.drop();
db.orders.createIndex({ userId: 1 });
db.orders.createIndex({ productId: 1 });

print("Orders collection ready (orders are created through the Java service).");

print("\n===== Initialization complete =====");
print("Databases created: userdb, productdb, orderdb");
print("You can now start the microservices.");

# Database

This directory contains MongoDB initialization and seed scripts used by the three
microservices. Each service owns its own database:

| Database    | Owner              | Collections |
|-------------|--------------------|-------------|
| `userdb`    | Node.js service    | `users`     |
| `productdb` | Python service     | `products`  |
| `orderdb`   | Java service       | `orders`    |

## Prerequisites

- MongoDB 6.0 or later installed and running locally on the default port (`27017`).
- `mongosh` (the MongoDB Shell) available on your `PATH`.

Start MongoDB (example for Linux with systemd):

```bash
sudo systemctl start mongod
```

Or run it directly:

```bash
mongod --dbpath /path/to/your/data/dir
```

## Initializing the databases

From the repository root, run:

```bash
mongosh < database/init-db.js
```

Alternatively, inside an interactive `mongosh` session:

```javascript
load("database/init-db.js")
```

The script will:

1. Create the three databases (`userdb`, `productdb`, `orderdb`).
2. Create useful indexes (unique index on `users.email`, indexes on
   `orders.userId` and `orders.productId`).
3. Insert a small set of seed data (3 sample users and 4 sample products).
4. Leave the `orders` collection empty -- orders are created through the Java
   service, which validates user and product IDs before persisting.

## Verifying the seed

```bash
mongosh
> use userdb
> db.users.find().pretty()
> use productdb
> db.products.find().pretty()
```

## Resetting the data

Re-running `mongosh < database/init-db.js` will drop and recreate the `users`
and `products` collections (and their seed data). The `orders` collection is
also dropped on re-run.

## Connection strings

Each service picks up its Mongo URI from an environment variable (see the
`.env.example` of each service). By default they are:

```
userdb    -> mongodb://localhost:27017/userdb
productdb -> mongodb://localhost:27017/productdb
orderdb   -> mongodb://localhost:27017/orderdb
```

# Multi-Stack Microservices — DevOps Practice Repository

A realistic multi-language microservices monorepo designed specifically for
**DevOps practice**. This repository provides fully working application source
code (no DevOps configs included) so you can practice writing Dockerfiles,
Kubernetes manifests, GitHub Actions workflows, Helm charts, service mesh
configs, and more — yourself.

> **Strictly no DevOps files included.** No Dockerfiles, no `docker-compose.yml`,
> no Kubernetes manifests, no CI/CD pipelines. Just the application code.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Service Communication Flow](#service-communication-flow)
- [Prerequisites](#prerequisites)
- [Running Locally (without Docker)](#running-locally-without-docker)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [DevOps Practice Ideas](#devops-practice-ideas)

---

## Project Overview

The system is a tiny e-commerce-style platform composed of three independently
deployable backend microservices, a shared MongoDB database, and a single-page
frontend dashboard. The services are intentionally written in **three different
languages** so you can practice containerizing and orchestrating a heterogeneous
stack:

- **Node.js (Express)** — User management
- **Python (Flask)** — Product catalog
- **Java (Spring Boot)** — Order processing with inter-service validation

The frontend is plain HTML/CSS/JavaScript (no build step) and talks directly to
each backend service. There is **no API gateway** — services communicate via
REST.

---

## Architecture

```
                          ┌────────────────────────┐
                          │   Frontend (Browser)    │
                          │   HTML / CSS / JS       │
                          └────────┬───────────────┘
                                   │ REST (direct calls)
           ┌───────────────────────┼────────────────────────┐
           │                       │                        │
           ▼                       ▼                        ▼
  ┌────────────────┐     ┌────────────────┐       ┌────────────────┐
  │ Node.js        │     │ Python         │       │ Java           │
  │ User Service   │     │ Product Service│       │ Order Service  │
  │ :3001          │     │ :3002          │       │ :3003          │
  └───────┬────────┘     └───────┬────────┘       └───────┬────────┘
          │                      │                        │
          │                      │       ┌────────────────┤
          │                      │       │  validates     │
          │                      │       │  user/product  │
          │                      │       ▼                │
          │              ┌───────┴───────────────┐        │
          │              │  calls from Java      │        │
          │              └───────────────────────┘        │
          │                                               │
          ▼                      ▼                        ▼
  ┌────────────────────────────────────────────────────────────┐
  │                       MongoDB                              │
  │  userdb.users   productdb.products   orderdb.orders        │
  └────────────────────────────────────────────────────────────┘
```

**Key properties**

- Each service has its own MongoDB database (`userdb`, `productdb`, `orderdb`).
- Services are stateless and read configuration from environment variables.
- When an order is created, the Java service performs synchronous REST calls
  to both the Node and Python services to validate the user and product.

---

## Tech Stack

| Service          | Language | Framework       | Port | Database   |
|------------------|----------|-----------------|------|------------|
| User Service     | Node.js  | Express         | 3001 | userdb     |
| Product Service  | Python   | Flask           | 3002 | productdb  |
| Order Service    | Java 17  | Spring Boot 3.x | 3003 | orderdb    |
| Frontend         | Vanilla  | HTML/CSS/JS     | any  | —          |
| Data store       | MongoDB  | 6.0+            | 27017| —          |

---

## Repository Structure

```
.
├── frontend/                       # Static HTML/CSS/JS dashboard
│   ├── index.html
│   ├── css/style.css
│   ├── js/{app,users,products,orders}.js
│   └── .env.example
├── services/
│   ├── node-service/               # Express user service
│   │   ├── src/
│   │   │   ├── config/db.js
│   │   │   ├── controllers/userController.js
│   │   │   ├── models/User.js
│   │   │   ├── routes/{userRoutes,healthRoutes}.js
│   │   │   └── index.js
│   │   ├── package.json
│   │   └── .env.example
│   ├── python-service/             # Flask product service
│   │   ├── models/product.py
│   │   ├── routes/{product_routes,health_routes}.py
│   │   ├── app.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── requirements.txt
│   │   └── .env.example
│   └── java-service/               # Spring Boot order service
│       ├── src/main/java/com/devops/orderservice/
│       │   ├── config/{CorsConfig,RestTemplateConfig}.java
│       │   ├── controller/{OrderController,HealthController}.java
│       │   ├── model/Order.java
│       │   ├── repository/OrderRepository.java
│       │   ├── service/OrderService.java
│       │   └── OrderServiceApplication.java
│       ├── src/main/resources/application.properties
│       ├── pom.xml
│       └── .env.example
├── database/
│   ├── init-db.js                  # MongoDB init & seed script
│   └── README.md
└── README.md
```

---

## Service Communication Flow

### Creating an order (example)

```
1. Browser  → POST /api/orders  (Java service, :3003)
              body: { userId, productId, quantity }

2. Java     → GET /api/users/:id        (Node service, :3001)
              ↳ validates that the user exists

3. Java     → GET /api/products/:id     (Python service, :3002)
              ↳ validates product, reads price

4. Java     computes totalPrice = price × quantity

5. Java     saves the order to orderdb.orders with status "PENDING"

6. Java     → 201 Created {order}       back to browser
```

All other CRUD operations (list users, create product, etc.) are direct calls
from the frontend to the appropriate service.

---

## Prerequisites

Install these on your local machine:

- **Node.js** 18+ and **npm**
- **Python** 3.10+ and **pip**
- **Java** 17+ and **Maven** 3.8+
- **MongoDB** 6.0+ (running locally on `mongodb://localhost:27017`)
- **mongosh** for running the database init script

---

## Running Locally (without Docker)

Open **five terminals** — one for MongoDB, one for each service, and one for
the frontend.

### 1. Start MongoDB

```bash
# Depending on your OS, e.g. on Linux:
sudo systemctl start mongod
# or:
mongod --dbpath /path/to/your/data/dir
```

### 2. Initialize the databases

From the repository root:

```bash
mongosh < database/init-db.js
```

This creates `userdb`, `productdb`, and `orderdb`, and seeds sample users
and products. See [`database/README.md`](database/README.md) for details.

### 3. Start the Node.js user service

```bash
cd services/node-service
cp .env.example .env
npm install
npm start
```

The service will listen on `http://localhost:3001`.

### 4. Start the Python product service

```bash
cd services/python-service
cp .env.example .env
pip install -r requirements.txt
python app.py
```

The service will listen on `http://localhost:3002`.

### 5. Start the Java order service

```bash
cd services/java-service
cp .env.example .env
# Export env vars for Spring Boot (optional — application.properties has defaults)
export $(grep -v '^#' .env | xargs)
mvn spring-boot:run
```

The service will listen on `http://localhost:3003`.

### 6. Open the frontend

Serve the static files with any lightweight server:

```bash
cd frontend
# Option A: Python's built-in HTTP server
python -m http.server 8080

# Option B: npx serve
npx serve -l 8080 .
```

Then open <http://localhost:8080> in your browser.

> **Note**: Opening `index.html` directly via `file://` works too, but some
> browsers restrict cross-origin requests from the local filesystem. Serving
> the folder over HTTP is the more reliable option.

---

## API Endpoints

### Node.js User Service — `http://localhost:3001`

| Method | Endpoint           | Description              |
|--------|--------------------|--------------------------|
| GET    | `/health`          | Service health check     |
| GET    | `/api/users`       | List all users           |
| GET    | `/api/users/:id`   | Get a user by ID         |
| POST   | `/api/users`       | Create a new user        |
| PUT    | `/api/users/:id`   | Update a user            |
| DELETE | `/api/users/:id`   | Delete a user            |

**Create user body**:
```json
{ "name": "Alice", "email": "alice@example.com" }
```

### Python Product Service — `http://localhost:3002`

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/health`             | Service health check     |
| GET    | `/api/products`       | List all products        |
| GET    | `/api/products/<id>`  | Get a product by ID      |
| POST   | `/api/products`       | Create a new product     |
| PUT    | `/api/products/<id>`  | Update a product         |
| DELETE | `/api/products/<id>`  | Delete a product         |

**Create product body**:
```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse",
  "price": 29.99,
  "category": "Electronics"
}
```

### Java Order Service — `http://localhost:3003`

| Method | Endpoint             | Description                                         |
|--------|----------------------|-----------------------------------------------------|
| GET    | `/health`            | Service health check                                |
| GET    | `/api/orders`        | List all orders                                     |
| GET    | `/api/orders/{id}`   | Get an order by ID                                  |
| POST   | `/api/orders`        | Create an order (validates user + product)          |
| PUT    | `/api/orders/{id}`   | Update an order's status                            |
| DELETE | `/api/orders/{id}`   | Delete an order                                     |

**Create order body**:
```json
{
  "userId": "<mongo user id>",
  "productId": "<mongo product id>",
  "quantity": 2
}
```

**Update status body**:
```json
{ "status": "CONFIRMED" }
```

---

## Environment Variables

Each service reads configuration from environment variables (loaded via `.env`
files). Copy each `.env.example` to `.env` and adjust values as needed.

### Node.js service (`services/node-service/.env.example`)

| Variable              | Description                          | Default                                 |
|-----------------------|--------------------------------------|-----------------------------------------|
| `PORT`                | HTTP port to listen on               | `3001`                                  |
| `MONGO_URI`           | MongoDB connection string            | `mongodb://localhost:27017/userdb`      |
| `PYTHON_SERVICE_URL`  | URL of the Python product service    | `http://localhost:3002`                 |
| `JAVA_SERVICE_URL`    | URL of the Java order service        | `http://localhost:3003`                 |

### Python service (`services/python-service/.env.example`)

| Variable              | Description                          | Default                                 |
|-----------------------|--------------------------------------|-----------------------------------------|
| `PORT`                | HTTP port to listen on               | `3002`                                  |
| `MONGO_URI`           | MongoDB connection string            | `mongodb://localhost:27017/productdb`   |
| `NODE_SERVICE_URL`    | URL of the Node user service         | `http://localhost:3001`                 |
| `JAVA_SERVICE_URL`    | URL of the Java order service        | `http://localhost:3003`                 |

### Java service (`services/java-service/.env.example`)

| Variable                     | Description                          | Default                                 |
|------------------------------|--------------------------------------|-----------------------------------------|
| `SERVER_PORT`                | HTTP port to listen on               | `3003`                                  |
| `SPRING_DATA_MONGODB_URI`    | MongoDB connection string            | `mongodb://localhost:27017/orderdb`     |
| `NODE_SERVICE_URL`           | URL of the Node user service         | `http://localhost:3001`                 |
| `PYTHON_SERVICE_URL`         | URL of the Python product service    | `http://localhost:3002`                 |

### Frontend (`frontend/.env.example`)

Because the frontend is static HTML/JS, environment variables cannot be read at
runtime. The service URLs are defined at the top of `frontend/js/app.js` and
should be changed there if the services are not running on their default
`localhost` ports. The `.env.example` file serves as documentation only.

---

## DevOps Practice Ideas

This repository was built as a playground for hands-on DevOps work. Here are
some exercises you can try:

### Containerization
- Write a `Dockerfile` for each of the four components (node, python, java, frontend).
- Use multi-stage builds for Java and frontend to produce lean images.
- Write a root `docker-compose.yml` that brings up MongoDB and all services.

### Orchestration
- Write Kubernetes manifests: `Deployment`, `Service`, `ConfigMap`, `Secret`,
  and an `Ingress` for each service.
- Convert the manifests into a Helm chart with per-service values.
- Try service discovery via Kubernetes DNS instead of hard-coded URLs.

### CI/CD
- Write a GitHub Actions workflow that builds and tests each service on every
  push, building and pushing Docker images on main.
- Add matrix jobs to test across Node / Python / Java versions.
- Add a deploy job that `kubectl apply`s the manifests to a local cluster
  (kind, minikube, or k3d).

### Observability & Operations
- Add a Prometheus scraper config for each `/health` (and extend services to
  expose `/metrics`).
- Build a Grafana dashboard showing service health and response times.
- Add distributed tracing with OpenTelemetry for the order-creation flow.

### Security
- Replace `.env` files with Kubernetes secrets or an external secret store.
- Add a NetworkPolicy restricting which services can call which.

---

## License

Provided as-is for educational and practice purposes.

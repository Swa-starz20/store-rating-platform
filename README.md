# Store Rate — Full-Stack Store Rating Web Application

A full-stack, production-ready **Store Rating Web Application** built with a modern decoupled monorepo architecture. Features comprehensive Role-Based Access Control (**ADMIN**, **STORE_OWNER**, **USER**), strict dual-layer schema validation, relational persistence with PostgreSQL & Prisma ORM, centralized error handling, and a responsive React UI powered by Vite and Tailwind CSS.

---

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Database Schema & Architecture](#database-schema--architecture)
3. [Strict Validation Rules](#strict-validation-rules)
4. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
5. [Seeded Test Credentials](#seeded-test-credentials)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Project Directory Structure](#project-directory-structure)
8. [Setup & Running Locally](#setup--running-locally)

---

## Tech Stack

### Backend
* **Runtime & Framework:** Node.js with Express.js
* **Architecture:** Controller-Service-Repository pattern with modular routes, validation middleware, and centralized error handling
* **Database & ORM:** PostgreSQL with Prisma ORM
* **Security & Auth:** JSON Web Tokens (JWT), `bcryptjs` password hashing, `helmet` security headers, `cors`
* **Validation:** Server-side schema validation via `zod`

### Frontend
* **Build Tool & Framework:** React.js 18 + Vite
* **Routing:** React Router v6 (with role-guarded `ProtectedRoute` wrapper)
* **Styling:** Tailwind CSS with custom branding
* **Icons:** Lucide React
* **HTTP Client:** Axios (with Bearer token injection and automatic 401 session expiry interceptors)
* **Components:** Reusable `DataTable` (sortable, searchable, filterable, paginated), `StarRating` (interactive & display), `Modal`, `StatCard`, inline validation forms, and custom toast notification system

---

## Database Schema & Architecture

The application utilizes a normalized relational PostgreSQL schema managed via Prisma ORM:

```mermaid
erDiagram
    USERS ||--o| STORES : "owns (1-to-1)"
    USERS ||--o{ RATINGS : "submits"
    STORES ||--o{ RATINGS : "receives"

    USERS {
        uuid id PK
        string name "VARCHAR(60), 20-60 chars"
        string email "VARCHAR(255), UNIQUE"
        string password "VARCHAR(255), Hashed"
        string address "VARCHAR(400)"
        enum role "ADMIN | STORE_OWNER | USER"
        datetime created_at
        datetime updated_at
    }

    STORES {
        uuid id PK
        string name "VARCHAR(60), 20-60 chars"
        string email "VARCHAR(255), UNIQUE"
        string address "VARCHAR(400)"
        uuid owner_id FK "UNIQUE -> users.id"
        datetime created_at
        datetime updated_at
    }

    RATINGS {
        uuid id PK
        uuid user_id FK "-> users.id (CASCADE)"
        uuid store_id FK "-> stores.id (CASCADE)"
        int rating "1 to 5 (CHECK)"
        datetime created_at
        datetime updated_at
    }
```

### Relational Integrity & Constraints:
* **Composite Unique Constraint:** `@@unique([userId, storeId])` on the `ratings` table guarantees that a consumer can submit at most one rating per store, facilitating clean upserts/modifications.
* **Cascading Deletes:** Deleting a user or store cascades deletions to their associated ratings.
* **Store Owner Binding:** `owner_id` is unique on the `stores` table, establishing a clean one-to-one relationship between a Store Owner and their physical business store.
* **Transaction Safety:** When an Admin registers a store with new owner details, the owner user account and store are created within a single atomic database transaction (`prisma.$transaction`).

---

## Strict Validation Rules

Both **backend** (`zod`) and **frontend** (`validators.js`) strictly enforce the following validation constraints:

| Field | Validation Constraint | Description |
| :--- | :--- | :--- |
| **Name** | `20 <= length <= 60` | Full name must be between **20 and 60 characters long**. Real-time character counter provided on frontend. |
| **Address** | `length <= 400` | Mandatory physical address, up to **400 characters**. |
| **Password** | `8 <= length <= 16` | Must be **8 to 16 characters**, containing at least **one uppercase letter (`A-Z`)** and at least **one special character (`!@#$%^&*(),.?":{}|<>`)**. |
| **Email** | Valid RFC email | Standard email pattern, case-insensitively unique in database. |
| **Rating** | Integer `1 <= rating <= 5` | Strictly an integer between 1 and 5 stars. |

---

## Role-Based Access Control (RBAC)

| Role | Key Capabilities & Accessible Routes |
| :--- | :--- |
| **System Administrator (`ADMIN`)** | • **Analytics Dashboard:** Live counts of Total Users, Total Stores, and Total Submitted Ratings, plus user demographic breakdown.<br>• **User Management:** View paginated/searchable table of users. Multi-field filter by Name, Email, Address, and Role. Add new users of any role. Inspect user details modal—**dynamically displaying their store details and calculated average rating if the user is a Store Owner**.<br>• **Store Management:** View all stores with overall ratings. Add new stores by linking an existing `STORE_OWNER` or auto-generating a new Store Owner account in an atomic transaction. |
| **Normal User (`USER`)** | • **Store Directory:** Search & filter stores by Name and Address, with multi-column sorting.<br>• **Rating Control:** Interactive 1–5 star rating widget per store. Submit a new rating or modify an existing rating with instant live UI updates.<br>• **Account Settings:** Update password with current password verification and strict validation. |
| **Store Owner (`STORE_OWNER`)** | • **Store Dashboard:** Prominently displays their Store's **Average Rating** (rounded to 1 decimal place) and **Total Ratings Count**.<br>• **Ratings Ledger:** Sortable table of customers who submitted reviews (showing Customer Name, Email, Submitted Rating, and Date).<br>• **Account Settings:** Update password. |

---

## Seeded Test Credentials

The database seed script (`prisma/seed.js`) populates initial data strictly satisfying all character length rules (all names are 20–60 characters long):

| Role | Name | Email | Password | Associated Store / Details |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | `System Administrator Master` | `admin@storerating.com` | `Admin@12345` | System Administrator Account |
| **STORE_OWNER** | `Arthur Pendelton Kingsman` | `arthur.kingsman@stores.com` | `Owner@12345` | *The Grand Artisan Bakery Shop* |
| **STORE_OWNER** | `Eleanor Beatrice Vancefield` | `eleanor.vance@stores.com` | `Owner@12345` | *Vancefield Organic Supermarket* |
| **STORE_OWNER** | `Franklin Douglas Sterlingwood` | `franklin.sterling@stores.com` | `Owner@12345` | *Sterlingwood Tech Electronics* |
| **USER** | `Alexander Montgomery Bennett` | `alexander.bennett@user.com` | `User@12345` | Rated Stores 1 (5★) & 2 (4★) |
| **USER** | `Charlotte Elizabeth Harrison` | `charlotte.harrison@user.com` | `User@12345` | Rated Stores 1 (4★) & 3 (5★) |
| **USER** | `Benjamin Theodore Richardson` | `benjamin.richardson@user.com` | `User@12345` | Rated Stores 2 (3★) & 3 (4★) |
| **USER** | `Genevieve Katherine Campbell` | `genevieve.campbell@user.com` | `User@12345` | Rated Stores 1 (5★), 2 (5★) & 3 (3★) |

*Tip: The Login page contains one-click "Quick Fill" demo buttons for Admin, Store Owner, and Normal User.*

---

## API Endpoints Reference

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Public registration for Normal Users (`USER`)
* `POST /api/auth/login` — Single login endpoint for all roles (`ADMIN`, `STORE_OWNER`, `USER`)
* `GET /api/auth/me` — Retrieve currently authenticated user's profile [Bearer Token]
* `POST /api/auth/change-password` — Change password for authenticated user [Bearer Token]

### Users (`/api/users`) — *Requires ADMIN Role*
* `GET /api/users` — Paginated, searchable, sortable list of users with multi-field filters (`search`, `role`, `name`, `email`, `address`, `sortBy`, `sortOrder`, `page`, `limit`)
* `POST /api/users` — Create new user of any role (`ADMIN`, `STORE_OWNER`, `USER`)
* `GET /api/users/available-owners` — Retrieve Store Owner accounts not currently assigned to a store
* `GET /api/users/:id` — User details modal data (includes dynamic store average rating if Store Owner)

### Stores (`/api/stores`)
* `GET /api/stores` — List stores with overall rating and current user's rating (`search`, `name`, `address`, `sortBy`, `sortOrder`)
* `POST /api/stores` — Register a new store (links existing owner or auto-creates new owner) [*ADMIN only*]
* `GET /api/stores/owner/dashboard` — Store Owner dashboard analytics & customer reviews list [*STORE_OWNER only*]

### Ratings (`/api/ratings`) — *Requires USER Role*
* `POST /api/ratings` — Submit or update rating for a store (`storeId`, `rating` 1-5). Returns updated store average and review count.

### Admin Analytics (`/api/admin`) — *Requires ADMIN Role*
* `GET /api/admin/stats` — Overall totals for Users, Stores, Submitted Ratings, and Role demographics

---

## Project Directory Structure

```
store-rating-app/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # PostgreSQL relational schema
│   │   └── seed.js                # Database seeder (satisfying 20-60 char names)
│   ├── scripts/
│   │   └── start-db.js            # Local dev database helper
│   ├── src/
│   │   ├── config/
│   │   │   ├── constants.js       # App constants & regex
│   │   │   └── prisma.js          # PrismaClient instance
│   │   ├── controllers/           # Request/response handling
│   │   │   ├── admin.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── rating.controller.js
│   │   │   ├── store.controller.js
│   │   │   └── user.controller.js
│   │   ├── middlewares/           # JWT verification, RBAC, error handling, Zod validation
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── validate.middleware.js
│   │   ├── routes/                # Express modular routers
│   │   ├── services/              # Business logic & Prisma database interactions
│   │   ├── validations/           # Zod schema definitions
│   │   ├── app.js                 # Express app config (CORS, Helmet, Morgan)
│   │   └── server.js              # Server bootstrapper & graceful shutdown
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js          # Axios client with JWT interceptors
│   │   ├── components/common/
│   │   │   ├── DataTable.jsx      # Reusable sortable & searchable table
│   │   │   ├── Input.jsx          # Form input with live validation & char count
│   │   │   ├── Modal.jsx          # Accessible dialog modal
│   │   │   ├── Navbar.jsx         # Responsive navbar with role badges
│   │   │   ├── ProtectedRoute.jsx # RBAC route guard
│   │   │   ├── StarRating.jsx     # Interactive & display star rating
│   │   │   └── StatCard.jsx       # Metric highlight card
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Authentication & user state
│   │   │   └── ToastContext.jsx   # Toast notification provider
│   │   ├── pages/
│   │   │   ├── admin/             # Admin dashboard, users & stores
│   │   │   ├── auth/              # Login & Register pages
│   │   │   ├── owner/             # Store Owner dashboard & review list
│   │   │   ├── settings/          # Password update & profile
│   │   │   └── user/              # User store directory & rating widget
│   │   ├── utils/
│   │   │   └── validators.js      # Client-side validation logic
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

---

## Setup & Running Locally

### 1. Prerequisites
* **Node.js**: v18 or higher (v20+ recommended)
* **PostgreSQL**: Running instance (port `5432` or `5433`)

### 2. Install Dependencies
From the repository root:
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Database Configuration
1. Configure `backend/.env` (refer to `backend/.env.example`):
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/store_rating_db?schema=public"
   PORT=5000
   JWT_SECRET="store_rating_jwt_super_secret_key_change_in_production_2026"
   CORS_ORIGIN="http://localhost:5173"
   ```

2. Push Prisma Schema and Seed initial data:
   ```bash
   cd backend
   npm run prisma:push
   npm run seed
   ```

### 4. Running the Development Servers
In two separate terminals:

**Terminal 1 — Backend API Server:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 — Frontend Application:**
```bash
cd frontend
npm run dev
# Vite runs on http://localhost:5173
```

Open `http://localhost:5173` in your browser and sign in using any of the seeded credentials.

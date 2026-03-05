# 🟠 Finpatch — Personal Finance Tracker

> A full-stack personal finance web application built with the **PERN stack** (PostgreSQL · Express · React · Node.js). Track transactions, set budgets, manage accounts, monitor loans, and visualize your spending — all in one clean, responsive dashboard.

---

## ✨ Features

- **Transaction Management** — Log income and expenses with category, date, and amount. Separate category lists for income (Salary, Freelance, etc.) and expenses (Groceries, Rent, etc.)
- **Budget Tracking** — Set monthly limits per category with real-time progress bars and color-coded alerts (green / orange / red)
- **Account Management** — Track Bank, Savings, Wallet, and Investment accounts. See total net worth at a glance
- **Loan & Debt Tracker** — Record money you've lent or owe, with per-person tracking
- **Analytics Dashboard** — 6-month income vs expense bar chart and current month expense breakdown by category (pie chart)
- **Multi-Currency Support** — 12+ currencies (NPR, USD, EUR, GBP, INR, AUD, CAD, JPY, CHF, SGD, AED, SAR)
- **Collapsible Sidebar** — Hamburger-toggle sidebar that slides in/out smoothly. On mobile it becomes a full overlay drawer
- **Responsive Design** — Fully mobile-responsive layout across all pages and tabs
- **Delete Confirmation** — Confirm dialog before any destructive action (transactions, budgets, accounts)
- **JWT Authentication** — Secure login with 7-day token expiry and bcrypt password hashing
- **Onboarding Flow** — 2-step wizard on first login to set username and preferred currency

---

## 🛠 Tech Stack
<<<<<<< HEAD

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS |
| **State / Forms** | React Hook Form, Context API |
| **Charts** | Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (via Sequelize ORM) |
| **Auth** | JSON Web Tokens (JWT), bcryptjs |
| **Dev Tools** | Nodemon, PostCSS, Autoprefixer |

---

## 📁 Project Structure

```
finpatch/
├── index.html                    # Vite entry point
├── package.json                  # Shared dependencies (frontend + backend)
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── backend/
    │   ├── index.js              # Express server entry (port 5000)
    │   ├── .env                  # Environment variables
    │   ├── Database/
    │   │   └── db.js             # Sequelize connection + auto-sync
    │   ├── Model/
    │   │   ├── userModel.js
    │   │   ├── transactionModel.js
    │   │   ├── budgetModel.js
    │   │   ├── accountModel.js
    │   │   └── loanModel.js
    │   ├── Controller/
    │   │   ├── userController.js
    │   │   ├── transactionController.js
    │   │   ├── budgetController.js
    │   │   ├── accountController.js
    │   │   └── loanController.js
    │   ├── Routes/
    │   │   ├── userRoute.js
    │   │   ├── transactionRoute.js
    │   │   ├── budgetRoute.js
    │   │   ├── accountRoute.js
    │   │   └── loanRoute.js
    │   └── Middleware/
    │       └── auth.js           # JWT verification middleware
    └── frontend/
        ├── main.jsx
        ├── App.jsx               # Route definitions + auth guards
        ├── index.css             # Tailwind + custom animations
        ├── api/
        │   └── axios.js          # Axios instance with JWT interceptor
        ├── context/
        │   └── AuthContext.jsx   # Global auth state
        └── components/
            ├── LandingPage.jsx   # Public landing / marketing page
            ├── Login.jsx
            ├── Register.jsx
            ├── ForgotPassword.jsx
            ├── Onboarding.jsx    # 2-step currency + name wizard
            ├── Dashboard.jsx     # App shell with collapsible sidebar
            ├── AddModal.jsx      # Universal add form (transactions, budgets, accounts, loans)
            ├── ConfirmDialog.jsx # Reusable delete confirmation dialog
            └── tabs/
                ├── HomeTab.jsx
                ├── AnalysisTab.jsx
                ├── BudgetTab.jsx
                ├── AccountsTab.jsx
                └── ProfileTab.jsx
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** (running locally or remote)
- **npm**

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/finpatch.git
cd finpatch
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Edit `src/backend/.env` with your PostgreSQL credentials:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=finpatch
DB_USER=postgres
DB_PASSWORD=yourpassword

JWT_SECRET=your_super_secret_jwt_key
```

### 4. Create the PostgreSQL database

```sql
CREATE DATABASE finpatch;
```

> Sequelize will auto-create all tables on first run using `sync({ alter: true })`.

### 5. Run the application

Open **two terminals**:

**Terminal 1 — Backend (API server on port 5000)**
```bash
npm run server
```

**Terminal 2 — Frontend (Vite dev server on port 3000)**
```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔌 API Endpoints

All protected routes require a `Bearer <token>` Authorization header.

### Auth — `/api/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Create a new account |
| POST | `/login` | ❌ | Login and receive JWT |
| PUT | `/onboarding` | ✅ | Complete onboarding (set currency) |
| GET | `/profile` | ✅ | Get current user profile |

### Transactions — `/api/transactions`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | Get all transactions |
| POST | `/` | ✅ | Create a transaction |
| DELETE | `/:id` | ✅ | Delete a transaction |
| GET | `/summary` | ✅ | Current month income & expense totals |
| GET | `/monthly` | ✅ | Last 6 months aggregated data (for chart) |
| GET | `/categories` | ✅ | Current month expense breakdown by category |

### Budgets — `/api/budgets`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | Get all budgets (with spent calculation) |
| POST | `/` | ✅ | Create a budget |
| DELETE | `/:id` | ✅ | Delete a budget |

### Accounts — `/api/accounts`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | Get all accounts |
| POST | `/` | ✅ | Add an account |
| DELETE | `/:id` | ✅ | Remove an account |
| GET | `/total` | ✅ | Get total balance across all accounts |

### Loans — `/api/loans`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | Get all loans |
| POST | `/` | ✅ | Record a loan |
| DELETE | `/:id` | ✅ | Remove a loan |
| GET | `/summary` | ✅ | Total lent vs total owed |

---

## 🗂 Database Models

### User
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `customerName` | String | Display name |
| `email` | String | Unique |
| `customerPassword` | String | bcrypt hashed |
| `currency` | String | e.g. `USD` |
| `currencySymbol` | String | e.g. `$` |
| `onboardingComplete` | Boolean | Set after onboarding wizard |

### Transaction
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `userId` | UUID | FK → User |
| `title` | String | Description |
| `amount` | Float | |
| `type` | Enum | `income` or `expense` |
| `category` | String | |
| `date` | DateOnly | |

### Budget
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `userId` | UUID | FK → User |
| `category` | String | |
| `budgetLimit` | Float | Monthly limit |
| `color` | String | Hex color for UI |

### Account
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `userId` | UUID | FK → User |
| `name` | String | Account label |
| `type` | Enum | `Bank`, `Savings`, `Wallet`, `Investing`, `Other` |
| `balance` | Float | |
| `color` | String | Hex color for UI |

### Loan
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `userId` | UUID | FK → User |
| `personName` | String | |
| `amount` | Float | |
| `type` | Enum | `lent` or `owed` |
| `date` | DateOnly | |
| `description` | String | Optional note |

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0A0805` | Page background |
| Card | `#141210` | Card surfaces |
| Border | `#1E1A14` | Dividers, borders |
| Accent | `#F4927A` | Primary CTA, active states |
| Income | `#22C55E` | Income amounts, positive values |
| Expense | `#EF4444` | Expense amounts, warnings |
| Text Primary | `#F5F0EB` | Headings, values |
| Text Secondary | `#8C8578` | Labels, subtitles |
| Muted | `#5C5448` | Placeholder, disabled |

**Font:** [Outfit](https://fonts.google.com/specimen/Outfit) (weights 400–900)

---

## 📱 Responsive Behavior

| Breakpoint | Sidebar | Navigation |
|---|---|---|
| `≥ 768px` (Desktop) | Inline — collapses to `width: 0` on hamburger click | Always visible in sidebar |
| `< 768px` (Mobile) | Fixed overlay drawer — toggled by hamburger | Icon quick-nav in topbar |

---

## 🔐 Authentication Flow

1. User registers → password is hashed with **bcryptjs** → JWT returned
2. JWT stored in **localStorage** and sent with every API request via Axios interceptor
3. On dashboard load, token is verified by the `auth` middleware on all protected routes
4. Onboarding flag (`onboardingComplete`) gates access to the dashboard — incomplete users are redirected to the setup wizard
5. Token expires after **7 days** — user is logged out and redirected to the landing page

---

## 📦 Available Scripts

```bash
npm run dev       # Start Vite frontend dev server (port 3000)
npm run server    # Start Express backend with nodemon (port 5000)
npm run build     # Production build of frontend
npm run preview   # Preview production build locally
npm run start     # Start backend without nodemon (production)
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

=======

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS |
| **State / Forms** | React Hook Form, Context API |
| **Charts** | Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (via Sequelize ORM) |
| **Auth** | JSON Web Tokens (JWT), bcryptjs |
| **Dev Tools** | Nodemon, PostCSS, Autoprefixer |

---

## 📁 Project Structure

```
finpatch/
├── index.html                    # Vite entry point
├── package.json                  # Shared dependencies (frontend + backend)
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── backend/
    │   ├── index.js              # Express server entry (port 5000)
    │   ├── .env                  # Environment variables
    │   ├── Database/
    │   │   └── db.js             # Sequelize connection + auto-sync
    │   ├── Model/
    │   │   ├── userModel.js
    │   │   ├── transactionModel.js
    │   │   ├── budgetModel.js
    │   │   ├── accountModel.js
    │   │   └── loanModel.js
    │   ├── Controller/
    │   │   ├── userController.js
    │   │   ├── transactionController.js
    │   │   ├── budgetController.js
    │   │   ├── accountController.js
    │   │   └── loanController.js
    │   ├── Routes/
    │   │   ├── userRoute.js
    │   │   ├── transactionRoute.js
    │   │   ├── budgetRoute.js
    │   │   ├── accountRoute.js
    │   │   └── loanRoute.js
    │   └── Middleware/
    │       └── auth.js           # JWT verification middleware
    └── frontend/
        ├── main.jsx
        ├── App.jsx               # Route definitions + auth guards
        ├── index.css             # Tailwind + custom animations
        ├── api/
        │   └── axios.js          # Axios instance with JWT interceptor
        ├── context/
        │   └── AuthContext.jsx   # Global auth state
        └── components/
            ├── LandingPage.jsx   # Public landing / marketing page
            ├── Login.jsx
            ├── Register.jsx
            ├── ForgotPassword.jsx
            ├── Onboarding.jsx    # 2-step currency + name wizard
            ├── Dashboard.jsx     # App shell with collapsible sidebar
            ├── AddModal.jsx      # Universal add form (transactions, budgets, accounts, loans)
            ├── ConfirmDialog.jsx # Reusable delete confirmation dialog
            └── tabs/
                ├── HomeTab.jsx
                ├── AnalysisTab.jsx
                ├── BudgetTab.jsx
                ├── AccountsTab.jsx
                └── ProfileTab.jsx
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** (running locally or remote)
- **npm**

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/finpatch.git
cd finpatch
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Edit `src/backend/.env` with your PostgreSQL credentials:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=finpatch
DB_USER=postgres
DB_PASSWORD=yourpassword

JWT_SECRET=your_super_secret_jwt_key
```

### 4. Create the PostgreSQL database

```sql
CREATE DATABASE finpatch;
```

> Sequelize will auto-create all tables on first run using `sync({ alter: true })`.

### 5. Run the application

Open **two terminals**:

**Terminal 1 — Backend (API server on port 5000)**
```bash
npm run server
```

**Terminal 2 — Frontend (Vite dev server on port 3000)**
```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔌 API Endpoints

All protected routes require a `Bearer <token>` Authorization header.

### Auth — `/api/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Create a new account |
| POST | `/login` | ❌ | Login and receive JWT |
| PUT | `/onboarding` | ✅ | Complete onboarding (set currency) |
| GET | `/profile` | ✅ | Get current user profile |

### Transactions — `/api/transactions`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | Get all transactions |
| POST | `/` | ✅ | Create a transaction |
| DELETE | `/:id` | ✅ | Delete a transaction |
| GET | `/summary` | ✅ | Current month income & expense totals |
| GET | `/monthly` | ✅ | Last 6 months aggregated data (for chart) |
| GET | `/categories` | ✅ | Current month expense breakdown by category |

### Budgets — `/api/budgets`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | Get all budgets (with spent calculation) |
| POST | `/` | ✅ | Create a budget |
| DELETE | `/:id` | ✅ | Delete a budget |

### Accounts — `/api/accounts`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | Get all accounts |
| POST | `/` | ✅ | Add an account |
| DELETE | `/:id` | ✅ | Remove an account |
| GET | `/total` | ✅ | Get total balance across all accounts |

### Loans — `/api/loans`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | Get all loans |
| POST | `/` | ✅ | Record a loan |
| DELETE | `/:id` | ✅ | Remove a loan |
| GET | `/summary` | ✅ | Total lent vs total owed |

---

## 🗂 Database Models

### User
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `customerName` | String | Display name |
| `email` | String | Unique |
| `customerPassword` | String | bcrypt hashed |
| `currency` | String | e.g. `USD` |
| `currencySymbol` | String | e.g. `$` |
| `onboardingComplete` | Boolean | Set after onboarding wizard |

### Transaction
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `userId` | UUID | FK → User |
| `title` | String | Description |
| `amount` | Float | |
| `type` | Enum | `income` or `expense` |
| `category` | String | |
| `date` | DateOnly | |

### Budget
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `userId` | UUID | FK → User |
| `category` | String | |
| `budgetLimit` | Float | Monthly limit |
| `color` | String | Hex color for UI |

### Account
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `userId` | UUID | FK → User |
| `name` | String | Account label |
| `type` | Enum | `Bank`, `Savings`, `Wallet`, `Investing`, `Other` |
| `balance` | Float | |
| `color` | String | Hex color for UI |

### Loan
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `userId` | UUID | FK → User |
| `personName` | String | |
| `amount` | Float | |
| `type` | Enum | `lent` or `owed` |
| `date` | DateOnly | |
| `description` | String | Optional note |

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0A0805` | Page background |
| Card | `#141210` | Card surfaces |
| Border | `#1E1A14` | Dividers, borders |
| Accent | `#F4927A` | Primary CTA, active states |
| Income | `#22C55E` | Income amounts, positive values |
| Expense | `#EF4444` | Expense amounts, warnings |
| Text Primary | `#F5F0EB` | Headings, values |
| Text Secondary | `#8C8578` | Labels, subtitles |
| Muted | `#5C5448` | Placeholder, disabled |

**Font:** [Outfit](https://fonts.google.com/specimen/Outfit) (weights 400–900)

---

## 📱 Responsive Behavior

| Breakpoint | Sidebar | Navigation |
|---|---|---|
| `≥ 768px` (Desktop) | Inline — collapses to `width: 0` on hamburger click | Always visible in sidebar |
| `< 768px` (Mobile) | Fixed overlay drawer — toggled by hamburger | Icon quick-nav in topbar |

---

## 🔐 Authentication Flow

1. User registers → password is hashed with **bcryptjs** → JWT returned
2. JWT stored in **localStorage** and sent with every API request via Axios interceptor
3. On dashboard load, token is verified by the `auth` middleware on all protected routes
4. Onboarding flag (`onboardingComplete`) gates access to the dashboard — incomplete users are redirected to the setup wizard
5. Token expires after **7 days** — user is logged out and redirected to the landing page

---

## 📦 Available Scripts

```bash
npm run dev       # Start Vite frontend dev server (port 3000)
npm run server    # Start Express backend with nodemon (port 5000)
npm run build     # Production build of frontend
npm run preview   # Preview production build locally
npm run start     # Start backend without nodemon (production)
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---
>>>>>>> 69198265e771a945093a0b095cb94c304b11906f

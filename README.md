\# FinGuard — Wallet \& Expense Management System



A full-stack MERN application for managing personal wallets, tracking transactions, monitoring budgets, and detecting suspicious financial activity. Built as a 6th-semester Web Engineering project at FAST University Islamabad.



\## Live Demo



\- \*\*Frontend (Vercel):\*\* https://fin-guard-wallet.vercel.app

\- \*\*Backend API (Render):\*\* https://finguard-wallet.onrender.com/api

\- \*\*Health Check:\*\* https://finguard-wallet.onrender.com/api/health

\- \*\*GitHub Repo:\*\* https://github.com/sarahk7204/FinGuard-wallet



> ⚠️ The backend is hosted on Render's free tier and sleeps after 15 minutes of inactivity. The first request after a sleep takes 30–60 seconds to wake up.



\## Features



\### User

\- Register, login, and JWT-based authentication

\- Personal wallet with deposit, withdraw, and transfer

\- Transaction history with filtering and downloadable receipts

\- Expense tracking with category breakdown

\- Budget creation with progress tracking and warnings when nearing/exceeding limits

\- Spending reports and analytics

\- Notifications for important account events

\- Profile management and password change



\### Admin

\- Admin dashboard with platform-wide statistics

\- View, block, and manage all users

\- View and freeze user wallets

\- View all platform transactions

\- Review flagged/suspicious transactions

\- Manage transaction categories

\- Generate platform-level reports



\### Suspicious Transaction Detection

The system automatically flags transactions matching any of these rules:

\- Large transfer above a configured threshold

\- Multiple rapid transfers in a short time window

\- Repeated transfers of the same exact amount

\- Transfers from a newly created account

\- Withdrawal that empties most of the wallet balance



\## Tech Stack



\*\*Frontend:\*\* React 18, React Router, Vite, Context API, Axios, plain CSS  

\*\*Backend:\*\* Node.js, Express, Mongoose ODM  

\*\*Database:\*\* MongoDB Atlas (cloud)  

\*\*Auth:\*\* JWT (JSON Web Tokens) + bcrypt password hashing  

\*\*Deployment:\*\* Vercel (frontend), Render (backend), MongoDB Atlas (DB)



\## Project Structure

fintech-wallet-system/

├── backend/

│   ├── config/          # Database connection

│   ├── controllers/     # Route handlers (auth, wallet, transactions, admin, etc.)

│   ├── middleware/      # Auth middleware, error handler

│   ├── models/          # Mongoose schemas (User, Wallet, Transaction, Budget, etc.)

│   ├── routes/          # Express route definitions

│   ├── seed/            # Admin seeder script

│   ├── utils/           # Helper utilities (token generation, suspicious rules, etc.)

│   ├── app.js           # Express app + middleware setup

│   └── server.js        # Entry point + DB connection

└── frontend/

├── src/

│   ├── components/  # Reusable UI (Navbar, Sidebar, Modal, etc.)

│   ├── context/     # AuthContext

│   ├── hooks/       # Custom hooks (useAuth)

│   ├── pages/       # Route pages (user/, admin/, auth/)

│   ├── routes/      # AppRoutes, ProtectedRoute, AdminRoute

│   ├── services/    # API client modules

│   ├── styles/      # global.css

│   ├── App.jsx

│   └── main.jsx

├── index.html

└── vite.config.js


\## Getting Started Locally



\### Prerequisites



\- Node.js v18 or higher (\[download](https://nodejs.org))

\- npm (comes with Node.js)

\- A MongoDB Atlas account (\[free signup](https://www.mongodb.com/atlas))

\- Git



\### 1. Clone the repository



```bash

git clone https://github.com/sarahk7204/FinGuard-wallet.git

cd FinGuard-wallet

```



\### 2. Backend setup



```bash

cd backend

npm install

```



Create a `.env` file in `backend/` with the following keys (do not share or commit this file):



PORT=5000

MONGO\_URI=<your MongoDB Atlas connection string>

JWT\_SECRET=<any long random string, at least 32 characters>

FRONTEND\_URL=http://localhost:5173

NODE\_ENV=development


Seed the admin account (run only once):



```bash

node seed/adminSeeder.js

```



Default admin credentials (change immediately after first login):

\- Email: `admin@finguard.com`

\- Password: `Admin@123`



Start the backend:



```bash

npm start

```



The API will run at `http://localhost:5000`. Verify with `GET http://localhost:5000/api/health`.



\### 3. Frontend setup



In a new terminal:



```bash

cd frontend

npm install

```



Create a `.env` file in `frontend/`:

VITE\_API\_URL=http://localhost:5000/api

Start the frontend:



```bash

npm run dev

```



Open `http://localhost:5173` in your browser.



\## Environment Variables Reference



\### Backend (`backend/.env`)



| Key | Description |

|---|---|

| `PORT` | Port the Express server listens on (e.g., 5000) |

| `MONGO\_URI` | MongoDB connection string from Atlas |

| `JWT\_SECRET` | Secret used to sign JSON Web Tokens |

| `FRONTEND\_URL` | URL of the frontend, used for CORS allowlist |

| `NODE\_ENV` | `development` locally, `production` on Render |



\### Frontend (`frontend/.env`)



| Key | Description |

|---|---|

| `VITE\_API\_URL` | Base URL of the backend API (must include `/api`) |



> Vite only exposes env variables prefixed with `VITE\_` to the browser.



\## Deployment



\- \*\*Backend (Render)\*\* — auto-deploys from the `main` branch. Root directory: `backend`. Environment variables (`MONGO\_URI`, `JWT\_SECRET`, `FRONTEND\_URL`, `NODE\_ENV`) are configured in the Render dashboard.

\- \*\*Frontend (Vercel)\*\* — auto-deploys from the `main` branch. Root directory: `frontend`. Framework preset: Vite. `VITE\_API\_URL` is configured in the Vercel dashboard. SPA rewrites are configured in `frontend/vercel.json`.

\- \*\*Database (MongoDB Atlas)\*\* — free M0 cluster. Network access is open to `0.0.0.0/0` so Render can connect.



\## API Overview



All endpoints are prefixed with `/api`.



| Module | Sample Endpoints |

|---|---|

| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PUT /auth/change-password` |

| Wallet | `GET /wallet`, `POST /wallet/deposit`, `POST /wallet/withdraw`, `POST /wallet/transfer` |

| Transactions | `GET /transactions`, `GET /transactions/:id`, `GET /transactions/:id/receipt` |

| Budgets | `GET /budgets`, `POST /budgets`, `PUT /budgets/:id`, `DELETE /budgets/:id` |

| Notifications | `GET /notifications`, `PATCH /notifications/:id/read` |

| Admin | `GET /admin/dashboard`, `GET /admin/users`, `PATCH /admin/users/:id/block`, `GET /admin/transactions/flagged` |



A full Postman collection with example requests and responses is included in `/docs/FinGuard.postman\_collection.json` (or attached separately with the submission).



\## Postman Testing



The project was tested with 25+ Postman test cases covering both success and failure scenarios across all modules — auth, wallet, transactions, and admin. Both local and deployed (Render) endpoints were tested. Screenshots are included in the submission.



\## Author



\*\*Sara Hashim, Maha Faisal, Amna Arshad, and Shaheer Ahmed\*\* — FAST University Islamabad, BS Computer Science, 6th Semester  

Course: Web Engineering



\## License



This project was built for academic purposes.


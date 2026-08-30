# ApexHub — All-in-One Tasks, Finance & Study Suite

ApexHub is a modern, unified MERN productivity application combining **Task & Note Management (Kanban/List)**, a **Full-Featured Personal Finance & Budget Tracker**, and an **Academic Study Planner with a Pomodoro Focus Studio**.

---

## 🌟 Key Features

### 1. 📊 Personal Overview Hub
- **Command Center Dashboard**: Unified snapshot of today's pending tasks, financial health, study hours, active streaks, and upcoming deadlines.
- **Quick Focus & Speed Actions**: 1-click Pomodoro focus session launcher and rapid task creator directly from the overview.

### 2. 💰 Comprehensive Finance & Expense Tracker
- **Cashflow & Net Balance**: Real-time calculation of Net Worth, Monthly Income, Monthly Expenses, and Savings Rate (%).
- **Monthly Category Budgeting**: Set spending caps per category (e.g. *Food & Dining*, *Education*, *Entertainment*, *Shopping*) with visual progress bars and dynamic warning alerts (>=80% and over-budget thresholds).
- **Interactive Savings Goals**: Goal cards with progress meters, target completion dates, remaining balances, and a 1-click **Deposit Funds** modal.
- **Filterable Transaction Feed & CSV Export**: Filter by type (*All / Expense / Income*), Category, or live search. Export transaction history to CSV.

### 3. 🎓 Academic Study Planner & Pomodoro Studio
- **Interactive Pomodoro Focus Timer**: Circular progress ring with live seconds countdown. Modes for **Focus (25m)**, **Short Break (5m)**, and **Long Break (15m)**.
- **Harmonic Audio Chimes**: Web Audio API synthesized chimes alert you when focus or break sessions end without requiring external sound files.
- **Auto Session Logging**: Completed focus sprints automatically log duration and topic to your weekly study hours.
- **Course Subjects & Syllabus Mastery**: Manage courses with custom color themes, instructor details, target weekly hours, and expandable topic checklists.
- **Exam & Assignment Countdown Matrix**: Chronologically sorted countdowns with urgency badges (*"Today!"*, *"Tomorrow"*, *"In 3 days"*, *"Overdue"*), submission weightage, and priority tags.
- **Study Analytics**: Track total study hours and daily study streak with an animated flame indicator.

### 4. 📋 Tasks & Embedded Notes
- **Kanban Board vs. List View**: Switch between interactive Kanban lanes (*To Do*, *Urgent / High Priority*, *Completed*) and clean list view.
- **Priority & Status Filters**: Filter by priority (*High, Medium, Low*) or active/completed status.
- **Embedded Note Drawers**: Attach multiple timestamped notes to any task.

### 5. 🎨 Modern Design & Aesthetics
- **Tailored UI**: Glassmorphic cards, glowing accents, vibrant Tailwind palette, custom scrollbars, and smooth micro-animations.
- **Instant Demo Mode**: 1-click Guest/Demo login option for instant testing without requiring manual account registration.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6, Tailwind CSS, Lucide Icons, Date-fns, React-Toastify
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), Express-Validator, Bcrypt.js, Dotenv
- **Database**: MongoDB with Mongoose ODM

---

## 📁 Project Structure

```
todo-notes-app/
├── client/                     # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Layout, TodoForm, TodoItem, NotesList
│   │   ├── contexts/           # AuthContext, TodoContext, FinanceContext, StudyContext
│   │   ├── pages/              # OverviewHub, Dashboard, FinanceTracker, StudyPlanner, Login, Register
│   │   ├── utils/              # Axios API client
│   │   ├── App.js              # Routing & Provider setup
│   │   └── index.css           # Modern design system & utilities
│   ├── package.json
│   └── tailwind.config.js
├── server/                     # Express Backend
│   ├── middleware/             # JWT Auth middleware
│   ├── models/                 # User, Todo, Finance (Transactions/Budgets/Goals), Study (Subjects/Deadlines/Sessions)
│   ├── routes/                 # auth.js, todos.js, finance.js, study.js
│   ├── init-db.js              # Database initialization & seeding script
│   ├── package.json
│   └── server.js               # Express application entry
├── quick-start.bat             # 1-Click launcher for Windows
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (Local MongoDB Community Server or MongoDB Atlas Cloud)

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd todo-notes-app
   ```

2. **Install Backend dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend dependencies:**
   ```bash
   cd ../client
   npm install
   ```

---

### Configuration (`.env`)

#### Backend Configuration (`server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/notes-todo
JWT_SECRET=apexhub_super_secret_jwt_key_2026_dev_mode_change_in_production
JWT_EXPIRE=7d
```

> **Using MongoDB Atlas?** Replace `MONGODB_URI` with your connection string:
> `mongodb+srv://<username>:<password>@cluster0.mongodb.net/notes-todo?retryWrites=true&w=majority`

#### Frontend Configuration (`client/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

### Database Initialization & Seeding

Populate the database with demo users, tasks, transactions, budgets, courses, and upcoming exams:

```bash
cd server
npm run seed
# or: node init-db.js
```

---

### Running the Application

#### Option 1: One-Click Quick Start (Windows)
Double-click [`quick-start.bat`](quick-start.bat) to start both backend and frontend servers simultaneously.

#### Option 2: Run via Terminal

**Terminal 1 — Backend (Port 5000):**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend (Port 3000):**
```bash
cd client
npm start
# or: npm run dev
```

Open **`http://localhost:3000`** in your browser.

---

## 📡 API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login user & return JWT |
| `GET` | `/api/auth/user` | Fetch current user profile |

### 📋 Tasks & Notes (`/api/todos`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/todos` | Fetch all user tasks |
| `POST` | `/api/todos` | Create a new task |
| `PUT` | `/api/todos/:id` | Update task status or priority |
| `DELETE` | `/api/todos/:id` | Delete task |
| `POST` | `/api/todos/:id/notes` | Add note to a task |
| `DELETE` | `/api/todos/:id/notes/:noteId` | Remove note from a task |

### 💰 Finance Tracker (`/api/finance`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/finance/transactions` | Fetch transactions (filters: type, category, date, search) |
| `POST` | `/api/finance/transactions` | Record new transaction |
| `PUT` | `/api/finance/transactions/:id` | Edit transaction |
| `DELETE` | `/api/finance/transactions/:id` | Delete transaction |
| `GET` | `/api/finance/summary` | Get balance, total income, expense & category breakdown |
| `GET` / `POST` | `/api/finance/budgets` | Get or set category spending limits |
| `GET` / `POST` / `PUT` / `DELETE` | `/api/finance/goals` | Manage savings goals and deposits |

### 🎓 Study Planner (`/api/study`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` / `POST` / `PUT` / `DELETE` | `/api/study/subjects` | Manage course subjects & syllabus topics |
| `GET` / `POST` | `/api/study/sessions` | Fetch session history or log Pomodoro sprint |
| `GET` | `/api/study/stats` | Get total hours, daily minutes, and streak stats |
| `GET` / `POST` / `PUT` / `DELETE` | `/api/study/deadlines` | Manage exam and assignment countdowns |

---

## 📄 License

This project is licensed under the MIT License.

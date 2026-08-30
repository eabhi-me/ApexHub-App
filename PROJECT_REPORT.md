# ApexHub — Comprehensive Project Report & Architecture Document

## 📋 Executive Summary

**ApexHub** is an all-in-one productivity, financial management, and academic study suite designed for students and professionals. Built on the **MERN** (MongoDB, Express.js, React 18, Node.js) stack, ApexHub bridges the gap between daily task execution, budget tracking, and focused academic study.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           REACT CLIENT (Frontend)                       │
│  - Overview Hub       - Tasks & Notes (Kanban/List)                     │
│  - Finance Tracker    - Study Planner & Pomodoro Studio                 │
│  - Context State: AuthContext, TodoContext, FinanceContext, StudyContext│
└────────────────────────────────────┬────────────────────────────────────┘
                                     │  HTTPS / REST APIs (JWT Auth)
┌────────────────────────────────────▼────────────────────────────────────┐
│                          EXPRESS SERVER (Backend)                       │
│  - Auth Middleware    - Error Handler Middleware                        │
│  - Routes: /api/auth, /api/todos, /api/finance, /api/study              │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │  Mongoose ODM (BSON)
┌────────────────────────────────────▼────────────────────────────────────┐
│                            MONGODB DATABASE                             │
│  Collections: users, todos, transactions, budgets,                      │
│               savingsgoals, subjects, studysessions, deadlines          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technology Stack

### Frontend Architecture
- **React 18** — Component-driven declarative UI with custom React Contexts
- **React Router DOM v6** — Client-side SPA routing with protected route guards
- **Tailwind CSS** — Utility-first styling extended with custom glassmorphism, glow shadows, and mesh gradients
- **Lucide Icons** — Clean, consistent vector iconography
- **React-Toastify** — Non-blocking system notifications
- **Date-fns** — High-performance date math and calendar formatting
- **Web Audio API** — Synthesized harmonic audio bell chimes for Pomodoro timers (zero external audio dependencies)

### Backend Architecture
- **Node.js (v18+)** & **Express.js** — Event-driven RESTful API server
- **MongoDB & Mongoose ODM** — Document-oriented schema modeling with indexing and validation
- **JSON Web Tokens (JWT)** — Stateless token-based user authentication (7-day validity)
- **Bcrypt.js** — Salted password hashing (12 rounds)
- **Express-Validator** — Server-side request sanitization and schema validation
- **Dotenv & CORS** — Environment configuration and secure Cross-Origin Resource Sharing

---

## 🎯 Deep Dive: Core Feature Modules

### 1. 📊 Personal Overview Hub (`/overview`)
- **Daily Command Center**: Real-time snapshot aggregating pending tasks, monthly financial balance, study streak days, and next imminent exam countdown.
- **Quick Focus Launcher**: Start an instant 25-minute Pomodoro focus session directly from the overview.
- **Speed Dial Task Creator**: Rapid inline task addition with automatic priority assignment.

### 2. 💰 Comprehensive Finance & Expense Tracker (`/finance`)
- **Cashflow & Net Worth**: Live calculation of Total Net Balance, Monthly Income, Monthly Expense, and Net Savings Rate (%).
- **Monthly Category Budgeting**:
  - Configure monthly spending caps per category (*Food & Dining*, *Housing*, *Transportation*, *Education*, *Entertainment*, *Shopping*, *Health*, *Utilities*).
  - Dynamic progress bars with 3-tier threshold warnings (Green < 80%, Amber 80–99%, Red with alert badge >= 100%).
- **Interactive Savings Goals**:
  - Goal cards with completion progress bars, target dates, and remaining balances.
  - Dedicated **Deposit Funds** modal for logging incremental deposits.
- **Filterable Transaction History & CSV Export**:
  - Multi-tab filtering (*All / Expense / Income*), Category dropdown, and real-time keyword search.
  - One-click **Export to CSV** for spreadsheet reporting.

### 3. 🎓 Academic Study Planner & Pomodoro Studio (`/study`)
- **Interactive Pomodoro Timer**:
  - Circular animated progress ring with live second-by-second countdown.
  - Three distinct modes: **Focus (25m)**, **Short Break (5m)**, and **Long Break (15m)**.
  - Associated course subject and session topic selector.
  - **Harmonic Audio Chime**: Native Web Audio API sine wave oscillator chimes on session completion.
  - Automatic session logging to weekly study hours upon timer completion.
- **Course Subjects & Syllabus Mastery**:
  - Subject cards with custom color accents, course code, instructor info, and weekly study hour targets.
  - Expandable Syllabus Checklist with topic checkboxes and percentage mastery progress.
- **Exam & Assignment Deadlines Matrix**:
  - Chronological countdown cards with dynamic urgency badges (*"Today!"*, *"Tomorrow"*, *"In 3 days"*, *"Overdue"*).
  - Category tags (*Exam, Assignment, Project, Quiz, Presentation*) and weightage tracking (*e.g., "30%"*).
- **Study Analytics & Streaks**:
  - Total cumulative study hours and active daily streak counter with animated flame.

### 4. 📋 Tasks & Embedded Notes (`/dashboard`)
- **Kanban Board vs. List View**:
  - Kanban lanes: **To Do**, **Urgent / High Priority**, and **Completed**.
  - Traditional list view with priority badges (*High, Medium, Low*) and due-date alerts.
- **Embedded Note Drawers**:
  - Attach multiple timestamped notes to any task.
  - Full CRUD operations on task-specific notes.

---

## 🗄️ Database Schemas (Mongoose)

### 1. User Schema (`server/models/User.js`)
```javascript
{
  username: { type: String, required: true, unique: true, minlength: 3, maxlength: 20 },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Todo Schema (`server/models/Todo.js`)
```javascript
{
  userId:      { type: ObjectId, ref: 'User', required: true, index: true },
  title:       { type: String, required: true, maxlength: 200 },
  description: { type: String, maxlength: 1000 },
  completed:   { type: Boolean, default: false },
  priority:    { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate:     Date,
  notes: [{
    content:   { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}
```

### 3. Finance Schemas (`server/models/Finance.js`)
```javascript
// Transaction
{
  userId:        { type: ObjectId, ref: 'User', required: true, index: true },
  type:          { type: String, enum: ['income', 'expense'], required: true },
  amount:        { type: Number, required: true, min: 0.01 },
  category:      { type: String, required: true, default: 'General' },
  description:   { type: String, maxlength: 300 },
  paymentMethod: { type: String, enum: ['Cash', 'Credit Card', 'Debit Card', 'UPI / Bank', 'Crypto', 'Other'], default: 'UPI / Bank' },
  date:          { type: Date, default: Date.now },
  isRecurring:   { type: Boolean, default: false },
  tags:          [String]
}

// Category Budget
{
  userId:       { type: ObjectId, ref: 'User', required: true, index: true },
  category:     { type: String, required: true },
  monthlyLimit: { type: Number, required: true, min: 1 },
  monthYear:    { type: String, required: true } // 'YYYY-MM'
}

// Savings Goal
{
  userId:        { type: ObjectId, ref: 'User', required: true, index: true },
  title:         { type: String, required: true },
  targetAmount:  { type: Number, required: true, min: 1 },
  currentAmount: { type: Number, default: 0 },
  targetDate:    Date,
  color:         { type: String, default: '#6366f1' }
}
```

### 4. Study Schemas (`server/models/Study.js`)
```javascript
// Subject & Syllabus
{
  userId:             { type: ObjectId, ref: 'User', required: true, index: true },
  name:               { type: String, required: true },
  code:               String,
  color:              { type: String, default: '#6366f1' },
  instructor:         String,
  targetHoursPerWeek: { type: Number, default: 5 },
  topics: [{
    title:            { type: String, required: true },
    completed:        { type: Boolean, default: false },
    completedAt:      Date
  }]
}

// Study Session
{
  userId:             { type: ObjectId, ref: 'User', required: true, index: true },
  subjectId:          { type: ObjectId, ref: 'Subject' },
  durationMinutes:    { type: Number, required: true, min: 1 },
  topic:              String,
  pomodorosCompleted: { type: Number, default: 1 },
  date:               { type: Date, default: Date.now }
}

// Deadline
{
  userId:             { type: ObjectId, ref: 'User', required: true, index: true },
  subjectId:          { type: ObjectId, ref: 'Subject' },
  title:              { type: String, required: true },
  type:               { type: String, enum: ['Exam', 'Assignment', 'Quiz', 'Project', 'Presentation'], default: 'Exam' },
  dueDate:            { type: Date, required: true },
  priority:           { type: String, enum: ['low', 'medium', 'high'], default: 'high' },
  weightage:          String,
  completed:          { type: Boolean, default: false },
  notes:              String
}
```

---

## 🛣️ Complete API Reference

### 🔐 Authentication (`/api/auth`)
- `POST /register` — Register a new account
- `POST /login` — Authenticate credentials & generate JWT
- `GET /user` — Retrieve authenticated user profile

### 📋 Task Management (`/api/todos`)
- `GET /` — Fetch authenticated user tasks
- `POST /` — Create a new task
- `PUT /:id` — Update task status, priority, or fields
- `DELETE /:id` — Remove a task
- `POST /:id/notes` — Add a note to a task
- `PUT /:id/notes/:noteId` — Update note content
- `DELETE /:id/notes/:noteId` — Remove a note

### 💰 Finance Tracking (`/api/finance`)
- `GET /transactions` — Query transactions with filters (`type`, `category`, `month`, `search`)
- `POST /transactions` — Record a new transaction
- `PUT /transactions/:id` — Update a transaction
- `DELETE /transactions/:id` — Delete a transaction
- `GET /summary` — Retrieve balance, income, expense, and category distribution
- `GET /budgets` — Get active monthly category budgets
- `POST /budgets` — Set or update category budget limits
- `GET /goals` — Fetch savings goals
- `POST /goals` — Create a savings goal
- `PUT /goals/:id` — Update savings goal (deposit funds or edit)
- `DELETE /goals/:id` — Delete a savings goal

### 🎓 Study Planning (`/api/study`)
- `GET /subjects` — Retrieve all course subjects and syllabus topics
- `POST /subjects` — Create a new subject
- `PUT /subjects/:id` — Update subject details or syllabus checklist
- `DELETE /subjects/:id` — Delete subject and associated data
- `GET /sessions` — Retrieve study session logs
- `POST /sessions` — Log a completed Pomodoro session
- `GET /stats` — Calculate total hours, streak days, and subject distribution
- `GET /deadlines` — Retrieve exam and assignment deadlines
- `POST /deadlines` — Create a deadline
- `PUT /deadlines/:id` — Update deadline status or due date
- `DELETE /deadlines/:id` — Delete a deadline

---

## 🔐 Security & Data Isolation

1. **Authentication**: Stateless JSON Web Tokens (JWT) verified on every private request via Express middleware.
2. **Password Cryptography**: Passwords salted and hashed with `bcryptjs` before database persistence.
3. **Multi-Tenant User Isolation**: Every database query is scoped strictly to `userId: req.user._id`, ensuring zero cross-user data leakage.
4. **Resilient Local Fallback**: Client-side state gracefully persists to browser `localStorage` in offline or demo modes, ensuring uninterrupted user experience.

---

## 🚀 Deployment & Local Execution

### 1. Automated Setup via Batch Script
Run [`quick-start.bat`](quick-start.bat) from the root folder.

### 2. Manual Command Line Startup

**Backend Server (Port 5000):**
```bash
cd server
npm install
npm run seed     # Optional: Seed sample database
npm run dev
```

**Frontend Client (Port 3000):**
```bash
cd client
npm install
npm start
```

### 3. Application Access
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **Demo Mode**: 1-click login available on the login screen for immediate feature demonstration.

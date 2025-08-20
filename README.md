# Multiuser Todo App with Notes

A full-stack todo application with user authentication and notes feature built with the MERN stack.

## Features

- User authentication (register/login)
- Create, edit, delete todos
- Add notes to todos
- Responsive design with Tailwind CSS
- Real-time updates

## Tech Stack

- **Frontend**: React 18, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT

## Project Structure

```
notes_todo/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.js
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── package.json
│   └── server.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or MongoDB Atlas)

### Quick Start

1. **Double-click `start.bat`** to launch both servers automatically
   
   **OR manually:**

2. **Start the server:**
   ```bash
   cd server
   npm run dev
   ```

3. **Start the client:**
   ```bash
   cd client
   npm run start-windows
   ```

### Configuration

- Update `server/.env` with your MongoDB connection string (already configured)
- The JWT secret is set for development

### Access

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Todos
- `GET /api/todos` - Get user's todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

### Notes
- `POST /api/todos/:id/notes` - Add a note to a todo
- `PUT /api/todos/:id/notes/:noteId` - Update a note
- `DELETE /api/todos/:id/notes/:noteId` - Delete a note

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

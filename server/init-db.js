const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Todo = require('./models/Todo');
const { Transaction, Budget, SavingsGoal } = require('./models/Finance');
const { Subject, StudySession, Deadline } = require('./models/Study');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-todo';

async function initDatabase() {
  console.log('========================================================');
  console.log('  ApexHub MongoDB Database & Collections Initializer');
  console.log('========================================================');
  console.log(`Connecting to: ${MONGODB_URI} ...\n`);

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully!\n');

    // 1. Setup Demo User
    console.log('📌 1. Initializing User Collection...');
    let user = await User.findOne({ email: 'demo@example.com' });
    if (!user) {
      user = new User({
        username: 'Alex Carter',
        email: 'demo@example.com',
        password: 'password123'
      });
      await user.save();
      console.log('   -> Created Demo User: demo@example.com (Password: password123)');
    } else {
      console.log('   -> Demo User exists: demo@example.com');
    }

    const userId = user._id;

    // 2. Setup Todos
    console.log('📌 2. Initializing Todos Collection...');
    const todoCount = await Todo.countDocuments({ userId });
    if (todoCount === 0) {
      await Todo.insertMany([
        {
          userId,
          title: 'Review Data Structures dynamic programming lecture notes',
          description: 'Focus on 0/1 Knapsack and longest common subsequence patterns',
          priority: 'high',
          completed: false,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          notes: [{ content: 'Review chapter 6 practice set 1-12' }]
        },
        {
          userId,
          title: 'Submit DBMS Relational Algebra Lab Assignment',
          description: 'Format queries and export PDF with ER diagram',
          priority: 'medium',
          completed: true,
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          notes: [{ content: 'Uploaded to university portal' }]
        },
        {
          userId,
          title: 'Pay monthly broadband internet & cloud subscription bill',
          description: 'Due on the 1st of the month',
          priority: 'low',
          completed: false,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          notes: []
        }
      ]);
      console.log('   -> Seeded 3 sample Tasks & Notes');
    } else {
      console.log(`   -> Found ${todoCount} existing todos`);
    }

    // 3. Setup Finance Transactions
    console.log('📌 3. Initializing Finance Transactions Collection...');
    const txCount = await Transaction.countDocuments({ userId });
    if (txCount === 0) {
      await Transaction.insertMany([
        {
          userId,
          type: 'income',
          amount: 45000,
          category: 'Salary',
          description: 'Monthly Tech Internship Stipend',
          paymentMethod: 'UPI / Bank',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          isRecurring: true,
          tags: ['salary', 'tech']
        },
        {
          userId,
          type: 'income',
          amount: 12500,
          category: 'Freelance',
          description: 'Web Design Client Gig',
          paymentMethod: 'UPI / Bank',
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          isRecurring: false,
          tags: ['freelance']
        },
        {
          userId,
          type: 'expense',
          amount: 3200,
          category: 'Food & Dining',
          description: 'Weekly healthy groceries & fruits',
          paymentMethod: 'Credit Card',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          isRecurring: false,
          tags: ['groceries']
        },
        {
          userId,
          type: 'expense',
          amount: 1999,
          category: 'Education',
          description: 'Full Stack Algorithm Masterclass',
          paymentMethod: 'Debit Card',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          isRecurring: false,
          tags: ['learning']
        },
        {
          userId,
          type: 'expense',
          amount: 699,
          category: 'Entertainment',
          description: 'Streaming & Cloud subscriptions',
          paymentMethod: 'UPI / Bank',
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          isRecurring: true,
          tags: ['subs']
        },
        {
          userId,
          type: 'expense',
          amount: 1450,
          category: 'Transportation',
          description: 'Metro pass & ride share',
          paymentMethod: 'Cash',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          isRecurring: false,
          tags: ['transit']
        }
      ]);
      console.log('   -> Seeded 6 initial Income & Expense transactions in INR');
    } else {
      console.log(`   -> Found ${txCount} existing transactions`);
    }

    // 4. Setup Budgets & Savings Goals
    console.log('📌 4. Initializing Budgets & Savings Goals Collections...');
    const currentMonth = new Date().toISOString().slice(0, 7);
    const budgetCount = await Budget.countDocuments({ userId, monthYear: currentMonth });
    if (budgetCount === 0) {
      await Budget.insertMany([
        { userId, category: 'Food & Dining', monthlyLimit: 10000, monthYear: currentMonth },
        { userId, category: 'Education', monthlyLimit: 5000, monthYear: currentMonth },
        { userId, category: 'Entertainment', monthlyLimit: 3000, monthYear: currentMonth },
        { userId, category: 'Shopping', monthlyLimit: 6000, monthYear: currentMonth }
      ]);
      console.log('   -> Seeded 4 monthly category budget limits in INR');
    }

    const goalCount = await SavingsGoal.countDocuments({ userId });
    if (goalCount === 0) {
      await SavingsGoal.insertMany([
        { userId, title: 'New M3 MacBook Pro', targetAmount: 125000, currentAmount: 85000, targetDate: new Date('2026-12-15'), color: '#6366f1' },
        { userId, title: 'Emergency Fund', targetAmount: 100000, currentAmount: 65000, targetDate: new Date('2027-01-01'), color: '#10b981' },
        { userId, title: 'Hackathon Travel & Stay', targetAmount: 15000, currentAmount: 10500, targetDate: new Date('2026-10-20'), color: '#f59e0b' }
      ]);
      console.log('   -> Seeded 3 savings goals in INR');
    }

    // 5. Setup Study Subjects & Deadlines
    console.log('📌 5. Initializing Study Subjects & Deadlines Collections...');
    let dsaSubj = await Subject.findOne({ userId, name: 'Data Structures & Algorithms' });
    if (!dsaSubj) {
      dsaSubj = await Subject.create({
        userId,
        name: 'Data Structures & Algorithms',
        code: 'CS-301',
        instructor: 'Prof. Sharma',
        color: '#6366f1',
        targetHoursPerWeek: 8,
        topics: [
          { title: 'Binary Trees & Traversals', completed: true },
          { title: 'Dynamic Programming & Memoization', completed: true },
          { title: 'Graph Algorithms (Dijkstra, BFS/DFS)', completed: false },
          { title: 'Trie and Advanced String Search', completed: false }
        ]
      });

      await Subject.create({
        userId,
        name: 'Database Management Systems',
        code: 'CS-304',
        instructor: 'Dr. Patel',
        color: '#10b981',
        targetHoursPerWeek: 6,
        topics: [
          { title: 'Relational Algebra & Normalization', completed: true },
          { title: 'ACID Properties & Concurrency Control', completed: true },
          { title: 'NoSQL & MongoDB Aggregations', completed: false }
        ]
      });

      await Subject.create({
        userId,
        name: 'Full Stack Web Engineering',
        code: 'CS-308',
        instructor: 'Dr. Anderson',
        color: '#f59e0b',
        targetHoursPerWeek: 10,
        topics: [
          { title: 'State Management & Architecture', completed: true },
          { title: 'RESTful API & JWT Authentication', completed: true },
          { title: 'Performance Optimization', completed: false }
        ]
      });
      console.log('   -> Seeded 3 Course Subjects with syllabus topics');
    }

    const dlCount = await Deadline.countDocuments({ userId });
    if (dlCount === 0) {
      await Deadline.insertMany([
        {
          userId,
          subjectId: dsaSubj ? dsaSubj._id : null,
          title: 'Mid-term DSA Examination',
          type: 'Exam',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          priority: 'high',
          weightage: '30%',
          notes: 'Covers Trees, Graphs, DP and Heaps',
          completed: false
        },
        {
          userId,
          title: 'DBMS SQL Assignment & ER Diagram',
          type: 'Assignment',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          priority: 'high',
          weightage: '15%',
          notes: 'Complete queries 1 through 10',
          completed: false
        },
        {
          userId,
          title: 'Full Stack Project Milestone 2',
          type: 'Project',
          dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
          priority: 'medium',
          weightage: '20%',
          notes: 'Submit GitHub repo with live URL',
          completed: false
        }
      ]);
      console.log('   -> Seeded 3 Upcoming Exam & Assignment Deadlines');
    }

    const sessCount = await StudySession.countDocuments({ userId });
    if (sessCount === 0) {
      await StudySession.insertMany([
        {
          userId,
          subjectId: dsaSubj ? dsaSubj._id : null,
          durationMinutes: 50,
          topic: 'Graph BFS/DFS Traversal practice',
          pomodorosCompleted: 2,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          userId,
          durationMinutes: 75,
          topic: 'Full stack routes & context architecture',
          pomodorosCompleted: 3,
          date: new Date()
        }
      ]);
      console.log('   -> Seeded sample study focus sessions');
    }

    console.log('\n========================================================');
    console.log('✨ All Collections & Initial Database Setup Completed Successfully!');
    console.log('   - Database: notes-todo');
    console.log('   - Demo User: demo@example.com (Password: password123)');
    console.log('========================================================\n');

  } catch (error) {
    console.error('\n❌ Database initialization error:', error.message);
    console.error('Note: Ensure MongoDB service is running (e.g. net start MongoDB) or check your MONGODB_URI in server/.env\n');
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

initDatabase();

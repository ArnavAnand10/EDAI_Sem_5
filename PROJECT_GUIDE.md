# SkillForge - Employee Skill Management System

A full-stack web application for managing employee skills with role-based access control.

## 🚀 Features

### Employee Portal
- Request new skills from available skill library
- View personal skill status (Pending/Approved/Rejected)
- Track professional development progress
- Clean, intuitive dashboard interface

### Admin Dashboard
- View and manage all employees
- Approve or reject skill requests
- Track organizational skill distribution
- Two-tab interface for efficient management

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** - REST API server
- **Prisma ORM** - Database management
- **SQLite** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Lucide React** - Icons

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

## 🎯 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd EDAI_SEM_5
```

### 2. Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with test data
node prisma/seed.js

# Start the backend server
npm start
```

The backend server will run on **http://localhost:4000**

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on **http://localhost:3000** or **http://localhost:3001**

## 🔐 Test Credentials

### Admin Account
- **Email:** admin@example.com
- **Password:** admin123

### Employee Account
- **Email:** john.doe@example.com
- **Password:** employee123

## 📖 User Flow

### For Employees:
1. Login with employee credentials
2. View dashboard with current skills
3. Browse available skills
4. Request new skills
5. Track approval status

### For Admins:
1. Login with admin credentials
2. View all employees and their skills
3. Navigate to "Skill Requests" tab
4. Review pending skill requests
5. Approve or reject requests
6. Monitor organizational skill distribution

## 🗂️ Project Structure

```
EDAI_SEM_5/
├── Backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── seed.js            # Seed data
│   │   └── migrations/        # Database migrations
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   ├── middlewares/       # Auth middleware
│   │   ├── routes/            # API routes
│   │   ├── config/            # Configuration files
│   │   └── utils/             # Utility functions
│   └── app.js                 # Main server file
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── auth/          # Authentication pages
    │   │   ├── admin/         # Admin dashboard
    │   │   ├── dashboard/     # Employee dashboard
    │   │   └── page.tsx       # Landing page
    │   ├── components/
    │   │   └── ui/            # Reusable UI components
    │   └── lib/               # Utility functions
    └── public/                # Static assets
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Skills
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create new skill (Admin)
- `POST /api/skills/request` - Request a skill (Employee)
- `GET /api/skills/my` - Get user's skills
- `GET /api/skills/employee-skill-requests` - Get all skill requests (Admin)
- `PATCH /api/skills/employee-skill-status` - Approve/reject skill request (Admin)

### Employees
- `GET /api/employees` - Get all employees (Admin)
- `POST /api/employees` - Create employee (Admin)

### Companies
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create company

## 🗄️ Database Schema

### User
- id, email, password, role (ADMIN/EMPLOYEE)

### Employee
- id, firstName, lastName, department, manager
- Relations: User, Company, Admin, Skills

### Skill
- id, name, category, description

### EmployeeSkill
- id, level, status (PENDING/APPROVED/REJECTED)
- Relations: Employee, Skill

### Company
- id, name, industry, location

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 or 4000 is already in use:

**Backend:**
```bash
# Edit Backend/src/app.js and change port
const PORT = 4001; // Change this
```

**Frontend:**
Next.js will automatically use the next available port (3001, 3002, etc.)

### Database Issues
```bash
cd Backend
npx prisma migrate reset  # This will reset and reseed the database
```

### Clear Browser Storage
If authentication issues occur, clear localStorage:
- Open browser DevTools (F12)
- Go to Application/Storage tab
- Clear Local Storage

## 🎨 Customization

### Add New Skills
1. Login as admin
2. Use `/api/skills` POST endpoint
3. Or modify `Backend/prisma/seed.js`

### Modify UI Theme
Edit `frontend/src/app/globals.css` for Tailwind theme customization

## 📝 Development Notes

- Backend uses JWT for authentication
- Passwords are hashed using bcrypt
- Frontend uses localStorage for token management
- Role-based routing implemented
- Responsive design for mobile and desktop

## 🚧 Future Enhancements

- [ ] Skill endorsements from peers
- [ ] Skill assessments and tests
- [ ] Skill analytics and reporting
- [ ] Email notifications
- [ ] Advanced search and filters
- [ ] Export functionality (PDF/CSV)
- [ ] Real-time updates with WebSockets

## 📄 License

MIT License

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js and Express**

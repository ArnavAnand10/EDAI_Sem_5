# SkillHub - Employee Skills Management System

A comprehensive full-stack application for managing employee skills, built with **Next.js 15** (frontend) and **Node.js/Express** (backend).

## 🚀 Features

### For Employees
- **Modern Dashboard**: Clean, intuitive interface to view and manage personal skills
- **Skill Requests**: Request new skills with proficiency levels (Beginner → Expert)
- **Progress Tracking**: Monitor skill approval status and development progress
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### For Administrators
- **Admin Dashboard**: Comprehensive overview with analytics and metrics
- **Employee Management**: Add, edit, and manage employee profiles
- **Skill Management**: Create and manage global skill categories
- **Request Approval**: Review and approve/reject skill requests
- **Company Management**: Manage organization profiles and information

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **Prisma ORM** with SQLite database
- **JWT** for authentication
- **Argon2** for password hashing
- **CORS** enabled for frontend communication

## 📁 Project Structure

```
EDAI_SEM_5/
├── Backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── dev.db                 # SQLite database
│   ├── src/
│   │   ├── controllers/           # API controllers
│   │   ├── middlewares/           # Auth middleware
│   │   ├── routes/                # API routes
│   │   ├── utils/                 # Utility functions
│   │   └── app.js                 # Server entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/                   # Next.js pages
    │   │   ├── admin/             # Admin-only pages
    │   │   ├── auth/              # Authentication pages
    │   │   └── dashboard/         # Employee dashboard
    │   ├── components/            # Reusable components
    │   └── lib/                   # Utilities and API client
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### 1. Clone and Setup

```bash
git clone <repository-url>
cd EDAI_SEM_5
```

### 2. Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

The backend will run on `http://localhost:4000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔐 Authentication & Roles

### User Roles
- **ADMIN**: Full access to manage employees, skills, and approve requests
- **EMPLOYEE**: Can view personal skills and submit requests

### Demo Accounts
The login page provides demo account buttons for easy testing:
- **Admin**: `admin@example.com` / `admin123`
- **Employee**: `employee@example.com` / `employee123`

## 📊 Database Schema

### Core Models
- **User**: Authentication and role management
- **Employee**: Employee profiles linked to users
- **Company**: Organization information
- **Skill**: Global skill definitions
- **EmployeeSkill**: Junction table for employee-skill relationships with levels and approval status

## 🎨 UI/UX Features

### Design System
- **Consistent Color Palette**: Indigo/purple gradient theme
- **Responsive Layout**: Mobile-first approach
- **Accessibility**: Screen reader friendly with proper ARIA labels
- **Loading States**: Smooth loading indicators and skeleton screens
- **Error Handling**: User-friendly error messages and validation

### Key Components
- **TopNav**: Responsive navigation with role-based menu items
- **Cards**: Consistent card layouts for data display
- **Forms**: Accessible forms with validation
- **Badges**: Status indicators for skills and requests
- **Dialogs**: Modal dialogs for actions and forms

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Users
- `GET /api/users/me` - Get current user profile

### Skills
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create skill (Admin only)
- `GET /api/skills/my` - Get user's skills
- `POST /api/skills/request` - Request skill
- `GET /api/skills/requests` - Get all requests (Admin only)
- `PATCH /api/skills/requests/:id` - Approve/reject request (Admin only)

### Employees
- `GET /api/employees` - Get all employees (Admin only)
- `POST /api/employees` - Create employee (Admin only)
- `PUT /api/employees/:id` - Update employee (Admin only)
- `DELETE /api/employees/:id` - Delete employee (Admin only)

### Companies
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create company (Admin only)
- `PUT /api/companies/:id` - Update company (Admin only)
- `DELETE /api/companies/:id` - Delete company (Admin only)

## 🔧 Development

### Backend Development
```bash
cd Backend
npm run dev    # Starts with nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm run dev    # Starts Next.js with Turbopack
```

### Database Management
```bash
cd Backend
npx prisma studio      # Visual database browser
npx prisma db push     # Push schema changes
npx prisma generate    # Generate Prisma client
```

## 🌟 Key Features Implemented

### User Experience
- ✅ Modern, responsive design
- ✅ Role-based access control
- ✅ Intuitive navigation and workflows
- ✅ Real-time form validation
- ✅ Loading states and error handling

### Backend Functionality
- ✅ JWT authentication with middleware
- ✅ Role-based route protection
- ✅ Database relationships with Prisma
- ✅ RESTful API design
- ✅ Error handling and validation

### Frontend Architecture
- ✅ Next.js 15 App Router
- ✅ TypeScript for type safety
- ✅ Component composition with Radix UI
- ✅ Responsive design with Tailwind CSS
- ✅ Client-side state management

## 🎯 Future Enhancements

- **Skill Recommendations**: AI-powered skill suggestions
- **Progress Tracking**: Visual skill development timelines
- **Reporting**: Advanced analytics and export capabilities
- **Notifications**: Real-time notifications for requests
- **Bulk Operations**: Mass approve/reject functionality
- **API Documentation**: Swagger/OpenAPI documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

---

**Built with ❤️ for modern skill management**
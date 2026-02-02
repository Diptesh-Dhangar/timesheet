# Employee Timesheet Management System

A comprehensive web application for managing employee timesheets and time off requests with manager approval workflows.

## 🚀 Features

### Core Features
- **Weekly Timesheet Entry** - Employees can log daily hours for projects/tasks
- **Manager Approval Flow** - Managers can review, approve, or reject timesheets
- **Time Off Requests** - Employees can request time off with manager approval
- **Role-based Access Control** - Separate interfaces for employees and managers
- **Real-time Status Tracking** - Track submission status at every stage

### Technical Features
- JWT-based authentication
- RESTful API design
- Input validation and security measures
- Responsive web design
- MongoDB database with proper indexing
- TypeScript for type safety

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

### Frontend
- **React** with TypeScript
- **React Router** for navigation
- **Axios** for API calls
- **CSS3** with responsive design

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd timesheet
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/timesheet_db
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
```

#### Database Setup
1. Make sure MongoDB is running on your system
2. The application will automatically create the `timesheet_db` database

#### Seed Sample Data
```bash
npm run seed
```
This will create sample users for testing (see Sample Users section below).

#### Start Backend Server
```bash
npm run dev
```
The backend will be running at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

#### Environment Variables
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

#### Start Frontend Development Server
```bash
npm start
```
The frontend will be running at `http://localhost:3000`

## 👥 Sample Users

After running the seed script, you can use these accounts to test the system:

### Employee Accounts
| Email | Password | Role | Employee ID |
|-------|----------|------|-------------|
| john.employee@company.com | password123 | Employee | EMP001 |
| jane.employee@company.com | password123 | Employee | EMP002 |

### Manager Accounts
| Email | Password | Role | Employee ID |
|-------|----------|------|-------------|
| mike.manager@company.com | password123 | Manager | MGR001 |
| sarah.manager@company.com | password123 | Manager | MGR002 |

## 📱 Usage Guide

### For Employees

1. **Login** with your credentials or **Register** for a new account
2. **Dashboard** - View your recent timesheets and time off requests
3. **Create Timesheet**
   - Go to "My Timesheets" → "New Timesheet"
   - Select a week (Monday to Sunday)
   - Enter daily hours, project names, and descriptions
   - Save as draft or submit for approval
4. **Time Off Requests**
   - Go to "Time Off Requests" → "New Request"
   - Select from/to dates and provide reason
   - Submit for manager approval

### For Managers

1. **Login** with your manager credentials or **Register** as a new manager
2. **Dashboard** - View pending items requiring your attention
3. **Review Timesheets**
   - Go to "Manager Actions" → "Review Timesheets"
   - View submitted timesheets with all details
   - Approve or reject with comments
4. **Review Time Off**
   - Go to "Manager Actions" → "Review Time Off"
   - View time off requests with reasons
   - Approve or reject with comments

### Registration

New users can create accounts by:
1. Visiting the login page
2. Clicking the "Register" tab
3. Filling in the required information:
   - First Name, Last Name
   - Email and Password (min 6 characters)
   - Employee ID (unique identifier)
   - Role (Employee or Manager)
   - Department (optional)
4. After registration, users are automatically logged in

## 🔄 Workflow States

### Timesheet Status Flow
```
Draft → Submitted → Approved
              ↘ Rejected (with reason)
```

### Time Off Status Flow
```
Pending → Approved
        ↘ Rejected (with reason)
```

## 📊 Database Schema

### Users Collection
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: String (employee|manager),
  employeeId: String (unique),
  department: String,
  isActive: Boolean,
  manager: ObjectId (ref: 'User')
}
```

### Timesheets Collection
```javascript
{
  employee: ObjectId (ref: 'User'),
  weekStartDate: Date,
  weekEndDate: Date,
  entries: [{
    day: String (Monday-Sunday),
    hours: Number (0-24),
    project: String,
    description: String
  }],
  status: String (Draft|Submitted|Approved|Rejected),
  totalHours: Number,
  submittedAt: Date,
  reviewedAt: Date,
  reviewedBy: ObjectId (ref: 'User'),
  rejectionReason: String
}
```

### Time Off Requests Collection
```javascript
{
  employee: ObjectId (ref: 'User'),
  fromDate: Date,
  toDate: Date,
  reason: String,
  status: String (Pending|Approved|Rejected),
  reviewedAt: Date,
  reviewedBy: ObjectId (ref: 'User'),
  rejectionReason: String,
  daysRequested: Number
}
```

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS protection
- Helmet.js for security headers

## ✅ Validation Rules

### Timesheet Validation
- Maximum 24 hours per day
- At least one entry required for submission
- Project name is required
- Week dates must be valid Monday-Sunday range

### Time Off Validation
- From date cannot be after to date
- Reason is required (max 1000 characters)
- No overlapping requests for same employee

## 🧪 Testing

### API Testing
You can test the APIs using Postman or similar tools. Key endpoints:

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

#### Timesheets
- `POST /api/timesheets` - Create/update timesheet
- `GET /api/timesheets/my` - Get user's timesheets
- `POST /api/timesheets/:id/submit` - Submit timesheet
- `POST /api/timesheets/:id/review` - Approve/reject (managers only)

#### Time Off
- `POST /api/timeoff` - Create time off request
- `GET /api/timeoff/my` - Get user's requests
- `POST /api/timeoff/:id/review` - Approve/reject (managers only)

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build and deploy to your preferred platform
3. Ensure MongoDB is accessible from your deployment environment

### Frontend Deployment
1. Update `REACT_APP_API_URL` to point to your production backend
2. Build the application: `npm run build`
3. Deploy the build folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the connection string in `.env`

2. **CORS Errors**
   - Verify frontend API URL is correct
   - Check backend CORS configuration

3. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT secret is set in backend `.env`

4. **Port Conflicts**
   - Change PORT in backend `.env` if needed
   - Update frontend `.env` API URL accordingly

### Development Tips

- Use `npm run dev` for backend development with auto-restart
- Use `npm start` for frontend development with hot reload
- Check browser console for detailed error messages
- Use MongoDB Compass to inspect database data

## 📞 Support

For support or questions, please open an issue in the repository or contact the development team.

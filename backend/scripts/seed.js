require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    console.log('Cleared existing users');

    const users = [
      {
        firstName: 'John',
        lastName: 'Employee',
        email: 'john.employee@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP001',
        department: 'Engineering'
      },
      {
        firstName: 'Jane',
        lastName: 'Employee',
        email: 'jane.employee@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP002',
        department: 'Marketing'
      },
      {
        firstName: 'Mike',
        lastName: 'Manager',
        email: 'mike.manager@company.com',
        password: 'password123',
        role: 'manager',
        employeeId: 'MGR001',
        department: 'Engineering'
      },
      {
        firstName: 'Sarah',
        lastName: 'Manager',
        email: 'sarah.manager@company.com',
        password: 'password123',
        role: 'manager',
        employeeId: 'MGR002',
        department: 'Marketing'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Sample users created:');

    createdUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\nLogin credentials:');
    console.log('Email: john.employee@company.com | Password: password123 (Employee)');
    console.log('Email: mike.manager@company.com | Password: password123 (Manager)');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedUsers();

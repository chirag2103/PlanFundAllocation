export const mockUsers = [
  {
    _id: '507f1f77bcf86cd799439011',
    googleId: 'mock-google-id-1',
    name: 'John Faculty',
    email: 'faculty@nitc.ac.in',
    avatar: 'https://ui-avatars.com/api/?name=John+Faculty',
    role: 'faculty',
    department: {
      _id: '507f1f77bcf86cd799439012',
      name: 'Computer Science',
      code: 'CSE',
    },
    isActive: true,
  },
  {
    _id: '507f1f77bcf86cd799439013',
    googleId: 'mock-google-id-2',
    name: 'Sarah Coordinator',
    email: 'coordinator@nitc.ac.in',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Coordinator',
    role: 'coordinator',
    department: {
      _id: '507f1f77bcf86cd799439012',
      name: 'Computer Science',
      code: 'CSE',
    },
    isActive: true,
  },
  {
    _id: '507f1f77bcf86cd799439014',
    googleId: 'mock-google-id-3',
    name: 'Mike Admin',
    email: 'admin@nitc.ac.in',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Admin',
    role: 'admin',
    department: {
      _id: '507f1f77bcf86cd799439012',
      name: 'Computer Science',
      code: 'CSE',
    },
    isActive: true,
  },
];

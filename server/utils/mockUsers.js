export const mockUsers = [
  // FACULTY 1
  {
    _id: '69059a6f5d721aed48ffff76',
    googleId: 'faculty-1-google-id',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@nitc.ac.in',
    avatar: 'https://ui-avatars.com/api/?name=Dr+Rajesh+Kumar',
    role: 'faculty',
    department: {
      _id: '69059a6e5d721aed48ffff69',
      name: 'Computer Science',
      code: 'CSE',
      budget: 5000000,
    },
    isActive: true,
  },

  // FACULTY 2
  {
    _id: '69059a6f5d721aed48ffff77',
    googleId: 'faculty-2-google-id',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@nitc.ac.in',
    avatar: 'https://ui-avatars.com/api/?name=Dr+Priya+Sharma',
    role: 'faculty',
    department: {
      _id: '69059a6e5d721aed48ffff6a',
      name: 'Electrical Electronics and Communication',
      code: 'ECE',
      budget: 4500000,
    },
    isActive: true,
  },

  // FACULTY 3
  {
    _id: '69059a6f5d721aed48ffff78',
    googleId: 'faculty-3-google-id',
    name: 'Dr. Anil Verma',
    email: 'anil.verma@nitc.ac.in',
    avatar: 'https://ui-avatars.com/api/?name=Dr+Anil+Verma',
    role: 'faculty',
    department: {
      _id: '69059a6e5d721aed48ffff6b',
      name: 'Mechanical Engineering',
      code: 'ME',
      budget: 4000000,
    },
    isActive: true,
  },

  // FACULTY 4
  {
    _id: '69059a6f5d721aed48ffff79',
    googleId: 'faculty-4-google-id',
    name: 'Dr. Sunita Reddy',
    email: 'sunita.reddy@nitc.ac.in',
    avatar: 'https://ui-avatars.com/api/?name=Dr+Sunita+Reddy',
    role: 'faculty',
    department: {
      _id: '69059a6e5d721aed48ffff6c',
      name: 'Civil Engineering',
      code: 'CE',
      budget: 3500000,
    },
    isActive: true,
  },

  // COORDINATOR 1 (CSE Department)
  {
    _id: '69059a6f5d721aed48ffff7a',
    googleId: 'coordinator-1-google-id',
    name: 'Prof. Vijay Malhotra',
    email: 'vijay.malhotra@nitc.ac.in',
    avatar: 'https://ui-avatars.com/api/?name=Prof+Vijay+Malhotra',
    role: 'coordinator',
    department: {
      _id: '69059a6e5d721aed48ffff6d',
      name: 'Computer Science',
      code: 'CSE',
      budget: 5000000,
    },
    isActive: true,
  },

  // COORDINATOR 2 (EE Department)
  {
    _id: '69059a6f5d721aed48ffff7b',
    googleId: 'coordinator-2-google-id',
    name: 'Prof. Kavita Singh',
    email: 'kavita.singh@nitc.ac.in',
    avatar: 'https://ui-avatars.com/api/?name=Prof+Kavita+Singh',
    role: 'coordinator',
    department: {
      _id: '507f1f77bcf86cd799439022',
      name: 'Electrical Engineering',
      code: 'EE',
      budget: 4500000,
    },
    isActive: true,
  },

  // ADMIN
  {
    _id: '69059a6f5d721aed48ffff7c',
    googleId: 'admin-google-id',
    name: 'Dr. Suresh Menon',
    email: 'admin@nitc.ac.in',
    avatar: 'https://ui-avatars.com/api/?name=Dr+Suresh+Menon',
    role: 'admin',
    department: {
      _id: '507f1f77bcf86cd799439021',
      name: 'Computer Science',
      code: 'CSE',
      budget: 5000000,
    },
    isActive: true,
  },
];

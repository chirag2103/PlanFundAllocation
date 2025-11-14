import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Department from '../models/Department.js';
import ItemKeyword from '../models/ItemKeyword.js';
import FundCycle from '../models/FundCycle.js';
import Proposal from '../models/Proposal.js';

dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/fund_allocation'
    );
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data
const departmentsData = [
  {
    name: 'Computer Science',
    code: 'CSE',
    budget: 5000000,
    description: 'Department of Computer Science and Engineering',
    isActive: true,
  },
  {
    name: 'Electrical Engineering',
    code: 'EE',
    budget: 4500000,
    description: 'Department of Electrical Engineering',
    isActive: true,
  },
  {
    name: 'Mechanical Engineering',
    code: 'ME',
    budget: 4000000,
    description: 'Department of Mechanical Engineering',
    isActive: true,
  },
  {
    name: 'Civil Engineering',
    code: 'CE',
    budget: 3500000,
    description: 'Department of Civil Engineering',
    isActive: true,
  },
  {
    name: 'Electronics and Communication',
    code: 'ECE',
    budget: 4200000,
    description: 'Department of Electronics and Communication Engineering',
    isActive: true,
  },
];

const usersData = [
  {
    googleId: 'faculty-1-google-id',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@nitc.ac.in',
    role: 'faculty',
    isActive: true,
  },
  {
    googleId: 'faculty-2-google-id',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@nitc.ac.in',
    role: 'faculty',
    isActive: true,
  },
  {
    googleId: 'faculty-3-google-id',
    name: 'Dr. Anil Verma',
    email: 'anil.verma@nitc.ac.in',
    role: 'faculty',
    isActive: true,
  },
  {
    googleId: 'faculty-4-google-id',
    name: 'Dr. Sunita Reddy',
    email: 'sunita.reddy@nitc.ac.in',
    role: 'faculty',
    isActive: true,
  },
  {
    googleId: 'coordinator-1-google-id',
    name: 'Prof. Vijay Malhotra',
    email: 'vijay.malhotra@nitc.ac.in',
    role: 'coordinator',
    isActive: true,
  },
  {
    googleId: 'coordinator-2-google-id',
    name: 'Prof. Kavita Singh',
    email: 'kavita.singh@nitc.ac.in',
    role: 'coordinator',
    isActive: true,
  },
  {
    googleId: 'admin-1-google-id',
    name: 'Dr. Suresh Menon',
    email: 'suresh.menon@nitc.ac.in',
    role: 'admin',
    isActive: true,
  },
];

const itemKeywordsData = [
  // Equipment
  {
    name: 'Laptop',
    category: 'equipment',
    description: 'High-performance laptop for research and development',
    estimatedCost: { min: 50000, max: 150000 },
  },
  {
    name: 'Desktop Computer',
    category: 'equipment',
    description: 'Desktop workstation for labs',
    estimatedCost: { min: 40000, max: 100000 },
  },
  {
    name: 'Server',
    category: 'equipment',
    description: 'Server for hosting applications and databases',
    estimatedCost: { min: 200000, max: 500000 },
  },
  {
    name: 'Projector',
    category: 'equipment',
    description: 'HD Projector for classrooms and presentations',
    estimatedCost: { min: 30000, max: 80000 },
  },
  {
    name: 'Oscilloscope',
    category: 'equipment',
    description: 'Digital oscilloscope for electronics lab',
    estimatedCost: { min: 100000, max: 300000 },
  },
  {
    name: '3D Printer',
    category: 'equipment',
    description: 'Industrial grade 3D printer',
    estimatedCost: { min: 150000, max: 400000 },
  },
  {
    name: 'CNC Machine',
    category: 'equipment',
    description: 'Computer Numerical Control machine',
    estimatedCost: { min: 500000, max: 1500000 },
  },

  // Software
  {
    name: 'MATLAB License',
    category: 'software',
    description: 'MATLAB software license for academic use',
    estimatedCost: { min: 50000, max: 100000 },
  },
  {
    name: 'AutoCAD License',
    category: 'software',
    description: 'AutoCAD software for design',
    estimatedCost: { min: 40000, max: 80000 },
  },
  {
    name: 'Microsoft Office Suite',
    category: 'software',
    description: 'MS Office license for department',
    estimatedCost: { min: 20000, max: 50000 },
  },
  {
    name: 'Adobe Creative Cloud',
    category: 'software',
    description: 'Adobe CC subscription for design work',
    estimatedCost: { min: 30000, max: 60000 },
  },
  {
    name: 'ANSYS License',
    category: 'software',
    description: 'ANSYS simulation software',
    estimatedCost: { min: 100000, max: 250000 },
  },

  // Consumables
  {
    name: 'Lab Chemicals',
    category: 'consumables',
    description: 'Various chemicals for laboratory experiments',
    estimatedCost: { min: 10000, max: 50000 },
  },
  {
    name: 'Electronic Components',
    category: 'consumables',
    description: 'ICs, resistors, capacitors, etc.',
    estimatedCost: { min: 5000, max: 30000 },
  },
  {
    name: 'Stationery',
    category: 'consumables',
    description: 'Office and lab stationery supplies',
    estimatedCost: { min: 5000, max: 20000 },
  },
  {
    name: 'Printing Paper',
    category: 'consumables',
    description: 'A4 and A3 printing paper',
    estimatedCost: { min: 3000, max: 10000 },
  },

  // Furniture
  {
    name: 'Lab Table',
    category: 'furniture',
    description: 'Laboratory work table',
    estimatedCost: { min: 15000, max: 40000 },
  },
  {
    name: 'Office Chair',
    category: 'furniture',
    description: 'Ergonomic office chair',
    estimatedCost: { min: 5000, max: 20000 },
  },
  {
    name: 'Bookshelf',
    category: 'furniture',
    description: 'Storage bookshelf for library',
    estimatedCost: { min: 10000, max: 30000 },
  },
  {
    name: 'Whiteboard',
    category: 'furniture',
    description: 'Classroom whiteboard',
    estimatedCost: { min: 5000, max: 15000 },
  },

  // Other
  {
    name: 'Air Conditioner',
    category: 'other',
    description: 'Split AC for server room/labs',
    estimatedCost: { min: 30000, max: 80000 },
  },
  {
    name: 'UPS System',
    category: 'other',
    description: 'Uninterruptible Power Supply',
    estimatedCost: { min: 20000, max: 100000 },
  },
  {
    name: 'Network Switch',
    category: 'other',
    description: 'Managed network switch',
    estimatedCost: { min: 15000, max: 50000 },
  },
];

// Seeder functions
const seedDepartments = async () => {
  try {
    await Department.deleteMany({});
    const departments = await Department.insertMany(departmentsData);
    console.log('✅ Departments seeded:', departments.length);
    return departments;
  } catch (error) {
    console.error('❌ Error seeding departments:', error);
    throw error;
  }
};

const seedUsers = async (departments) => {
  try {
    await User.deleteMany({});

    // Assign departments to users
    const usersWithDepts = usersData.map((user, index) => ({
      ...user,
      department: departments[index % departments.length]._id,
    }));

    const users = await User.insertMany(usersWithDepts);
    console.log('✅ Users seeded:', users.length);
    return users;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

const seedItemKeywords = async (departments, users) => {
  try {
    await ItemKeyword.deleteMany({});

    const admin = users.find((u) => u.role === 'admin');

    // Assign departments and creator to keywords
    const keywordsWithDepts = itemKeywordsData.map((keyword, index) => ({
      ...keyword,
      department: departments[index % departments.length]._id,
      createdBy: admin._id,
    }));

    const keywords = await ItemKeyword.insertMany(keywordsWithDepts);
    console.log('✅ Item Keywords seeded:', keywords.length);
    return keywords;
  } catch (error) {
    console.error('❌ Error seeding item keywords:', error);
    throw error;
  }
};

const seedFundCycles = async (departments, users) => {
  try {
    await FundCycle.deleteMany({});

    const coordinator = users.find((u) => u.role === 'coordinator');

    const cyclesData = [
      {
        name: 'Fund Cycle 2024-25',
        academicYear: '2024-2025',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        submissionDeadline: new Date('2024-12-31'),
        reviewDeadline: new Date('2025-01-15'),
        totalBudget: 20000000,
        status: 'active',
        departmentBudgets: departments.map((dept) => ({
          department: dept._id,
          allocatedAmount: dept.budget,
          spentAmount: 0,
        })),
        createdBy: coordinator._id,
        description: 'Annual fund allocation cycle for academic year 2024-25',
      },
      {
        name: 'Fund Cycle 2023-24',
        academicYear: '2023-2024',
        startDate: new Date('2023-04-01'),
        endDate: new Date('2024-03-31'),
        submissionDeadline: new Date('2023-12-31'),
        reviewDeadline: new Date('2024-01-15'),
        totalBudget: 18000000,
        status: 'closed',
        departmentBudgets: departments.map((dept) => ({
          department: dept._id,
          allocatedAmount: dept.budget * 0.9,
          spentAmount: dept.budget * 0.75,
        })),
        createdBy: coordinator._id,
        description: 'Annual fund allocation cycle for academic year 2023-24',
      },
    ];

    const cycles = await FundCycle.insertMany(cyclesData);
    console.log('✅ Fund Cycles seeded:', cycles.length);
    return cycles;
  } catch (error) {
    console.error('❌ Error seeding fund cycles:', error);
    throw error;
  }
};

const seedProposals = async (departments, users, keywords, cycles) => {
  try {
    await Proposal.deleteMany({});

    const facultyUsers = users.filter((u) => u.role === 'faculty');
    const activeCycle = cycles.find((c) => c.status === 'active');
    const coordinator = users.find((u) => u.role === 'coordinator');

    // Generate unique proposalIds
    const generateProposalId = (index) => `PROP-${Date.now()}-${index}`;

    const proposalsData = [
      // Approved proposal 1
      {
        proposalId: generateProposalId(1),
        faculty: facultyUsers[0]._id,
        department: departments[0]._id,
        fundCycle: activeCycle._id,
        items: [
          {
            itemKeyword: keywords[0]._id, // Laptop
            quantity: 10,
            unitCost: 80000,
            totalCost: 800000,
            justification: 'Required for new ML research lab',
          },
          {
            itemKeyword: keywords[7]._id, // MATLAB
            quantity: 1,
            unitCost: 75000,
            totalCost: 75000,
            justification: 'Software license for data analysis',
          },
        ],
        totalAmount: 875000,
        status: 'approved',
        submittedAt: new Date('2024-06-15'),
        reviewedAt: new Date('2024-06-20'),
        reviewedBy: coordinator._id,
        reviewComments: 'Approved for ML lab setup',
        priority: 'high',
      },

      // Approved proposal 2
      {
        proposalId: generateProposalId(2),
        faculty: facultyUsers[1]._id,
        department: departments[1]._id,
        fundCycle: activeCycle._id,
        items: [
          {
            itemKeyword: keywords[4]._id, // Oscilloscope
            quantity: 3,
            unitCost: 200000,
            totalCost: 600000,
            justification: 'For electronics lab modernization',
          },
        ],
        totalAmount: 600000,
        status: 'approved',
        submittedAt: new Date('2024-07-01'),
        reviewedAt: new Date('2024-07-05'),
        reviewedBy: coordinator._id,
        reviewComments: 'Approved - essential equipment',
        priority: 'medium',
      },

      // Pending proposal 1
      {
        proposalId: generateProposalId(3),
        faculty: facultyUsers[2]._id,
        department: departments[2]._id,
        fundCycle: activeCycle._id,
        items: [
          {
            itemKeyword: keywords[5]._id, // 3D Printer
            quantity: 2,
            unitCost: 250000,
            totalCost: 500000,
            justification: 'For rapid prototyping lab',
          },
          {
            itemKeyword: keywords[17]._id, // Lab Table
            quantity: 5,
            unitCost: 25000,
            totalCost: 125000,
            justification: 'Workstations for 3D printing lab',
          },
        ],
        totalAmount: 625000,
        status: 'submitted',
        submittedAt: new Date('2024-10-01'),
        priority: 'medium',
      },

      // Pending proposal 2
      {
        proposalId: generateProposalId(4),
        faculty: facultyUsers[3]._id,
        department: departments[3]._id,
        fundCycle: activeCycle._id,
        items: [
          {
            itemKeyword: keywords[6]._id, // CNC Machine
            quantity: 1,
            unitCost: 1000000,
            totalCost: 1000000,
            justification: 'Advanced manufacturing lab equipment',
          },
        ],
        totalAmount: 1000000,
        status: 'submitted',
        submittedAt: new Date('2024-10-10'),
        priority: 'high',
      },

      // Rejected proposal
      {
        proposalId: generateProposalId(5),
        faculty: facultyUsers[0]._id,
        department: departments[0]._id,
        fundCycle: activeCycle._id,
        items: [
          {
            itemKeyword: keywords[10]._id, // Adobe CC
            quantity: 20,
            unitCost: 45000,
            totalCost: 900000,
            justification: 'For design course students',
          },
        ],
        totalAmount: 900000,
        status: 'rejected',
        submittedAt: new Date('2024-08-15'),
        reviewedAt: new Date('2024-08-20'),
        reviewedBy: coordinator._id,
        reviewComments: 'Budget constraints - resubmit next cycle',
        priority: 'low',
      },

      // Draft proposal
      {
        proposalId: generateProposalId(6),
        faculty: facultyUsers[1]._id,
        department: departments[1]._id,
        fundCycle: activeCycle._id,
        items: [
          {
            itemKeyword: keywords[2]._id, // Server
            quantity: 1,
            unitCost: 350000,
            totalCost: 350000,
            justification: 'Cloud computing lab server',
          },
        ],
        totalAmount: 350000,
        status: 'draft',
        priority: 'medium',
      },
    ];

    const proposals = await Proposal.insertMany(proposalsData);
    console.log('✅ Proposals seeded:', proposals.length);
    return proposals;
  } catch (error) {
    console.error('❌ Error seeding proposals:', error);
    throw error;
  }
};

// Main seeder function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    await connectDB();

    const departments = await seedDepartments();
    const users = await seedUsers(departments);
    const keywords = await seedItemKeywords(departments, users);
    const cycles = await seedFundCycles(departments, users);
    const proposals = await seedProposals(departments, users, keywords, cycles);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Departments: ${departments.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Item Keywords: ${keywords.length}`);
    console.log(`   - Fund Cycles: ${cycles.length}`);
    console.log(`   - Proposals: ${proposals.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();

// This file contains setup code that will run before each test
// Mock NextAuth session and other dependencies as needed

// Silence console logs during tests
global.console = {
  ...console,
  // Uncomment to silence specific console methods during tests
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
};

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test-db';

// Mock Prisma
jest.mock('@/app/lib/db', () => ({
  findUserByEmail: jest.fn(),
  searchDocuments: jest.fn(),
  getAllCourses: jest.fn(),
  getDocumentById: jest.fn(),
  incrementViewCount: jest.fn(),
  incrementDownloadCount: jest.fn(),
  saveRating: jest.fn(),
  getRatingsForDocument: jest.fn(),
  createComment: jest.fn(),
  deleteComment: jest.fn(),
  recordDocumentView: jest.fn(),
  getRecentlyViewedDocuments: jest.fn(),
  getRecommendedCourses: jest.fn(),
  createUser: jest.fn()
}));

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}));
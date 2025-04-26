import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';

// Mock the NextAuth session
export const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'STUDENT',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Mock getServerSession function
export const mockGetServerSession = jest.fn().mockResolvedValue(mockSession);

// Create a mocked NextRequest with search params
export function createMockNextRequest(url: string): NextRequest {
  const nextUrl = new URL(url);
  const req = {
    url,
    nextUrl,
    cookies: { getAll: () => [] },
    headers: new Headers(),
    json: jest.fn(),
    text: jest.fn(),
    blob: jest.fn(),
    arrayBuffer: jest.fn(),
    formData: jest.fn(),
  } as unknown as NextRequest;
  
  // Add search params functionality
  Object.defineProperty(req, 'url', {
    get: () => url,
  });
  
  return req;
}

// Mock Prisma functions
export const mockPrismaFunctions = {
  findUserByEmail: jest.fn(),
  searchDocuments: jest.fn(),
  getAllCourses: jest.fn(),
  getRecentlyViewedDocuments: jest.fn(),
  getRecommendedCourses: jest.fn(),
  getDocumentById: jest.fn(),
  incrementViewCount: jest.fn(),
  incrementDownloadCount: jest.fn(),
  saveRating: jest.fn(),
  getRatingsForDocument: jest.fn(),
  createComment: jest.fn(),
  deleteComment: jest.fn(),
  recordDocumentView: jest.fn(),
  calculateAverageRating: jest.fn().mockReturnValue(4.5),
  getRelatedDocuments: jest.fn().mockResolvedValue([])
};

// Reset all mocks between tests
export function resetMocks() {
  jest.resetAllMocks();
  mockGetServerSession.mockResolvedValue(mockSession);
  Object.values(mockPrismaFunctions).forEach(mock => mock.mockReset());
  // Reset some default values
  mockPrismaFunctions.calculateAverageRating.mockReturnValue(4.5);
  mockPrismaFunctions.getRelatedDocuments.mockResolvedValue([]);
}
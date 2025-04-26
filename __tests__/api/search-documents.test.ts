import { NextResponse } from 'next/server';
import { GET } from '@/app/api/documents/search/route';
import * as auth from 'next-auth/next';
import * as db from '@/app/lib/db';
import { createMockNextRequest, mockSession, resetMocks } from '../helpers';

// Mock the modules
jest.mock('next-auth/next');
jest.mock('@/app/lib/db');

describe('Documents Search API', () => {
  // Reset mocks before each test
  beforeEach(() => {
    resetMocks();
    
    // Setup specific mocks for this test file
    jest.spyOn(auth, 'getServerSession').mockResolvedValue(mockSession);
    jest.spyOn(db, 'findUserByEmail').mockResolvedValue({ 
      id: 'test-user-id', 
      email: 'test@example.com',
      name: 'Test User',
      role: 'STUDENT',
      password: null,
      joinedDate: new Date(),
      oauthProvider: null,
      oauthId: null,
      profilePicture: null,
      bio: null
    });
  });

  it('should return 401 when user is not authenticated', async () => {
    // Mock unauthenticated session
    jest.spyOn(auth, 'getServerSession').mockResolvedValue(null);

    const req = createMockNextRequest('http://localhost:3000/api/documents/search?query=test');
    const response = await GET(req);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

  it('should return 404 when user is not found', async () => {
    // Mock user not found
    jest.spyOn(db, 'findUserByEmail').mockResolvedValue(null);

    const req = createMockNextRequest('http://localhost:3000/api/documents/search?query=test');
    const response = await GET(req);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: 'User not found' });
  });

  it('should return search results successfully', async () => {
    // Mock searchDocuments function
    const mockSearchResults = {
      results: [
        { id: 'doc1', title: 'Test Document 1', course: { name: 'Course 1' }, rating: 4.5, totalRatings: 10, downloads: 25, uploadDate: '2023-01-01', thumbnailBase64: 'base64data1' },
        { id: 'doc2', title: 'Test Document 2', course: { name: 'Course 2' }, rating: 3.2, totalRatings: 5, downloads: 12, uploadDate: '2023-01-02', thumbnailBase64: null }
      ],
      total: 2,
      page: 1,
      pageSize: 9,
      totalPages: 1
    };
    jest.spyOn(db, 'searchDocuments').mockResolvedValue(mockSearchResults);

    const req = createMockNextRequest('http://localhost:3000/api/documents/search?query=test&page=1&pageSize=9');
    const response = await GET(req);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toHaveProperty('results');
    expect(responseData).toHaveProperty('total');
    expect(responseData).toHaveProperty('page');
    
    // Use expect.any() to be more flexible with the parameter types
    expect(db.searchDocuments).toHaveBeenCalledWith(expect.objectContaining({
      query: 'test',
      page: 1,
      pageSize: 9,
      sortBy: 'newest'
    }));
  });

  it('should handle search parameters correctly', async () => {
    // Mock searchDocuments function
    jest.spyOn(db, 'searchDocuments').mockResolvedValue({
      results: [],
      total: 0,
      page: 1,
      pageSize: 5,
      totalPages: 0
    });

    const url = 'http://localhost:3000/api/documents/search?query=test&courseId=123&docType=NOTES&minRating=4&sortBy=rating&page=2&pageSize=5';
    const req = createMockNextRequest(url);
    
    await GET(req);
    
    // Use expect.any() to be more flexible with the parameter types
    expect(db.searchDocuments).toHaveBeenCalledWith(expect.objectContaining({
      query: 'test',
      courseId: '123',
      docType: 'NOTES',
      minRating: 4,
      sortBy: 'rating',
      page: 2,
      pageSize: 5
    }));
  });
});
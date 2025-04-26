import { POST } from '@/app/api/documents/rating/route';
import * as auth from 'next-auth/next';
import * as db from '@/app/lib/db';
import { mockSession, resetMocks } from '../helpers';
import { Session } from 'next-auth';
import { NextRequest } from 'next/server';

// Mock the modules
jest.mock('next-auth/next');
jest.mock('@/app/lib/db');

describe('Document Rating API', () => {
  // Reset mocks before each test
  beforeEach(() => {
    resetMocks();
    
    jest.spyOn(auth, 'getServerSession').mockResolvedValue({
      user: {
        name: 'Test User',
        email: 'test@example.com',
      },
      expires: new Date().toISOString()
    } as Session);
    jest.spyOn(auth, 'getServerSession').mockResolvedValue(mockSession);
  });

  it('should return 401 when user is not authenticated', async () => {
    // Mock unauthenticated session
    jest.spyOn(auth, 'getServerSession').mockResolvedValue(null);
    const req = new NextRequest('http://localhost:3000/api/documents/rating', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: 'doc123', rating: 4 })
    });
    
    const response = await POST(req);

    expect(response.status).toBe(401);
    expect(await response.text()).toContain('Unauthorized');
  });

  it('should return 400 for invalid request body', async () => {
    const req = new NextRequest('http://localhost:3000/api/documents/rating', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}) // Missing id and rating
    });
    
    const response = await POST(req);

    expect(response.status).toBe(400);
    expect(await response.text()).toContain('Invalid request');
  });

  it('should return 404 when user is not found', async () => {
    // Mock user not found
    jest.spyOn(db, 'findUserByEmail').mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/documents/rating', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: 'doc123', rating: 4 })
    });
    
    const response = await POST(req);

    expect(response.status).toBe(404);
    expect(await response.text()).toContain('User not found');
  });

  it('should return 404 when document is not found', async () => {
    // Mock user found but document not found
    jest.spyOn(db, 'findUserByEmail').mockResolvedValue({ 
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'STUDENT',
      password: null,
      oauthProvider: null,
      oauthId: null,
      bio: null,
      profilePicture: null,
      joinedDate: new Date(),
    });
    
    jest.spyOn(db, 'getDocumentById').mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/documents/rating', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: 'doc123', rating: 4 })
    });
    
    const response = await POST(req);

    expect(response.status).toBe(404);
    expect(await response.text()).toContain('Document not found');
  });

  it('should save rating and return average rating successfully', async () => {
    // Mock dependencies
    jest.spyOn(db, 'findUserByEmail').mockResolvedValue({ 
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'STUDENT',
      password: null,
      oauthProvider: null,
      oauthId: null,
      bio: null,
      profilePicture: null,
      joinedDate: new Date(),
    });
    
    jest.spyOn(db, 'getDocumentById').mockResolvedValue({ 
      id: 'doc123', 
      title: 'Test Document',
      course: { name: 'Test Course' },
      comments: [],
      ratings: [],
      author: {
        name: 'Test Author',
        email: 'author@example.com'
      },
      courseId: 1,
      docType: 'NOTES',
      fileUrl: 'https://example.com/test.pdf',
      fileType: 'pdf',
      originalFileName: 'test.pdf',
      thumbnailBase64: null,
      uploadDate: new Date(),
      authorId: 'user123',
      tags: [],
      metadata: {},
      viewCount: 0,
      downloadCount: 0,
    });
    
    jest.spyOn(db, 'saveRating').mockResolvedValue(undefined);
    
    jest.spyOn(db, 'getRatingsForDocument').mockResolvedValue([
      { value: 4 },
      { value: 5 },
      { value: 3 }
    ]);

    const req = new NextRequest('http://localhost:3000/api/documents/rating', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: 'doc123', rating: 4 })
    });
    
    const response = await POST(req);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toHaveProperty('averageRating');
    expect(responseData.averageRating).toBe(4); // (4+5+3)/3 = 4
    
    // Verify saveRating was called with correct params
    expect(db.saveRating).toHaveBeenCalledWith({
      documentId: 'doc123',
      userId: 'user123',
      rating: 4
    });
  });
});
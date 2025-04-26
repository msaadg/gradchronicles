import { NextRequest } from 'next/server';
import { GET } from '@/app/api/documents/[id]/route';
import * as auth from 'next-auth/next';
import * as db from '@/app/lib/db';
import { mockSession, resetMocks } from '../helpers';

// Mock the modules
jest.mock('next-auth/next');
jest.mock('@/app/lib/db', () => ({
  findUserByEmail: jest.fn(),
  getDocumentById: jest.fn(),
  incrementViewCount: jest.fn(),
  recordDocumentView: jest.fn(),
  calculateAverageRating: jest.fn().mockReturnValue(4.5),
  getRelatedDocuments: jest.fn().mockResolvedValue([])
}));

describe('Document View API', () => {
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

    const req = {} as NextRequest;
    const params = Promise.resolve({ id: 'doc123' });
    
    const response = await GET(req, { params });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

  it('should return 404 when user is not found', async () => {
    // Mock user not found
    jest.spyOn(db, 'findUserByEmail').mockResolvedValue(null);

    const req = {} as NextRequest;
    const params = Promise.resolve({ id: 'doc123' });
    
    const response = await GET(req, { params });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: 'User not found' });
  });

  it('should return 404 when document is not found', async () => {
    // Mock document not found
    jest.spyOn(db, 'getDocumentById').mockResolvedValue(null);

    const req = {} as NextRequest;
    const params = Promise.resolve({ id: 'doc123' });
    
    const response = await GET(req, { params });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: 'Document not found' });
  });

  it('should return document data and increment view count successfully', async () => {
    // Mock getRelatedDocuments with proper return value
    jest.spyOn(db, 'getRelatedDocuments').mockResolvedValue([
      {
        id: 'related1',
        title: 'Related Doc 1',
        courseId: 1,
        docType: 'NOTES',
        originalFileName: 'related1.pdf',
        fileUrl: 'https://example.com/related1.pdf',
        fileType: 'pdf',
        tags: ['test'],
        uploadDate: new Date(),
        authorId: 'user1',
        metadata: {},
        viewCount: 5,
        downloadCount: 2,
        course: { name: 'Test Course' },
        ratings: [
          { id: 'rating3', createdAt: new Date(), userId: 'user3', documentId: 'related1', value: 3 }
        ],
        thumbnailBase64: 'base64data'
      },
      {
        id: 'related2',
        title: 'Related Doc 2',
        courseId: 1,
        docType: 'NOTES',
        originalFileName: 'related2.pdf',
        fileUrl: 'https://example.com/related2.pdf',
        fileType: 'pdf',
        tags: ['test'],
        uploadDate: new Date(),
        authorId: 'user1',
        metadata: {},
        viewCount: 5,
        downloadCount: 2,
        course: { name: 'Test Course' },
        ratings: [
          { id: 'rating3', createdAt: new Date(), userId: 'user3', documentId: 'related2', value: 3 }
        ],
        thumbnailBase64: 'base64data'
      },
      {
        id: 'related3',
        title: 'Related Doc 3',
        courseId: 1,
        docType: 'NOTES',
        originalFileName: 'related3.pdf',
        fileUrl: 'https://example.com/related3.pdf',
        fileType: 'pdf',
        tags: ['test'],
        uploadDate: new Date(),
        authorId: 'user1',
        metadata: {},
        viewCount: 5,
        downloadCount: 2,
        course: { name: 'Test Course' },
        ratings: [
          { id: 'rating3', createdAt: new Date(), userId: 'user3', documentId: 'related3', value: 3 }
        ],
        thumbnailBase64: 'base64data'
      }
    ]);

    // Mock document found with required nested data structure
    const mockDocument = {
      id: 'doc123',
      title: 'Test Document',
      description: 'This is a test document',
      fileUrl: 'https://example.com/test.pdf',
      fileType: 'pdf',
      originalFileName: 'test.pdf',
      thumbnailBase64: 'base64-thumbnail-data',
      uploadDate: new Date(),
      docType: 'NOTES' as any,
      courseId: 1,
      authorId: 'user123',
      tags: ['test', 'document'],
      metadata: { fileSize: 1024 },
      course: {
        id: 'course123',
        name: 'Test Course',
      },
      author: {
        id: 'user123',
        name: 'Document Creator',
        email: 'creator@example.com',
      },
      comments: [
        {
          id: 'comment1',
          content: 'Great document',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'commenter1',
          documentId: 'doc123',
          user: {
            id: 'commenter1',
            name: 'Commenter User'
          }
        }
      ],
      ratings: [
        { id: 'rating1', createdAt: new Date(), userId: 'user1', documentId: 'doc123', value: 4 },
        { id: 'rating2', createdAt: new Date(), userId: 'user2', documentId: 'doc123', value: 5 }
      ],
      viewCount: 20,
      downloadCount: 5,
    };
    
    jest.spyOn(db, 'getDocumentById').mockResolvedValue(mockDocument);
    jest.spyOn(db, 'incrementViewCount').mockResolvedValue(mockDocument);
    jest.spyOn(db, 'recordDocumentView').mockResolvedValue({
      id: 'view-123',
      userId: 'test-user-id',
      documentId: 'doc123',
      viewedAt: new Date()
    });

    const req = {} as NextRequest;
    const params = Promise.resolve({ id: 'doc123' });
    
    const response = await GET(req, { params });
    
    expect(response.status).toBe(200);
    
    const responseData = await response.json();
    expect(responseData.document).toHaveProperty('id', 'doc123');
    expect(responseData.document).toHaveProperty('title', 'Test Document');
    
    // Verify view count was incremented
    expect(db.incrementViewCount).toHaveBeenCalledWith('doc123');
    
    // Verify document view was recorded
    expect(db.recordDocumentView).toHaveBeenCalledWith('test-user-id', 'doc123');
  });
});
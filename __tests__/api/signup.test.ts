import { POST } from '@/app/api/signup/route';
import * as db from '@/app/lib/db';
import { resetMocks } from '../helpers';

// Mock the database module
jest.mock('@/app/lib/db');

describe('Signup API', () => {
  // Reset mocks before each test
  beforeEach(() => {
    resetMocks();
  });

  it('should return 400 when required fields are missing', async () => {
    // Missing lastName
    const req = new Request('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: 'John',
        email: 'john@example.com',
        password: 'password123'
      })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toContain('All fields are required');
  });

  it('should return 409 when user already exists', async () => {
    // Mock user already exists
    jest.spyOn(db, 'findUserByEmail').mockResolvedValue({
      id: 'existing-user',
      email: 'existing@example.com',
      name: 'Existing User',
      password: null,
      oauthProvider: null,
      oauthId: null,
      bio: null,
      profilePicture: null,
      role: 'STUDENT',
      joinedDate: new Date(),
    });

    const req = new Request('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'password123'
      })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.message).toContain('User with this email already exists');
    expect(db.findUserByEmail).toHaveBeenCalledWith('existing@example.com');
  });

  it('should create a new user successfully', async () => {
    // Mock user doesn't exist and creation succeeds
    jest.spyOn(db, 'findUserByEmail').mockResolvedValue(null);
    jest.spyOn(db, 'createUser').mockResolvedValue({
      id: 'new-user-id',
      email: 'john.doe@example.com',
      name: 'John Doe',
      password: null,
      oauthProvider: null,
      oauthId: null,
      bio: null,
      profilePicture: null,
      role: 'STUDENT',
      joinedDate: new Date(),
    });

    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    };

    const req = new Request('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toContain('User created successfully');
    expect(data.user).toHaveProperty('id', 'new-user-id');
    expect(data.user).toHaveProperty('email', 'john.doe@example.com');
    
    // Check createUser was called with correct parameters
    expect(db.createUser).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    });
  });

  it('should handle server errors', async () => {
    // Mock database error
    jest.spyOn(db, 'findUserByEmail').mockResolvedValue(null);
    jest.spyOn(db, 'createUser').mockRejectedValue(new Error('Database error'));
    
    // Mock console.error to avoid cluttering test output
    const originalConsoleError = console.error;
    console.error = jest.fn();

    const req = new Request('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toContain('Failed to create user');
    
    // Restore original console.error
    console.error = originalConsoleError;
  });
});
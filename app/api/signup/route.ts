// app/api/signup/route.ts
import { NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    // Create the user
    const user = await createUser({
      firstName,
      lastName,
      email,
      password,
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: { id: user.id, email: user.email, name: user.name },
      credentials: { email, password }, // Send credentials for client-side sign-in
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ message: 'Failed to create user' }, { status: 500 });
  }
}
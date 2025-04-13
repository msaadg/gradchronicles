// app/api/courses/route.ts
import { NextResponse } from 'next/server';
import { getAllCourses } from '@/app/lib/db';

export async function GET() {
  try {
    const courses = await getAllCourses();
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return NextResponse.json({ message: 'Failed to load courses' }, { status: 500 });
  }
}

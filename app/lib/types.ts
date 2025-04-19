export interface DocumentMetadata {
  summary?: string;
  pageCount?: number;
  wordCount?: number;
  createdAt?: string;
  modifiedAt?: string;
  author?: string;
  title?: string;
  keywords?: string[];
  language?: string;
  fileSize?: number;
  isPasswordProtected?: boolean;
}

export type FileType = 'PDF' | 'DOC' | 'DOCX' | 'TXT';

export interface ExtractedMetadata extends DocumentMetadata {
  fileType: FileType;
  mimeType: string;
}

export interface Credentials {
  email: string;
  password: string;
}

// Adding a new Document (Rating and Course) interface

export interface Rating {
  value: number;
}

export interface Course {
  name: string;
}

export interface Document {
  id: string;
  title: string;
  course: Course;
  ratings: Rating[];
  downloadCount: number;
  uploadDate: Date;
  fileUrl: string;
}

// Types for front-end Search page.tsx

export type SearchResultType = {
  id: string;
  title: string;
  course: string;
  rating: number;
  totalRatings: number;
  downloads: number;
  uploadDate: string;
  imageUrl: string;
};

export type CourseType = {
  id: string;
  name: string;
};
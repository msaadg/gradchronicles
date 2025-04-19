// lib/types.ts
export interface Document {
  id: string;
  title: string;
  course: string;
  rating?: number;
  totalRating?: number;
  imageBase64?: string | null;
}

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

export type CourseRecommendation = {
  id: number
  title: string
  course: string
  rating: number
  totalRating: number
}

export interface Document {
  id: string;
  title: string;
  course: string;
  ratings: number;
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
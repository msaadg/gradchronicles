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

interface DocumentResponse {
  id: string;
  title: string;
  author: string | null;
  course: string;
  uploadDate: string;
  tags: string[];
  fileUrl: string;
  // fileType: string;
  fileType: FileType; // Use FileType ('PDF', 'DOC', etc.)
  mimeType: string;   // Add mimeType
  fileSize: number;
  averageRating: number;
}

interface CommentResponse {
  id: string;
  author: string;
  time: string;
  content: string;
  canDelete: boolean;
  avatar: string;
}

interface RelatedDocResponse {
  id: string;
  title: string;
  course: string;
  rating: number;
  totalRating: number;
}

interface ViewDocumentResponse {
  document: DocumentResponse;
  comments: CommentResponse[];
  relatedDocuments: RelatedDocResponse[];
}
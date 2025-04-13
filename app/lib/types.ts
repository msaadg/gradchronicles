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
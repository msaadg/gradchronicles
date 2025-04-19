'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Download, ZoomIn, ZoomOut, ArrowLeft, ArrowRight, Star } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Document, Page, pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
import { FileType } from '@/app/lib/types';

// Set PDF.js worker (required for react-pdf)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Define types matching api/documents/[id]/route.ts
interface DocumentResponse {
  id: string;
  title: string;
  author: string | null;
  course: string;
  uploadDate: string;
  tags: string[];
  fileUrl: string;
  fileType: FileType; // Use FileType ('PDF', 'DOC', etc.)
  mimeType: string;   // Add mimeType
  originalFileName: string; // Using this insead to extarct document type
  fileSize: number;
  averageRating: number;
  viewCount: number;      // Added to display in UI
  downloadCount: number;  // Added to display in UI
}

interface CommentResponse {
  id: string;
  author: string;
  time: string;
  content: string;
  canDelete: boolean;
  // avatar: string;
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

export default function ViewDocument() {
  const { id } = useParams(); // Get dynamic id from URL
  const { data: session, status } = useSession(); // Get user session
  const [data, setData] = useState<ViewDocumentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  // Preview states
  const [numPages, setNumPages] = useState<number | null>(null); // For PDFs
  const [pageNumber, setPageNumber] = useState(1); // For PDFs
  const [scale, setScale] = useState(1.0); // Zoom level
  const [textContent, setTextContent] = useState<string | null>(null); // For text files
  const [wordContent, setWordContent] = useState<string | null>(null); // For Word files
  const previewRef = useRef<HTMLDivElement>(null); // For scrolling Word/text

  // // Fetch document data on mount
  // useEffect(() => {
  //   async function fetchDocument() {
  //     if (!id) return;
  //     try {
  //       const res = await fetch(`/api/documents/${id}`);
  //       if (!res.ok) {
  //         throw new Error(
  //           res.status === 404 ? 'Document not found' : res.status === 401 ? 'Please sign in to view this document' : 'Failed to fetch document'
  //         );
  //       }
  //       const result: ViewDocumentResponse = await res.json();
  //       setData(result);
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : 'An error occurred');
  //       toast.error(err instanceof Error ? err.message : 'An error occurred');
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetchDocument();
  // }, [id]);
  useEffect(() => {
    async function fetchDocument() {
      if (!id || typeof id !== 'string') {
        setError('Invalid document ID');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/documents/${id}`);
        if (!res.ok) {
          throw new Error(
            res.status === 404 ? 'Document not found' : res.status === 401 ? 'Please sign in to view this document' : 'Failed to fetch document'
          );
        }
        const result: ViewDocumentResponse = await res.json();
        setData(result);

        // Fetch content for Word or text files
        if (result.document.fileType === 'DOC' || result.document.fileType === 'DOCX') {
          try {
            const response = await fetch(result.document.fileUrl);
            if (!response.ok) throw new Error('Failed to fetch Word document');
            const arrayBuffer = await response.arrayBuffer();
            const { value } = await mammoth.convertToHtml({ arrayBuffer });
            setWordContent(value);
          } catch (err) {
            console.error('Word preview error:', err);
            toast.error('Failed to load Word document preview');
          }
        } else if (result.document.fileType === 'TXT') {
          try {
            const response = await fetch(result.document.fileUrl);
            if (!response.ok) throw new Error('Failed to fetch text file');
            const text = await response.text();
            setTextContent(text);
          } catch (err) {
            console.error('Text preview error:', err);
            toast.error('Failed to load text file preview');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        toast.error(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchDocument();
  }, [id]);

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'authenticated') {
      toast.error('Please sign in to post a comment');
      return;
    }
    if (!comment.trim()) {
      toast.warning('Comment cannot be empty');
      return;
    }

    try {
      const res = await fetch('/api/comments', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: id, content: comment }),
      });
      if (!res.ok) {
        throw new Error(res.status === 404 ? 'Document not found' : 'Failed to post comment');
      }
      const newComment: CommentResponse = await res.json();
      setData((prev) =>
        prev ? { ...prev, comments: [newComment, ...prev.comments] } : prev
      );
      setComment('');
      toast.success('Comment posted successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error posting comment');
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete comment');
      }
      setData((prev) =>
        prev ? { ...prev, comments: prev.comments.filter((c) => c.id !== commentId) } : prev
      );
      toast.success('Comment deleted successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error deleting comment');
    }
  };

  // Preview handlers
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const handlePrevPage = () => {
    if (data?.document.fileType === 'PDF') {
      setPageNumber((prev) => Math.max(prev - 1, 1));
    } else if (previewRef.current) {
      previewRef.current.scrollBy({ top: -100, behavior: 'smooth' });
    }
  };
  const handleNextPage = () => {
    if (data?.document.fileType === 'PDF') {
      setPageNumber((prev) => (numPages ? Math.min(prev + 1, numPages) : prev));
    } else if (previewRef.current) {
      previewRef.current.scrollBy({ top: 100, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar isLoggedIn={status === 'authenticated'} />
        <main className="flex-grow py-8 container mx-auto px-4">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar isLoggedIn={status === 'authenticated'} />
        <main className="flex-grow py-8 container mx-auto px-4">
          <p className="text-red-500">Error: {error}</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar isLoggedIn={status === 'authenticated'} />
        <main className="flex-grow py-8 container mx-auto px-4">
          <p>Document not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  const { document, comments, relatedDocuments } = data;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isLoggedIn={status === 'authenticated'} />
      
      <main className="bg-[#fbf8f8] flex-grow py-10 py-8 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Preview */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-3">
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <ZoomIn className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <ZoomOut className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <ArrowRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-lg min-h-[400px] flex items-center justify-center overflow-hidden">
                <Image 
                  src="/f185f2fc-4a7b-4a4c-ad0a-bed9c2f4f052.png" // TODO: Replace with actual document preview if available
                  alt={document.title}
                  width={800}
                  height={600}
                  className="max-w-full h-auto transform transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>

            {/* Document Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">{document.title}</h1>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      fill={i < Math.round(document.averageRating) ? '#FBBF24' : 'none'}
                      color={i < Math.round(document.averageRating) ? '#FBBF24' : '#CBD5E1'}
                    />
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600">Uploaded by {document.author || 'Unknown Author'}</p>
                <p className="text-gray-600">Course: {document.course}</p>
                <p className="text-gray-600">
                  Uploaded on {new Date(document.uploadDate).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {document.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-brand-purple-dark transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download {document.originalFileName.slice(document.originalFileName.lastIndexOf('.') + 1).toUpperCase()} · {(document.fileSize / (1024 * 1024)).toFixed(1)}MB
                </a>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-4">Comments</h2>
              
              <form onSubmit={handleSubmitComment} className="mb-6">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={status === 'authenticated' ? 'Add a comment...' : 'Sign in to add a comment'}
                  disabled={status !== 'authenticated'}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 min-h-[80px] disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={status !== 'authenticated'}
                    className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-brand-purple-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Post
                  </button>
                </div>
              </form>
              
              <div className="space-y-5">
                {comments.length === 0 ? (
                  <p className="text-gray-600">No comments yet.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          <Image
                            src={'/avatar1.png'} 
                            alt={comment.author}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium">{comment.author}</h4>
                              <p className="text-sm text-gray-500">
                                {new Date(comment.time).toLocaleString()}
                              </p>
                            </div>
                            <button className="text-purple-600 hover:underline text-sm">
                              Report
                            </button>
                          </div>
                          <p className="mt-2 text-gray-700">{comment.content}</p>
                          <div className="mt-2 flex space-x-4">
                            <button className="text-purple-600 hover:underline text-sm">
                              Reply
                            </button>
                            {comment.canDelete && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-red-500 hover:underline text-sm"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Related Documents */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-4">Related Documents</h2>
              
              <div className="space-y-4">
                {relatedDocuments.length === 0 ? (
                  <p className="text-gray-600">No related documents found.</p>
                ) : (
                  relatedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src="/login-image.png" // TODO: Replace with actual document thumbnail if available
                          alt={doc.title}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{doc.title}</h3>
                        <p className="text-sm text-gray-600">{doc.course}</p>
                        <div className="flex items-center mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill={i < Math.round(doc.rating) ? '#FBBF24' : 'none'}
                                color={i < Math.round(doc.rating) ? '#FBBF24' : '#CBD5E1'}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-1">
                            {doc.rating}/{doc.totalRating}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/document/${doc.id}`}
                        className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-full hover:bg-brand-purple-dark transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
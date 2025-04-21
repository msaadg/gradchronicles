// 'use client';

// import { useEffect, useState, useRef, useCallback } from 'react';
// import { useParams } from 'next/navigation';
// import Link from 'next/link';
// import { Download, ZoomIn, ZoomOut, ArrowLeft, ArrowRight, Star } from 'lucide-react';
// import Navbar from '@/app/components/Navbar';
// import Footer from '@/app/components/Footer';
// import Image from 'next/image';
// import { useSession } from 'next-auth/react';
// import { toast } from 'sonner';
// import { Document, Page, pdfjs } from 'react-pdf';
// import mammoth from 'mammoth';
// import { FileType } from '@/app/lib/types';

// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// import 'react-pdf/dist/esm/Page/TextLayer.css';
// // Set PDF.js worker (required for react-pdf)
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// // Define types matching api/documents/[id]/route.ts
// interface DocumentResponse {
//   id: string;
//   title: string;
//   author: string | null;
//   course: string;
//   uploadDate: string;
//   tags: string[];
//   fileUrl: string;
//   fileType: FileType; // Use FileType ('PDF', 'DOC', etc.)
//   mimeType: string;   // Add mimeType
//   originalFileName: string; // Using this insead to extarct document type
//   fileSize: number;
//   averageRating: number;
//   viewCount: number;      // Added to display in UI
//   downloadCount: number;  // Added to display in UI
// }

// interface CommentResponse {
//   id: string;
//   author: string;
//   time: string;
//   content: string;
//   canDelete: boolean;
//   // avatar: string;
// }

// interface RelatedDocResponse {
//   id: string;
//   title: string;
//   course: string;
//   rating: number;
//   totalRating: number;
// }

// interface ViewDocumentResponse {
//   document: DocumentResponse;
//   comments: CommentResponse[];
//   relatedDocuments: RelatedDocResponse[];
// }

// interface ErrorResponse {
//   message?: string;
// }

// export default function ViewDocument() {
//   const { id } = useParams(); // Get dynamic id from URL
//   const { data: session, status } = useSession(); // Get user session
//   const [data, setData] = useState<ViewDocumentResponse | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [comment, setComment] = useState('');
//   const [fileUrl, setFileUrl] = useState<string | null>(null); // For PDF Blob URL

//   // Preview states
//   const [numPages, setNumPages] = useState<number | null>(null); // For PDFs
//   const [pageNumber, setPageNumber] = useState(1); // For PDFs
//   const [scale, setScale] = useState(1.0); // Zoom level
//   const [textContent, setTextContent] = useState<string | null>(null); // For text files
//   const [wordContent, setWordContent] = useState<string | null>(null); // For Word files
//   const previewRef = useRef<HTMLDivElement>(null); // For scrolling Word/text
//   const [showRatingForm, setShowRatingForm] = useState(false);
//   const [selectedRating, setSelectedRating] = useState<number>(0);
//   const [submittingRating, setSubmittingRating] = useState(false);
//   const [isPdf, setIsPdf] = useState<boolean>(false);
//   const pageRefs = useRef<(HTMLDivElement | null)[]>([]); // Refs for each PDF page

//   // Fetch document data and content
//   useEffect(() => {
//     async function fetchDocument() {
//       if (!id || typeof id !== 'string') {
//         setError('Invalid document ID');
//         setLoading(false);
//         return;
//       }

//       try {
//         // Fetch metadata
//         const metaRes = await fetch(`/api/documents/${id}`);
//         if (!metaRes.ok) {
//           throw new Error(
//             metaRes.status === 404 ? 'Document not found' : metaRes.status === 401 ? 'Please sign in to view this document' : 'Failed to fetch document'
//           );
//         }
//         const result: ViewDocumentResponse = await metaRes.json();
//         console.log('API Response:', result);
//         setData(result);

//         console.log('FileType:', result.document.fileType);
//         console.log('File URL:', result.document.fileUrl);

//         // Fetch file content for preview
//         const fileRes = await fetch(`/api/documents/preview/${id}`);
//         if (!fileRes.ok) {
//           throw new Error('Failed to fetch file content');
//         }

//         const contentType = fileRes.headers.get('content-type');
//         console.log('Content-Type:', contentType);
//         const blob = await fileRes.blob();
//         console.log('Blob Size:', blob.size, 'Type:', blob.type);
//         const url = URL.createObjectURL(blob);
//         setFileUrl(url);
//         setIsPdf(contentType?.includes('application/pdf') || result.document.fileType?.toUpperCase() === 'PDF');

//         // Handle non-PDF files
//         if (result.document.fileType === 'DOC' || result.document.fileType === 'DOCX') {
//           try {
//             const arrayBuffer = await blob.arrayBuffer();
//             const { value } = await mammoth.convertToHtml({ arrayBuffer });
//             setWordContent(value);
//           } catch (err) {
//             console.error('Word preview error:', err);
//             toast.error('Failed to load Word document preview');
//           }
//         } else if (result.document.fileType === 'TXT') {
//           try {
//             const text = await blob.text();
//             setTextContent(text);
//           } catch (err) {
//             console.error('Text preview error:', err);
//             toast.error('Failed to load text file preview');
//           }
//         }
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'An error occurred');
//         console.error('Fetch error:', err);
//         toast.error(err instanceof Error ? err.message : 'An error occurred');
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchDocument();

//     // Cleanup Blob URL
//     return () => {
//       if (fileUrl) URL.revokeObjectURL(fileUrl);
//     };
//   }, [id]);

//   // IntersectionObserver to update pageNumber when scrolling
//   useEffect(() => {
//     if (!isPdf || !numPages) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             const pageIndex = parseInt(entry.target.getAttribute('data-page-number') || '1', 10);
//             setPageNumber(pageIndex);
//           }
//         });
//       },
//       { threshold: 0.5 } // Trigger when 50% of the page is visible
//     );

//     pageRefs.current.forEach((ref) => {
//       if (ref) observer.observe(ref);
//     });

//     return () => {
//       pageRefs.current.forEach((ref) => {
//         if (ref) observer.unobserve(ref);
//       });
//     };
//   }, [isPdf, numPages]);

//   // Handle rating
//   const handleSubmitRating = async () => {
//     if (!session) {
//       toast.error('Please sign in to rate this document');
//       console.error('[Rating] No session found');
//       return;
//     }
//     if (selectedRating < 1 || selectedRating > 5) {
//       toast.warning('Please select a rating between 1 and 5');
//       console.error('[Rating] Invalid rating:', selectedRating);
//       return;
//     }
  
//     setSubmittingRating(true);
//     try {
//       console.log('[Rating] Submitting rating:', selectedRating, 'for document:', id);
//       const res = await fetch('/api/documents/rating', { 
//         method: 'POST',
//         body: JSON.stringify({ id, rating: selectedRating }),
//         headers: { 'Content-Type': 'application/json' }
//       });
  
//       console.log('[Rating] Response:', {
//         status: res.status,
//         statusText: res.statusText,
//         headers: Object.fromEntries(res.headers.entries()),
//       });
  
//       if (!res.ok) {
//         let errorData: ErrorResponse = {};
//         let rawResponse = '';
//         try {
//           rawResponse = await res.text();
//           console.log('[Rating] Raw response:', rawResponse.slice(0, 200));
//           // Check if response is JSON
//           const contentType = res.headers.get('content-type') || '';
//           if (contentType.includes('application/pdf')) {
//             errorData = JSON.parse(rawResponse);
//           } else {
//             console.warn('[Rating] Non-JSON response:', contentType);
//             errorData = { message: `HTTP ${res.status}: ${res.statusText} (Non-JSON response)` };
//           }
//         } catch (jsonError) {
//           console.error('[Rating] Failed to parse response:', jsonError, 'Raw:', rawResponse.slice(0, 200));
//           errorData = { message: `HTTP ${res.status}: ${res.statusText}` };
//         }
//         console.log('[Rating] Error data:', errorData);
//         throw new Error(errorData.message || `Failed to submit rating (status: ${res.status})`);
//       }
  
//       const { averageRating } = await res.json();
//       console.log('[Rating] Success, averageRating:', averageRating);
//       setData((prev) =>
//         prev
//           ? {
//               ...prev,
//               document: { ...prev.document, averageRating },
//             }
//           : prev
//       );
//       setShowRatingForm(false);
//       setSelectedRating(0);
//       toast.success('Rating submitted successfully');
//     } catch (err) {
//       console.error('[Rating] Error:', {
//         message: err instanceof Error ? err.message : 'Unknown error',
//         stack: err instanceof Error ? err.stack : undefined,
//       });
//       toast.error(err instanceof Error ? err.message : 'Error submitting rating');
//     } finally {
//       setSubmittingRating(false);
//     }
//   };

//   // Handle comment submission
//   const handleSubmitComment = async (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log('[1] Form submit triggered');
  
//     if (status !== 'authenticated') {
//       console.log('[2] User not authenticated, status:', status);
//       toast.error('Please sign in to post a comment');
//       return;
//     }
  
//     console.log('[3] Comment content:', comment);
//     if (!comment.trim()) {
//       console.log('[4] Empty comment detected');
//       toast.warning('Comment cannot be empty');
//       return;
//     }
  
//     console.log('[5] Document ID:', id, 'URL:', `/api/documents/${id}`, 'Body:', { content: comment });
  
//     try {
//       const res = await fetch(`/api/documents/${id}`, { // Remove /comments
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ content: comment }),
//       });
//       console.log('[6] Response status:', res.status, 'ok:', res.ok);
  
//       if (!res.ok) {
//         let errorData: { message?: string } = {};
//         let rawResponse = '';
//         try {
//           rawResponse = await res.text();
//           console.log('[7] Raw response:', rawResponse.slice(0, 200));
//           errorData = JSON.parse(rawResponse);
//         } catch (jsonError) {
//           console.error('[7] Failed to parse JSON response:', jsonError);
//         }
//         console.error('[7] Error response:', errorData, 'status:', res.status);
//         const errorMessage = errorData.message ?? `Failed to post comment (status: ${res.status})`;
//         throw new Error(errorMessage);
//       }
  
//       const newComment = await res.json();
//       console.log('[8] New comment created:', newComment);
  
//       setData((prev) =>
//         prev
//           ? {
//               ...prev,
//               comments: [
//                 {
//                   id: newComment.id,
//                   author: session?.user?.name || 'Anonymous',
//                   time: new Date().toISOString(),
//                   content: comment,
//                   canDelete: true,
//                 },
//                 ...prev.comments,
//               ],
//             }
//           : prev
//       );
//       setComment('');
//       toast.success('Comment posted successfully');
//     } catch (err) {
//       console.error('[9] Full error:', err);
//       toast.error(err instanceof Error ? err.message : 'Error posting comment');
//     }
//   };

//   // Handle comment deletion
//   const handleDeleteComment = async (commentId: string) => {
//     if (!confirm('Are you sure you want to delete this comment?')) return;
  
//     console.log('[1] Delete comment triggered for commentId:', commentId, 'documentId:', id);
  
//     try {
//       console.log('[2] Sending DELETE request to:', `/api/documents/${id}`);
//       const res = await fetch(`/api/documents/${id}`, {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ commentId }),
//       });
  
//       console.log('[3] Response status:', res.status, 'ok:', res.ok);
  
//       if (!res.ok) {
//         let errorData: { message?: string } = {};
//         let rawResponse = '';
//         try {
//           rawResponse = await res.text();
//           console.log('[4] Raw response:', rawResponse.slice(0, 200));
//           errorData = JSON.parse(rawResponse);
//         } catch (jsonError) {
//           console.error('[4] Failed to parse JSON response:', jsonError);
//         }
//         console.error('[4] Error response:', errorData, 'status:', res.status);
//         const errorMessage = errorData.message ?? `Failed to delete comment (status: ${res.status})`;
//         throw new Error(errorMessage);
//       }
  
//       console.log('[5] Comment deleted successfully');
//       setData((prev) =>
//         prev
//           ? {
//               ...prev,
//               comments: prev.comments.filter((c) => c.id !== commentId),
//             }
//           : prev
//       );
//       toast.success('Comment deleted successfully');
//     } catch (err) {
//       console.error('[6] Full error:', err);
//       toast.error(err instanceof Error ? err.message : 'Error deleting comment');
//     }
//   };

//   // Preview handlers
//   const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
//     setNumPages(numPages);
//     setPageNumber(1);
//     pageRefs.current = Array(numPages).fill(null); // Initialize refs array
//   };

//   const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
//   const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

//   const handlePrevPage = useCallback(() => {
//     if (isPdf && numPages) {
//       const newPage = Math.max(pageNumber - 1, 1);
//       setPageNumber(newPage);
//       const pageElement = pageRefs.current[newPage - 1];
//       if (pageElement) {
//         pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
//       }
//     } else if (previewRef.current) {
//       previewRef.current.scrollBy({ top: -100, behavior: 'smooth' });
//     }
//   }, [isPdf, numPages, pageNumber]);

//   const handleNextPage = useCallback(() => {
//     if (isPdf && numPages) {
//       const newPage = Math.min(pageNumber + 1, numPages);
//       setPageNumber(newPage);
//       const pageElement = pageRefs.current[newPage - 1];
//       if (pageElement) {
//         pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
//       }
//     } else if (previewRef.current) {
//       previewRef.current.scrollBy({ top: 100, behavior: 'smooth' });
//     }
//   }, [isPdf, numPages, pageNumber]);

//   if (loading) {
//     return (
//       <div className="flex flex-col min-h-screen">
//         <Navbar isLoggedIn={status === 'authenticated'} />
//         <main className="flex-grow py-8 container mx-auto px-4">
//           <p>Loading...</p>
//         </main>
//         <Footer />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col min-h-screen">
//         <Navbar isLoggedIn={status === 'authenticated'} />
//         <main className="flex-grow py-8 container mx-auto px-4">
//           <p className="text-red-500">Error: {error}</p>
//         </main>
//         <Footer />
//       </div>
//     );
//   }

//   if (!data) {
//     return (
//       <div className="flex flex-col min-h-screen">
//         <Navbar isLoggedIn={status === 'authenticated'} />
//         <main className="flex-grow py-8 container mx-auto px-4">
//           <p>Document not found</p>
//         </main>
//         <Footer />
//       </div>
//     );
//   }

//   const { document, comments, relatedDocuments } = data;

//   // Determine iframe source for non-PDF files
//   const iframeSrc =
//     !isPdf && fileUrl
//       ? (document.fileType === 'DOC' || document.fileType === 'DOCX')
//         ? `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
//         : fileUrl
//       : '';

//   return (
//     <div className="flex flex-col min-h-screen">
//       <Navbar isLoggedIn={status === 'authenticated'} />
      
//       <main className="bg-[#fbf8f8] flex-grow py-10 py-8 container mx-auto px-4">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Document Preview */}
//             <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
//               {/* Control Buttons */}
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex space-x-3">
//                   <button onClick={handleZoomIn} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
//                     <ZoomIn className="h-5 w-5 text-gray-600" />
//                   </button>
//                   <button onClick={handleZoomOut} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
//                     <ZoomOut className="h-5 w-5 text-gray-600" />
//                   </button>
//                 </div>
//                 <div className="flex space-x-3">
//                   <button onClick={handlePrevPage} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
//                     <ArrowLeft className="h-5 w-5 text-gray-600" />
//                   </button>
//                   <button onClick={handleNextPage} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
//                     <ArrowRight className="h-5 w-5 text-gray-600" />
//                   </button>
//                 </div>
//               </div>

//               {/* Actual Preview Area */}
//               <div className="flex justify-center items-center min-h-[400px] border rounded-md p-4 bg-gray-50" ref={previewRef}>
//                 {isPdf && fileUrl ? (
//                   <>
//                     {console.log('Rendering PDF preview...', fileUrl)}
//                     <div className="w-full h-[80vh] overflow-y-auto">
//                       <Document
//                         file={fileUrl}
//                         onLoadSuccess={onDocumentLoadSuccess}
//                         onLoadError={(err) => {
//                           console.error('PDF Load Error:', err);
//                           toast.error('Failed to load PDF preview');
//                         }}
//                       >
//                         {Array.from(new Array(numPages || 0), (_, index) => (
//                           <div
//                             key={`page_${index + 1}`}
//                             ref={(el) => (pageRefs.current[index] = el)}
//                             data-page-number={index + 1}
//                           >
//                             <Page
//                               pageNumber={index + 1}
//                               scale={scale}
//                               renderTextLayer={true}
//                               renderAnnotationLayer={true}
//                             />
//                           </div>
//                         ))}
//                       </Document>
//                     </div>
//                   </>
//                 ) : (
//                   iframeSrc && (
//                     <iframe
//                       src={iframeSrc}
//                       className="w-full h-[80vh] border"
//                       title="Document Preview"
//                     />
//                   )
//                 )}
//               </div>
//             </div>

//             {/* Document Details */}
//             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//               <div className="flex items-center justify-between mb-4">
//                 <h1 className="text-2xl font-bold">{document.title}</h1>
//                 <div className="flex items-center space-x-2">
//                   {/* Star ratings */}
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       size={20}
//                       fill={i < Math.round(document.averageRating) ? '#FBBF24' : 'none'}
//                       color={i < Math.round(document.averageRating) ? '#FBBF24' : '#CBD5E1'}
//                     />
//                   ))}
//                   {/* Rate document link */}
//                   <span
//                     className="text-sm text-purple-600 cursor-pointer hover:underline"
//                     onClick={() => setShowRatingForm(true)}
//                   >
//                     Rate document
//                   </span>
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <p className="text-gray-600">Uploaded by {document.author || 'Unknown Author'}</p>
//                 <p className="text-gray-600">Course: {document.course}</p>
//                 <p className="text-gray-600">
//                   Uploaded on {new Date(document.uploadDate).toLocaleDateString()}
//                 </p>
//                 <div className="flex flex-wrap gap-2 mt-2">
//                   {document.tags.map((tag) => (
//                     <span
//                       key={tag}
//                       className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
//                     >
//                       {tag}
//                     </span>
//                   ))}
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <a
//                   href={document.fileUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-brand-purple-dark transition-colors"
//                 >
//                   <Download className="h-4 w-4 mr-2" />
//                   Download {document.originalFileName.slice(document.originalFileName.lastIndexOf('.') + 1).toUpperCase()} · {(document.fileSize / (1024 * 1024)).toFixed(1)}MB
//                 </a>
//               </div>

//               {/* Rating form */}
//               {showRatingForm && (
//                 <div className="mt-4 p-4 bg-gray-50 rounded-md">
//                   <h3 className="text-lg font-semibold mb-2">Rate this document</h3>
//                   <div className="flex space-x-2 mb-4">
//                     {[...Array(5)].map((_, i) => (
//                       <Star
//                         key={i}
//                         size={24}
//                         fill={i < selectedRating ? '#FBBF24' : 'none'}
//                         color={i < selectedRating ? '#FBBF24' : '#CBD5E1'}
//                         className="cursor-pointer"
//                         onClick={() => setSelectedRating(i + 1)}
//                       />
//                     ))}
//                   </div>
//                   <div className="flex space-x-2">
//                     <button
//                       onClick={handleSubmitRating}
//                       className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-full hover:bg-brand-purple-dark transition-colors"
//                       disabled={submittingRating}
//                     >
//                       {submittingRating ? 'Submitting...' : 'Submit Rating'}
//                     </button>
//                     <button
//                       onClick={() => setShowRatingForm(false)}
//                       className="text-gray-600 px-4 py-2 rounded-full hover:bg-gray-100"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Right Column */}
//           <div className="space-y-6">
//             {/* Comments Section */}
//             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//               <h2 className="text-xl font-bold mb-4">Comments</h2>
              
//               <form onSubmit={handleSubmitComment} className="mb-6">
//                 <textarea
//                   value={comment}
//                   onChange={(e) => setComment(e.target.value)}
//                   placeholder={status === 'authenticated' ? 'Add a comment...' : 'Sign in to add a comment'}
//                   disabled={status !== 'authenticated'}
//                   className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 min-h-[80px] disabled:bg-gray-100 disabled:cursor-not-allowed"
//                 />
//                 <div className="flex justify-end mt-2">
//                   <button
//                     type="submit"
//                     disabled={status !== 'authenticated'}
//                     className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-brand-purple-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
//                   >
//                     Post
//                   </button>
//                 </div>
//               </form>
              
//               <div className="space-y-5">
//                 {comments.length === 0 ? (
//                   <p className="text-gray-600">No comments yet.</p>
//                 ) : (
//                   comments.map((comment) => (
//                     <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
//                       <div className="flex items-start">
//                         <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
//                           <Image
//                             src={'/avatar1.png'} 
//                             alt={comment.author}
//                             width={40}
//                             height={40}
//                             className="w-full h-full object-cover"
//                           />
//                         </div>
//                         <div className="ml-3 flex-1">
//                           <div className="flex justify-between">
//                             <div>
//                               <h4 className="font-medium">{comment.author}</h4>
//                               <p className="text-sm text-gray-500">
//                                 {new Date(comment.time).toLocaleString()}
//                               </p>
//                             </div>
//                             <button className="text-purple-600 hover:underline text-sm">
//                               Report  {/* to do */}
//                             </button>
//                           </div>
//                           <p className="mt-2 text-gray-700">{comment.content}</p>
//                           <div className="mt-2 flex space-x-4">
//                             <button className="text-purple-600 hover:underline text-sm">
//                               Reply  {/* to do*/}
//                             </button>
//                             {comment.canDelete && (
//                               <button
//                                 onClick={() => handleDeleteComment(comment.id)}
//                                 className="text-red-500 hover:underline text-sm"
//                               >
//                                 Delete
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
            
//             {/* Related Documents */}
//             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//               <h2 className="text-xl font-bold mb-4">Related Documents</h2>
              
//               <div className="space-y-4">
//                 {relatedDocuments.length === 0 ? (
//                   <p className="text-gray-600">No related documents found.</p>
//                 ) : (
//                   relatedDocuments.map((doc) => (
//                     <div
//                       key={doc.id}
//                       className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
//                     >
//                       <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
//                         <Image
//                           src="/login-image.png" // TODO: Replace with actual document thumbnail if available
//                           alt={doc.title}
//                           width={100}
//                           height={100}
//                           className="w-full h-full object-cover"
//                         />
//                       </div>
//                       <div className="flex-1">
//                         <h3 className="font-medium">{doc.title}</h3>
//                         <p className="text-sm text-gray-600">{doc.course}</p>
//                         <div className="flex items-center mt-1">
//                           <div className="flex">
//                             {[...Array(5)].map((_, i) => (
//                               <Star
//                                 key={i}
//                                 size={14}
//                                 fill={i < Math.round(doc.rating) ? '#FBBF24' : 'none'}
//                                 color={i < Math.round(doc.rating) ? '#FBBF24' : '#CBD5E1'}
//                               />
//                             ))}
//                           </div>
//                           <span className="text-xs text-gray-500 ml-1">
//                             {doc.rating}/{doc.totalRating}
//                           </span>
//                         </div>
//                       </div>
//                       <Link
//                         href={`/document/${doc.id}`}
//                         className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-full hover:bg-brand-purple-dark transition-colors"
//                       >
//                         View
//                       </Link>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
      
//       <Footer />
//     </div>
//   );
// }
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
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
  originalFileName: string; // Using this to extract document type
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

interface ErrorResponse {
  message?: string;
}

export default function ViewDocument() {
  const { id } = useParams(); // Get dynamic id from URL
  const { data: session, status } = useSession(); // Get user session
  const [data, setData] = useState<ViewDocumentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [fileUrl, setFileUrl] = useState<string | null>(null); // For PDF Blob URL
  const [wordError, setWordError] = useState<string | null>(null); // For DOC/DOCX errors

  // Preview states
  const [numPages, setNumPages] = useState<number | null>(null); // For PDFs
  const [pageNumber, setPageNumber] = useState(1); // For PDFs
  const [scale, setScale] = useState(1.0); // Zoom level
  const [textContent, setTextContent] = useState<string | null>(null); // For text files
  const [wordContent, setWordContent] = useState<string | null>(null); // For Word files
  const previewRef = useRef<HTMLDivElement>(null); // For scrolling Word/text
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [isPdf, setIsPdf] = useState<boolean>(false);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]); // Refs for each PDF page

  // Fetch document data and content
  useEffect(() => {
    async function fetchDocument() {
      if (!id || typeof id !== 'string') {
        setError('Invalid document ID');
        setLoading(false);
        return;
      }

      try {
        // Fetch metadata
        const metaRes = await fetch(`/api/documents/${id}`);
        if (!metaRes.ok) {
          throw new Error(
            metaRes.status === 404 ? 'Document not found' : metaRes.status === 401 ? 'Please sign in to view this document' : 'Failed to fetch document'
          );
        }
        const result: ViewDocumentResponse = await metaRes.json();
        console.log('API Response:', result);
        console.log('Document Details:', {
          fileType: result.document.fileType,
          mimeType: result.document.mimeType,
          originalFileName: result.document.originalFileName,
        });
        setData(result);

        // Fetch file content for preview
        const fileRes = await fetch(`/api/documents/preview/${id}`);
        if (!fileRes.ok) {
          throw new Error('Failed to fetch file content');
        }

        const contentType = fileRes.headers.get('content-type');
        console.log('Preview Fetch - Content-Type:', contentType);
        // Clone the response to avoid stream locking issues
        const responseClone = fileRes.clone();
        const blob = await fileRes.blob();
        console.log('Blob Size:', blob.size, 'Type:', blob.type);

        const url = URL.createObjectURL(blob);
        setFileUrl(url);
        setIsPdf(
          contentType?.includes('application/pdf') ||
          result.document.fileType?.toUpperCase() === 'PDF' ||
          result.document.mimeType?.includes('application/pdf')
        );

        // Handle non-PDF files
        const isWordDocument =
          result.document.fileType.toUpperCase() === 'DOC' ||
          result.document.fileType.toUpperCase() === 'DOCX' ||
          result.document.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          result.document.mimeType === 'application/msword' ||
          result.document.originalFileName.toLowerCase().endsWith('.doc') ||
          result.document.originalFileName.toLowerCase().endsWith('.docx');

        const isTextDocument =
          result.document.fileType.toUpperCase() === 'TXT' ||
          result.document.mimeType === 'text/plain' ||
          result.document.originalFileName.toLowerCase().endsWith('.txt');

        if (isWordDocument) {
          try {
            console.log('Processing Word document...');
            const arrayBuffer = await (await responseClone.blob()).arrayBuffer();
            console.log('ArrayBuffer size:', arrayBuffer.byteLength);
            const { value } = await mammoth.convertToHtml({ arrayBuffer });
            console.log('DOC/DOCX HTML Content:', value.substring(0, 200)); // Log first 200 chars
            setWordContent(value);
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error converting Word document';
            console.error('Word preview error:', err);
            setWordError(errorMsg);
            toast.error('Failed to load Word document preview: ' + errorMsg);
          }
        } else if (isTextDocument) {
          try {
            console.log('Processing text file...');
            const text = await (await responseClone.blob()).text();
            console.log('Text Content:', text.substring(0, 200)); // Log first 200 chars
            setTextContent(text);
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error reading text file';
            console.error('Text preview error:', err);
            setError(errorMsg);
            toast.error('Failed to load text file preview: ' + errorMsg);
          }
        } else {
          console.log('Unsupported file type:', result.document.fileType, 'mimeType:', result.document.mimeType);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMsg);
        console.error('Fetch error:', err);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    }
    fetchDocument();

    // Cleanup Blob URL
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [id]);

  // IntersectionObserver to update pageNumber when scrolling
  useEffect(() => {
    if (!isPdf || !numPages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageIndex = parseInt(entry.target.getAttribute('data-page-number') || '1', 10);
            setPageNumber(pageIndex);
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the page is visible
    );

    pageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      pageRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [isPdf, numPages]);

  // Log preview details
  useEffect(() => {
    if (data?.document) {
      const { document } = data;
      const isWordDocument =
        document.fileType.toUpperCase() === 'DOC' ||
        document.fileType.toUpperCase() === 'DOCX' ||
        document.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        document.mimeType === 'application/msword' ||
        document.originalFileName.toLowerCase().endsWith('.doc') ||
        document.originalFileName.toLowerCase().endsWith('.docx');

      const isTextDocument =
        document.fileType.toUpperCase() === 'TXT' ||
        document.mimeType === 'text/plain' ||
        document.originalFileName.toLowerCase().endsWith('.txt');

      console.log('Rendering preview for fileType:', document.fileType, 'mimeType:', document.mimeType, 'isPdf:', isPdf, 'wordContent:', !!wordContent, 'textContent:', !!textContent, 'isWordDocument:', isWordDocument, 'isTextDocument:', isTextDocument);
    }
  }, [data, isPdf, wordContent, textContent]);

  // Handle rating
  const handleSubmitRating = async () => {
    if (!session) {
      toast.error('Please sign in to rate this document');
      console.error('[Rating] No session found');
      return;
    }
    if (selectedRating < 1 || selectedRating > 5) {
      toast.warning('Please select a rating between 1 and 5');
      console.error('[Rating] Invalid rating:', selectedRating);
      return;
    }
  
    setSubmittingRating(true);
    try {
      console.log('[Rating] Submitting rating:', selectedRating, 'for document:', id);
      const res = await fetch('/api/documents/rating', { 
        method: 'POST',
        body: JSON.stringify({ id, rating: selectedRating }),
        headers: { 'Content-Type': 'application/json' }
      });
  
      console.log('[Rating] Response:', {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
      });
  
      if (!res.ok) {
        let errorData: ErrorResponse = {};
        let rawResponse = '';
        try {
          rawResponse = await res.text();
          console.log('[Rating] Raw response:', rawResponse.slice(0, 200));
          errorData = JSON.parse(rawResponse);
        } catch (jsonError) {
          console.error('[Rating] Failed to parse response:', jsonError, 'Raw:', rawResponse.slice(0, 200));
          errorData = { message: `HTTP ${res.status}: ${res.statusText}` };
        }
        console.log('[Rating] Error data:', errorData);
        throw new Error(errorData.message || `Failed to submit rating (status: ${res.status})`);
      }
  
      const { averageRating } = await res.json();
      console.log('[Rating] Success, averageRating:', averageRating);
      setData((prev) =>
        prev
          ? {
              ...prev,
              document: { ...prev.document, averageRating },
            }
          : prev
      );
      setShowRatingForm(false);
      setSelectedRating(0);
      toast.success('Rating submitted successfully');
    } catch (err) {
      console.error('[Rating] Error:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      });
      toast.error(err instanceof Error ? err.message : 'Error submitting rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[1] Form submit triggered');
  
    if (status !== 'authenticated') {
      console.log('[2] User not authenticated, status:', status);
      toast.error('Please sign in to post a comment');
      return;
    }
  
    console.log('[3] Comment content:', comment);
    if (!comment.trim()) {
      console.log('[4] Empty comment detected');
      toast.warning('Comment cannot be empty');
      return;
    }
  
    console.log('[5] Document ID:', id, 'URL:', `/api/documents/${id}`, 'Body:', { content: comment });
  
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment }),
      });
      console.log('[6] Response status:', res.status, 'ok:', res.ok);
  
      if (!res.ok) {
        let errorData: { message?: string } = {};
        let rawResponse = '';
        try {
          rawResponse = await res.text();
          console.log('[7] Raw response:', rawResponse.slice(0, 200));
          errorData = JSON.parse(rawResponse);
        } catch (jsonError) {
          console.error('[7] Failed to parse JSON response:', jsonError);
        }
        console.error('[7] Error response:', errorData, 'status:', res.status);
        const errorMessage = errorData.message ?? `Failed to post comment (status: ${res.status})`;
        throw new Error(errorMessage);
      }
  
      const newComment = await res.json();
      console.log('[8] New comment created:', newComment);
  
      setData((prev) =>
        prev
          ? {
              ...prev,
              comments: [
                {
                  id: newComment.id,
                  author: session?.user?.name || 'Anonymous',
                  time: new Date().toISOString(),
                  content: comment,
                  canDelete: true,
                },
                ...prev.comments,
              ],
            }
          : prev
      );
      setComment('');
      toast.success('Comment posted successfully');
    } catch (err) {
      console.error('[9] Full error:', err);
      toast.error(err instanceof Error ? err.message : 'Error posting comment');
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
  
    console.log('[1] Delete comment triggered for commentId:', commentId, 'documentId:', id);
  
    try {
      console.log('[2] Sending DELETE request to:', `/api/documents/${id}`);
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      });
  
      console.log('[3] Response status:', res.status, 'ok:', res.ok);
  
      if (!res.ok) {
        let errorData: { message?: string } = {};
        let rawResponse = '';
        try {
          rawResponse = await res.text();
          console.log('[4] Raw response:', rawResponse.slice(0, 200));
          errorData = JSON.parse(rawResponse);
        } catch (jsonError) {
          console.error('[4] Failed to parse JSON response:', jsonError);
        }
        console.error('[4] Error response:', errorData, 'status:', res.status);
        const errorMessage = errorData.message ?? `Failed to delete comment (status: ${res.status})`;
        throw new Error(errorMessage);
      }
  
      console.log('[5] Comment deleted successfully');
      setData((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.filter((c) => c.id !== commentId),
            }
          : prev
      );
      toast.success('Comment deleted successfully');
    } catch (err) {
      console.error('[6] Full error:', err);
      toast.error(err instanceof Error ? err.message : 'Error deleting comment');
    }
  };

  // Preview handlers
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    pageRefs.current = Array(numPages).fill(null); // Initialize refs array
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  const handlePrevPage = useCallback(() => {
    if (isPdf && numPages) {
      const newPage = Math.max(pageNumber - 1, 1);
      setPageNumber(newPage);
      const pageElement = pageRefs.current[newPage - 1];
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (previewRef.current) {
      previewRef.current.scrollBy({ top: -100, behavior: 'smooth' });
    }
  }, [isPdf, numPages, pageNumber]);

  const handleNextPage = useCallback(() => {
    if (isPdf && numPages) {
      const newPage = Math.min(pageNumber + 1, numPages);
      setPageNumber(newPage);
      const pageElement = pageRefs.current[newPage - 1];
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (previewRef.current) {
      previewRef.current.scrollBy({ top: 100, behavior: 'smooth' });
    }
  }, [isPdf, numPages, pageNumber]);

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

  const isWordDocument =
    document.fileType.toUpperCase() === 'DOC' ||
    document.fileType.toUpperCase() === 'DOCX' ||
    document.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    document.mimeType === 'application/msword' ||
    document.originalFileName.toLowerCase().endsWith('.doc') ||
    document.originalFileName.toLowerCase().endsWith('.docx');

  const isTextDocument =
    document.fileType.toUpperCase() === 'TXT' ||
    document.mimeType === 'text/plain' ||
    document.originalFileName.toLowerCase().endsWith('.txt');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isLoggedIn={status === 'authenticated'} />
      
      <main className="bg-[#fbf8f8] flex-grow py-10 py-8 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Preview */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              {/* Control Buttons */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-3">
                  <button onClick={handleZoomIn} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <ZoomIn className="h-5 w-5 text-gray-600" />
                  </button>
                  <button onClick={handleZoomOut} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <ZoomOut className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button onClick={handlePrevPage} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <button onClick={handleNextPage} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <ArrowRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Actual Preview Area */}
              <div className="flex justify-center items-center min-h-[400px] border rounded-md p-4 bg-gray-50" ref={previewRef}>
                {isPdf && fileUrl ? (
                  <>
                    {console.log('Rendering PDF preview...', fileUrl)}
                    <div className="w-full h-[80vh] overflow-y-auto">
                      <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={(err) => {
                          console.error('PDF Load Error:', err);
                          toast.error('Failed to load PDF preview');
                        }}
                      >
                        {Array.from(new Array(numPages || 0), (_, index) => (
                          <div
                            key={`page_${index + 1}`}
                            ref={(el) => { pageRefs.current[index] = el; }}
                            data-page-number={index + 1}
                          >
                            <Page
                              pageNumber={index + 1}
                              scale={scale}
                              renderTextLayer={true}
                              renderAnnotationLayer={true}
                            />
                          </div>
                        ))}
                      </Document>
                    </div>
                  </>
                ) : isWordDocument ? (
                  wordContent ? (
                    <>
                      {console.log('Rendering DOC/DOCX preview, HTML length:', wordContent.length)}
                      <div
                        className="w-full h-[80vh] overflow-y-auto prose prose-sm max-w-none"
                        style={{ zoom: scale }}
                        dangerouslySetInnerHTML={{ __html: wordContent }}
                      />
                    </>
                  ) : wordError ? (
                    <p className="text-red-500">Error loading Word document: {wordError}</p>
                  ) : (
                    <p className="text-gray-600">Loading Word document...</p>
                  )
                ) : isTextDocument && textContent ? (
                  <>
                    {console.log('Rendering TXT preview, Text length:', textContent.length)}
                    <div
                      className="w-full h-[80vh] overflow-y-auto text-gray-800 whitespace-pre-wrap"
                      style={{ zoom: scale }}
                    >
                      {textContent}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">
                    Preview not available for this file type: {document.fileType}
                    {document.mimeType ? ` (MIME: ${document.mimeType})` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Document Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">{document.title}</h1>
                <div className="flex items-center space-x-2">
                  {/* Star ratings */}
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      fill={i < Math.round(document.averageRating) ? '#FBBF24' : 'none'}
                      color={i < Math.round(document.averageRating) ? '#FBBF24' : '#CBD5E1'}
                    />
                  ))}
                  {/* Rate document link */}
                  <span
                    className="text-sm text-purple-600 cursor-pointer hover:underline"
                    onClick={() => setShowRatingForm(true)}
                  >
                    Rate document
                  </span>
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
                onClick={async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
                  e.preventDefault();
                  try {
                    const response = await fetch(`/api/documents/${document.id}`, {
                      method: 'PATCH',
                    });
                    if (!response.ok) {
                      const data: { message?: string } = await response.json();
                      throw new Error(data.message ?? 'Failed to increment download count');
                    }

                    toast.success('File Downloading...');
                    window.open(document.fileUrl, '_blank', 'noopener,noreferrer');
                  } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Failed to increment download count';
                    console.error('Error incrementing download count:', err);
                    toast.error(errorMessage);
                    window.open(document.fileUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download {document.originalFileName.slice(document.originalFileName.lastIndexOf('.') + 1).toUpperCase()} · {(document.fileSize / (1024 * 1024)).toFixed(1)}MB
              </a>
              </div>

              {/* Rating form */}
              {showRatingForm && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Rate this document</h3>
                  <div className="flex space-x-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={24}
                        fill={i < selectedRating ? '#FBBF24' : 'none'}
                        color={i < selectedRating ? '#FBBF24' : '#CBD5E1'}
                        className="cursor-pointer"
                        onClick={() => setSelectedRating(i + 1)}
                      />
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSubmitRating}
                      className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-full hover:bg-brand-purple-dark transition-colors"
                      disabled={submittingRating}
                    >
                      {submittingRating ? 'Submitting...' : 'Submit Rating'}
                    </button>
                    <button
                      onClick={() => setShowRatingForm(false)}
                      className="text-gray-600 px-4 py-2 rounded-full hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
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
                              Report  {/* to do */}
                            </button>
                          </div>
                          <p className="mt-2 text-gray-700">{comment.content}</p>
                          <div className="mt-2 flex space-x-4">
                            <button className="text-purple-600 hover:underline text-sm">
                              Reply  {/* to do */}
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
                          src="/login-image.png" // Ensure this exists in public/
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
// upload/page.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { FileUp } from 'lucide-react';
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import { toast } from 'sonner';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const Upload = () => {
  const router = useRouter();
  const [pdfjs, setPdfjs] = useState<typeof import('pdfjs-dist') | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState('');
  const [availableCourses, setAvailableCourses] = useState<{ id: string; name: string }[]>([]);
  const [courseId, setCourseId] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  
  // Load pdfjs-dist dynamically on the client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('pdfjs-dist').then((module) => {
        setPdfjs(module);
        module.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      });
    }
  }, []);

  const handleDocumentTypeChange = (type: string) => {
    setDocumentType(type);
  };
  const generateThumbnail = async (file: File) => {
    if (typeof window === 'undefined' || !pdfjs) {
      console.warn('generateThumbnail called on server-side or pdfjs not loaded, aborting.');
      return null;
    }

    try {
      const url = URL.createObjectURL(file);
      const pdf = await pdfjs.getDocument(url).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });
      const maxWidth = 300;
      const scale = Math.min(maxWidth / viewport.width, 1);
      const scaledViewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Failed to get canvas context');
      await page.render({ canvasContext: context, viewport: scaledViewport }).promise;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          },
          'image/jpeg', 
          0.7
        );
      });
      URL.revokeObjectURL(url);
      return blob;
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB in bytes
        toast.error('File exceeds 100MB limit. Please select a smaller file.');
        return;
      }
      setSelectedFile(file);
      setIsUploaded(true);
      setUploadComplete(false);
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.length) {
      toast.error('Please select a file to upload.');
      return;
    }

    if (!title.trim() || !courseId || !documentType) {
      toast.warning('Please fill in all required fields.');
      return;
    }    

    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('courseId', courseId);
    formData.append('docType', documentType.toUpperCase());
    formData.append('tags', tags);
    formData.append('description', description);

    // Generate thumbnail and convert to base64 if PDF
    if (file.type === 'application/pdf') {
      const thumbnailBlob = await generateThumbnail(file);
      if (thumbnailBlob) {
        const thumbnailBuffer = await thumbnailBlob.arrayBuffer();
        const thumbnailBase64 = `data:image/jpeg;base64,${Buffer.from(thumbnailBuffer).toString('base64')}`;
        formData.append('thumbnailBase64', thumbnailBase64);
      } else {
        toast.warning('Failed to generate thumbnail for the PDF. The document will be uploaded without a thumbnail.');
      }
    }

    // Start the simulated progress at 1%
    setUploadProgress(1);

    // Start a timer that gradually increases progress to a maximum (e.g., 95%)
    const simulationInterval = setInterval(() => {
      setUploadProgress((prev) => (prev < 95 ? prev + 1 : prev));
    }, 300);

    try {
      const response = await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      clearInterval(simulationInterval);
      const data = await response.data;
      if (!response.status.toString().startsWith('2')) {
        throw new Error(data.message || 'Upload failed');
      }
      // On successful response, update progress to 100%
      setUploadProgress(100);
      setUploadedDocumentId(data.documentId);
      setTimeout(() => {
        setUploadComplete(true);
        setIsUploaded(false);
        setSelectedFile(null);
        setTitle('');
        setCourseId('');
        setTags('');
        setDescription('');
        setDocumentType('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 500);
    } catch (error: unknown) {
      clearInterval(simulationInterval);
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
      setUploadProgress(0);
    } finally {
      clearInterval(simulationInterval);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setIsUploaded(false);
    setUploadProgress(0);
    setUploadComplete(false);
    setTitle('');
    setCourseId('');
    setTags('');
    setDescription('');
    setDocumentType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleViewFile = () => {
    if (selectedFile) {
      const fileURL = URL.createObjectURL(selectedFile);
      window.open(fileURL, '_blank');
    }
  };

  const handleViewFileInternal = () => {
    if (uploadedDocumentId) {
      router.push(`/document/${uploadedDocumentId}`);
    } else {
      toast.error('Document ID not found. Please upload a document first.');
    }
  }

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        const data = await res.json();
        setAvailableCourses(data.courses);
      } catch (err) {
        console.error('Failed to fetch courses', err);
        toast.error('Failed to load courses.');
      }
    };
    fetchCourses();
  }, []);  

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isLoggedIn={true} />
      
      <main className="bg-[#fbf8f8] flex-grow py-10">
        <div className="page-container">
          <h1 className="text-3xl font-bold mb-8 text-center">Upload Your Study Materials</h1>
          
          <div className="max-w-3xl mx-auto">
            {/* Upload Box & File Preview */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8 transform translate-y-1">
              <div className="bg-[#fbf8f8] border-2 border-dashed border-[#6a0dad] rounded-xl p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-[#f3e8ff] rounded-full flex items-center justify-center">
                    <FileUp className="h-8 w-8 text-[#6a0dad]" />
                  </div>
                </div>
                <h3 className="text-medium font-semibold mb-2">
                  Drag and drop your files here or click to upload
                </h3>
                <p className="text-xs text-[#6a0dad] mb-4">
                  Supported file formats: PDF, DOCX, TXT<br />
                  Max 100MB per file
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#6a0dad] text-white w-40 h-10 rounded-full font-medium hover:bg-[#5a0cc0] transition-colors"
                >
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>

              {isUploaded && selectedFile && (
                <div className="mt-6 md:flex items-center justify-between bg-[#e8ccf4] rounded-xl p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-10 h-10 border border-[#6a0dad] rounded-full flex items-center justify-center text-[#6a0dad] font-semibold text-xs mr-4">
                      File
                    </div>
                    <div className='mb-2'>
                      <p className="text-sm font-medium text-gray-800">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-[#6a0dad]">
                        {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end md:flex gap-4 text-sm">
                    <button
                      onClick={handleViewFile}
                      className="border px-5 py-2 rounded-full font-medium hover:bg-[#f3e8ff] transition-colors"
                      style={{ borderColor: '#6a0dad', color: '#6a0dad' }}
                    >
                      View
                    </button>
                    <button
                      onClick={handleRemoveFile}
                      className="border px-5 py-2 rounded-full font-medium hover:bg-[#f3e8ff] transition-colors"
                      style={{ borderColor: '#6a0dad', color: 'red' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Document Metadata Form */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8 transform translate-y-6">
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Title<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter the title of your document"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/50"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Course<span className="text-red-500">*</span>
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="form-input w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/50"
                >
                  <option value="">Select a course</option>
                  {availableCourses?.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Document Type<span className="text-red-500">*</span>
                </label>
                <div className="md:flex md:space-x-4">
                  <div 
                    onClick={() => handleDocumentTypeChange('exam')}
                    className={`flex items-center space-x-2 cursor-pointer ${documentType === 'exam' ? 'text-brand-purple' : 'text-gray-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${documentType === 'exam' ? 'border-brand-purple' : 'border-gray-400'}`}>
                      {documentType === 'exam' && (
                        <div className="w-2 h-2 rounded-full bg-brand-purple"></div>
                      )}
                    </div>
                    <span>Exam</span>
                  </div>
                  
                  <div 
                    onClick={() => handleDocumentTypeChange('assignment')}
                    className={`flex items-center space-x-2 cursor-pointer ${documentType === 'assignment' ? 'text-brand-purple' : 'text-gray-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${documentType === 'assignment' ? 'border-brand-purple' : 'border-gray-400'}`}>
                      {documentType === 'assignment' && (
                        <div className="w-2 h-2 rounded-full bg-brand-purple"></div>
                      )}
                    </div>
                    <span>Assignment</span>
                  </div>

                  <div 
                    onClick={() => handleDocumentTypeChange('notes')}
                    className={`flex items-center space-x-2 cursor-pointer ${documentType === 'notes' ? 'text-brand-purple' : 'text-gray-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${documentType === 'notes' ? 'border-brand-purple' : 'border-gray-400'}`}>
                      {documentType === 'notes' && (
                        <div className="w-2 h-2 rounded-full bg-brand-purple"></div>
                      )}
                    </div>
                    <span>Notes</span>
                  </div>
                  
                  <div 
                    onClick={() => handleDocumentTypeChange('other_resources')}
                    className={`flex items-center space-x-2 cursor-pointer ${documentType === 'other_resources' ? 'text-brand-purple' : 'text-gray-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${documentType === 'other_resources' ? 'border-brand-purple' : 'border-gray-400'}`}>
                      {documentType === 'other_resources' && (
                        <div className="w-2 h-2 rounded-full bg-brand-purple"></div>
                      )}
                    </div>
                    <span>Other Resources</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Tags (Separated by commas)
                </label>
                <input
                  type="text"
                  placeholder="Add tags to help others find your document"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="form-input w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/50"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Add a description (e.g., 'Covers chapters 1-5')"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/50 min-h-[100px]"
                ></textarea>
              </div>
              
              {/* Currently Save as Draft button is off */}
              <div className="flex justify-end space-x-3">
                <button
                  className="border px-6 py-2.5 rounded-full font-medium transition-colors cursor-not-allowed"      // add this hover:bg-[#f3e8ff] and remove cursor-not-allowed
                  style={{ borderColor: '#dcdbdc', color: '#dcdbdc' }}      // change to this style={{ borderColor: '#f3e8ff', color: '#f3e8ff' }}
                >
                  Save as Draft
                </button>

                <button 
                  onClick={handleUpload}
                  className="bg-brand-purple text-white px-6 py-2.5 rounded-full font-medium hover:bg-brand-purple-dark transition-colors"
                  disabled={uploadProgress > 0 && !uploadComplete}
                >
                  Upload
                </button>
              </div>
            </div>
            
            {/* Upload Progress/Success */}
            {uploadProgress > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
                {!uploadComplete ? (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Uploading your document...</span>
                      <span className="text-brand-purple">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-brand-purple h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium mb-2">Your document has been uploaded successfully!</h3>
                    <p className="text-gray-600 mb-4">Your document will be reviewed and made available to others shortly.</p>
                    <div className="flex justify-center space-x-3">
                      <button 
                        onClick={handleViewFileInternal} 
                        className="border border-gray-200 text-gray-700 px-6 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors"
                      >
                        View Document
                      </button>
                      <button
                        onClick={() => {
                          setIsUploaded(false);
                          setUploadComplete(false);
                          setUploadProgress(0);
                          setSelectedFile(null);
                          setUploadedDocumentId(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="bg-brand-purple text-white px-6 py-2.5 rounded-full font-medium hover:bg-brand-purple-dark transition-colors"
                      >
                        Upload Another
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Upload;

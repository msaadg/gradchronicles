'use client';
import { useRef, useState } from 'react';
import { Upload as UploadIcon, CloudUpload,FileUp, X } from 'lucide-react'; 
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Upload = () => {
  const [isUploaded, setIsUploaded] = useState(true);
  const [documentType, setDocumentType] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null); // this added for adding functionality upon clicking the 'browse files' button
  
  const handleDocumentTypeChange = (type: string) => {
    setDocumentType(type);
  };

  const handleUpload = () => {
    // In a real app, this would handle the form submission
    // For demo, we'll simulate a progress bar
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setUploadComplete(true);
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isLoggedIn={true} />
      
      <main className="bg-[#fbf8f8] flex-grow py-10">
        <div className="page-container">
          <h1 className="text-3xl font-bold mb-8 text-center">Upload Your Study Materials</h1>
          
          <div className="max-w-3xl mx-auto">
            {/* {Enclosing the upload box and file preview inside the white box */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8 transform translate-y-1">
            {/* Dashed Upload Box with instructions */}
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
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log("Selected file:", file.name);
                    setIsUploaded(true); // You can trigger a preview, upload, etc.
                  }
                }}
              />

            </div>

            {/* Uploaded Files Preview — Outside the Box */}
            {isUploaded && (
              <div className="mt-6 flex items-center justify-between bg-[#e8ccf4] rounded-xl p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="w-10 h-10 border border-[#6a0dad] rounded-full flex items-center justify-center text-[#6a0dad] font-semibold text-xs mr-4">
                    File
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Introduction_to_Programming.pdf
                    </p>
                    <p className="text-xs text-[#6a0dad]">2.5 MB</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <button className="border px-5 py-2 rounded-full font-medium hover:bg-[#f3e8ff] transition-colors" 
                    style={{ borderColor: '#6a0dad', color: '#6a0dad' }}>View</button>
                  <button className="border px-5 py-2 rounded-full font-medium hover:bg-[#f3e8ff] transition-colors" 
                    style={{ borderColor: '#6a0dad', color: 'red' }}>Remove</button>
                </div>
              </div>
            )}
          </div>
            
            {/* Document Metadata Form */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8 transform translate-y-6">
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Course Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Select or type a course name"
                  className="form-input"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Document Type<span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
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
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Tags (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Add tags to help others find your document"
                  className="form-input"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Add a description (e.g., 'Covers chapters 1-5')"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/50 min-h-[100px]"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button className="border px-6 py-2.5 rounded-full font-medium hover:bg-[#f3e8ff] transition-colors" 
                style={{ borderColor: '#6a0dad', color: '#6a0dad' }}
                >
                Save as Draft
                </button>

                <button 
                  onClick={handleUpload}
                  className="bg-brand-purple text-white px-6 py-2.5 rounded-full font-medium hover:bg-brand-purple-dark transition-colors"
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
                      <button className="border border-gray-200 text-gray-700 px-6 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors">
                        View Document
                      </button>
                      <button 
                        onClick={() => {
                          setIsUploaded(false);
                          setUploadComplete(false);
                          setUploadProgress(0);
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

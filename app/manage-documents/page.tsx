'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import Image from 'next/image';
import { toast, Toaster } from 'sonner';

const ManageDocuments = () => {
  const [hasDocuments] = useState(true);
  const router = useRouter();

  const documents = [
    {
      id: '0d7f029e-bab2-4cf5-bbd4-398170dad854',
      title: 'CS101 Midterm Notes',
      course: 'Computer Science 101',
      uploadDate: '2024-02-22',
      downloads: 120,
    },
    {
      id: '2',
      title: 'Math 201 Final Exam',
      course: 'Mathematics 201',
      uploadDate: '2024-03-15',
      downloads: 85,
    },
    {
      id: '3',
      title: 'History 101 Lecture Slides',
      course: 'History 101',
      uploadDate: '2024-01-10',
      downloads: 45,
    },
    {
      id: '4',
      title: 'Biology Lab Report',
      course: 'Biology 101',
      uploadDate: '2024-02-05',
      downloads: 60,
    },
    {
      id: '5',
      title: 'Chemistry 101 Study Guide',
      course: 'Chemistry 101',
      uploadDate: '2024-03-01',
      downloads: 30,
    },
    {
      id: '6',
      title: 'Physics 201 Problem Set',
      course: 'Physics 201',
      uploadDate: '2024-02-20',
      downloads: 75,
    },
    {
      id: '7',
      title: 'Economics 101 Lecture Notes',
      course: 'Economics 101',
      uploadDate: '2024-01-25',
      downloads: 50,
    },
    {
      id: '8',
      title: 'Psychology 101 Research Paper',
      course: 'Psychology 101',
      uploadDate: '2024-03-10',
      downloads: 90,
    },
    {
      id: '9',
      title: 'Philosophy 101 Essay',
      course: 'Philosophy 101',
      uploadDate: '2024-02-28',
      downloads: 40,
    },
    {
      id: '10',
      title: 'Art History Presentation',
      course: 'Art History 101',
      uploadDate: '2024-01-15',
      downloads: 20,
    },
  ];

  const handleEdit = (id: string, title: string) => {
    toast.success(`Edit initiated for "${title}"`, {
      duration: 3000,
      position: 'top-right',
    });
  };

  const handleDelete = (id: string, title: string) => {
    toast.success(`"${title}" deleted successfully`, {
      duration: 3000,
      position: 'top-right',
    });
  };

  const handleUploadClick = () => {
    router.push('/upload');
  };

  // format upload date function to format the date string to "19-April-2025"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date); // e.g., 19-April-2025
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-tr from-white via-[#f5f0ff] to-[#f6f6f7]">
      <Toaster position="top-right" richColors />
      <Navbar isLoggedIn={true} />
      <main className="flex-grow bg-[#fbf8f8] pt-7 pb-10">
        <div className="page-container">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Manage Your Documents</h1>
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden mb-12">
            <div className="flex flex-wrap justify-between items-center px-6 pt-6 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Your Uploaded Documents</h2>
                <p className="text-gray-500 text-base mt-1">Manage, edit, or delete your shared study materials.</p>
              </div>
              <button
                onClick={handleUploadClick}
                className="primary-btn py-2.5 px-7 font-semibold text-base"
              >
                Upload New Document
              </button>
            </div>
            <div className="overflow-x-auto">
              <div className="max-h-[21rem] overflow-y-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="bg-[#f7f7f8] text-gray-900 font-extrabold text-[15px] border-b border-gray-100">
                      <th className="px-6 py-4 w-[5%] text-center">
                        <input type="checkbox" className="w-4 h-4" />
                      </th>
                      <th className="px-4 py-4 w-[25%] text-left">Title</th>
                      <th className="px-4 py-4 w-[20%] text-left">Course</th>
                      <th className="px-4 py-4 w-[15%] text-left">Upload Date</th>
                      <th className="px-4 py-4 w-[10%] text-left">Downloads</th>
                      <th className="px-4 py-4 w-[25%] text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!hasDocuments ? (
                      <tr>
                        <td colSpan={6} className="py-14 text-center">
                          <Image
                            src="/lovable-Uploads/e1eebe85-ec9f-40d3-bb3c-fbab3cc3c524.png"
                            alt="No documents"
                            className="w-32 h-32 mx-auto mb-3"
                          />
                          <div className="mb-1 text-xl font-semibold text-neutral-700">No Documents Uploaded Yet</div>
                          <p className="text-gray-500 mb-2">
                            Start sharing with your peers! Upload your first set of notes or exams.
                          </p>
                          <button
                            onClick={handleUploadClick}
                            className="primary-btn mt-2"
                          >
                            Upload Document
                          </button>
                        </td>
                      </tr>
                    ) : (
                      documents.map((doc) => (
                        <tr key={doc.id} className="border-b border-gray-100">
                          <td className="px-6 py-3 w-[5%] text-center">
                            <input type="checkbox" className="w-4 h-4" />
                          </td>
                          <td className="px-4 py-3 w-[25%] font-semibold">{doc.title}</td>
                          <td className="px-4 py-3 w-[20%]">{doc.course}</td>
                          <td className="px-4 py-3 w-[15%]">{formatDate(doc.uploadDate)}</td>
                          <td className="px-4 py-3 w-[10%]">{doc.downloads}</td>
                          <td className="px-4 py-3 w-[25%] flex gap-2">
                            <button
                              onClick={() => handleEdit(doc.id, doc.title)}
                              className="px-4 py-1 bg-brand-purple text-white text-sm rounded-full hover:bg-brand-purple-dark font-medium transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(doc.id, doc.title)}
                              className="px-4 py-1 bg-red-500 text-white text-sm rounded-full hover:bg-red-600 font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ManageDocuments;
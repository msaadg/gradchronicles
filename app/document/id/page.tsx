'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, ZoomIn, ZoomOut, ArrowLeft, ArrowRight, Star } from 'lucide-react';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Image from 'next/image';

export default function ViewDocument() {
  const [comment, setComment] = useState('');

  // Sample data - replace with your actual data
  const relatedDocs = [
    {
      id: '4',
      title: 'CS101 Final Exam Guide',
      course: 'Computer Science 101',
      rating: 5,
      totalRating: 5
    },
    {
      id: '5',
      title: 'CS101 Homework Solutions',
      course: 'Computer Science 101', 
      rating: 4.8,
      totalRating: 5
    }
  ];

  const comments = [
    {
      id: '1',
      author: 'Ali, CS101 Student',
      time: '2 hours ago',
      content: 'This document is really helpful, especially for the algorithms section!',
      canDelete: false,
      avatar: '/images/avatar1.jpg'
    },
    {
      id: '2',
      author: 'Sarah, Computer Science Student',
      time: '5 hours ago',
      content: 'Great notes! They clarified some of the doubts I had. Thanks for sharing!',
      canDelete: true,
      avatar: '/images/avatar2.jpg'
    }
  ];

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    setComment('');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isLoggedIn={true} />
      
      <main className="flex-grow py-8 container mx-auto px-4">
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
                  src="/f185f2fc-4a7b-4a4c-ad0a-bed9c2f4f052.png"
                  alt="Document Preview"
                  width={800}
                  height={600}
                  className="max-w-full h-auto transform transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>

            {/* Document Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">CS101 Midterm Notes</h1>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      fill={i < 4 ? "#FBBF24" : "none"}
                      color={i < 4 ? "#FBBF24" : "#CBD5E1"}
                    />
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600">Uploaded by John Doe</p>
                <p className="text-gray-600">Course: Computer Science 101</p>
                <p className="text-gray-600">Uploaded on 2024-02-22</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Midterm</span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Lecture Slides</span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-brand-purple-dark transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF · 12MB
                </button>
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
                  placeholder="Add a comment..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 min-h-[80px]"
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-brand-purple-dark transition-colors"
                  >
                    Post
                  </button>
                </div>
              </form>
              
              <div className="space-y-5">
                {comments.map(comment => (
                  <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        <Image
                          src={comment.avatar || "https://via.placeholder.com/40"}
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
                            <p className="text-sm text-gray-500">{comment.time}</p>
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
                            <button className="text-red-500 hover:underline text-sm">
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Related Documents */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-4">Related Documents</h2>
              
              <div className="space-y-4">
                {relatedDocs.map(doc => (
                  <div key={doc.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={`https://via.placeholder.com/100?text=${doc.title.split(' ')[0]}`}
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
                              fill={i < Math.floor(doc.rating) ? "#FBBF24" : "none"}
                              color={i < Math.floor(doc.rating) ? "#FBBF24" : "#CBD5E1"}
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
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
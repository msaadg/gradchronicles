'use client';
import { Search as SearchIcon } from 'lucide-react';
import { Star } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import Image from 'next/image';

const Search = () => {
  const hasResults = true;

  // Example search results data
  const searchResults = [
    {
      id: '1',
      title: 'CS101 Midterm Notes',
      course: 'Computer Science 101',
      rating: 4.5,
      totalRating: 5,
      downloads: 120,
      uploadDate: '2024-02-22',
      imageUrl: '/searchpage_Image1.png'
    },
    {
      id: '2',
      title: 'Calculus II Lecture Slides',
      course: 'Mathematics 202',
      rating: 4.0,
      totalRating: 5,
      downloads: 90,
      uploadDate: '2024-03-10',
      imageUrl: '/searchpage_Image2.png'
    },
    {
      id: '3',
      title: 'Environmental Science Assignment',
      course: 'Science 310',
      rating: 4.8,
      totalRating: 5,
      downloads: 150,
      uploadDate: '2024-01-15',
      imageUrl: '/searchpage_Image3.png'
    }
  ];

  return (
    <div className="bg-[#fbf8f8] flex flex-col min-h-screen">
      <Navbar isLoggedIn={true} />
      
      <main className="flex-grow py-8">
        <div className="page-container">
          {/* Search Bar */}
          <div className="mb-10">
            <div className="relative max-w-3xl mx-auto">
              <input
                type="text"
                placeholder="Search for courses, notes, or exams..."
                className="w-full py-3 px-5 pr-12 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/50"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div className="mt-3 flex justify-end max-w-3xl mx-auto">
              <button className="bg-brand-purple text-white px-5 py-2 rounded-full font-medium hover:bg-brand-purple-dark transition-colors">
                Advanced Filters
              </button>
            </div>
          </div>
          
          {/* Search Results */}
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold mb-6">Search Results for [Query]</h1>
            
            {/* Applied Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-brand-purple font-medium">Filters Applied:</span>
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">Course: CS101</div>
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">Document Type: Exam</div>
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">Rating: 4+ stars</div>
              
              <button className="text-brand-purple hover:underline text-sm ml-auto">
                Clear All Filters
              </button>
            </div>
            
            {/* Sort Dropdown */}
            <div className="flex justify-end mb-6">
              <select className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/50">
                <option value="relevance">Relevance</option>
                <option value="date-new">Newest</option>
                <option value="date-old">Oldest</option>
                <option value="rating-high">Highest Rated</option>
                <option value="downloads">Most Downloaded</option>
              </select>
            </div>
            
            {hasResults ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {searchResults.map(doc => (
                    <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="h-48 overflow-hidden bg-gray-100">
                        <Image
                          src= {doc.imageUrl || "https://via.placeholder.com/400x200"}
                          alt={doc.title}
                          width={400}
                          height={200}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      
                      <div className="p-5">
                        <h3 className="font-semibold text-lg">{doc.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{doc.course}</p>
                        
                        <div className="flex items-center mt-2">
                            {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < Math.floor(doc.rating) ? "#FBBF24" : "none"}
                              color={i < Math.floor(doc.rating) ? "#FBBF24" : "#CBD5E1"}
                            />
                          ))}
                          <span className="text-sm font-medium">{doc.rating}/5</span>
                        </div>
                        
                        <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                          <div>Uploaded on {doc.uploadDate}</div>
                          <div>Downloaded {doc.downloads} times</div>
                        </div>
                        
                        <div className="mt-4">
                          <button className="block w-full text-center bg-brand-purple text-white py-2 rounded-lg hover:bg-brand-purple-dark transition-colors">
                            View Document
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button className="w-10 h-10 rounded-full bg-brand-purple text-white flex items-center justify-center">
                    1
                  </button>
                  <button
                  className="border w-10 h-10 rounded-full font-medium hover:bg-[#f3e8ff] transition-colors"
                  style={{ borderColor: '#6a0dad', color: '#6a0dad' }}
                    >
                    2
                    </button>
                    <button
                    className="border w-10 h-10 rounded-full font-medium hover:bg-[#f3e8ff] transition-colors"
                    style={{ borderColor: '#6a0dad', color: '#6a0dad' }}
                    >
                    3
                    </button>
                  <span className="px-2">...</span>
                  <button
                  className="border w-20 h-10 rounded-full font-medium hover:bg-[#f3e8ff] transition-colors"
                  style={{ borderColor: '#6a0dad', color: '#6a0dad' }}
                    >
                    Next
                    </button>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <SearchIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">No results found for your search.</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or searching for something else.</p>
                <button className="bg-brand-purple text-white px-6 py-2.5 rounded-full font-medium hover:bg-brand-purple-dark transition-colors">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Search;

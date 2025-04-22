'use client';
import { Search, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CourseType, SearchResultType } from '@/app/lib/types';
import axios, { AxiosResponse } from 'axios';
import { useDebounce } from 'use-debounce';
import Image from 'next/image';

const SearchPage = () => {

  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [courseId, setCourseId] = useState('');
  const [docType, setDocType] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [searchResults, setSearchResults] = useState<SearchResultType[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(false);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res: AxiosResponse = await axios.get('/api/courses');
        setAvailableCourses(res.data.courses);
      } catch (err) {
        console.error('Failed to fetch courses', err);
        toast.error('Failed to load courses.');
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          query: debouncedQuery,
          ...(courseId && { courseId }),
          ...(docType && { docType: docType.toUpperCase() }),
          ...(minRating && { minRating }),
          sortBy,
          page: page.toString(),
          pageSize: pageSize.toString(),
        });

        // TODO: Currenly new Search from second page does not work if new search results are only in first page
        const res: AxiosResponse = await axios.get(`/api/documents/search?${params}`);

        if (!res.data || !res.data.results) {
          throw new Error('Failed to fetch search results');
        }
        
        setSearchResults(res.data.results);
        setTotalPages(res.data.totalPages);
      } catch (error) {
        console.error('Search error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to perform search');
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, courseId, docType, minRating, sortBy, page, pageSize]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  // clear filters function to reset all filters and search query
  const clearFilters = () => {
    setQuery('');
    setCourseId('');
    setDocType('');
    setMinRating('');
    setSortBy('newest');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // format upload date function to format the date string to "19-April-2025"
  const formatUploadDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date); // e.g., 19-April-2025
  };

  const filteredCourses = availableCourses.filter(course =>
    course.name.toLowerCase().includes(courseSearchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#fbf8f8]">
      <Navbar isLoggedIn={true} />
      
      <main className="flex-grow py-10">
        <div className="page-container">
          <h1 className="text-3xl font-bold mb-8 text-center">Search Study Materials</h1>
          
          <div className="max-w-full mx-auto">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for courses, notes, or exams..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/50"
                />
              </div>
            </form>

            {/* Filters and Sorting */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Course</label>
                  <div className="relative course-dropdown-container">
                    <input
                      type="text"
                      placeholder="Search for a course"
                      value={courseSearchQuery || (courseId ? availableCourses.find(c => c.id === courseId)?.name || '' : '')}
                      onChange={(e) => {
                        const query = e.target.value;
                        setCourseSearchQuery(query);
                        
                        // Clear selected course if input is empty
                        if (!query) {
                          setCourseId('');
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && filteredCourses.length > 0) {
                          // Select the first matching course on Enter
                          setCourseId(filteredCourses[0].id);
                          setCourseSearchQuery('');
                          setShowCourseDropdown(false);
                        } else if (e.key === 'Escape') {
                          setShowCourseDropdown(false);
                        }
                      }}
                      onFocus={() => setShowCourseDropdown(true)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/50"
                    />
                    {showCourseDropdown && courseSearchQuery && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filteredCourses.length > 0 ? (
                          filteredCourses.map((course) => (
                            <div
                              key={course.id}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => {
                                setCourseId(course.id);
                                setCourseSearchQuery('');
                                setShowCourseDropdown(false);
                              }}
                            >
                              {course.name}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">No courses found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/50"
                  >
                    <option value="">All Types</option>
                    <option value="exam">Exam</option>
                    <option value="notes">Notes</option>
                    <option value="assignment">Assignment</option>
                    <option value="other_resources">Other Resources</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Minimum Rating</label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/50"
                  >
                    <option value="">Any Rating</option>
                    <option value="1">1+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/50"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="rating">Highest Rated</option>
                    <option value="downloads">Most Downloaded</option>
                    <option value="views">Most Visited</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="border px-6 py-2 rounded-full font-medium hover:bg-[#f3e8ff] transition-colors"
                  style={{ borderColor: '#6a0dad', color: '#6a0dad' }}
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Search Results */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm p-6 h-[400px] animate-pulse"
                  >
                    {/* Image Placeholder */}
                    <div className="h-48 bg-gray-200 rounded-t-xl" />
                    
                    {/* Content Placeholders */}
                    <div className="my-4 space-y-3">
                      {/* Title Placeholder */}
                      <div className="h-5 bg-gray-200 rounded w-1/4" />
                      {/* Course Name Placeholder */}
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </div>
                    
                    {/* Rating Placeholder */}
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-4 w-4 bg-gray-200 rounded-full" />
                      ))}
                      <div className="h-4 bg-gray-200 rounded w-4 ml-3" />
                    </div>
                    
                    {/* Downloads Placeholder */}
                    <div className="h-4 bg-gray-200 rounded w-2/5 mb-2" />
                    
                    {/* Upload Date Placeholder */}
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-5xl font-bold text-brand-purple/70">No results found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/document/${result.id}`)}
                  >
                    <div className="h-48 overflow-hidden">
                      <Image
                        src={result.thumbnailBase64 || '/default-thumbnail.png'}
                        alt={result.title}
                        width={400}
                        height={200}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="my-4">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">{result.title}</h3>
                      <p className="text-sm text-gray-600">{result.course.name}</p>
                    </div>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < Math.floor(result.rating) ? '#FBBF24' : 'none'}
                          color={i < Math.floor(result.rating) ? '#FBBF24' : '#CBD5E1'}
                          className={`${i < Math.floor(result.rating) ? "text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">
                        {Number.isInteger(result.rating) ? result.rating : result.rating.toFixed(1)} ({result.totalRatings})
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Downloads:</span> {result.downloads}
                    </p>
                    
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Uploaded:</span> {formatUploadDate(result.uploadDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 rounded-full font-medium ${
                      page === i + 1
                        ? 'bg-brand-purple text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  <ChevronRight size={20} />
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

export default SearchPage;
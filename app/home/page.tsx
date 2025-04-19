'use client';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import DocumentCard from '@/app/components/DocumentCard';
import { FileText, Compass, Search, Sparkles, BookOpen, Clock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Document } from '@/app/lib/types';
import axios from 'axios';

const Home = () => {
  // get user
  const { data: session, status } = useSession();
  const [recentlyViewedDocs, setRecentlyViewedDocs] = useState<Document[]>([]);
  const [recommendedDocs, setRecommendedDocs] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorRecent, setErrorRecent] = useState<string | null>(null);
  const [errorRecommended, setErrorRecommended] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorRecent(null);
        setErrorRecommended(null);

        // Fetch both APIs concurrently
        const [recentResponse, recommendedResponse] = await Promise.all([
          axios.get('/api/recently-viewed', { params: { limit: 3 } }).catch(err => {
            throw new Error('Failed to fetch recently viewed documents: ' + (err.message || 'Unknown error'));
          }),
          axios.get('/api/recommended-courses', { params: { limit: 3 } }).catch(err => {
            throw new Error('Failed to fetch recommended courses: ' + (err.message || 'Unknown error'));
          }),
        ]);

        setRecentlyViewedDocs(recentResponse.data);
        setRecommendedDocs(recommendedResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        if (errorMessage.includes('recently viewed')) {
          setErrorRecent('Failed to load recently viewed documents. Please try again later.');
        }
        if (errorMessage.includes('recommended courses')) {
          setErrorRecommended('Failed to load recommended courses. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [status]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isLoggedIn={true} />
      
      <main className="bg-[#fbf8f8] flex-grow pb-16">
        <div className="page-container pt-8">
          <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl shadow-sm p-6 mb-6 sm:p-8 sm:mb-8 transform translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-brand-purple/10 p-2 rounded-lg">
                <Sparkles className="w-12 h-12 sm:w-6 sm:h-6 text-brand-purple" />
              </div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-800">Hi, {session?.user?.name}! Ready to learn?</h1>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 md:flex items-center md:justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center space-x-2 sm:space-x-5 mb-4 md:mb-0">
                <div className="bg-brand-purple/10 rounded-full p-3">
                  <Search className="w-5 h-5 sm:w-7 sm:h-7 text-brand-purple" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-xl font-semibold text-gray-800 leading-tight">
                    Discover Your Study Materials
                  </h3>
                  <p className="text-gray-500 mt-1 text-xs md:text-sm">
                    Explore notes, exams, assignments, and more with ease!
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Link
                  href="/search"
                  className="bg-brand-purple text-sm md:text-base text-white px-6 py-2.5 rounded-lg font-medium shadow-sm hover:bg-brand-purple-dark hover:shadow-md transition-all duration-300"
                >
                  Start Exploring
                </Link>
              </div>
            </div>
          </div>
          
          {/* Recently Viewed Section */}
          <section className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-lg md:text-2xl font-bold text-gray-800">Recently Viewed</h2>
            </div>
            {isLoading ? (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[370px] animate-pulse"
                    >
                      <div className="h-48 bg-gray-200" />
                      <div className="p-4 space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-4 w-4 bg-gray-200 rounded-full" />
                          ))}
                        </div>
                        <div className="h-10 bg-gray-200 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : errorRecent ? (
              <p className="text-red-600">{errorRecent}</p>
            ) : recentlyViewedDocs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-brand-purple/30 p-12">
                <div className="max-w-md mx-auto text-center">
                  <div className="bg-brand-purple/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-8 h-8 text-brand-purple" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">No Recently Viewed Documents</h3>
                  <p className="text-gray-500 mb-6">
                    You haven&apos;t viewed any documents yet. Start your learning journey by exploring our collection!
                  </p>
                  <Link
                    href="/search"
                    className="inline-flex items-center justify-center px-6 py-3 bg-brand-purple text-white font-medium rounded-full hover:bg-brand-purple-dark transition-all duration-300 hover:shadow-lg"
                  >
                    Browse Documents
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentlyViewedDocs.map(doc => (
                  <DocumentCard
                    key={doc.id}
                    id={doc.id}
                    title={doc.title}
                    course={doc.course}
                    rating={doc.rating || 0}
                    totalRating={doc.totalRating || 0}
                    imageBase64={doc.imageBase64}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Recommended Section */}
          <section className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg md:text-2xl font-bold text-gray-800">Recommended for You</h2>
            </div>
            {isLoading ? (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 h-[170px] animate-pulse"
                    >
                      <div className="p-6 space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-10 bg-gray-200 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : errorRecommended ? (
              <p className="text-red-600">{errorRecommended}</p>
            ) : recommendedDocs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-brand-purple/30 p-12">
                <div className="max-w-md mx-auto text-center">
                  <div className="bg-brand-purple/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Compass className="w-8 h-8 text-brand-purple" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">No Recommended Courses Yet</h3>
                  <p className="text-gray-500 mb-6">
                    As you explore more content, we&apos;ll provide personalized course recommendations just for you!
                  </p>
                  <Link
                    href="/search"
                    className="inline-flex items-center justify-center px-6 py-3 bg-brand-purple text-white font-medium rounded-full hover:bg-brand-purple-dark transition-all duration-300 hover:shadow-lg"
                  >
                    Discover Courses
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedDocs.map(doc => (
                  <div key={doc.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-lg">{doc.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{doc.course}</p>
                    <div className="mt-6">
                      <Link
                        href={`/course/${doc.id}`}
                        className="block w-full text-center bg-brand-purple text-white py-2 rounded-lg hover:bg-brand-purple-dark transition-colors"
                      >
                        Explore
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;

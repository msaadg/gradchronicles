'use client';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import SearchBar from '@/app/components/SearchBar';
import DocumentCard from '@/app/components/DocumentCard';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Document } from '@/app/lib/types';
import axios from 'axios';

const Home = () => {
  // get user
  const { data: session, status } = useSession();
  const [recentlyViewedDocs, setRecentlyViewedDocs] = useState<Document[]>([]);
  const [recommendedDocs, setRecommendedDocs] = useState<Document[]>([]);

  useEffect(() => {
    if (status !== 'authenticated') return;
  
    const fetchData = async () => {
      try {
        const recentResponse = await axios.get('/api/recently-viewed', { params: { limit: 3 } });
        setRecentlyViewedDocs(recentResponse.data);
  
        const recommendedResponse = await axios.get('/api/recommended-courses', { params: { limit: 3 } });
        setRecommendedDocs(recommendedResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
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
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 transform translate-y-1">
            <h1 className="text-2xl font-bold mb-6">Hi, {session?.user?.name}! Ready to learn?</h1>
            <SearchBar hasAdvancedFilters={true} />
          </div>
          
          {/* Recently Viewed Section */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Recently Viewed</h2>
            {recentlyViewedDocs.length === 0 ? (
              <p className="text-gray-600">No recently viewed documents.</p>
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
                    imageUrl={doc.imageUrl}
                  />
                ))}
              </div>
            )}
          </section>
          
          {/* Recommended Section */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
            {recommendedDocs.length === 0 ? (
              <p className="text-gray-600">No recommended courses.</p>
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

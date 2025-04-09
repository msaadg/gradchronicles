'use client';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import DocumentCard from '../components/DocumentCard';

const Home = () => {
  // This is just example data, in a real app you'd fetch this from an API
  const recentlyViewedDocs = [
    {
      id: '1',
      title: 'CS101 Midterm Notes',
      course: 'Computer Science 101',
      rating: 4.5,
      totalRating: 5,
      imageUrl: '/homepage_Image1.png'
    },
    {
      id: '2',
      title: 'Math101 Final Exam',
      course: 'Mathematics 101',
      rating: 4.7,
      totalRating: 5,
      imageUrl: '/homepage_Image2.png'
    },
    {
      id: '3',
      title: 'History202 Project',
      course: 'History 202',
      rating: 4.8,
      totalRating: 5,
      imageUrl: '/homepage_Image3.png'
    }
  ];

  const recommendedDocs = [
    {
      id: '4',
      title: 'CS101: Introduction to Programming',
      course: '15 Notes, 5 Exams',
      rating: 4.9,
      totalRating: 5,
    },
    {
      id: '5',
      title: 'BIO201: Biology Basics',
      course: '10 Notes, 8 Exams',
      rating: 4.5,
      totalRating: 5,
    },
    {
      id: '6',
      title: 'ENG101: English Literature',
      course: '12 Notes, 3 Exams',
      rating: 4.2,
      totalRating: 5,
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isLoggedIn={true} />
      
      <main className="bg-[#fbf8f8] flex-grow pb-16">
        <div className="page-container pt-8">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 transform translate-y-1">
            <h1 className="text-2xl font-bold mb-6">Hi, Ali! Ready to learn?</h1>
            <SearchBar hasAdvancedFilters={true} />
          </div>
          
          {/* Recently Viewed Section */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Recently Viewed</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyViewedDocs.map(doc => (
                <DocumentCard
                  key={doc.id}
                  id={doc.id}
                  title={doc.title}
                  course={doc.course}
                  rating={doc.rating}
                  totalRating={doc.totalRating}
                  imageUrl={doc.imageUrl}
                />
              ))}
            </div>
          </section>
          
          {/* Recommended Section */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedDocs.map(doc => (
                <div key={doc.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-lg">{doc.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{doc.course}</p>
                  
                  <div className="mt-6">
                  <Link
                  href={`/document/${doc.id}`}
                  className="block w-full text-center bg-brand-purple text-white py-2 rounded-lg hover:bg-brand-purple-dark transition-colors"
                >
                  Explore
                  </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;

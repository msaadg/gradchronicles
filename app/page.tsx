import Link from 'next/link';
import { MessageSquare, Download, Users } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import Footer from "@/app/components/Footer";
import SearchBar from '@/app/components/SearchBar';
import FeatureCard from '@/app/components/FeatureCard';
import TestimonialCard from '@/app/components/TestimonialCard';
import SmoothScrollButton from '@/app/components/ui/SmoothScrollButton';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section 
           className="bg-cover bg-center py-24"
           style={{ backgroundImage: "url('/landingpage.png')" }}
         >
           <div className="page-container">
            <div className="max-w-3xl mx-auto text-center animate-enter bg-white/80 p-8 rounded-xl shadow-md">
              <h1 className="text-4xl font-bold mb-6">Your Hub for Collaborative Learning</h1>
              <p className="text-xl text-black mb-8">Share notes, ask questions, and ace your courses</p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Link href={{ pathname: "/login", query: { tab: "signup" } }} className="primary-btn">
                  Get Started
                </Link>
                <SmoothScrollButton targetId="features" className="secondary-btn">
                  Learn More
                </SmoothScrollButton>
              </div>
              
              <div className="max-w-xl mx-auto">
                <SearchBar />
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-16">
          <div className="page-container">
            <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <FeatureCard 
                icon={<MessageSquare className="w-6 h-6" />}
                title="Ask Questions, Get Answers"
                description="Our AI chatbot helps you find answers from uploaded course materials."
              />
              
              <FeatureCard 
                icon={<Download className="w-6 h-6" />}
                title="Share & Discover Resources"
                description="Upload your notes and rate others' contributions to find the best materials."
              />
              
              <FeatureCard 
                icon={<Users className="w-6 h-6" />}
                title="Collaborate with Peers"
                description="Discuss documents, leave comments, and learn together."
              />
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16 bg-gray-50">
          <div className="page-container">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <TestimonialCard 
                name="Ali"
                major="CS Major"
                rating={4}
                testimonial="Grad Chronicles helped me ace my midterms!"
              />
              
              <TestimonialCard 
                name="Emma"
                major="Biology Major"
                rating={5}
                testimonial="The best platform for finding quality study materials."
              />
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16">
          <div className="page-container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to take your learning to the next level?</h2>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link href={{ pathname: "/login", query: { tab: "signup" } }} className="primary-btn">
                  Sign Up Now
                </Link>
                <SmoothScrollButton targetId="features" className="secondary-btn">
                  Explore Features
                </SmoothScrollButton>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import Image from 'next/image';

const Login = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Column - Illustration */}
      <div className="hidden md:flex md:w-1/2 bg-gray-50 flex-col justify-center p-12">
      
        <div className="max-w-md mx-auto">
      
        <Image 
            src="/login-image.png" 
            alt="Students collaborating" 
            width={300} 
            height={200} 
            className="mx-auto mb-6 max-w-full rounded-lg animate-fade-in" // center it
          />    
          
          <h1 className="text-3xl font-bold mb-4">Collaborate. Learn. Succeed.</h1>
          <p className="text-gray-600 mb-8">Join thousands of students sharing and accessing study materials.</p>
          <div className="flex justify-center">
            <Link
              href="/features"
              className="inline-block bg-brand-purple text-white px-6 py-2.5 rounded-full font-medium transition-colors hover:bg-brand-purple-dark shadow-lg"
            >
              Learn More
            </Link>
          </div>
          
        </div>
      </div>
      
      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-12">
        <div className="max-w-md w-full mx-auto">
          <div className="md:hidden mb-10">
            <Logo />
          </div>
          
          <div className="flex border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('login')}
              className={`py-3 px-4 font-medium text-lg flex-1 text-center border-b-2 transition-colors ${
                activeTab === 'login'
                  ? 'border-brand-purple text-brand-purple'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`py-3 px-4 font-medium text-lg flex-1 text-center border-b-2 transition-colors ${
                activeTab === 'signup'
                  ? 'border-brand-purple text-brand-purple'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              Signup
            </button>
          </div>
          
          {activeTab === 'login' ? (
            <form className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="form-input"
                />
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="form-input pr-12"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              <div className="text-right">
                <Link href="/forget" className="text-brand-purple hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-purple text-white py-3 rounded-full font-medium transition-colors hover:bg-brand-purple-dark"
              >
                Log In
              </button>
              
              <div className="text-center text-gray-600">
                Don't have an account? <span className="text-brand-purple hover:underline cursor-pointer" onClick={() => setActiveTab('signup')}>Sign Up</span>
              </div>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="py-3 px-4 border border-gray-200 rounded-full flex justify-center items-center space-x-2 hover:bg-gray-50 transition-colors"
                >
                  <span>Continue with Google</span>
                </button>
                <button
                  type="button"
                  className="py-3 px-4 border border-gray-200 rounded-full flex justify-center items-center space-x-2 hover:bg-gray-50 transition-colors"
                >
                  <span>Continue with Microsoft</span>
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="First Name"
                    className="form-input"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="form-input"
                  />
                </div>
              </div>
              
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="form-input"
                />
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create Password"
                  className="form-input pr-12"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              <div>
                {/* hard-coded, need to change this */}
                <select className="form-input">
                  <option value="">Select your university</option>
                  <option value="1">University of ABC</option>
                  <option value="2">University of XYZ</option>
                  <option value="3">Other</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="w-full bg-brand-purple text-white py-3 rounded-full font-medium transition-colors hover:bg-brand-purple-dark"
              >
                Create Account
              </button>
              
              <div className="text-center text-gray-600">
                Already have an account? <span className="text-brand-purple hover:underline cursor-pointer" onClick={() => setActiveTab('login')}>Log In</span>
              </div>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="py-3 px-4 border border-gray-200 rounded-full flex justify-center items-center space-x-2 hover:bg-gray-50 transition-colors"
                >
                  <span>Continue with Google</span>
                </button>
                <button
                  type="button"
                  className="py-3 px-4 border border-gray-200 rounded-full flex justify-center items-center space-x-2 hover:bg-gray-50 transition-colors"
                >
                  <span>Continue with Microsoft</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

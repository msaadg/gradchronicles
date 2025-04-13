'use client';
import { useState } from 'react';
import Link from 'next/link';
// import { toast } from 'sonner';
import Navbar from '../components/Navbar';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const isLoading = false;
  // const [isLoading, setIsLoading] = useState(false);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);

  //   try {
  //     // TODO: Implement api/forgot-password (high difficulty, validate with sending link to email or code to email)
  //     const response = await fetch('/api/forgot-password', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ email }),
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data.message || 'Failed to send reset email');
  //     }

  //     toast.success('Password reset email sent! Please check your inbox.');
  //     setEmail('');
  //   } catch (error: any) {
  //     toast.error(error.message || 'An error occurred while sending the reset email');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <>
      <Navbar isLoggedIn={false} />
      <div className="flex min-h-screen justify-center items-center p-8">
        <div className="max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Forgot Password</h1>
          <form className="space-y-6"> {/*onSubmit={handleSubmit}*/}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="form-input w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-brand-purple text-white py-3 rounded-full font-medium transition-colors hover:bg-brand-purple-dark flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="p-2 flex space-x-1 justify-center items-center">
                  <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 bg-white rounded-full animate-bounce"></div>
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
          <div className="text-center text-gray-600 mt-6">
            Remember your password?{' '}
            <Link href="/login" className="text-brand-purple hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </div>
      <div className="p-2 flex space-x-1 justify-center items-center">
        <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 bg-white rounded-full animate-bounce"></div>
      </div>
    </>
  );
};

export default ForgotPassword;
'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Logo from './Logo';
import { signOut, useSession } from 'next-auth/react'; // Added signOut and useSession
import Image from 'next/image';

interface NavbarProps {
  isLoggedIn?: boolean; // Keep as optional prop for flexibility
}

const Navbar = ({ isLoggedIn: propIsLoggedIn = false }: NavbarProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession(); // Get session state
  const pathname = usePathname();
  const router = useRouter();

  const isLoggedIn = session ? true : propIsLoggedIn; // Use session if available, fallback to prop

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setDropdownOpen(false);
  };

  const handleMenuLinkClick = () => {
    setMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false }); // Sign out without immediate redirect
    setDropdownOpen(false); // Close dropdown
    router.push("/login"); // Redirect to login page
  };

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="page-container">
        <div className="flex justify-between items-center h-16">
          <Logo />
          <div className="hidden md:flex space-x-2 md:space-x-8">
            {isLoggedIn ? (
              <>
                <NavLink href="/home" active={pathname === "/home"}>Home</NavLink>
                <NavLink href="/upload" active={pathname === "/upload"}>Upload</NavLink>
                <NavLink href="/search" active={pathname === "/search"}>Search</NavLink>
                <NavLink href="/chatbot" active={pathname === "/chatbot"}>Chatbot</NavLink>
              </>
            ) : (
              <></>
            )}
          </div>
          
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={toggleMenu}
                  className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 animate-scale-in">
                    <Link
                      href="/home"
                      onClick={handleMenuLinkClick}
                      className={`block px-4 py-2 text-sm font-medium ${
                        pathname === "/home"
                          ? 'text-gray-900 bg-brand-purple/10'
                          : 'text-gray-700 hover:bg-brand-purple hover:text-white'
                      }`}
                    >
                      Home
                    </Link>
                    <Link
                      href="/upload"
                      onClick={handleMenuLinkClick}
                      className={`block px-4 py-2 text-sm font-medium ${
                        pathname === "/upload"
                          ? 'text-gray-900 bg-brand-purple/10'
                          : 'text-gray-700 hover:bg-brand-purple hover:text-white'
                      }`}
                    >
                      Upload
                    </Link>
                    <Link
                      href="/search"
                      onClick={handleMenuLinkClick}
                      className={`block px-4 py-2 text-sm font-medium ${
                        pathname === "/search"
                          ? 'text-gray-900 bg-brand-purple/10'
                          : 'text-gray-700 hover:bg-brand-purple hover:text-white'
                      }`}
                    >
                      Search
                    </Link>
                    <Link
                      href="/chatbot"
                      onClick={handleMenuLinkClick}
                      className={`block px-4 py-2 text-sm font-medium ${
                        pathname === "/chatbot"
                          ? 'text-gray-900 bg-brand-purple/10'
                          : 'text-gray-700 hover:bg-brand-purple hover:text-white'
                      }`}
                    >
                      Chatbot
                    </Link>
                  </div>
                )}
              </div>
              <div className="relative">
                <div className="lg:w-60 flex justify-end">
                    <button 
                    onClick={toggleDropdown}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    >
                    {session?.user?.image ? (
                      <Image
                      src={session.user.image} 
                      alt="Profile" 
                      className="h-10 w-10 rounded-full object-cover"
                      width={44}
                      height={44}
                      />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                    </button>
                </div>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 animate-scale-in">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-purple hover:text-white">
                      My Profile 
                    </Link>
                    <Link href="/manage-documents" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-purple hover:text-white">
                      Manage Documents
                    </Link>
                    <Link href="/notifications" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-purple hover:text-white">
                      Notifications <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-2">3</span>
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand-purple hover:text-white"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href={{ pathname: "/login", query: { tab: "login" } }}
                className="text-brand-purple font-medium px-4 py-2 rounded-full bg-brand-purple/15 hover:bg-brand-purple/25 transition-colors"
              >
                Login
              </Link>
              <Link
                href={{ pathname: "/login", query: { tab: "signup" } }}
                className="bg-brand-purple text-white font-medium px-4 py-2 rounded-full hover:bg-brand-purple-dark transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) => {
  return (
    <Link href={href} className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
        active
          ? 'border-brand-purple text-gray-900'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </Link>
  );
};

export default Navbar;
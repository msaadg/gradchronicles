'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';
import Link from 'next/link';
import Logo from './Logo';

interface NavbarProps {
  isLoggedIn?: boolean;
}

const Navbar = ({ isLoggedIn = false }: NavbarProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const pathname = usePathname();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="page-container">
        <div className="flex justify-between items-center h-16">
          <Logo />
          <div className="flex space-x-8">
            {isLoggedIn ? (
              <>
                <NavLink href="/" active={pathname === "/"}>Home</NavLink>
                <NavLink href="/upload" active={pathname === "/upload"}>Upload</NavLink>
                <NavLink href="/chatbot" active={pathname === "/chatbot"}>Chatbot</NavLink>
              </>
            ) : (
              <>
                <NavLink href="/" active={pathname === "/"}>Home</NavLink>
                <NavLink href="/" active={pathname === "/#"}>Features</NavLink>
              </>
            )}
          </div>
          
          {isLoggedIn ? (
            <div className="relative">
              <button 
                onClick={toggleDropdown}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <User className="h-6 w-6" />
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 animate-scale-in">
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
                  <Link href="/logout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-purple hover:text-white">
                    Logout
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login" className="text-brand-purple font-medium px-4 py-2 rounded-full hover:bg-brand-purple/5 transition-colors">
                Login
              </Link>
              <Link href="/signup" className="bg-brand-purple text-white font-medium px-4 py-2 rounded-full hover:bg-brand-purple-dark transition-colors">
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

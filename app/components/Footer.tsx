import Link from "next/link";
import { Facebook, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 py-12 mt-auto">
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider">Quick Links</h3>
            <ul className="mt-4 space-y-3">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/contact">Contact Support</FooterLink>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider">Stay Updated with our Newsletter!</h3>
            <div className="mt-4 flex">
              <input 
                type="email" 
                placeholder="Enter your email..." 
                className="px-4 py-2 w-full rounded-l-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/50"
              />
              <button className="bg-brand-purple text-white px-5 py-2 rounded-r-full font-medium transition-colors hover:bg-brand-purple-dark">
                Subscribe
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider">Follow Us</h3>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-brand-purple transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-brand-purple transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-brand-purple transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Grad Chronicles. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <li>
      <Link href={href} className="text-black hover:text-brand-purple transition-colors">
        {children}
      </Link>
    </li>
  );
};

export default Footer;

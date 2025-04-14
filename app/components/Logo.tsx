import Link from "next/link";

const Logo = () => {
  return (
    <Link 
      href="/" 
      className="flex items-center gap-2 font-bold text-xl"
    >
      <div className="w-10 h-10 bg-brand-purple rounded-md flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
      </div>
      <span className="hidden sm:flex">Grad Chronicles</span>
    </Link>
  );
};

export default Logo;

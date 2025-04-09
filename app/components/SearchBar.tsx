
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  hasAdvancedFilters?: boolean;
}

const SearchBar = ({ placeholder = "Search for courses, notes, or exams...", hasAdvancedFilters = false }: SearchBarProps) => {
  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full py-3 px-5 pr-12 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/50 transition-all"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      {hasAdvancedFilters && (
        <div className="mt-3 flex justify-end">
          <button className="bg-brand-purple text-white px-5 py-2 rounded-full font-medium hover:bg-brand-purple-dark transition-colors">
            Advanced Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;

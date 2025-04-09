
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  major: string;
  rating: number;
  testimonial: string;
  avatarUrl?: string;
}

const TestimonialCard = ({ name, major, rating, testimonial, avatarUrl }: TestimonialCardProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-brand-purple text-white text-sm font-medium">
                {name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
          </div>
        </div>
        
        <div className="ml-4">
          <h3 className="text-base font-semibold">{name}</h3>
          <p className="text-sm text-black">{major}</p>
        </div>
      </div>
      
      <div className="mt-3 flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            fill={i < rating ? "#FBBF24" : "none"}
            color={i < rating ? "#FBBF24" : "#CBD5E1"}
            className={`${i < rating ? "text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
      
      <p className="mt-4 text-black">{testimonial}</p>
    </div>
  );
};

export default TestimonialCard;
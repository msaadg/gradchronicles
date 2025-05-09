
import Link from 'next/link';
import { Star } from 'lucide-react';
import Image from 'next/image';

interface DocumentCardProps {
  id: string;
  title: string;
  course: string;
  rating: number;
  totalRating: number;
  downloads?: number;
  uploadDate?: string;
  imageBase64?: string | null;
  imageUrl: string;
  showViewButton?: boolean;
}

const DocumentCard = ({
  id,
  title,
  course,
  rating,
  totalRating,
  downloads,
  uploadDate,
  imageBase64,
  showViewButton = true
}: DocumentCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 duration-300">
      <div className="h-48 overflow-hidden">
        <Image
          src={imageBase64 || '/default-thumbnail.png'}
          alt={title}
          width={400}
          height={200}
          className="w-full h-full object-cover object-top"
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{course}</p>
        
        <div className="flex items-center mt-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                fill={i < Math.floor(rating) ? "#FBBF24" : "none"}
                color={i < Math.floor(rating) ? "#FBBF24" : "#CBD5E1"}
                className={`${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">
            {Number.isInteger(rating) ? rating : rating.toFixed(1)} ({totalRating})
          </span>
        </div>
        
        {(downloads || uploadDate) && (
          <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
            {downloads && <div>Downloaded {downloads} times</div>}
            {uploadDate && <div>Uploaded on {uploadDate}</div>}
          </div>
        )}
        
        {showViewButton && (
          <div className="mt-4">
            <Link href={`/document/${id}`} className="block w-full text-center bg-brand-purple text-white py-2 rounded-lg hover:bg-brand-purple-dark transition-colors">
                View Document
            
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;

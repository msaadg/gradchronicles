import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center h-full">
      <div className="w-12 h-12 bg-brand-purple/10 rounded-lg flex items-center justify-center text-brand-purple mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-black">{description}</p>
    </div>
  );
};

export default FeatureCard;
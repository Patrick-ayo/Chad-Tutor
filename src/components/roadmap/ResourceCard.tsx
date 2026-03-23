import React from 'react';

interface ResourceCardProps {
  type: 'article' | 'video' | 'course';
  title: string;
  url: string;
  discount?: string;
  isPremium?: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ 
  type, 
  title, 
  url, 
  discount, 
  isPremium = false 
}) => {
  const getDomainFromUrl = (resourceUrl: string) => {
    try {
      const parsed = new URL(resourceUrl);
      return parsed.hostname.replace(/^www\./i, '').toLowerCase();
    } catch {
      return '';
    }
  };

  const domainName = getDomainFromUrl(url);

  // Badge colors based on type
  const getBadgeStyle = () => {
    switch (type) {
      case 'article':
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-700';
      case 'video':
        return 'bg-purple-900/30 text-purple-400 border border-purple-700';
      case 'course':
        return 'bg-orange-900/30 text-orange-400 border border-orange-700';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 hover:border-gray-600 rounded-lg p-4 transition-all duration-200 group"
    >
      {/* Badges Row */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs px-2 py-1 rounded ${getBadgeStyle()}`}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
        
        {discount && (
          <span className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-400 border border-green-700">
            {discount}
          </span>
        )}
        
        {isPremium && (
          <span className="text-xs px-2 py-1 rounded bg-purple-900/30 text-purple-400 border border-purple-700">
            Premium
          </span>
        )}
      </div>
      
      {/* Title */}
      <h4 className="text-white text-sm font-medium leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
        {title}
      </h4>
      
      {/* External Link Icon */}
      <div className="mt-2 flex items-center text-gray-400 text-xs">
        <span>{domainName || 'View Resource'}</span>
        <svg 
          className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
          />
        </svg>
      </div>
    </a>
  );
};

export default ResourceCard;

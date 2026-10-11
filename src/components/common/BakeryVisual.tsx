import React, { useState } from 'react';
import { ProductVisualType } from '../../types/bakery';

export const DEFAULT_VISUAL_PHOTOS: Record<ProductVisualType, string> = {
  sourdough: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
  croissant: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
  chocolate_cake: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  donut: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
  cookies: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
  toast_bread: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  sweet_bun: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?auto=format&fit=crop&w=800&q=80',
  baguette: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=80',
  tart: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
  hampers: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
};

// Secondary verified backup photo URLs in case one fails to load
const BACKUP_VISUAL_PHOTOS: Record<ProductVisualType, string> = {
  sourdough: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  croissant: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=800&q=80',
  chocolate_cake: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
  donut: 'https://images.unsplash.com/photo-1527515545081-5db817172677?auto=format&fit=crop&w=800&q=80',
  cookies: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
  toast_bread: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=80',
  sweet_bun: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  baguette: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  tart: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
  hampers: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
};

interface BakeryVisualProps {
  type: ProductVisualType;
  imageUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;
}

export const BakeryVisual: React.FC<BakeryVisualProps> = ({
  type,
  imageUrl,
  className = '',
  size = 'md',
  alt,
}) => {
  const [errorCount, setErrorCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-full h-48',
    lg: 'w-full h-72',
    xl: 'w-full h-96',
  }[size];

  // Primary image URL resolution: explicit prop -> primary default photo -> backup photo
  const primaryUrl = imageUrl || DEFAULT_VISUAL_PHOTOS[type] || DEFAULT_VISUAL_PHOTOS.sourdough;
  const backupUrl = BACKUP_VISUAL_PHOTOS[type] || DEFAULT_VISUAL_PHOTOS.sourdough;
  const resolvedUrl = errorCount === 0 ? primaryUrl : errorCount === 1 ? backupUrl : null;

  const handleImageError = () => {
    setErrorCount(prev => prev + 1);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // If image URL is resolved, render real photographic image
  if (resolvedUrl) {
    return (
      <div className={`relative overflow-hidden bg-[#FAF0E4] ${sizeClasses} ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#F5E8D8] via-[#EDE0D0] to-[#F5E8D8] animate-pulse" />
        )}
        <img
          src={resolvedUrl}
          alt={alt || `Foto roti ${type}`}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {/* Warm bakery ambient lighting gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  // Graceful artisanal vector fallback if both network images fail completely
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-[#EED9C4] to-[#C99C6A] flex items-center justify-center ${sizeClasses} ${className}`}>
      <div className="text-center p-3">
        <span className="text-3xl block mb-1">🥖</span>
        <span className="text-[10px] font-bold text-[#5A3A1A] uppercase tracking-wider">
          Bakery House
        </span>
      </div>
    </div>
  );
};

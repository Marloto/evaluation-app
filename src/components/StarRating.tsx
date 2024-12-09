"use client"

import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showEmpty?: boolean;
  className?: string;
}

const StarRating = ({ 
  score, 
  maxScore = 5, 
  size = 'md', 
  showEmpty = true,
  className = '' 
}: StarRatingProps) => {
  // Map size to actual dimensions
  const sizeMap = {
    sm: { star: 14, container: 'h-4' },
    md: { star: 18, container: 'h-5' },
    lg: { star: 22, container: 'h-6' }
  };

  const renderStars = () => {
    const totalStars = Math.floor(maxScore);
    const fullStars = Math.floor(score);
    const decimal = score % 1;

    return Array.from({ length: totalStars }).map((_, index) => {
      const isFilled = index < fullStars;
      const isHalf = !isFilled && index === fullStars && decimal >= 0.25;
      const isNearlFull = !isFilled && index === fullStars && decimal >= 0.75;

      return (
        <div 
          key={index} 
          className="relative"
          style={{
            width: `${sizeMap[size].star}px`,
            height: `${sizeMap[size].star}px`
          }}
        >
          {showEmpty && (
            <Star
              size={sizeMap[size].star}
              className="absolute top-0 left-0 text-gray-300"
            />
          )}
          
          {(isFilled || isHalf || isNearlFull) && (
            isHalf ? (
              <StarHalf
                size={sizeMap[size].star}
                className="absolute top-0 left-0 fill-green-700 text-green-700"
              />
            ) : (
              <Star
                size={sizeMap[size].star}
                className="absolute top-0 left-0 fill-green-700 text-green-700"
              />
            )
          )}
        </div>
      );
    });
  };

  return (
    <div className={`flex items-center gap-0.5 ${sizeMap[size].container} ${className}`}>
      {renderStars()}
    </div>
  );
};

export default StarRating;
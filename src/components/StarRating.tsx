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
    const stars = [];
    const totalStars = Math.floor(maxScore);
    const decimal = score % 1;
    const fullStars = Math.floor(score);
    
    // Add filled stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star 
          key={`star-${i}`}
          size={sizeMap[size].star}
          className="fill-green-700 text-green-700"
        />
      );
    }
    
    // Add half star if needed
    if (decimal >= 0.25 && decimal < 0.75) {
      stars.push(
        <StarHalf
          key="star-half"
          size={sizeMap[size].star}
          className="fill-green-700 text-green-700"
        />
      );
    } else if (decimal >= 0.75) {
      stars.push(
        <Star
          key="star-rounded"
          size={sizeMap[size].star}
          className="fill-green-700 text-green-700"
        />
      );
    }
    
    // Add empty stars
    if (showEmpty) {
      const emptyStars = totalStars - Math.ceil(score);
      for (let i = 0; i < emptyStars; i++) {
        stars.push(
          <Star
            key={`star-empty-${i}`}
            size={sizeMap[size].star}
            className="text-gray-300"
          />
        );
      }
    }
    
    return stars;
  };

  return (
    <div className={`flex items-center gap-0.5 ${sizeMap[size].container} ${className}`}>
      {renderStars()}
    </div>
  );
};

export default StarRating;
import React from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.floor(rating);
          const isPartial = starValue === Math.ceil(rating) && rating % 1 !== 0;

          return (
            <div key={index} className="relative">
              <Star
                className={`${sizeClasses[size]} text-gray-300`}
                fill="currentColor"
              />
              {(isFilled || isPartial) && (
                <Star
                  className={`${sizeClasses[size]} text-yellow-400 absolute top-0 left-0`}
                  fill="currentColor"
                  style={{
                    clipPath: isPartial
                      ? `inset(0 ${100 - (rating % 1) * 100}% 0 0)`
                      : 'none'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      {showNumber && (
        <span className="ml-1 text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
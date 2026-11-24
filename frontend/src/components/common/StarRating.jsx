import React, { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * StarRating component supporting both interactive rating submission and static display
 * @param {number} rating - current rating value (1-5 or null)
 * @param {function} onRate - callback when star is clicked (if interactive)
 * @param {boolean} interactive - whether user can click/hover to submit rating
 * @param {string} size - star icon size class
 * @param {boolean} showValue - whether to print number alongside stars
 */
const StarRating = ({
  rating = 0,
  onRate,
  interactive = false,
  size = 'w-5 h-5',
  showValue = true,
  disabled = false
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const activeValue = hoverRating || rating || 0;

  return (
    <div className="inline-flex items-center space-x-1.5 select-none">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeValue;
          const isHovered = hoverRating > 0 && star <= hoverRating;

          return (
            <button
              key={star}
              type="button"
              disabled={!interactive || disabled}
              onClick={() => interactive && onRate && onRate(star)}
              onMouseEnter={() => interactive && !disabled && setHoverRating(star)}
              onMouseLeave={() => interactive && !disabled && setHoverRating(0)}
              className={`transition-transform duration-150 ${
                interactive && !disabled
                  ? 'cursor-pointer hover:scale-125 focus:outline-none'
                  : 'cursor-default'
              } ${isHovered ? 'scale-110' : ''}`}
              title={interactive ? `Rate ${star} star${star > 1 ? 's' : ''}` : undefined}
            >
              <Star
                className={`${size} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                    : 'fill-transparent text-slate-300'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 ml-1">
          {rating ? Number(rating).toFixed(1) : 'Not Rated'}
        </span>
      )}
    </div>
  );
};

export default StarRating;

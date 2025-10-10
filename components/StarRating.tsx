import React from 'react';

/**
 * Props for the StarRating component.
 */
interface StarRatingProps {
  /** The rating value. */
  rating: number;
  /** The maximum rating value. */
  maxRating?: number;
}

/**
 * A single star icon component.
 * @param {object} props The props for the component.
 * @param {boolean} props.filled Whether the star should be filled.
 * @returns {JSX.Element} The rendered component.
 */
const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

/**
 * A component that displays a star rating.
 * @param {StarRatingProps} props The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
const StarRating: React.FC<StarRatingProps> = ({ rating, maxRating = 5 }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0; // Not used, but could be implemented
  const emptyStars = maxRating - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => <StarIcon key={`full-${i}`} filled={true} />)}
      {[...Array(emptyStars)].map((_, i) => <StarIcon key={`empty-${i}`} filled={false} />)}
    </div>
  );
};

export default StarRating;

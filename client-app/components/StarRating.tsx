
import React from 'react';

/**
 * Props for the StarRating component.
 * @interface StarRatingProps
 */
interface StarRatingProps {
  /** The numerical rating value to display. */
  rating: number;
  /** The maximum possible rating, used to determine the number of empty stars. Defaults to 5. */
  maxRating?: number;
  /** Optional: Callback function to call when the rating changes. Makes the component editable. */
  onRatingChange?: (rating: number) => void;
  /** Optional: If true, the stars can be clicked to change the rating. */
  editable?: boolean;
}

/**
 * A single star icon component used by the StarRating component.
 * Its color is determined by the `filled` prop.
 *
 * @param {object} props The props for the component.
 * @param {boolean} props.filled Whether the star should be filled (yellow) or empty (gray).
 * @param {() => void} [props.onClick] Optional click handler for editable stars.
 * @returns {React.ReactElement} The rendered SVG star icon.
 */
const StarIcon: React.FC<{ filled: boolean; onClick?: () => void }> = ({ filled, onClick }) => (
  <svg
    className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'} ${onClick ? 'cursor-pointer' : ''}`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    onClick={onClick}
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

/**
 * A component that displays a rating as a series of star icons.
 * It shows a number of filled stars corresponding to the integer part of the rating.
 *
 * @param {StarRatingProps} props The props for the component.
 * @returns {React.ReactElement} A div containing the series of star icons.
 */
const StarRating: React.FC<StarRatingProps> = ({ rating, maxRating = 5, onRatingChange, editable = false }) => {
  const fullStars = Math.floor(rating);
  const emptyStars = maxRating - fullStars;

  const stars = [];
  for (let i = 1; i <= maxRating; i++) {
    stars.push(
      <StarIcon
        key={i}
        filled={i <= rating}
        onClick={editable ? () => onRatingChange && onRatingChange(i) : undefined}
      />
    );
  }

  return (
    <div className="flex items-center">
      {stars}
    </div>
  );
};

export default StarRating;

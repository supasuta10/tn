import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import reviewService from '../../services/ReviewService';

const ReviewSummary = ({ size = 'md' }) => {
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAverageRating = async () => {
      try {
        const response = await reviewService.getAverageRating();
        setAverageRating(response.data.averageRating || 0);
        setTotalReviews(response.data.totalReviews || 0);
      } catch (error) {
        console.error('Error fetching average rating:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAverageRating();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center">
        <span className="loading loading-spinner loading-xs mr-2"></span>
        <span>กำลังโหลด...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <StarRating rating={Math.round(averageRating)} readOnly size={size} />
      <div className="ml-2 text-gray-600">
        <span className="font-semibold">{averageRating.toFixed(1)}</span>
        <span className="mx-1">•</span>
        <span>{totalReviews} รีวิว</span>
      </div>
    </div>
  );
};

export default ReviewSummary;
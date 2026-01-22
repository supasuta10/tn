import React from 'react';
import ReviewItem from './ReviewItem';
import StarRating from './StarRating';

const ReviewList = ({ 
  reviews = [], 
  onEdit, 
  onDelete, 
  showActions = true, 
  averageRating, 
  totalReviews 
}) => {
  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">ยังไม่มีรีวิว</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {averageRating !== undefined && totalReviews !== undefined && (
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <div className="flex items-center">
            <StarRating rating={averageRating} readOnly size="lg" />
            <span className="ml-2 text-lg font-semibold text-gray-800">
              {averageRating.toFixed(1)}
            </span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-gray-600">{totalReviews} รีวิว</span>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewItem
            key={review._id}
            review={review}
            onEdit={onEdit}
            onDelete={onDelete}
            showActions={showActions}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
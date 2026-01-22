import React from 'react';
import StarRating from './StarRating';

const ReviewItem = ({ review, onEdit, onDelete, showActions = true }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h4 className="font-medium text-gray-900">
              {review.customerID?.name || 'ลูกค้า'}
            </h4>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-sm text-gray-500">{formatDate(review.review_date || review.createdAt)}</span>
          </div>
          
          <div className="flex items-center mb-2">
            <StarRating rating={review.rating} readOnly size="sm" />
            <span className="ml-2 text-sm font-medium text-gray-600">{review.rating}/5</span>
          </div>
          
          {review.review_text && (
            <p className="text-gray-700 mb-3">{review.review_text}</p>
          )}
        </div>
      </div>
      
      {showActions && onEdit && onDelete && (
        <div className="flex justify-end space-x-2 mt-2">
          <button
            onClick={() => onEdit(review)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            แก้ไข
          </button>
          <button
            onClick={() => onDelete(review._id)}
            className="text-sm text-red-600 hover:text-red-800"
          >
            ลบ
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewItem;
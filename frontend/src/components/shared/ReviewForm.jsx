import React, { useState } from 'react';
import StarRating from './StarRating';
import reviewService from '../../services/ReviewService';
import Swal from 'sweetalert2';

const ReviewForm = ({ bookingId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    bookingID: bookingId,
    rating: 0,
    review_text: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (formData.rating === 0) newErrors.rating = 'กรุณาให้คะแนน';
    if (!formData.review_text.trim()) newErrors.review_text = 'กรุณาเขียนรีวิว';
    if (formData.review_text.length > 2000) newErrors.review_text = 'รีวิวยาวเกินไป (สูงสุด 2000 ตัวอักษร)';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await reviewService.createReview(formData);
      Swal.fire({
        title: 'สำเร็จ!',
        text: 'รีวิวของคุณถูกบันทึกเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonColor: '#3085d6'
      });
      onSuccess && onSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.message || 'ไม่สามารถส่งรีวิวได้ กรุณาลองใหม่อีกครั้ง';
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-green-200 p-6">
      <h3 className="text-lg font-bold text-green-700 mb-4">เขียนรีวิว</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ให้คะแนน <span className="text-red-500">*</span>
          </label>
          <StarRating 
            rating={formData.rating} 
            setRating={(rating) => setFormData({...formData, rating})} 
          />
          {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating}</p>}
        </div>
        
        <div>
          <label htmlFor="review_text" className="block text-sm font-medium text-gray-700 mb-2">
            ความคิดเห็น <span className="text-red-500">*</span>
          </label>
          <textarea
            id="review_text"
            name="review_text"
            rows={4}
            value={formData.review_text}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm ${
              errors.review_text ? 'border-red-500' : ''
            }`}
            placeholder="แบ่งปันประสบการณ์ของคุณเกี่ยวกับการใช้บริการของเรา..."
          />
          <div className="mt-1 text-sm text-gray-500 text-right">
            {formData.review_text.length}/2000 ตัวอักษร
          </div>
          {errors.review_text && <p className="mt-1 text-sm text-red-600">{errors.review_text}</p>}
        </div>
        
        <input type="hidden" name="bookingID" value={formData.bookingID} />
        
        <div className="flex space-x-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="loading loading-spinner loading-xs mr-2"></span>
                กำลังส่ง...
              </span>
            ) : (
              'ส่งรีวิว'
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
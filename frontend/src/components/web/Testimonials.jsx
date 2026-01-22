import React, { useState, useEffect } from 'react';
import reviewService from '../../services/ReviewService';
import StarRating from '../shared/StarRating';

const Testimonials = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await reviewService.getAllReviews();
                // console.log(response.data.data)
                setReviews(response.data.data.slice(0, 3)); // Get only first 3 reviews
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <section className="py-16 bg-green-50">
            <div className="container mx-auto px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-green-800 mb-4">ความประทับใจจากลูกค้า</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">คำแนะนำและประสบการณ์จากลูกค้าที่ใช้บริการ</p>
                </div>

                {loading ? (
                    <div className="flex justify-center">
                        <span className="loading loading-spinner loading-lg text-green-600"></span>
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="grid md:grid-cols-3 gap-8">
                        {reviews.map((review, index) => (
                            <div key={review._id || index} className="bg-white p-6 rounded-xl shadow-md border border-green-100">
                                <div className="flex items-center mb-4">
                                    <StarRating rating={review.rating} readOnly size="md" />
                                </div>
                                <p className="text-gray-600 mb-4 italic">
                                    "{review.review_text || 'ลูกค้าไม่ได้แสดงความคิดเห็น'}"
                                </p>
                                <div className="flex items-center">
                                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                                    <div className="ml-3">
                                        <p className="font-semibold text-green-800">
                                            คุณ {review.customerID?.firstName} {review.customerID?.lastName}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            {formatDate(review.review_date || review.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">ยังไม่มีรีวิวจากลูกค้า</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Testimonials
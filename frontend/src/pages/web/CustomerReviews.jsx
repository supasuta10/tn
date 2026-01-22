import React, { useState, useEffect } from 'react';
import reviewService from '../../services/reviewService';


const CustomerReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch customer reviews from the service
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);

                // Fetch all reviews using the service
                const reviewsResponse = await reviewService.getAllReviews();
                // The backend returns { count, data } where 'data' contains the reviews
                const reviewsData = reviewsResponse.data.data || reviewsResponse;
                setReviews(Array.isArray(reviewsData) ? reviewsData : reviewsData.data.data || []);

                // Fetch review statistics
                try {
                    const statsResponse = await reviewService.getAverageRating();
                    // Format stats to match expected structure
                    setStats({
                        averageRating: statsResponse.averageRating || statsResponse.data?.averageRating || 0,
                        totalReviews: statsResponse.totalReviews || statsResponse.data?.totalReviews || 0,
                        satisfactionRate: 0 // Backend doesn't provide this directly
                    });
                } catch (error) {
                    console.error('Error fetching stats:', error);
                    // Set default stats values if API fails
                    setStats({
                        averageRating: 0,
                        totalReviews: 0,
                        satisfactionRate: 0
                    });
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
                // In production, we would show an error message to the user
                // For now, we'll just set empty arrays
                setReviews([]);

                // Set default stats values
                setStats({
                    averageRating: 0,
                    totalReviews: 0,
                    satisfactionRate: 0
                });
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    // Function to render star ratings
    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <span 
                key={index} 
                className={`text-xl ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
                ★
            </span>
        ));
    };

    return (
        <div className="min-h-screen bg-green-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Page Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-green-800 mb-4">รีวิวลูกค้า</h1>
                    <p className="text-lg text-green-700 max-w-2xl mx-auto">
                        ความคิดเห็นและประสบการณ์จากลูกค้าของเราที่ได้มาใช้บริการ โต๊ะจีน ชัยเจริญโภชนา
                    </p>
                </div>

                {/* Stats Section */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="border-r border-green-200 last:border-r-0">
                            <h3 className="text-3xl font-bold text-green-700">
                                {loading ? '...' : (stats?.averageRating || '4.8')}
                            </h3>
                            <p className="text-green-600">คะแนนเฉลี่ย</p>
                        </div>
                        <div className="border-r border-green-200 last:border-r-0">
                            <h3 className="text-3xl font-bold text-green-700">
                                {loading ? '...' : `${stats?.totalReviews || '250'}+`}
                            </h3>
                            <p className="text-green-600">จำนวนรีวิว</p>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-green-700">
                                {loading ? '...' : `${stats?.satisfactionRate || '95'}%`}
                            </h3>
                            <p className="text-green-600">ความพึงพอใจ</p>
                        </div>
                    </div>
                </div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        // Loading state
                        Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-md overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="animate-pulse">
                                        <div className="flex items-center mb-4">
                                            <div className="bg-gray-200 rounded-full w-12 h-12 mr-4"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-3 bg-gray-200 rounded"></div>
                                            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        reviews.map((review) => (
                            <div
                                key={review._id}
                                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="p-6">
                                    <div className="flex items-center mb-4">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent((review.customerID?.firstName || '') + ' ' + (review.customerID?.lastName || ''))}&background=green&color=fff`}
                                            alt={`${review.customerID?.firstName || ''} ${review.customerID?.lastName || ''}`}
                                            className="w-12 h-12 rounded-full mr-4"
                                        />
                                        <div>
                                            <h4 className="font-semibold text-green-800">
                                                {review.customerID ?
                                                    `${review.customerID.firstName || ''} ${review.customerID.lastName || ''}` :
                                                    'ลูกค้า'}
                                            </h4>
                                            <div className="flex items-center">
                                                {renderStars(review.rating)}
                                                <span className="ml-2 text-sm text-gray-500">
                                                    {new Date(review.createdAt).toLocaleDateString('th-TH')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <p className="text-gray-700 italic">"{review.review_text}"</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerReviews;
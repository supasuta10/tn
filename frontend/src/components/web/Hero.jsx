import React from "react";
import ReviewSummary from '../shared/ReviewSummary';
import coverFront from '../../assets/cover_front.jpg';
import coverBack from '../../assets/cover_back.jpg';

const Hero = () => {
    return (
        <>
            {/* Hero Section */}
            <section className="min-h-[90vh] bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute top-20 -left-20 w-72 h-72 bg-green-100 rounded-full opacity-30 blur-3xl"></div>
                    <div className="absolute bottom-20 -right-20 w-72 h-72 bg-amber-100 rounded-full opacity-30 blur-3xl"></div>
                </div>

                <div className="container mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                    {/* Text Content */}
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-block px-4 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
                            คุณภาพระดับพรีเมียม
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                            <span className="block">โต๊ะจีน</span>
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-amber-600 mt-2">
                                ชัยเจริญโภชนา (เอ๋) นครปฐม
                            </span>
                        </h1>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center lg:justify-start gap-4">
                            <p className="text-xl lg:text-2xl font-semibold text-gray-700">
                                ยินดีต้อนรับสู่บริการจองโต๊ะจีนออนไลน์
                            </p>
                            <div>
                                <ReviewSummary />
                            </div>
                        </div>

                        <p className="text-gray-600 leading-relaxed text-lg max-w-lg mx-auto lg:mx-0">
                            ทีมงานเรารับจัดโต๊ะจีนนอกสถานที่
                            งานเล็ก งานใหญ่ พร้อมเสิร์ฟเมนูอาหารจีนแสนอร่อย
                            ด้วยวัตถุดิบสดใหม่ และบริการระดับมืออาชีพ
                        </p>

                        <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start mt-6">
                             <a href="/booking"><button className="btn bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 transform font-semibold">
                                จองตอนนี้
                            </button></a>
                            <a href="/menu"><button className="btn bg-white text-green-700 border-2 border-green-600 hover:bg-green-50 px-8 py-4 text-lg rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 transform font-semibold">
                                ดูเมนู
                            </button></a>
                        </div>
                    </div>

                    {/* Modern Image Gallery - Side by Side */}
                    <div className="flex flex-col lg:flex-row gap-6 items-center justify-center lg:justify-start">
                        {/* Main Image */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-amber-400 rounded-3xl opacity-20 blur-lg transform -rotate-1 group-hover:rotate-0 transition-transform duration-500"></div>
                            <img
                                src={coverFront}
                                className="relative rounded-2xl shadow-2xl w-80 h-auto object-cover transform -rotate-1 group-hover:rotate-0 transition-transform duration-500 z-10"
                                alt="อาหารโต๊ะจีน ชัยเจริญโภชนา - หน้าปก"
                            />
                        </div>

                        {/* Secondary Image */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 to-green-400 rounded-3xl opacity-20 blur-lg transform rotate-1 group-hover:rotate-0 transition-transform duration-500"></div>
                            <img
                                src={coverBack}
                                className="relative rounded-2xl shadow-2xl w-80 h-auto object-cover transform rotate-1 group-hover:rotate-0 transition-transform duration-500 z-10"
                                alt="อาหารโต๊ะจีน ชัยเจริญโภชนา - ด้านหลัง"
                            />
                        </div>
                    </div>

                </div>
            </section>
        </>
    );
};

export default Hero;

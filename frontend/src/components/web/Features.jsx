import React from 'react'

const Features = () => {
    return (
        <>
            {/* Features Section */}
            <section className="py-16 bg-green-50">
                <div className="container mx-auto px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-green-800 mb-4">ทำไมต้องเลือกเรา</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">บริการจัดโต๊ะจีนคุณภาพดีที่สุดในนครปฐม ด้วยประสบการณ์มากกว่า 10 ปี</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-md text-center border border-green-100">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-green-800 mb-3">วัตถุดิบคุณภาพ</h3>
                            <p className="text-gray-600">ใช้วัตถุดิบที่สดใหม่ คุณภาพดี ผ่านการคัดสรรอย่างดี</p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-md text-center border border-green-100">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-green-800 mb-3">ทีมงานมืออาชีพ</h3>
                            <p className="text-gray-600">ทีมงานมากประสบการณ์ บริการด้วยใจ ใส่ใจทุกรายละเอียด</p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-md text-center border border-green-100">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-green-800 mb-3">รสชาติอร่อย</h3>
                            <p className="text-gray-600">เมนูอาหารจีนรสชาติดั้งเดิม ถูกปากคนไทยทุกวัย</p>
                        </div>
                    </div>
                </div>
            </section>

        </>
    )
}

export default Features
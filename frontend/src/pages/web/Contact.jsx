import React from 'react'

const Contact = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 text-center mb-8">ติดต่อเรา</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <h2 className="text-xl font-bold text-green-700 mb-4">ข้อมูลติดต่อ</h2>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-600 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">ที่อยู่</p>
                    <p className="text-gray-600">นครปฐม, ประเทศไทย</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-green-600 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">โทรศัพท์</p>
                    <p className="text-gray-600">08XXXXXXXX</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-green-600 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">อีเมล</p>
                    <p className="text-gray-600">contact@chai-charoen.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-green-600 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">เวลาทำการ</p>
                    <p className="text-gray-600">ทุกวัน 08:00 - 20:00 น.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <h2 className="text-xl font-bold text-green-700 mb-4">ติดต่อผ่าน LINE</h2>
              <p className="text-gray-600 mb-4">สามารถติดต่อเราเพิ่มเติมผ่าน LINE ได้ที่นี่</p>
              <button className="btn bg-green-600 text-white hover:bg-green-700 px-6 py-2 rounded-lg">
                เพิ่มเพื่อน LINE
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <h2 className="text-xl font-bold text-green-700 mb-4">ส่งข้อความถึงเรา</h2>

            <form className="space-y-4">
              <div>
                <label className="label text-green-700 font-medium">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  placeholder="กรุณากรอกชื่อของคุณ"
                  className="input input-bordered w-full bg-white border-green-200"
                />
              </div>

              <div>
                <label className="label text-green-700 font-medium">อีเมล</label>
                <input
                  type="email"
                  placeholder="กรุณากรอกอีเมลของคุณ"
                  className="input input-bordered w-full bg-white border-green-200"
                />
              </div>

              <div>
                <label className="label text-green-700 font-medium">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  placeholder="กรุณากรอกเบอร์โทรศัพท์ของคุณ"
                  className="input input-bordered w-full bg-white border-green-200"
                />
              </div>

              <div>
                <label className="label text-green-700 font-medium">ข้อความ</label>
                <textarea
                  rows="4"
                  placeholder="กรุณากรอกรายละเอียดข้อความของคุณ"
                  className="textarea textarea-bordered w-full bg-white border-green-200"
                ></textarea>
              </div>

              <button type="submit" className="btn bg-green-600 text-white hover:bg-green-700 w-full mt-4">
                ส่งข้อความ
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
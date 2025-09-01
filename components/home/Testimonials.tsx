"use client";

import { useState } from 'react';

const items = [
    { id: 1, name:"Trương Thanh Thúy", text:"Trang web dễ dùng, tìm nhà nhanh, có hỗ trợ tư vấn tận tình. Rất hài lòng!", avatar:"/home/avt1.png" },
    { id: 2, name:"Nguyễn Thanh Trà",  text:"Tìm nhà nhanh, AI gợi ý khá chuẩn.", avatar:"/home/avt2.png" },
    { id: 3, name:"Lý Huỳnh Thanh",    text:"Trải nghiệm mượt, thanh toán tiện.", avatar:"/home/avt3.png" },
    { id: 4, name:"Phạm Văn An",       text:"Dịch vụ tốt, nhân viên nhiệt tình, rất đáng tin cậy.", avatar:"/home/avt1.png" },
    { id: 5, name:"Lê Thị Bình",       text:"Tìm được nhà phù hợp với ngân sách, rất hài lòng với trải nghiệm.", avatar:"/home/avt2.png" },
    { id: 6, name:"Hoàng Minh Cường",  text:"Giao diện đẹp, dễ sử dụng, thông tin chi tiết và chính xác.", avatar:"/home/avt3.png" },
  ];
  
  export default function Testimonials(){
    const [showAll, setShowAll] = useState(false);
    const displayedItems = showAll ? items : items.slice(0, 3);

    return (
      <section className="py-8 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h3 className="text-2xl md:text-3xl font-bold text-teal-600 mb-6">
            Khách Hàng Nói Về Chúng Tôi
          </h3>
          
          <div className="grid md:grid-cols-3 gap-5">
            {displayedItems.map((it,i)=>(
              <div key={it.id} className="rounded-2xl bg-white p-5 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3">
                  <img 
                    src={it.avatar} 
                    alt={it.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-teal-100"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{it.name}</p>
                    <p className="text-yellow-400 text-sm">★★★★★</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-700 italic leading-relaxed">"{it.text}"</p>
              </div>
            ))}
          </div>
          
          {/* Expand/Collapse Button */}
          <div className="text-center mt-6">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
            >
              {showAll ? 'Thu gọn' : 'Xem thêm đánh giá'}
              <svg 
                className={`w-5 h-5 transition-transform ${showAll ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    )
  }
  
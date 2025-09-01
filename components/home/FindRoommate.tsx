"use client";

const posts = [
    { id:1, img:"/home/room.png", text:"Tụi mình cần tìm bạn ở ghép IUH, có đủ mọi thứ xách đồ vào là ở nhé." },
    { id:2, img:"/home/room.png", text:"Cần 1 nữ ở ghép khu Tân Bình, phòng mới sạch." },
    { id:3, img:"/home/room.png", text:"Tìm bạn ở ghép gần Phú Nhuận, giờ giấc tự do." },
    { id:4, img:"/home/room.png", text:"Cần bạn ở ghép khu vực Quận 1, gần trường đại học." },
    { id:5, img:"/home/room.png", text:"Tìm bạn ở ghép gần Bình Thạnh, phòng có điều hòa." },
    { id:6, img:"/home/room.png", text:"Cần 1 nam ở ghép khu Gò Vấp, giờ giấc linh hoạt." },
  ];
  
  export default function FindRoommate(){
    const scrollContainer = (direction: 'left' | 'right') => {
      const container = document.getElementById('scroll-container');
      if (container) {
        const scrollAmount = 320; // width of one card + gap
        if (direction === 'left') {
          container.scrollLeft -= scrollAmount;
        } else {
          container.scrollLeft += scrollAmount;
        }
      }
    };

    return (
      <section className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl md:text-3xl font-bold text-teal-600 mb-4">
            Nếu bạn cần tìm người chung tổ ấm?
          </h3>
          
          {/* Slider Container */}
          <div className="relative">
            {/* Cards Container */}
            <div 
              id="scroll-container"
              className="flex gap-6 overflow-x-hidden scroll-smooth pb-4"
            >
              {posts.map(p=>(
                <article key={p.id} className="flex-shrink-0 w-80 p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <img src={p.img} alt="" className="w-28 h-28 object-cover rounded-xl"/>
                    <div className="flex flex-col flex-1">
                      <p className="text-sm text-slate-700 mb-3 flex-1">{p.text}</p>
                      <button className="self-start px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors">
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            
            {/* Chevron Left Button */}
            <button 
              onClick={() => scrollContainer('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow z-10"
            >
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Chevron Right Button */}
            <button 
              onClick={() => scrollContainer('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow z-10"
            >
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    )
  }
  
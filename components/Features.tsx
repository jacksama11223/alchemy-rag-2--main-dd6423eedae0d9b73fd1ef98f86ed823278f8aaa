import React from 'react';
import { Feature } from '../types';

const features: Feature[] = [
  {
    icon: 'person_pin',
    title: 'Lộ trình học cá nhân hóa',
    description: 'AI phân tích điểm mạnh, điểm yếu và mục tiêu của bạn để tạo ra con đường học tập riêng biệt.'
  },
  {
    icon: 'model_training',
    title: 'Ôn tập thông minh',
    description: 'Thuật toán lặp lại ngắt quãng giúp bạn ghi nhớ kiến thức lâu hơn với thời gian ôn tập ít hơn.'
  },
  {
    icon: 'joystick',
    title: 'Bài học tương tác',
    description: 'Các bài học ngắn, thú vị được thiết kế như những trò chơi để bạn luôn có động lực học tập.'
  },
  {
    icon: 'chat_bubble',
    title: 'Phản hồi tức thì',
    description: 'Nhận góp ý và sửa lỗi ngay lập tức từ trợ lý AI, giúp bạn tiến bộ nhanh hơn sau mỗi bài học.'
  }
];

const Features: React.FC = () => {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#101c22]">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4 max-w-3xl mx-auto text-center animate-fade-in-up">
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl text-[#212529] dark:text-[#F8F9FA]">Khám phá các tính năng đột phá</h1>
          <p className="text-base font-normal leading-normal text-[#6c757d] dark:text-[#adb5bd] md:text-lg">
            Chúng tôi tích hợp những công nghệ AI tiên tiến nhất vào các phương pháp học tập đã được chứng minh để mang lại trải nghiệm hiệu quả và thú vị.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
                key={index} 
                className="flex flex-col gap-4 items-center text-center group hover:-translate-y-2 transition-all duration-300 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'forwards' }}
            >
              <div className="flex items-center justify-center size-16 rounded-lg bg-[#3498db]/20 text-[#3498db] text-4xl group-hover:bg-[#3498db] group-hover:text-white group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined">{feature.icon}</span>
              </div>
              <div>
                <p className="text-lg font-bold text-[#212529] dark:text-[#F8F9FA] group-hover:text-[#3498db] transition-colors">{feature.title}</p>
                <p className="text-sm font-normal leading-normal text-[#6c757d] dark:text-[#adb5bd] mt-2">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(Features);
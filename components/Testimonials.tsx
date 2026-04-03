import React from 'react';
import { Testimonial } from '../types';

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Minh Anh',
    date: 'Tháng 8, 2023',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5ZQpyNOWx2Gfq7TwU13amXWyVpevKMcHGRJryY4rrMBMJUTp2EG8szBGl7hgEHKRuvWZmvUZvz-45po-P7mf4vP2gQwYNWratuxvtN8uz5EfLqqu9pkeTHl2L-9yjAHeNLzB0SABmonos9CaAMjNYHxo5fUmycKHj5S3TVPQnYL6mPOjLzilWu_9yncPJOO2Cqoa1st3pf_FPVugYyOaMBX4XIxT_Q14bcQXCyUh1dp6r0Vmmdhut_S49XcIHAHCCmmNq6bPiRpEp',
    content: '"Ứng dụng này đã thay đổi hoàn toàn cách tôi học ngoại ngữ. Lộ trình cá nhân hóa thực sự hiệu quả và giúp tôi tập trung vào những gì cần thiết nhất."',
    rating: 5
  },
  {
    id: 2,
    name: 'Quốc Bảo',
    date: 'Tháng 9, 2023',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCz4vh7zoDmpL8KUlXRmrSSwG5l7clTtv_0Nt4Kf3bs9Ew_50ptR49MFLUTCvG7iEQoGAlwhKoXqiYIRluKUZVtD5kFmRIFB1-AlF4mFsOCNmBxq8sURGKmMHg0sSxDLj15MPAuul1CAomK2R_fUk2KtHiDVMQgm-ZRrrE5O4i-oF7IRyLqUz1wCLSucG8oz_0dj--qZj8wdRnZ5iweItzb3vYfVnAwfn2iZ0rYo7wlJwPWs1a5qSriW9WRLASzPmms0idMSOSrJhLT',
    content: '"Tính năng ôn tập thông minh giống như có một gia sư riêng vậy. Tôi chưa bao giờ nghĩ mình có thể nhớ được nhiều từ vựng đến thế!"',
    rating: 5
  },
  {
    id: 3,
    name: 'Lan Hương',
    date: 'Tháng 10, 2023',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRE2I2_6UPyhi6hW9FyHdmKnu1rvI9hSGhk9OOO1OnT_skYpJel33KnLwhZh-taxDPQRmLKL8hrQEoNjoTlGG98EfA9WipoaFHy0JprBRRJ1VdM5nW-eYDQ0GNwxye32DBrxo2Nx8c2gGJw4ZV7d-lFcp9UJWE-3OCuQryRKRRjgYDMw_5wCbWUqVtYQEtH9DEPDlO43rJEi2fPdgmHscFCQDN0LpTEkwcYFXbtCZAlb56CA8gXrPPQQJzwOfYbtwhQpQcjyMwhXUv',
    content: '"Giao diện thân thiện và các bài học vui nhộn giúp tôi có động lực học mỗi ngày. Rất khuyến khích cho bất kỳ ai muốn học tập hiệu quả hơn."',
    rating: 4.5
  }
];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex gap-0.5 text-[#f1c40f]">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className="material-symbols-outlined">
          {rating >= star ? 'star' : rating >= star - 0.5 ? 'star_half' : 'star_border'}
        </span>
      ))}
    </div>
  );
};

const Testimonials: React.FC = () => {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA] dark:bg-[#101c22]">
      <div className="flex flex-col gap-12">
        <h2 className="text-3xl font-bold leading-tight tracking-tight text-center text-[#212529] dark:text-[#F8F9FA]">Học viên của chúng tôi nói gì</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.id} className="flex flex-col gap-4 p-6 rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-[#101c22] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div 
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12" 
                  style={{ backgroundImage: `url("${t.avatar}")` }}
                ></div>
                <div className="flex-1">
                  <p className="font-bold text-[#212529] dark:text-[#F8F9FA]">{t.name}</p>
                  <p className="text-sm text-[#6c757d] dark:text-[#adb5bd]">{t.date}</p>
                </div>
              </div>
              <StarRating rating={t.rating} />
              <p className="text-base font-normal leading-normal text-[#212529] dark:text-[#F8F9FA]">{t.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(Testimonials);

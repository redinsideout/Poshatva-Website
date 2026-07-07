import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';

const REVIEWS = [
  { name: 'Priya Sharma', rating: 5, comment: 'The cocopeat from Poshatva is amazing! My terrace vegetable garden has never looked better. Highly recommend their organic mix!', location: 'Mumbai', initial: 'PS' },
  { name: 'Rajesh Kumar', rating: 5, comment: "Best vermicompost I've ever used. My indoor plants are thriving and the texture is extremely rich and odorless. Top-notch quality!", location: 'Delhi', initial: 'RK' },
  { name: 'Ananya Nair', rating: 5, comment: 'Excellent potting mix! Perfect water retention and drainage. My succulents are growing beautifully. Will buy again!', location: 'Bengaluru', initial: 'AN' },
  { name: 'Amit Patel', rating: 5, comment: 'Their seaweed liquid fertilizer is a miracle worker. Saw fresh green shoots on my curry leaf plant in just 10 days.', location: 'Ahmedabad', initial: 'AP' },
  { name: 'Sunita Rao', rating: 5, comment: 'Clean, premium packaging and very fast delivery. The tools are sturdy and the cocopeat block expanded easily. Best store!', location: 'Hyderabad', initial: 'SR' },
  { name: 'Vikram Singh', rating: 5, comment: 'Poshatva has helped me revive my dying houseplants. Their neem cake powder is the best organic pest control.', location: 'Pune', initial: 'VS' }
];

const TestimonialsSlider = () => {
  return (
    <section className="section-padding bg-[#0B6B3A] text-white overflow-hidden relative">
      {/* Decorative leafy vectors background */}
      <div className="absolute top-10 left-10 text-9xl opacity-5 pointer-events-none select-none">🌿</div>
      <div className="absolute bottom-10 right-10 text-9xl opacity-5 pointer-events-none select-none">🍃</div>

      <div className="page-container relative z-10">
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-lime-300 font-semibold text-sm uppercase tracking-widest mb-2"
          >
            Gardener Reviews
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-bold text-white"
          >
            Loved by 10,000+ Plant Parents
          </motion.h2>
        </div>

        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          spaceBetween={24}
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
          className="!pb-14"
        >
          {REVIEWS.map((rev, idx) => (
            <SwiperSlide key={idx}>
              <div className="bg-[#166C38]/40 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm h-full flex flex-col justify-between hover:bg-[#166C38]/60 transition-colors">
                <div>
                  <div className="flex gap-1 mb-4 text-yellow-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <FiStar key={i} className="fill-current text-sm" />
                    ))}
                  </div>
                  <p className="text-green-50 text-sm md:text-base leading-relaxed mb-6">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="flex items-center gap-4 border-t border-white/10 pt-4">
                  <div className="w-10 h-10 rounded-full bg-lime-400 text-[#0B6B3A] font-bold flex items-center justify-center text-sm flex-shrink-0">
                    {rev.initial}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm md:text-base text-white">{rev.name}</h4>
                    <p className="text-xs text-green-200">{rev.location}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TestimonialsSlider;

import React from 'react';
import { motion } from 'framer-motion';
import { FiInstagram } from 'react-icons/fi';

const POSTS = [
  { img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=400', tags: '#UrbanJungle' },
  { img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=400', tags: '#OrganicGardening' },
  { img: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&q=80&w=400', tags: '#CocopeatGrow' },
  { img: 'https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&q=80&w=400', tags: '#PlantCareTips' },
  { img: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=400', tags: '#FreshHarvest' },
  { img: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=400', tags: '#HealthyPlants' }
];

const InstagramSection = () => {
  return (
    <section className="section-padding bg-white">
      <div className="page-container">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[#1B8D4A] font-semibold text-sm uppercase tracking-widest mb-2"
          >
            Social Feed
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title"
          >
            Follow Us On Instagram
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-subtitle max-w-xl mx-auto"
          >
            Get daily green tips, exclusive guides, and product updates at <a href="https://www.instagram.com/poshatva/" target="_blank" rel="noopener noreferrer" className="text-[#0B6B3A] font-bold hover:underline">@poshatva</a>.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {POSTS.map((post, idx) => (
            <motion.a
              key={idx}
              href="https://www.instagram.com/poshatva/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -4 }}
              className="relative aspect-square rounded-2xl overflow-hidden shadow-sm group block bg-gray-100"
            >
              <img 
                src={post.img} 
                alt="Instagram post" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-4">
                <FiInstagram className="text-2xl mb-2" />
                <span className="text-xs font-semibold tracking-wider text-center">{post.tags}</span>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="text-center mt-10">
          <a 
            href="https://www.instagram.com/poshatva/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-primary inline-flex items-center gap-2"
          >
            <FiInstagram /> Visit Our Instagram Feed
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;

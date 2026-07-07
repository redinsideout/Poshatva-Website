import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter, FiYoutube } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-[#0B6B3A] text-white">
      {/* Upper Footer: Links & Info */}
      <div className="page-container py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden p-0.5 shadow-md">
                <img src="/Poshlogo.jpeg" alt="Poshatva Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <span className="text-xl font-display font-black tracking-tight">Poshatva</span>
            </Link>
            <p className="text-green-100 text-xs md:text-sm leading-relaxed">
              Bringing nature's finest organic plant-care products to your doorstep. Grow organically, eat healthy, live green.
            </p>
            <div className="flex gap-3 pt-2">
              {[
                { Icon: FiInstagram, url: 'https://www.instagram.com/poshatva/' },
                { Icon: FiFacebook, url: 'https://www.facebook.com/profile.php?id=61552269023487' },
                { Icon: FiTwitter, url: 'https://twitter.com/poshatva' },
                { Icon: FiYoutube, url: 'https://youtube.com/poshatva' }
              ].map(({ Icon, url }, i) => (
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  key={i} 
                  className="w-9 h-9 bg-white/10 hover:bg-lime-400 hover:text-[#0B6B3A] rounded-xl flex items-center justify-center transition-all duration-300"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-display font-black text-white tracking-wider text-xs md:text-sm uppercase mb-4 pb-1 border-b border-white/10">Company</h4>
            <ul className="space-y-2 text-xs md:text-sm text-green-100 font-medium">
              {[
                ['/', 'Home'],
                ['/products', 'About Us'],
                ['/products?featured=true', 'Special Offers'],
                ['/profile', 'My Account']
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-lime-300 transition-colors block py-0.5">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Shop Categories */}
          <div>
            <h4 className="font-display font-black text-white tracking-wider text-xs md:text-sm uppercase mb-4 pb-1 border-b border-white/10">Shop</h4>
            <ul className="space-y-2 text-xs md:text-sm text-green-100 font-medium">
              {['Cocopeat', 'Vermicompost', 'Potting Mix', 'Fertilizers', 'Garden Tools'].map((cat) => (
                <li key={cat}>
                  <Link to={`/products?search=${encodeURIComponent(cat)}`} className="hover:text-lime-300 transition-colors block py-0.5">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Customer Policies */}
          <div>
            <h4 className="font-display font-black text-white tracking-wider text-xs md:text-sm uppercase mb-4 pb-1 border-b border-white/10">Policies</h4>
            <ul className="space-y-2 text-xs md:text-sm text-green-100 font-medium">
              {['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Shipping Policy'].map((policy) => (
                <li key={policy}>
                  <button type="button" className="hover:text-lime-300 transition-colors text-left block py-0.5">{policy}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact Info */}
          <div>
            <h4 className="font-display font-black text-white tracking-wider text-xs md:text-sm uppercase mb-4 pb-1 border-b border-white/10">Contact Us</h4>
            <ul className="space-y-3 text-xs md:text-sm text-green-100 font-medium">
              <li className="flex items-start gap-2.5">
                <FiMail className="mt-0.5 flex-shrink-0 text-lime-300 text-sm md:text-base" />
                <span className="break-all">poshatva@gmail.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <FiPhone className="mt-0.5 flex-shrink-0 text-lime-300 text-sm md:text-base" />
                <span>+91 8445684783</span>
              </li>
              <li className="flex items-start gap-2.5">
                <FiMapPin className="mt-0.5 flex-shrink-0 text-lime-300 text-sm md:text-base" />
                <span>Muzaffarnagar, Uttar Pradesh, India 251001</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Lower Footer: Copyright & Payments */}
      <div className="border-t border-white/10 bg-[#064223]">
        <div className="page-container py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm text-green-200">
          <p>© {new Date().getFullYear()} Poshatva. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold text-green-300 uppercase tracking-widest mr-2">Secure Payments:</span>
            {['Razorpay', 'UPI', 'Visa', 'Mastercard', 'NetBanking'].map((method) => (
              <span key={method} className="bg-white/10 px-2.5 py-1 rounded-md text-[10px] md:text-xs text-white font-bold tracking-wide">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

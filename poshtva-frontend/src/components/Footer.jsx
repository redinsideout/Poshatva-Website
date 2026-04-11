import React from 'react';
import { Link } from 'react-router-dom';
import { GiSolidLeaf } from 'react-icons/gi';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-forest-900 text-white">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden p-0.5">
                <img src="/Poshlogo.jpeg" alt="Poshatva Logo" className="w-full h-full object-cover rounded-lg" />
              </div>
              <span className="text-xl font-display font-bold">Poshatva</span>
            </Link>
            <p className="text-forest-200 text-sm leading-relaxed mb-6">
              Bringing nature's finest organic plant-care products to your doorstep. Grow better, live greener.
            </p>
            <div className="flex gap-3">
              {[FiInstagram, FiFacebook, FiTwitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-forest-700 hover:bg-forest-500 rounded-lg flex items-center justify-center transition-colors">
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-forest-200">
              {[['/', 'Home'], ['/products', 'Products'], ['/cart', 'Cart'], ['/profile', 'My Account']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-leaf transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-forest-200">
              {['Cocopeat', 'Vermicompost', 'Bone Meal', 'Potting Mix', 'Fertilizers'].map((cat) => (
                <li key={cat}>
                  <Link to={`/products?category=${cat.toLowerCase().replace(' ', '-')}`} className="hover:text-leaf transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-forest-200">
              <li className="flex items-start gap-3"><FiMail className="mt-0.5 flex-shrink-0 text-leaf" /><span>hello@poshatva.com</span></li>
              <li className="flex items-start gap-3"><FiPhone className="mt-0.5 flex-shrink-0 text-leaf" /><span>+91 98765 43210</span></li>
              <li className="flex items-start gap-3"><FiMapPin className="mt-0.5 flex-shrink-0 text-leaf" /><span>Bengaluru, Karnataka, India 560001</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-forest-700">
        <div className="page-container py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-forest-300">
          <p>© {new Date().getFullYear()} Poshatva. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-leaf transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-leaf transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-leaf transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

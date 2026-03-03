import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">HandyMasters</h3>
            <p className="text-gray-300">
              منصة تجمع الحرفيين المهرة مع العملاء بكل ثقة وسهولة
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white">الرئيسية</Link></li>
              <li><Link to="/artisans" className="text-gray-300 hover:text-white">الحرفيون</Link></li>
              <li><Link to="/posts" className="text-gray-300 hover:text-white">الخدمات</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">الدعم</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-white">عن المنصة</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white">اتصل بنا</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-white">سياسة الخصوصية</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">تواصل معنا</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">📱</a>
              <a href="#" className="text-gray-300 hover:text-white">💬</a>
              <a href="#" className="text-gray-300 hover:text-white">📧</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>جميع الحقوق محفوظة © 2024 HandyMasters</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

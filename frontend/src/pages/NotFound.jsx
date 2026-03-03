import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-3xl font-semibold mt-4 mb-6">الصفحة غير موجودة</h2>
        <p className="text-gray-600 mb-8">عذراً، الصفحة التي تبحث عنها غير متوفرة</p>
        <Link
          to="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

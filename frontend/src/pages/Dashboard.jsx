import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">لوحة التحكم</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-lg">مرحباً {user?.name}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React from 'react';
import Navbar from '@/components/Navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  role: 'admin' | 'teacher' | 'student';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

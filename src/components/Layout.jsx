import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-var(--bg-color)">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 mt-16 lg:mt-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

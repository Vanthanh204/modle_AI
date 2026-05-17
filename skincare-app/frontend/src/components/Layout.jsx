import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <footer className="bg-white border-t border-gray-100 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    © 2026 Skincare AI Solution. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Layout;

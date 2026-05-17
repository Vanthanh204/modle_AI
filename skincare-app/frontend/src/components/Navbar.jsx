import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, User, LogOut, History, LayoutDashboard, Activity } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="bg-rose-500 p-1.5 rounded-lg">
                                <Heart className="h-6 w-6 text-white fill-current" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
                                Skincare AI
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <Link to="/analyze" className="text-gray-600 hover:text-rose-500 font-medium px-3 py-2 rounded-md flex items-center gap-2">
                                    <Activity className="h-4 w-4" /> Phân tích
                                </Link>
                                <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="h-5 w-5 text-blue-600" />
                                        )}
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium text-gray-700">{user.full_name || user.email}</span>
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Đăng xuất"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium px-4 py-2">
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-shadow shadow-md hover:shadow-lg">
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

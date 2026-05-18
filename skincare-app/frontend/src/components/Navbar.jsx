import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Heart,
    User,
    LogOut,
    Activity,
    Sparkles,
} from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinkClass = (path) =>
        `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${location.pathname === path
            ? 'bg-rose-100 text-rose-600 shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-rose-500'
        }`;

    return (
        <nav className="sticky top-4 z-50 w-[96%] max-w-7xl mx-auto rounded-[28px] bg-white/85 backdrop-blur-2xl border border-white/50 shadow-[0_20px_60px_rgba(15,23,42,0.08)] border-gray-200 hover:border-[#ff4d8d]">
            <div className="absolute top-0 left-0 w-72 h-72 bg-pink-400/8 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex items-center justify-between h-24">

                    {/* LOGO */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 group"
                    >
                        <div className="bg-gradient-to-br from-[#ff4d8d] to-[#ff7a59] p-3 rounded-[22px] shadow-[0_10px_30px_rgba(244,114,182,0.35)] group-hover:scale-105 transition-all duration-300">
                            
                            <Heart className="h-6 w-6 text-white fill-current" />
                        </div>

                        <div>
                            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                                Skincare AI
                            </h1>
                            <p className="text-[11px] tracking-[0.25em] uppercase text-gray-400 -mt-1">
                                AI Facial Analysis System
                            </p>
                        </div>
                    </Link>

                    {/* MENU */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <div className="flex items-center gap-2 sm:gap-4">
                                {/* Analyze - Hidden on mobile, shown on sm+ */}
                                <Link
                                    to="/analyze"
                                    className="hidden sm:flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-[24px] bg-gradient-to-r from-[#ff4d8d] via-[#ff5fa2] to-[#ff7a59] text-white font-semibold shadow-[0_10px_30px_rgba(244,114,182,0.25)] hover:scale-105 transition-all duration-300"
                                >
                                    <Activity className="h-4 w-4" />
                                    <span className="hidden md:inline">Phân tích</span>
                                </Link>

                                {/* Profile */}
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-md px-2 py-1.5 sm:px-3 sm:py-2 rounded-[24px] transition-all duration-200"
                                >
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#ff4d8d] bg-rose-50 flex items-center justify-center">
                                        {user.avatar_url ? (
                                            <img
                                                src={user.avatar_url}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-5 w-5 text-rose-500" />
                                        )}
                                    </div>

                                    <div className="hidden lg:block">
                                        <p className="text-sm font-semibold text-gray-800 leading-none">
                                            {user.full_name || 'Người dùng'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {user.email}
                                        </p>
                                    </div>
                                </Link>

                                {/* Logout - Visible on all screens, but compact on mobile */}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 p-3 sm:px-5 sm:py-3 rounded-[24px] bg-red-50 text-red-500 hover:bg-red-100 font-semibold transition-all duration-300 hover:scale-105"
                                    title="Đăng xuất"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span className="hidden sm:inline">Đăng xuất</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="text-gray-600 hover:text-rose-500 font-medium px-4 py-2 transition-colors"
                                >
                                    Đăng nhập
                                </Link>

                                <Link
                                    to="/register"
                                    className="flex items-center gap-2 bg-gradient-to-r from-[#ff4d8d] via-[#ff5fa2] to-[#ff7a59] text-white px-5 py-2.5 rounded-[24px] font-semibold shadow-lg hover:shadow-rose-200 hover:scale-105 transition-all duration-200"
                                >
                                    <Sparkles className="h-4 w-4" />
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
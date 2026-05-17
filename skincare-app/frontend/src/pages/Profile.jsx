import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Camera, History, ChevronRight, BarChart3, Clock } from 'lucide-react';

const Profile = () => {
    const { user, setUser, API_URL } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`${API_URL}/history`);
            setHistory(response.data);
        } catch (error) {
            console.error("Lỗi khi tải lịch sử:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUpdating(true);
        const formData = new FormData();
        formData.append('avatar_file', file);

        try {
            const response = await axios.put(`${API_URL}/users/me`, formData);
            setUser(response.data);
        } catch (error) {
            alert("Lỗi khi cập nhật ảnh đại diện.");
        } finally {
            setUpdating(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
                        <div className="relative inline-block mb-6">
                            <div className="w-32 h-32 rounded-full bg-blue-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-16 w-16 text-blue-600" />
                                )}
                            </div>
                            <button 
                                onClick={() => fileInputRef.current.click()}
                                disabled={updating}
                                className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white shadow-lg hover:bg-blue-700 transition-all border-2 border-white"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                            <input 
                                type="file" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleAvatarChange}
                                accept="image/*"
                            />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-900">{user.full_name || "Người dùng"}</h2>
                        <p className="text-gray-500 mb-6">{user.email}</p>
                        
                        <div className="space-y-4 text-left border-t border-gray-50 pt-6">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">Đã tham gia: {new Date(user.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
                        <h3 className="text-xl font-bold mb-4">Mẹo Skincare hôm nay</h3>
                        <p className="text-blue-100 text-sm leading-relaxed">
                            Đừng quên bôi kem chống nắng ngay cả khi ở trong nhà. Tia UV vẫn có thể xuyên qua cửa kính và làm tổn hại làn da của bạn.
                        </p>
                    </div>
                </div>

                {/* History Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <History className="h-5 w-5 text-blue-600" /> Lịch sử Phân tích
                            </h3>
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                                {history.length} lần phân tích
                            </span>
                        </div>

                        <div className="p-0">
                            {loading ? (
                                <div className="p-12 text-center">
                                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                                    <p className="text-gray-500">Đang tải lịch sử...</p>
                                </div>
                            ) : history.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {history.map((item) => (
                                        <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                                <img src={item.image_url} alt="Analyzed" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-gray-900 capitalize">{item.skin_type_label.replace('_', ' ')}</span>
                                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">
                                                        {Math.round(item.skin_type_conf * 100)}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(item.created_at).toLocaleString('vi-VN')}</span>
                                                    <span className="flex items-center gap-1 text-red-400 font-medium">
                                                        {item.problems_data.length} vấn đề
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-white rounded-full transition-shadow border border-transparent hover:border-gray-100 shadow-sm">
                                                <ChevronRight className="h-5 w-5 text-gray-400" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <BarChart3 className="h-8 w-8 text-gray-300" />
                                    </div>
                                    <p className="text-gray-400">Bạn chưa thực hiện lần phân tích nào.</p>
                                    <button className="mt-4 text-blue-600 font-bold hover:underline">Phân tích ngay</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

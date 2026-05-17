import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Zap, BarChart3, ArrowRight } from 'lucide-react';

const Dashboard = () => {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden pt-16 pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-8">
                            Thấu hiểu làn da bạn với <br />
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Trí tuệ Nhân tạo đỉnh cao
                            </span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10">
                            Công nghệ YOLOv8 phân tích 15 danh mục bệnh lý da liễu, mang lại kết quả chính xác và phác đồ chăm sóc cá nhân hóa chỉ trong vài giây.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link to="/analyze" className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center gap-2">
                                Bắt đầu phân tích ngay <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
                
                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                                <Zap className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Tốc độ vượt trội</h3>
                            <p className="text-gray-500">Sử dụng mô hình YOLOv8 tối ưu cho thời gian phản hồi dưới 1 giây trên mọi thiết bị.</p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                                <ShieldCheck className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Độ tin cậy cao</h3>
                            <p className="text-gray-500">Huấn luyện trên bộ dữ liệu lâm sàng đa dạng, nhận diện chính xác 15 vấn đề da liễu phổ biến.</p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                                <BarChart3 className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Theo dõi tiến trình</h3>
                            <p className="text-gray-500">Lưu trữ lịch sử phân tích giúp bạn theo dõi sự cải thiện của làn da qua từng giai đoạn điều trị.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

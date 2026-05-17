import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Upload, RefreshCw, AlertTriangle, CheckCircle, Info, Beaker, BarChart3 } from 'lucide-react';

const Analysis = () => {
    const { API_URL } = useAuth();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post(`${API_URL}/predict`, formData);
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Lỗi khi phân tích hình ảnh. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Phân tích Làn da</h2>
                <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
                    Tải lên ảnh khuôn mặt của bạn để AI bắt đầu quá trình nhận diện.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Upload Section */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    {!previewUrl ? (
                        <div 
                            onClick={() => fileInputRef.current.click()}
                            className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
                        >
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="h-8 w-8 text-blue-600" />
                            </div>
                            <p className="text-lg font-semibold text-gray-700">Chọn hoặc kéo ảnh vào đây</p>
                            <p className="text-sm text-gray-400 mt-2">Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
                        </div>
                    ) : (
                        <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-inner flex items-center justify-center">
                            <div className="relative inline-block">
                                <img src={previewUrl} alt="Preview" className="max-w-full max-h-[500px] block mx-auto" />
                                {result && result.problems && result.problems.map((p, idx) => {
                                    return (
                                        <div 
                                            key={idx}
                                            className="absolute border-2 border-red-500 pointer-events-none group/box"
                                            style={{
                                                left: `${p.box[0] * 100}%`,
                                                top: `${p.box[1] * 100}%`,
                                                width: `${(p.box[2] - p.box[0]) * 100}%`,
                                                height: `${(p.box[3] - p.box[1]) * 100}%`,
                                            }}
                                        >
                                            <div className="absolute -top-6 left-0 bg-red-500 text-white text-[10px] px-1 rounded whitespace-nowrap opacity-100 transition-opacity">
                                                {p.label} ({Math.round(p.confidence * 100)}%)
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    
                    <input 
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                        accept="image/*"
                    />

                    <div className="mt-8 flex gap-4">
                        {previewUrl && !result && (
                            <button 
                                onClick={handleAnalyze}
                                disabled={loading}
                                className="flex-grow bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Beaker className="h-5 w-5" />
                                )}
                                {loading ? 'Đang phân tích...' : 'Bắt đầu Phân tích'}
                            </button>
                        )}
                        {previewUrl && (
                            <button 
                                onClick={reset}
                                className="px-6 py-4 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                            >
                                {result ? 'Chụp ảnh mới' : 'Hủy'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {loading && (
                        <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 text-center animate-pulse">
                            <RefreshCw className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
                            <h3 className="text-xl font-bold text-blue-900">AI đang xử lý dữ liệu</h3>
                            <p className="text-blue-700 mt-2">Chúng tôi đang quét qua 15 danh mục bệnh lý để tìm kết quả chính xác nhất cho bạn.</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex gap-4">
                            <AlertTriangle className="h-6 w-6 text-red-600 shrink-0" />
                            <div>
                                <h3 className="font-bold text-red-900">Đã có lỗi xảy ra</h3>
                                <p className="text-red-700 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {result && (
                        <>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Kết quả Phân tích</h3>
                                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" /> Hoàn tất
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-blue-50 p-4 rounded-2xl">
                                        <p className="text-xs text-blue-600 font-bold uppercase mb-1">Loại da</p>
                                        <p className="text-lg font-extrabold text-blue-900 capitalize">{result?.skin_type?.label?.replace('_', ' ') || "Đang xác định..."}</p>
                                    </div>
                                    <div className="bg-indigo-50 p-4 rounded-2xl">
                                        <p className="text-xs text-indigo-600 font-bold uppercase mb-1">Độ chính xác</p>
                                        <p className="text-lg font-extrabold text-indigo-900">{result?.skin_type?.confidence ? Math.round(result.skin_type.confidence * 100) : 0}%</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-sm font-bold text-gray-700">Vấn đề phát hiện ({result.problems.length})</p>
                                    <div className="flex flex-wrap gap-2">
                                        {result.problems.length > 0 ? (
                                            [...new Set(result.problems.map(p => p.label))].map((label, i) => (
                                                <span key={i} className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-red-100">
                                                    {label}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 text-sm italic">Không phát hiện vấn đề nghiêm trọng</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Info className="h-5 w-5 text-blue-600" /> Lời khuyên Chuyên gia
                                </h3>
                                <div className="space-y-4">
                                    {result.advices.map((advice, idx) => (
                                        <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <h4 className="font-bold text-gray-900 mb-1">{advice.title}</h4>
                                            <p className="text-sm text-gray-600 leading-relaxed">{advice.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {result.warning && (
                                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                                    <p className="text-sm text-amber-700">{result.warning}</p>
                                </div>
                            )}
                        </>
                    )}

                    {!result && !loading && (
                        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BarChart3 className="h-8 w-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-400">Chưa có dữ liệu phân tích</h3>
                            <p className="text-gray-400 text-sm mt-2">Vui lòng tải ảnh lên và nhấn nút bắt đầu để xem kết quả.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analysis;

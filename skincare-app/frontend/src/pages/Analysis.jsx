import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Upload, RefreshCw, AlertTriangle, CheckCircle, Info, Beaker, BarChart3 } from 'lucide-react';
import CameraScanner from '../components/CameraScanner';

const Analysis = () => {
    const { API_URL } = useAuth();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
            setResult(null);
            setError(null);
        }
    };

    const handleCapture = (blob) => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
        setResult(null);
        setError(null);
        setShowCamera(false);
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
            
            if (response.data.image_url === "error_upload") {
                console.warn("Lưu ý: Ảnh không thể tải lên máy chủ Cloudinary, nhưng kết quả phân tích vẫn được hiển thị.");
            }
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
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
            <div className="absolute top-20 left-20 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"></div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-14">
                    <h2 className="text-5xl md:text-6xl font-black leading-tight text-gray-900">
                        Phân tích
                        <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                            {' '}làn da
                        </span>
                    </h2>
                    <p className="mt-5 max-w-2xl mx-auto text-lg md:text-xl text-gray-500 leading-relaxed">
                        Tải lên ảnh khuôn mặt hoặc chụp trực tiếp từ camera để AI bắt đầu quá trình nhận diện,
                        phân tích loại da và phát hiện các vấn đề da phổ biến.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Upload Section */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-[32px] shadow-[0_20px_60px_rgba(255,120,150,0.12)] p-8 border border-white">
                        {!previewUrl ? (
                            <div className="space-y-4">
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="aspect-square border-2 border-dashed border-rose-200 rounded-[28px] flex flex-col items-center justify-center cursor-pointer bg-gradient-to-br from-rose-50 to-orange-50 hover:border-rose-400 transition-all group"
                                >
                                    <div className="w-20 h-20 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center mb-5 shadow-xl group-hover:scale-110 transition-transform">
                                        <Upload className="h-8 w-8 text-white" />
                                    </div>
                                    <p className="text-lg font-semibold text-gray-700">Tải ảnh lên</p>
                                    <p className="text-sm text-gray-400 mt-2 text-center px-4">Kéo thả hoặc nhấn để chọn file</p>
                                </div>
                                
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">Hoặc</span></div>
                                </div>

                                <button
                                    onClick={() => setShowCamera(true)}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg"
                                >
                                    <Camera className="h-5 w-5" />
                                    Chụp ảnh từ Camera
                                </button>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-inner flex items-center justify-center">
                                <div className="relative inline-block overflow-hidden rounded-2xl">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="max-w-full max-h-[500px] object-contain block mx-auto rounded-2xl"
                                    />
                                    {result && result.problems && result.problems.map((p, idx) => (
                                        <div
                                            key={idx}
                                            className="absolute border-[1.5px] border-[#ff4d8d] rounded-lg pointer-events-none shadow-[0_0_20px_rgba(255,77,141,0.35)]"
                                            style={{
                                                left: `${p.box[0] * 100}%`,
                                                top: `${p.box[1] * 100}%`,
                                                width: `${(p.box[2] - p.box[0]) * 100}%`,
                                                height: `${(p.box[3] - p.box[1]) * 100}%`,
                                            }}
                                        >
                                            <div className="absolute -top-2 left-0 bg-[#0f172a] text-white text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                                                {p.label} ({Math.round(p.confidence * 100)}%)
                                            </div>
                                        </div>
                                    ))}
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
                                    className="flex-grow bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-2xl font-bold hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-rose-200 disabled:opacity-50"
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
                                    className="px-6 py-4 bg-white border border-rose-200 text-rose-600 rounded-2xl font-bold hover:bg-rose-50 transition-all"
                                >
                                    {result ? 'Chụp ảnh mới' : 'Hủy'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {loading && (
                            <div className="bg-rose-50 p-8 rounded-3xl border border-rose-100 text-center animate-pulse">
                                <RefreshCw className="h-12 w-12 text-rose-600 mx-auto mb-4 animate-spin" />
                                <h3 className="text-xl font-bold text-rose-900">AI đang phân tích làn da</h3>
                                <p className="text-rose-700 mt-2">Chúng tôi đang quét qua 15 danh mục bệnh lý để tìm kết quả chính xác nhất cho bạn.</p>
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
                                <div className="bg-white/70 backdrop-blur-2xl p-7 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-white">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-gray-900">Kết quả Phân tích</h3>
                                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" /> Hoàn tất
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-blue-50 p-4 rounded-2xl">
                                            <p className="text-xs text-blue-600 font-bold uppercase mb-1">Loại da</p>
                                            <p className="text-lg font-extrabold text-blue-900">{result?.skin_type?.label || "Đang xác định..."}</p>
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

                                <div className="bg-white/70 backdrop-blur-2xl p-7 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-white">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <Info className="h-5 w-5 text-blue-600" /> Lời khuyên Chuyên gia
                                    </h3>
                                    <div className="space-y-4">
                                        {result.advices.map((advice, idx) => (
                                            <div key={idx} className="p-5 bg-gradient-to-r from-gray-50 to-white rounded-3xl border border-gray-100 hover:shadow-md transition-all">
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
                            <div className="bg-white/70 backdrop-blur-xl p-14 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-white text-center">
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
            {showCamera && (
                <CameraScanner 
                    onCapture={handleCapture} 
                    onClose={() => setShowCamera(false)} 
                />
            )}
        </div>
    );
};

export default Analysis;

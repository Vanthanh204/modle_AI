import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle, CheckCircle2, Sun, SunDim, Focus } from 'lucide-react';

const CameraScanner = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [status, setStatus] = useState({
        isDark: false,
        isBlurry: false,
        brightness: 0,
        sharpness: 0
    });
    const [isCameraReady, setIsCameraReady] = useState(false);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsCameraReady(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Không thể truy cập camera. Vui lòng cấp quyền.");
            onClose();
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    useEffect(() => {
        if (!isCameraReady) return;

        let animationId;
        const analyze = () => {
            if (videoRef.current && canvasRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });

                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    // Cài đặt kích thước canvas nhỏ hơn để phân tích nhanh hơn
                    const w = 200;
                    const h = (video.videoHeight / video.videoWidth) * w;
                    canvas.width = w;
                    canvas.height = h;

                    ctx.drawImage(video, 0, 0, w, h);
                    const imageData = ctx.getImageData(0, 0, w, h);
                    const data = imageData.data;

                    // 1. Tính độ sáng trung bình
                    let totalBrightness = 0;
                    const grayData = new Float32Array(w * h);
                    
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i+1];
                        const b = data[i+2];
                        // Luma formula: 0.299R + 0.587G + 0.114B
                        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
                        totalBrightness += brightness;
                        grayData[i/4] = brightness;
                    }
                    const avgBrightness = totalBrightness / (w * h);

                    // 2. Tính độ sắc nét (Variance of Laplacian)
                    // Sử dụng kernel Laplacian 3x3:
                    // [ 0,  1, 0]
                    // [ 1, -4, 1]
                    // [ 0,  1, 0]
                    let laplaceSum = 0;
                    let laplaceSqSum = 0;
                    const count = (w - 2) * (h - 2);

                    for (let y = 1; y < h - 1; y++) {
                        for (let x = 1; x < w - 1; x++) {
                            const idx = y * w + x;
                            const laplacian = 
                                grayData[idx - w] + // trên
                                grayData[idx - 1] + // trái
                                grayData[idx + 1] + // phải
                                grayData[idx + w] - // dưới
                                4 * grayData[idx];
                            
                            laplaceSum += laplacian;
                            laplaceSqSum += laplacian * laplacian;
                        }
                    }

                    const mean = laplaceSum / count;
                    const variance = (laplaceSqSum / count) - (mean * mean);

                    setStatus({
                        brightness: avgBrightness,
                        sharpness: variance,
                        isDark: avgBrightness < 50,
                        isBlurry: variance < 15 // Ngưỡng có thể điều chỉnh
                    });
                }
            }
            animationId = requestAnimationFrame(analyze);
        };

        analyze();
        return () => cancelAnimationFrame(animationId);
    }, [isCameraReady]);

    const capture = () => {
        if (videoRef.current) {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            canvas.toBlob((blob) => {
                onCapture(blob);
                stopCamera();
            }, 'image/jpeg', 0.95);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl bg-gray-900 rounded-[32px] overflow-hidden shadow-2xl border border-white/10">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Camera className="w-5 h-5 text-rose-400" />
                        Chụp ảnh khuôn mặt
                    </h3>
                    <button 
                        onClick={() => { stopCamera(); onClose(); }}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Video Area */}
                <div className="relative aspect-[3/4] sm:aspect-video bg-black flex items-center justify-center">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover mirror"
                        style={{ transform: 'scaleX(-1)' }}
                    />
                    
                    {/* Face Guide Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-64 h-80 border-2 border-dashed border-white/30 rounded-[100px] relative">
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-white/30 rounded-full"></div>
                        </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="absolute bottom-24 left-0 right-0 px-6 flex flex-col gap-2 items-center">
                        {status.isDark && (
                            <div className="bg-amber-500/90 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
                                <SunDim className="w-4 h-4" />
                                Thiếu ánh sáng. Vui lòng di chuyển ra nơi sáng hơn.
                            </div>
                        )}
                        {status.isBlurry && !status.isDark && (
                            <div className="bg-rose-500/90 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
                                <Focus className="w-4 h-4" />
                                Ảnh đang bị mờ. Hãy giữ chắc tay hoặc lấy nét lại.
                            </div>
                        )}
                        {!status.isDark && !status.isBlurry && isCameraReady && (
                            <div className="bg-green-500/90 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Chất lượng ảnh tốt
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="p-8 bg-gray-900 flex flex-col items-center">
                    <div className="flex items-center gap-12">
                        <div className="text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${status.isDark ? 'bg-amber-500/20 text-amber-500' : 'bg-green-500/20 text-green-500'}`}>
                                <Sun className="w-6 h-6" />
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Ánh sáng</p>
                        </div>

                        <button 
                            onClick={capture}
                            disabled={!isCameraReady}
                            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                        >
                            <div className="w-16 h-16 border-4 border-gray-900 rounded-full flex items-center justify-center">
                                <div className="w-12 h-12 bg-rose-500 rounded-full"></div>
                            </div>
                        </button>

                        <div className="text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${status.isBlurry ? 'bg-rose-500/20 text-rose-500' : 'bg-green-500/20 text-green-500'}`}>
                                <Focus className="w-6 h-6" />
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Độ nét</p>
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm mt-6">Căn giữa khuôn mặt vào khung hình và nhấn nút để chụp</p>
                </div>

                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
};

export default CameraScanner;

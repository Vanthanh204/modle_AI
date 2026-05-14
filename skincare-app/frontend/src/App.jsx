import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Upload, Activity, ShieldCheck, Info, Camera, RefreshCcw, LayoutPanelLeft, Video, StopCircle } from 'lucide-react';

const API_URL = "http://127.0.0.1:8000/predict";

const SkincareApp = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState([]);
  const [advices, setAdvices] = useState([]);
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [facingMode, setFacingMode] = useState("user"); // "user" hoặc "environment"
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const analysisInterval = useRef(null);

  // Xử lý khi chọn ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      stopLiveMode();
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResults([]);
      setAdvices([]);
      setWarning("");
      setHasAnalyzed(false);
    }
  };

  // Chuyển đổi Camera Trước/Sau
  const switchCamera = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    if (isLive) {
      stopLiveMode();
      setTimeout(() => startLiveMode(nextMode), 100);
    }
  };

  // Bật/Tắt chế độ Camera trực tiếp
  const toggleLiveMode = async () => {
    if (isLive) {
      stopLiveMode();
    } else {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Trình duyệt của bạn không hỗ trợ truy cập camera hoặc đang ở môi trường không an toàn (cần HTTPS hoặc localhost).");
        return;
      }
      startLiveMode(facingMode);
    }
  };

  const startLiveMode = async (mode = "user") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: mode,
          width: { ideal: 1920 }, // Yêu cầu độ phân giải Full HD nếu có
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        } 
      });
      streamRef.current = stream;
      setIsLive(true);
      setPreview(null);
      setImage(null);
      setResults([]);
      setAdvices([]);
      setWarning("");
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Không thể truy cập camera. Vui lòng kiểm tra quyền trình duyệt!");
    }
  };

  // Hàm chụp ảnh tĩnh chất lượng cao từ Camera
  const captureHighRes = () => {
    if (!videoRef.current || videoRef.current.videoWidth === 0) {
      alert("Camera chưa sẵn sàng hoặc không tìm thấy dữ liệu video.");
      return;
    }
    
    // Tạm dừng vòng lặp quét tự động để tập trung phân tích ảnh tĩnh này
    if (analysisInterval.current) clearInterval(analysisInterval.current);
    
    setLoading(true);
    setWarning("");
    
    // Hiệu ứng nháy màn hình (Flash effect)
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'white';
    overlay.style.zIndex = '9999';
    overlay.style.opacity = '0.8';
    overlay.style.transition = 'opacity 0.3s ease-out';
    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => document.body.removeChild(overlay), 300);
    }, 50);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert("Không thể trích xuất dữ liệu ảnh từ camera.");
        setLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append('file', blob, 'high_res_capture.jpg');

      try {
        const response = await axios.post(API_URL, formData);
        if (response.data.status === "success") {
          setResults(response.data.data);
          setAdvices(response.data.advices || []);
          setWarning(response.data.warning || "");
          setHasAnalyzed(true);
          alert("Đã chụp và phân tích xong! Hãy xem kết quả ở cột bên phải.");
        } else {
          alert("Lỗi từ server: " + response.data.message);
        }
      } catch (error) {
        console.error("High-res analysis failed:", error);
        alert("Không thể kết nối với Backend AI. Hãy chắc chắn bạn đã bật server!");
      } finally {
        setLoading(false);
        // Sau 3 giây tự động quay lại chế độ quét live
        setTimeout(() => {
          if (isLive && !analysisInterval.current) {
            analysisInterval.current = setInterval(captureAndAnalyze, 1000);
          }
        }, 3000);
      }
    }, 'image/jpeg', 0.9);
  };

  // Effect xử lý khi luồng camera đã sẵn sàng
  useEffect(() => {
    if (isLive && videoRef.current && streamRef.current) {
      console.log("Setting video srcObject", streamRef.current);
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => console.error("Error playing video:", err));
      
      // Bắt đầu vòng lặp phân tích sau khi video đã bắt đầu phát
      analysisInterval.current = setInterval(() => {
        captureAndAnalyze();
      }, 1000);
    }
    
    return () => {
      if (analysisInterval.current) clearInterval(analysisInterval.current);
    };
  }, [isLive]);

  const stopLiveMode = () => {
    console.log("Stopping live mode");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log("Stopped track:", track.label);
      });
      streamRef.current = null;
    }
    if (analysisInterval.current) {
      clearInterval(analysisInterval.current);
    }
    setIsLive(false);
    setResults([]);
    setWarning("");
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !isLive) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');

      try {
        const response = await axios.post(API_URL, formData);
        if (response.data.status === "success") {
          setResults(response.data.data);
          setAdvices(response.data.advices || []);
          setWarning(response.data.warning || "");
          setHasAnalyzed(true);
        }
      } catch (error) {
        console.error("Live analysis failed:", error);
      }
    }, 'image/jpeg', 0.7);
  };

  // Gửi ảnh lên Backend AI (cho chế độ Upload)
  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setHasAnalyzed(false);
    setWarning("");
    const formData = new FormData();
    formData.append('file', image);

    try {
      const response = await axios.post(API_URL, formData);
      if (response.data.status === "success") {
        setResults(response.data.data);
        setAdvices(response.data.advices || []);
        setWarning(response.data.warning || "");
        setHasAnalyzed(true);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Backend chưa được bật hoặc có lỗi kết nối!");
    } finally {
      setLoading(false);
    }
  };

  // Vẽ các khung (Bounding Box) lên Canvas
  useEffect(() => {
    if (results.length > 0 && (imgRef.current || videoRef.current)) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const target = isLive ? videoRef.current : imgRef.current;

      if (!target) return;

      // Thiết lập kích thước canvas
      if (isLive) {
        canvas.width = target.videoWidth;
        canvas.height = target.videoHeight;
      } else {
        canvas.width = target.naturalWidth;
        canvas.height = target.naturalHeight;
      }

      canvas.style.width = `${target.clientWidth}px`;
      canvas.style.height = `${target.clientHeight}px`;
      canvas.style.top = `${target.offsetTop}px`;
      canvas.style.left = `${target.offsetLeft}px`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      results.forEach((res) => {
        const [x1, y1, x2, y2] = res.box;
        const color = getLabelColor(res.label);
        
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(canvas.width / 200, 2);
        ctx.strokeRect(x1, y1, (x2 - x1), (y2 - y1));
        
        ctx.fillStyle = color;
        const fontSize = Math.max(canvas.width / 40, 14);
        ctx.font = `bold ${fontSize}px Inter`;
        ctx.fillText(`${getLabelVN(res.label)} ${Math.round(res.confidence * 100)}%`, x1, y1 > fontSize ? y1 - 10 : y1 + fontSize);
      });
    } else if (results.length === 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [results, preview, isLive]);

  // Thống kê số lượng mụn
  const stats = results.reduce((acc, curr) => {
    acc[curr.label] = (acc[curr.label] || 0) + 1;
    return acc;
  }, {});

  const getLabelVN = (label) => {
    const mapping = {
      'Blackheads': 'Mụn đầu đen',
      'Combination skin': 'Da hỗn hợp',
      'Dry skin': 'Da khô',
      'Dull skin': 'Da xỉn màu',
      'Enlarged pores': 'Lỗ chân lông to',
      'Freckles': 'Tàn nhang',
      'Hyperpigmentation': 'Thâm nám / Sắc tố',
      'Inflammatory acne': 'Mụn viêm',
      'Melasma': 'Nám da',
      'Oily skin': 'Da dầu',
      'Psoriasis': 'Vảy nến',
      'Whiteheads': 'Mụn đầu trắng',
      'Wrinkles': 'Nếp nhăn',
      'cystic acne': 'Mụn nang / Mụn bọc'
    };
    return mapping[label] || label;
  };

  const getLabelColor = (label) => {
    if (['Blackheads', 'Inflammatory acne', 'Whiteheads', 'cystic acne'].includes(label)) return '#EF4444';
    return '#F59E0B';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Activity className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">AI Skincare Pro</h1>
        </div>
        <div className="flex gap-4">
          {isLive && (
            <button 
              onClick={switchCamera}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition"
            >
              <RefreshCcw className="w-4 h-4"/> Đổi Camera
            </button>
          )}
          <button 
            onClick={toggleLiveMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${isLive ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`}
          >
            {isLive ? <><StopCircle className="w-4 h-4"/> Tắt Camera</> : <><Video className="w-4 h-4"/> Xem Trực Tiếp</>}
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition">Liên hệ bác sĩ</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-10 px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[500px] flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-500" />
              {isLive ? "Đang xem trực tiếp từ Camera" : "Chẩn đoán qua hình ảnh"}
            </h2>

            {!preview && !isLive ? (
              <label className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center hover:bg-slate-50 hover:border-indigo-400 transition cursor-pointer">
                <div className="bg-indigo-50 p-4 rounded-full mb-4">
                  <Upload className="w-8 h-8 text-indigo-500" />
                </div>
                <p className="text-sm font-medium text-slate-600">Nhấp để tải lên hoặc kéo thả ảnh vào đây</p>
                <p className="text-xs text-slate-400 mt-1">Hỗ trợ JPG, PNG (Max 5MB)</p>
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
            ) : (
              <div className="relative flex-1 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
                {isLive ? (
                  <>
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline 
                      muted
                      className="max-w-full max-h-full object-contain"
                    />
                    {/* Khung hướng dẫn lấy nét */}
                    <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none flex items-center justify-center">
                      <div className="w-64 h-64 border-2 border-dashed border-white/50 rounded-full flex items-center justify-center">
                        <p className="text-white/70 text-[10px] uppercase tracking-widest text-center px-4">Đưa vùng da cần soi vào giữa khung</p>
                      </div>
                    </div>
                    {/* Nút Chụp ảnh sắc nét */}
                    <button 
                      onClick={captureHighRes}
                      disabled={loading}
                      className="absolute bottom-6 bg-white/90 backdrop-blur text-indigo-600 p-4 rounded-full shadow-xl hover:bg-white transition active:scale-95 disabled:opacity-50"
                      title="Chụp ảnh sắc nét để phân tích kỹ"
                    >
                      <Camera className="w-8 h-8" />
                    </button>
                  </>
                ) : (
                  <img 
                    ref={imgRef}
                    src={preview} 
                    className="max-w-full max-h-full object-contain" 
                    alt="preview" 
                  />
                )}
                <canvas 
                  ref={canvasRef} 
                  className="absolute pointer-events-none" 
                />
              </div>
            )}

            {isLive && (
              <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <h4 className="text-xs font-bold text-amber-800 flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4" /> MẸO ĐỂ AI NHẬN DIỆN CHÍNH XÁC HƠN:
                </h4>
                <ul className="text-[11px] text-amber-700 space-y-1 list-disc pl-4">
                  <li><strong>Đủ ánh sáng:</strong> Đứng trước cửa sổ hoặc dưới đèn sáng (ánh sáng trắng là tốt nhất).</li>
                  <li><strong>Khoảng cách:</strong> Giữ camera cách da khoảng 10-15cm. Đừng để quá gần sẽ bị mất nét.</li>
                  <li><strong>Giữ yên:</strong> Giữ máy thật tĩnh trong 1-2 giây để AI bắt được chi tiết mụn.</li>
                  <li><strong>Lấy nét thủ công:</strong> Nếu mờ, hãy đưa máy ra xa rồi từ từ đưa lại gần cho đến khi thấy rõ lỗ chân lông.</li>
                </ul>
              </div>
            )}

            {!isLive && (
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => {setPreview(null); setImage(null); setResults([]); setHasAnalyzed(false);}}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition flex items-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" /> Làm mới
                </button>
                <button 
                  onClick={analyzeImage}
                  disabled={!image || loading}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition disabled:bg-slate-300 shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  {loading ? <span className="flex items-center gap-2 italic"><LayoutPanelLeft className="animate-spin w-4 h-4"/> Đang phân tích...</span> : "BẮT ĐẦU PHÂN TÍCH AI"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {warning && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-3 animate-pulse">
              <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium">{warning}</p>
            </div>
          )}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Kết quả soi da
            </h3>
            {results.length > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats).map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="capitalize font-medium text-slate-600" style={{ color: getLabelColor(label) }}>
                      {getLabelVN(label)}
                    </span>
                    <span className="bg-white px-3 py-1 rounded-lg border text-indigo-600 font-bold">{count} nốt</span>
                  </div>
                ))}
                
                <div className="pt-4 border-t mt-4">
                  <div className="flex items-center gap-2 text-sm text-amber-600 mb-4">
                    <Info className="w-4 h-4" />
                    <strong>Lời khuyên chuyên gia:</strong>
                  </div>
                  <div className="space-y-4">
                    {advices.map((advice, index) => (
                      <div key={index} className="bg-slate-50 p-3 rounded-lg border-l-4 border-indigo-500">
                        <h4 className="text-xs font-bold text-indigo-700 uppercase mb-1">{advice.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{advice.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : hasAnalyzed ? (
              <div className="text-center py-10">
                <div className="bg-emerald-50 inline-block p-4 rounded-full mb-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-sm text-slate-600 font-medium">Tuyệt vời! AI không tìm thấy dấu hiệu mụn hay vấn đề da liễu nào đáng lo ngại.</p>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="bg-slate-50 inline-block p-4 rounded-full mb-3">
                  <Activity className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400">Chưa có dữ liệu phân tích. Hãy tải ảnh hoặc bật camera để bắt đầu.</p>
              </div>
            )}
          </div>

          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
            <h4 className="font-bold mb-2">Bạn có biết?</h4>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Trí tuệ nhân tạo (AI) có khả năng nhận diện các tổn thương da với độ chính xác cao nếu được cung cấp hình ảnh rõ nét và đủ ánh sáng.
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center mt-12 text-slate-400 text-xs px-6">
        Lưu ý: Công cụ này chỉ mang tính chất tham khảo dựa trên thuật toán AI. <br/> 
        Vui lòng không tự ý dùng thuốc mà chưa có chỉ định của bác sĩ da liễu.
      </footer>
    </div>
  );
};

export default SkincareApp;

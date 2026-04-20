import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Upload, Activity, ShieldCheck, Info, Camera, RefreshCcw, LayoutPanelLeft } from 'lucide-react';

const API_URL = "http://localhost:8000/predict";

const SkincareApp = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState([]);
  const [advices, setAdvices] = useState([]); // State mới cho lời khuyên
  const [loading, setLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  // Xử lý khi chọn ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResults([]);
      setAdvices([]);
      setHasAnalyzed(false);
    }
  };

  // Gửi ảnh lên Backend AI
  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setHasAnalyzed(false);
    const formData = new FormData();
    formData.append('file', image);

    try {
      const response = await axios.post(API_URL, formData);
      if (response.data.status === "success") {
        setResults(response.data.data);
        setAdvices(response.data.advices || []); // Lưu lời khuyên từ API
        setHasAnalyzed(true);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Backend chưa được bật hoặc có lỗi kết nối!");
    } finally {
      setLoading(false);
    }
  };

  // Vẽ các khung (Bounding Box) lên Canvas khi có kết quả
  useEffect(() => {
    if (results.length > 0 && imgRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imgRef.current;

      // Thiết lập kích thước canvas bằng đúng kích thước thật của ảnh
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Căn chỉnh canvas đè khít lên ảnh đang hiển thị trên màn hình
      canvas.style.width = `${img.clientWidth}px`;
      canvas.style.height = `${img.clientHeight}px`;
      canvas.style.top = `${img.offsetTop}px`;
      canvas.style.left = `${img.offsetLeft}px`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      results.forEach((res) => {
        const [x1, y1, x2, y2] = res.box;
        const color = getLabelColor(res.label);
        
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(img.naturalWidth / 200, 2); // Độ dày nét vẽ tỉ lệ với độ phân giải ảnh
        ctx.strokeRect(x1, y1, (x2 - x1), (y2 - y1));
        
        // Vẽ nhãn
        ctx.fillStyle = color;
        const fontSize = Math.max(img.naturalWidth / 40, 14);
        ctx.font = `bold ${fontSize}px Inter`;
        ctx.fillText(`${getLabelVN(res.label)} ${Math.round(res.confidence * 100)}%`, x1, y1 > fontSize ? y1 - 10 : y1 + fontSize);
      });
    }
  }, [results, preview]);

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
    if (['Blackheads', 'Inflammatory acne', 'Whiteheads', 'cystic acne'].includes(label)) return '#EF4444'; // Đỏ cho mụn
    return '#F59E0B'; // Cam cho các tình trạng khác
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Activity className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">AI Skincare Pro</h1>
        </div>
        <div className="flex gap-4">
          <button className="text-sm font-medium text-slate-600 hover:text-indigo-600">Hướng dẫn</button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition">Liên hệ bác sĩ</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-10 px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Preview */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[500px] flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-500" />
              Chẩn đoán qua hình ảnh
            </h2>

            {!preview ? (
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
                <img 
                  ref={imgRef}
                  src={preview} 
                  className="max-w-full max-h-full object-contain" 
                  alt="preview" 
                />
                <canvas 
                  ref={canvasRef} 
                  className="absolute top-0 left-0 w-full h-full pointer-events-none" 
                />
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => {setPreview(null); setImage(null); setResults([]);}}
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
          </div>
        </div>

        {/* Right Column: Analysis Results */}
        <div className="lg:col-span-4 space-y-6">
          {/* Summary Box */}
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
                
                {/* Phần lời khuyên động từ Web */}
                <div className="pt-4 border-t mt-4">
                  <div className="flex items-center gap-2 text-sm text-amber-600 mb-4">
                    <Info className="w-4 h-4" />
                    <strong>Lời khuyên chuyên gia (Từ Web):</strong>
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
                <p className="text-sm text-slate-600 font-medium">Tuyệt vời! AI không tìm thấy dấu hiệu mụn hay vấn đề da liễu nào đáng lo ngại trên ảnh này.</p>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="bg-slate-50 inline-block p-4 rounded-full mb-3">
                  <Activity className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400">Chưa có dữ liệu phân tích. Hãy tải ảnh lên để bắt đầu.</p>
              </div>
            )}
          </div>

          {/* Tips Box */}
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
            <h4 className="font-bold mb-2">Bạn có biết?</h4>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Trí tuệ nhân tạo (AI) có khả năng nhận diện các tổn thương da với độ chính xác trên 90% nếu được cung cấp hình ảnh rõ nét và đủ ánh sáng.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="text-center mt-12 text-slate-400 text-xs px-6">
        Lưu ý: Công cụ này chỉ mang tính chất tham khảo dựa trên thuật toán AI. <br/> 
        Vui lòng không tự ý dùng thuốc mà chưa có chỉ định của bác sĩ da liễu.
      </footer>
    </div>
  );
};

export default SkincareApp;

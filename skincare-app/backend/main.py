from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import shutil
import os
import uvicorn

app = FastAPI()

# Cho phép Website (React) có thể gọi vào Backend này
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Load bộ não AI của bạn - CHỈ LOAD 1 LẦN KHI KHỞI ĐỘNG
model_path = "best.pt"
if os.path.exists(model_path):
    model = YOLO(model_path)
else:
    print("CẢNH BÁO: Không tìm thấy file best.pt!")
    model = None

@app.get("/")
async def root():
    return {"message": "AI Skincare Backend is running!"}

# Dữ liệu lời khuyên chuẩn y khoa thu thập từ web (Vinmec/Medlatec)
ADVICE_DATABASE = {
    'Blackheads': {
        'title': 'Xử lý Mụn đầu đen',
        'content': 'Sử dụng BHA (Salicylic Acid) để làm sạch sâu lỗ chân lông. Thực hiện Double Cleansing (Tẩy trang + Sữa rửa mặt) hàng tối.'
    },
    'Inflammatory acne': {
        'title': 'Chăm sóc Mụn viêm',
        'content': 'Sử dụng Benzoyl Peroxide hoặc Azelaic Acid để tiêu diệt vi khuẩn. Tuyệt đối không nặn mụn khi đang viêm đỏ.'
    },
    'cystic acne': {
        'title': 'Điều trị Mụn nang/Mụn bọc',
        'content': 'Đây là tình trạng nặng. Hãy sử dụng kháng sinh bôi (Clindamycin) và cân nhắc thăm khám bác sĩ để có đơn thuốc uống chuyên sâu.'
    },
    'Enlarged pores': {
        'title': 'Thu nhỏ Lỗ chân lông',
        'content': 'Sử dụng Niacinamide để điều tiết dầu. Đắp mặt nạ đất sét 1-2 lần/tuần để hút bã nhờn dư thừa.'
    },
    'Dry skin': {
        'title': 'Phục hồi Da khô',
        'content': 'Cấp ẩm bằng Serum Hyaluronic Acid (HA) trên nền da ẩm và khóa ẩm bằng kem dưỡng chứa Ceramides.'
    },
    'Oily skin': {
        'title': 'Kiểm soát Da dầu',
        'content': 'Sử dụng sữa rửa mặt dạng Gel có pH 5.5. Không bỏ qua kem dưỡng ẩm nhưng nên chọn dạng Lotion mỏng nhẹ.'
    },
    'Hyperpigmentation': {
        'title': 'Trị Thâm nám / Sắc tố',
        'content': 'Sử dụng Vitamin C, Arbutin hoặc Tranexamic Acid để làm sáng da. Bắt buộc dùng kem chống nắng mỗi ngày.'
    },
    'Wrinkles': {
        'title': 'Cải thiện Nếp nhăn',
        'content': 'Sử dụng Retinol vào ban tối để tăng sinh Collagen. Luôn dưỡng ẩm đầy đủ và chống nắng kỹ.'
    }
}

@app.post("/predict")
async def predict_skincare(file: UploadFile = File(...)):
    if model is None:
        return {"status": "error", "message": "Không tìm thấy file best.pt. Hãy copy nó vào thư mục backend!"}
        
    temp_file = "temp_image.jpg"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    results = model.predict(source=temp_file, conf=0.20, imgsz=640)
    
    predictions = []
    detected_labels = set()
    for result in results:
        for box in result.boxes:
            label = model.names[int(box.cls)]
            predictions.append({
                "label": label,
                "confidence": round(float(box.conf), 2),
                "box": [round(x, 2) for x in box.xyxy[0].tolist()]
            })
            detected_labels.add(label)
    
    # Lấy lời khuyên từ "Web Database" dựa trên các nhãn tìm thấy
    advices = []
    for label in detected_labels:
        if label in ADVICE_DATABASE:
            advices.append(ADVICE_DATABASE[label])
    
    # Lời khuyên chung nếu không thấy gì đặc biệt hoặc bổ sung
    if not advices:
        advices.append({
            'title': 'Chăm sóc da cơ bản',
            'content': 'Duy trì làm sạch, dưỡng ẩm và chống nắng hàng ngày để bảo vệ hàng rào bảo vệ da.'
        })

    if os.path.exists(temp_file):
        os.remove(temp_file)
        
    return {
        "status": "success", 
        "data": predictions,
        "advices": advices
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

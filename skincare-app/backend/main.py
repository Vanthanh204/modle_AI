from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ultralytics import YOLO
from jose import JWTError, jwt
from typing import List, Optional
import shutil
import os
import uvicorn
import cv2
import numpy as np
from datetime import timedelta

# Import Local Modules
from database import engine, SessionLocal, get_db
import models, schemas, auth, cloudinary_utils

# Tạo bảng trong database (Nếu chưa có)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

async def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

# Cho phép Website (React) có thể gọi vào Backend này
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print(f"❌ LỖI SERVER: {exc}")
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

# 1. Load 2 bộ não AI
type_model_path = "best_classify.pt"
problem_model_path = "best_detect.pt"

type_model = None
problem_model = None

if os.path.exists(type_model_path):
    type_model = YOLO(type_model_path)
    print(f"Đã load mô hình phân loại da: {type_model.names}")
else:
    print(f"CẢNH BÁO: Không tìm thấy {type_model_path}")

if os.path.exists(problem_model_path):
    problem_model = YOLO(problem_model_path)
    print(f"Đã load mô hình phát hiện vấn đề: {problem_model.names}")
else:
    print(f"CẢNH BÁO: Không tìm thấy {problem_model_path}")

def check_blur(image_path, threshold=40):
    image = cv2.imread(image_path)
    if image is None:
        return 0, False
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    fm = cv2.Laplacian(gray, cv2.CV_64F).var()
    return float(fm), bool(fm > threshold)

def check_brightness(image_path, threshold=50):
    image = cv2.imread(image_path)
    if image is None:
        return 0, False
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    avg_brightness = np.mean(gray)
    return float(avg_brightness), bool(avg_brightness > threshold)

# Bản đồ dịch tự động linh hoạt
def get_vi_label(label):
    if not label:
        return label
    
    label_lower = label.lower().strip()
    mapping = {
        'combination_skin': 'Da hỗn hợp', 
        'dry_skin': 'Da khô', 
        'oily_skin': 'Da dầu',
        'normal_skin': 'Da thường',
        'blackheads': 'Mụn đầu đen', 
        'blackhead': 'Mụn đầu đen',
        'combination skin': 'Da hỗn hợp', 
        'dry skin': 'Da khô',
        'dull skin': 'Da xỉn màu', 
        'enlarged pores': 'Lỗ chân lông to', 
        'freckles': 'Tàn nhang',
        'hyperpigmentation': 'Thâm da/Tăng sắc tố', 
        'inflammatory acne': 'Mụn viêm',
        'melasma': 'Nám da', 
        'oily skin': 'Da dầu', 
        'psoriasis': 'Vảy nến',
        'whiteheads': 'Mụn đầu trắng', 
        'whitehead': 'Mụn đầu trắng',
        'wrinkles': 'Nếp nhăn', 
        'cystic acne': 'Mụn nang', 
        'acne': 'Mụn',
        'pimple': 'Mụn bọc', 
        'scar': 'Sẹo',
        'dark circles': 'Quầng thâm mắt',
        'redness': 'Mẩn đỏ',
        'sunburn': 'Cháy nắng'
    }
    return mapping.get(label_lower, label)

# Dữ liệu lời khuyên mở rộng (Sử dụng key là nhãn gốc để tra cứu chính xác)
ADVICE_DATABASE = {
    'oily_skin': {'title': 'Chăm sóc Da dầu', 'content': 'Sử dụng sữa rửa mặt dạng Gel pH 5.5, dùng Niacinamide để kiềm dầu.'},
    'dry_skin': {'title': 'Chăm sóc Da khô', 'content': 'Dùng sữa rửa mặt dạng Cream, cấp ẩm sâu bằng Hyaluronic Acid.'},
    'combination_skin': {'title': 'Chăm sóc Da hỗn hợp', 'content': 'Làm sạch kỹ vùng chữ T và dưỡng ẩm sâu cho vùng chữ U.'},
    'blackheads': {'title': 'Trị Mụn đầu đen', 'content': 'Sử dụng BHA định kỳ để làm sạch sâu lỗ chân lông.'},
    'Blackheads': {'title': 'Trị Mụn đầu đen', 'content': 'Sử dụng BHA định kỳ để làm sạch sâu lỗ chân lông.'},
    'Enlarged pores': {'title': 'Thu nhỏ Lỗ chân lông', 'content': 'Kết hợp dùng Retinoids và đắp mặt nạ đất sét hàng tuần.'},
    'Melasma': {'title': 'Điều trị Nám da', 'content': 'Sử dụng các hoạt chất làm sáng như Vitamin C hoặc Arbutin.'},
    'hyperpigmentation': {'title': 'Mờ thâm sáng da', 'content': 'Sử dụng Serum Vitamin C và kem chống nắng đầy đủ hàng ngày.'},
    'wrinkles': {'title': 'Chống lão hóa', 'content': 'Bổ sung Retinol vào quy trình ban đêm để tăng sinh collagen.'}
}

# --- AUTH ENDPOINTS ---

@app.post("/register", response_model=schemas.User)
async def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        print(f"📩 Đang xử lý đăng ký cho email: {user.email}")
        db_user = db.query(models.User).filter(models.User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = auth.get_password_hash(user.password)
        new_user = models.User(
            email=user.email,
            hashed_password=hashed_password,
            full_name=user.full_name
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"✅ Đăng ký thành công cho: {user.email}")
        return new_user
    except Exception as e:
        db.rollback()
        print(f"❌ LỖI KHI ĐĂNG KÝ: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.put("/users/me", response_model=schemas.User)
async def update_user(
    full_name: Optional[str] = None,
    avatar_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if full_name:
        current_user.full_name = full_name
    
    if avatar_file:
        temp_avatar = f"temp_avatar_{current_user.id}.jpg"
        with open(temp_avatar, "wb") as buffer:
            shutil.copyfileobj(avatar_file.file, buffer)
        
        url = cloudinary_utils.upload_image(temp_avatar, folder="avatars")
        if url:
            current_user.avatar_url = url
        
        if os.path.exists(temp_avatar):
            os.remove(temp_avatar)
            
    db.commit()
    db.refresh(current_user)
    return current_user

# --- HISTORY ENDPOINT ---

@app.get("/history", response_model=List[schemas.AnalysisHistory])
async def get_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.AnalysisHistory).filter(models.AnalysisHistory.user_id == current_user.id).order_by(models.AnalysisHistory.created_at.desc()).all()

# --- PREDICT ENDPOINT (UPDATED) ---

@app.post("/predict")
async def predict_skincare(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if type_model is None or problem_model is None:
        raise HTTPException(status_code=500, detail="Mô hình AI chưa được tải")
        
    temp_file = f"temp_{current_user.id}.jpg"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 1. Kiểm tra chất lượng ảnh
    sharpness_score, is_sharp = check_blur(temp_file)
    brightness_score, is_bright = check_brightness(temp_file)
    
    warning_msg = ""
    if not is_sharp:
        warning_msg += "Ảnh hơi mờ, kết quả có thể kém chính xác. "
    if not is_bright:
        warning_msg += "Ảnh hơi tối, hãy chụp nơi có ánh sáng tốt hơn."

    # 2. Dự đoán Loại da
    type_results = type_model.predict(source=temp_file, verbose=False)
    top1_idx = type_results[0].probs.top1
    raw_type_label = type_results[0].names[top1_idx]
    skin_type_label = get_vi_label(raw_type_label)
    skin_type_conf = round(float(type_results[0].probs.top1conf), 2)
    
    # 3. Dự đoán Vấn đề da (Tăng ngưỡng conf lên 0.25 để giảm sai số)
    problem_results = problem_model.predict( source=temp_file,
    conf=0.22,
    iou=0.35,
    imgsz=640,
    verbose=False)
    
    detected_problems = []
    unique_problem_labels = set()
    
    for result in problem_results:
        for box in result.boxes:
            raw_label = problem_model.names[int(box.cls)]
            vi_label = get_vi_label(raw_label)
            detected_problems.append({
                "label": vi_label,
                "confidence": round(float(box.conf), 2),
                "box": [round(float(x), 4) for x in box.xyxyn[0].tolist()]
            })
            unique_problem_labels.add(raw_label) # Dùng raw_label để đối chiếu ADVICE_DATABASE
    
    # 4. Tổng hợp lời khuyên
    advices = []
    if raw_type_label in ADVICE_DATABASE:
        advices.append(ADVICE_DATABASE[raw_type_label])
    
    for prob_label in unique_problem_labels:
        if prob_label in ADVICE_DATABASE and ADVICE_DATABASE[prob_label] not in advices:
            advices.append(ADVICE_DATABASE[prob_label])
            
    if not advices:
        advices.append({'title': 'Chăm sóc cơ bản', 'content': 'Duy trì làm sạch và chống nắng hàng ngày.'})

    # 5. Tải lên Cloudinary
    image_url = cloudinary_utils.upload_image(temp_file, folder="analysis_history")
    
    # 6. Lưu vào Database
    new_history = models.AnalysisHistory(
        user_id=current_user.id,
        image_url=image_url if image_url else "error_upload",
        skin_type_label=skin_type_label,
        skin_type_conf=skin_type_conf,
        problems_data=detected_problems,
        advices_data=advices,
        sharpness_score=round(float(sharpness_score), 2)
    )
    db.add(new_history)
    db.commit()
    db.refresh(new_history)

    if os.path.exists(temp_file):
        os.remove(temp_file)
        
    return {
        "status": "success",
        "history_id": new_history.id,
        "image_url": new_history.image_url,
        "skin_type": {"label": skin_type_label, "confidence": skin_type_conf},
        "problems": detected_problems,
        "advices": advices,
        "sharpness": round(float(sharpness_score), 2),
        "is_sharp": bool(is_sharp),
        "brightness": round(float(brightness_score), 2),
        "is_bright": bool(is_bright),
        "warning": warning_msg
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

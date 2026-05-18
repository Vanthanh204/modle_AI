import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

def upload_image(file_path: str, folder: str = "skincare_ai"):
    """
    Upload ảnh lên Cloudinary và trả về URL
    """
    # Kiểm tra cấu hình
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    if not cloud_name:
        print("❌ LỖI: Chưa cấu hình CLOUDINARY_CLOUD_NAME trong file .env")
        return None

    try:
        if not os.path.exists(file_path):
            print(f"❌ LỖI: Không tìm thấy file tại {file_path}")
            return None
            
        response = cloudinary.uploader.upload(file_path, folder=folder)
        url = response.get("secure_url")
        if url:
            print(f"✅ Upload thành công: {url}")
        return url
    except Exception as e:
        print(f"❌ Lỗi Upload Cloudinary: {str(e)}")
        print("Gợi ý: Kiểm tra Cloud Name, API Key, API Secret trong .env và kết nối mạng.")
        return None

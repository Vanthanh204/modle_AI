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
    try:
        response = cloudinary.uploader.upload(file_path, folder=folder)
        return response.get("secure_url")
    except Exception as e:
        print(f"Lỗi Upload Cloudinary: {e}")
        return None

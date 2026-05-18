import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

# Thử load file .env
load_dotenv()

# Lấy thông tin cấu hình
cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
api_key = os.getenv("CLOUDINARY_API_KEY")
api_secret = os.getenv("CLOUDINARY_API_SECRET")

print("--- KIỂM TRA CẤU HÌNH CLOUDINARY ---")
print(f"Cloud Name: {cloud_name}")
print(f"API Key: {api_key}")
print(f"API Secret: {'********' if api_secret else 'None'}")

if not all([cloud_name, api_key, api_secret]):
    print("\n❌ LỖI: Thiếu thông tin cấu hình trong file .env")
else:
    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True
    )

    print("\n--- ĐANG THỬ UPLOAD ẢNH TEST ---")
    # Tạo một file ảnh giả để test
    test_filename = "test_cloudinary.txt"
    with open(test_filename, "w") as f:
        f.write("test upload")
    
    try:
        # Cloudinary có thể upload cả file text/raw
        response = cloudinary.uploader.upload(test_filename, resource_type="raw")
        print("✅ KẾT QUẢ: Kết nối Cloudinary THÀNH CÔNG!")
        print(f"URL ảnh test: {response.get('secure_url')}")
    except Exception as e:
        print(f"❌ KẾT QUẢ: Kết nối Cloudinary THẤT BẠI!")
        print(f"Chi tiết lỗi: {str(e)}")
    finally:
        if os.path.exists(test_filename):
            os.remove(test_filename)

print("\n--- HƯỚNG DẪN ---")
print("1. Nếu báo lỗi 'Must provide cloud_name', hãy kiểm tra xem bạn đã lưu file .env chưa.")
print("2. Nếu báo lỗi 'Invalid API Key', hãy copy lại chính xác Key từ Dashboard Cloudinary.")
print("3. Đảm bảo máy tính có kết nối Internet.")

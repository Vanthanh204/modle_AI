import os
from ultralytics import YOLO
import torch

# 1. Cấu hình
model_path = 'skincare-app/backend/best.pt'
data_dir = 'data'
conf_threshold = 0.20

# Bản đồ khớp tên thư mục tiếng Việt với nhãn của AI (đã lấy từ model.names)
mapping = {
    'mụn đầu đen': 'Blackheads',
    'da hỗn hợp': 'Combination skin',
    'da khô': 'Dry skin',
    'da xỉn màu': 'Dull skin',
    'lỗ chân lông to': 'Enlarged pores',
    'tàn nhang': 'Freckles',
    'da thâm': 'Hyperpigmentation',
    'mụn viêm': 'Inflammatory acne',
    'da nám': 'Melasma',
    'da dầu': 'Oily skin',
    'vảy nến': 'Psoriasis',
    'mụn đầu trắng': 'Whiteheads',
    'nếp nhăn': 'Wrinkles',
    'mụn nang': 'cystic acne',
    'mụn bọc': 'cystic acne'
}

def evaluate():
    if not os.path.exists(model_path):
        print(f"Lỗi: Không tìm thấy file {model_path}")
        return

    print(f"--- ĐANG KIỂM TRA MÔ HÌNH: {model_path} ---")
    model = YOLO(model_path)
    
    results_summary = {}
    
    # Quét qua từng thư mục bệnh lý
    for folder_name in os.listdir(data_dir):
        folder_path = os.path.join(data_dir, folder_name)
        if not os.path.isdir(folder_path):
            continue
            
        target_label = mapping.get(folder_name.lower())
        if not target_label:
            print(f"Bỏ qua thư mục: {folder_name} (Chưa cấu hình nhãn khớp)")
            continue

        print(f"Đang quét nhóm: {folder_name} (Mong đợi nhãn: {target_label})...")
        
        correct = 0
        total = 0
        wrong_labels = {}

        for img_name in os.listdir(folder_path):
            if not img_name.lower().endswith(('.jpg', '.jpeg', '.png')):
                continue
                
            img_path = os.path.join(folder_path, img_name)
            total += 1
            
            # Dự đoán
            res = model.predict(source=img_path, conf=conf_threshold, verbose=False)
            
            detected_labels = []
            for r in res:
                for box in r.boxes:
                    detected_labels.append(model.names[int(box.cls)])
            
            if target_label in detected_labels:
                correct += 1
            elif len(detected_labels) > 0:
                # Nếu đoán sai sang nhãn khác
                main_wrong = detected_labels[0]
                wrong_labels[main_wrong] = wrong_labels.get(main_wrong, 0) + 1
            
        results_summary[folder_name] = {
            'correct': correct,
            'total': total,
            'accuracy': (correct / total * 100) if total > 0 else 0,
            'most_wrong': max(wrong_labels, key=wrong_labels.get) if wrong_labels else "Không có"
        }

    # In báo cáo cuối cùng
    print("\n" + "="*60)
    print(f"{'BỆNH LÝ (THƯ MỤC)':<25} | {'ĐÚNG/TỔNG':<10} | {'ĐỘ CHÍNH XÁC':<12} | {'SAY SAI SANG'}")
    print("-" * 60)
    
    total_correct = 0
    total_imgs = 0
    
    for name, stats in results_summary.items():
        total_correct += stats['correct']
        total_imgs += stats['total']
        print(f"{name:<25} | {stats['correct']:>2}/{stats['total']:<5} | {stats['accuracy']:>10.1f}% | {stats['most_wrong']}")
        
    avg_acc = (total_correct / total_imgs * 100) if total_imgs > 0 else 0
    print("-" * 60)
    print(f"{'TỔNG CỘNG':<25} | {total_correct:>2}/{total_imgs:<5} | {avg_acc:>10.1f}%")
    print("="*60)

if __name__ == "__main__":
    evaluate()

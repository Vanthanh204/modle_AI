from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(191), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    avatar_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Quan hệ với bảng lịch sử
    histories = relationship("AnalysisHistory", back_populates="owner")

class AnalysisHistory(Base):
    __tablename__ = "analysis_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    image_url = Column(String(255), nullable=False)
    skin_type_label = Column(String(50), nullable=False)
    skin_type_conf = Column(Float, nullable=False)
    problems_data = Column(JSON, nullable=True) # Lưu list các vấn đề và tọa độ
    advices_data = Column(JSON, nullable=True)  # Lưu list các lời khuyên
    sharpness_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="histories")

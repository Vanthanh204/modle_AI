from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- Schemas cho User ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None

class User(UserBase):
    id: int
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Schemas cho Auth ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Schemas cho History ---
class AnalysisHistoryBase(BaseModel):
    image_url: str
    skin_type_label: str
    skin_type_conf: float
    problems_data: Optional[List[dict]] = None
    advices_data: Optional[List[dict]] = None
    sharpness_score: Optional[float] = None

class AnalysisHistoryCreate(AnalysisHistoryBase):
    pass

class AnalysisHistory(AnalysisHistoryBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Đối với MySQL, ta dùng create_engine với SQLALCHEMY_DATABASE_URL
engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Hàm dependency để lấy session database cho mỗi request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

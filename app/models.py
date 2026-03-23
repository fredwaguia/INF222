from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from .database import Base

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String(100), index=True, nullable=False)
    date = Column(DateTime, default=datetime.utcnow, index=True)
    category = Column(String(100), index=True, nullable=False)
    tags = Column(String(255), default="")  # comma-separated tags for SQLite simplicity

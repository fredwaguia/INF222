from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class ArticleBase(BaseModel):
    title: str = Field(..., title="Titre de l'article", min_length=1)
    content: str = Field(..., title="Contenu de l'article", min_length=1)
    author: str = Field(..., title="Auteur de l'article", min_length=1)
    category: str = Field(..., title="Catégorie", min_length=1)
    tags: Optional[List[str]] = Field(default=[], title="Liste de tags")

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    content: Optional[str] = Field(None, min_length=1)
    author: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = Field(None, min_length=1)
    tags: Optional[List[str]] = None

class ArticleResponse(ArticleBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True  # Pydantic v2 support
        orm_mode = True         # Pydantic v1 support

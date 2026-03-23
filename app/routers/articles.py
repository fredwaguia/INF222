from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/articles",
    tags=["articles"],
    responses={404: {"description": "Not found"}},
)

def _format_article_response(db_article: models.Article) -> dict:
    article_dict = {
        "id": db_article.id,
        "title": db_article.title,
        "content": db_article.content,
        "author": db_article.author,
        "date": db_article.date,
        "category": db_article.category,
        "tags": [t.strip() for t in db_article.tags.split(",")] if db_article.tags else []
    }
    return article_dict

@router.post("/", response_model=schemas.ArticleResponse, status_code=status.HTTP_201_CREATED)
def create_article(article: schemas.ArticleCreate, db: Session = Depends(get_db)):
    tags_str = ",".join(article.tags) if article.tags else ""
    db_article = models.Article(
        title=article.title,
        content=article.content,
        author=article.author,
        category=article.category,
        tags=tags_str,
        date=datetime.utcnow()
    )
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    
    return _format_article_response(db_article)

@router.get("/", response_model=List[schemas.ArticleResponse])
def read_articles(
    category: Optional[str] = Query(None, description="Filtre par catégorie"),
    start_date: Optional[datetime] = Query(None, description="Date de début (ex: 2023-01-01)"),
    end_date: Optional[datetime] = Query(None, description="Date de fin (ex: 2023-12-31)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(models.Article)
    
    if category:
        query = query.filter(models.Article.category == category)
    if start_date:
        query = query.filter(models.Article.date >= start_date)
    if end_date:
        query = query.filter(models.Article.date <= end_date)
    
    articles = query.offset(skip).limit(limit).all()
    return [_format_article_response(a) for a in articles]

@router.get("/search", response_model=List[schemas.ArticleResponse])
def search_articles(
    q: str = Query(..., min_length=1, description="Terme de recherche textuelle pour le titre et contenu"), 
    db: Session = Depends(get_db)
):
    search_query = f"%{q}%"
    articles = db.query(models.Article).filter(
        (models.Article.title.ilike(search_query)) | 
        (models.Article.content.ilike(search_query))
    ).all()
    
    return [_format_article_response(a) for a in articles]

@router.get("/{article_id}", response_model=schemas.ArticleResponse)
def read_article(article_id: int, db: Session = Depends(get_db)):
    db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if db_article is None:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    return _format_article_response(db_article)

@router.put("/{article_id}", response_model=schemas.ArticleResponse)
def update_article(
    article_id: int, 
    article_update: schemas.ArticleUpdate, 
    db: Session = Depends(get_db)
):
    db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if db_article is None:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    update_data = article_update.dict(exclude_unset=True)
    if "tags" in update_data and update_data["tags"] is not None:
        update_data["tags"] = ",".join(update_data["tags"])
        
    for key, value in update_data.items():
        setattr(db_article, key, value)
        
    db.commit()
    db.refresh(db_article)
    
    return _format_article_response(db_article)

@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(article_id: int, db: Session = Depends(get_db)):
    db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if db_article is None:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    db.delete(db_article)
    db.commit()
    return None

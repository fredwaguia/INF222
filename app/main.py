import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from . import models
from .database import engine
from .routers import articles, uploads

# Create tables in the database (SQLAlchemy)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Blog REST API",
    description="Une API REST complète pour un système de blog.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configuration CORS pour autoriser l'interface web (si accès sur un autre port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(articles.router)
app.include_router(uploads.router)

# Servir les fichiers statiques de l'interface graphique
os.makedirs("frontend", exist_ok=True)
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# Exposer le dossier pour servir les médias (images, vidéos, pdf)
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    index_path = os.path.join("frontend", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {
        "message": "Bienvenue sur l'API de Blog !",
        "documentation": "Visitez /docs pour voir l'interface."
    }

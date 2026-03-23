# Nexus Blog API & CMS

Un système de blog complet intégrant une API REST performante propulsée par **FastAPI**, couplée à une interface d'administration "Vanilla JS" ultra-moderne (Glassmorphism, Dark Mode).

## 🌟 Fonctionnalités Principales

- **API REST Robuste** : Création, lecture, modification, suppression (CRUD) et recherche textuelle.
- **Base de Données Légère** : SQLite avec l'ORM SQLAlchemy.
- **Interface Graphique ("Dashboard")** : Design Premium façon Glassmorphism. Affichage dynamique sous forme de cartes d'articles avec miniature intelligente.
- **Support Multimédia Avancé** : Importation et lecture locale de fichiers texte (`.txt`, `.md`, etc.) et upload complet côté serveur de fichiers lourds (Images, Vidéos, PDF).
- **Rendu Markdown/HTML** : L'interface lit et convertit instantanément la syntaxe Markdown, affichant vos images et vidéos incrustées directement à l'intérieur de l'article (via *Marked.js*).
- **Documentation Automatique Swagger UI** : Fournie nativement et interactivement par FastAPI.

## 📂 Architecture du Projet

```text
fastapi-blog/
├── requirements.txt      # Dépendances Python
├── app/                  # Dossier Backend de l'API
│   ├── main.py           # Point d'entrée, paramétrage CORS et montage des fichiers
│   ├── models.py         # Modèles SQLAlchemy (Base de données)
│   ├── schemas.py        # Schémas de validation Pydantic
│   ├── database.py       # Configuration DB SQLite
│   └── routers/          
│       ├── articles.py   # Routes CRUD des articles
│       └── uploads.py    # Route de gestion et sécurisation de l'upload
├── frontend/             # Dossier Frontend / Interface Graphique (SPA)
│   ├── index.html        # Structure de l'application
│   ├── style.css         # Thème sombre et effets de flou (Glassmorphism)
│   └── app.js            # Logique fonctionnelle cliente (Fetch de l'API)
└── uploads/              # Dossier servant à stocker les médias lourds
```

## 🚀 Installation & Lancement

1. **Prérequis**
   Assurez-vous d'avoir Python 3.8+ installé. Il est recommandé de créer un environnement virtuel (venv).

2. **Installation des dépendances**
   À la base du répertoire contenant ce fichier, tapez :
   ```bash
   pip install -r requirements.txt
   ```

3. **Lancer le Serveur**
   ```bash
   uvicorn app.main:app --reload
   ```

4. **Accéder à l'Application**
   - **Interface Graphique (CMS Principal)** : Ouvrez votre navigateur sur **http://127.0.0.1:8000/**
   - **Documentation de l'API (Swagger UI)** : Allez sur **http://127.0.0.1:8000/docs**

## 📝 Utilisation du CMS

- **Création** : Cliquez sur **"+ Nouvel Article"**. Vous pouvez y écrire en texte ou en Markdown complet !
- **Gestion des Fichiers/Médias** : Utilisez le bouton **"📎 Insérer Fichier/Média"**. 
  - Si le fichier est du texte (ex: `.txt`, `.md`...etc), son contenu sera injecté dans la boîte de saisie pour une reprise facile de vos brouillons. 
  - S'il s'agit d'une **Image**, **Vidéo** ou d'un **PDF**, l'application frontend l'uploade vers l'API, récupère une URL unique et sécurisée, puis génère la balise HTML/Markdown adaptée !
- **Articles & Cartes** : L'interface analysera le contenu d'un article à la recherche d'une image. S'il en trouve une, il l'appliquera en tant que grande bannière ("cover") sur la page d'accueil pour la rendre dynamique.

---
*Projet de WAGUIA NONO FRED STIVE*

const API_BASE = window.location.origin + '/articles';

// DOM Elements
const articlesList = document.getElementById('articlesList');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Modals & Form
const articleModal = document.getElementById('articleModal');
const viewModal = document.getElementById('viewModal');
const form = document.getElementById('articleForm');

// Form Inputs
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const categoryInput = document.getElementById('category');
const tagsInput = document.getElementById('tags');
const contentInput = document.getElementById('content');
const importFileInput = document.getElementById('importFile');
const hiddenId = document.getElementById('articleId');
const modalTitle = document.getElementById('modalTitle');

// View Elements
const viewTitle = document.getElementById('viewTitle');
const viewCategory = document.getElementById('viewCategory');
const viewAuthor = document.getElementById('viewAuthor');
const viewDate = document.getElementById('viewDate');
const viewContent = document.getElementById('viewContent');
const viewTags = document.getElementById('viewTags');

let currentArticleId = null;

// Initialize
document.addEventListener('DOMContentLoaded', fetchArticles);

// Add enter key support on search
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchBtn.click();
});

// Fetch all
async function fetchArticles() {
    try {
        const res = await fetch(API_BASE + '/');
        if (!res.ok) throw new Error("API call failed");
        const data = await res.json();
        renderArticles(data);
    } catch (err) {
        console.error("Erreur de chargement", err);
        articlesList.innerHTML = `<div class="glass-panel" style="padding: 2rem; text-align:center; grid-column: 1/-1; color: var(--danger);">Impossible de joindre l'API. Assurez-vous que le serveur tourne correctement.</div>`;
    }
}

// Search
searchBtn.addEventListener('click', async () => {
    const q = searchInput.value.trim();
    if (!q) return fetchArticles();
    try {
        const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        renderArticles(data);
    } catch (err) {
        console.error(err);
    }
});

// Render List
function renderArticles(articles) {
    if (!articles || articles.length === 0) {
        articlesList.innerHTML = `<div class="glass-panel" style="padding: 2.5rem; text-align:center; grid-column: 1/-1; color: #94a3b8; font-size: 1.2rem;">Aucun article trouvé. Cliquez sur "Nouvel Article" pour en créer un.</div>`;
        return;
    }

    articlesList.innerHTML = articles.map(a => {
        // Extraction de l'image issue du fichier importé (texte markdown ou html)
        let coverImg = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600'; // Image par défaut
        if (a.content) {
            const mdImgMatch = a.content.match(/!\[.*?\]\((.*?)\)/); // Markdown image
            if (mdImgMatch && mdImgMatch[1]) {
                coverImg = mdImgMatch[1];
            } else {
                const htmlImgMatch = a.content.match(/<img.*?src=["'](.*?)["']/); // HTML image
                if (htmlImgMatch && htmlImgMatch[1]) {
                    coverImg = htmlImgMatch[1];
                }
            }
        }

        // Nettoyage esthétique du texte de description (retrait des balises images non interprétables)
        const rawText = a.content ? a.content.replace(/<[^>]*>?/gm, '').replace(/!\[.*?\]\(.*?\)/g, '') : '';
        const excerpt = escapeHtml(rawText).substring(0, 110) + '...';

        return `
        <div class="article-card glass-panel" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;" onclick="viewArticle(${a.id})">
            <div style="height: 180px; width: 100%; background-image: url('${coverImg}'); background-size: cover; background-position: center; border-bottom: 1px solid rgba(255,255,255,0.1);"></div>
            <div style="padding: 1.5rem; flex: 1; display: flex; flex-direction: column;">
                <div>
                    <span class="badge" style="margin-bottom: 0.8rem;">${escapeHtml(a.category)}</span>
                    <h3 style="margin-bottom: 0.5rem; font-size: 1.3rem;">${escapeHtml(a.title)}</h3>
                    <p style="margin-bottom: 1.5rem; min-height: 45px;">${excerpt}</p>
                </div>
                <div style="margin-top: auto;">
                    <button class="primary-btn" style="width: 100%; border-radius: 8px; margin-bottom: 1rem; padding: 0.6rem;" onclick="event.stopPropagation(); viewArticle(${a.id})">OUVRIR L'ARTICLE</button>
                    <div style="font-size: 0.85rem; color:#94a3b8; display: flex; justify-content: space-between;">
                        <span>Par <strong>${escapeHtml(a.author)}</strong></span>
                        <span>${new Date(a.date).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// View Article details
window.viewArticle = async (id) => {
    try {
        const res = await fetch(`${API_BASE}/${id}`);
        const article = await res.json();
        
        currentArticleId = article.id;
        viewTitle.textContent = article.title;
        viewCategory.textContent = article.category;
        viewAuthor.textContent = article.author;
        viewDate.textContent = new Date(article.date).toLocaleDateString();
        
        // Render content via marked.js so HTML and Markdown (images, video) works
        viewContent.innerHTML = marked.parse(article.content || "");
        
        viewTags.innerHTML = (article.tags || []).map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('');
        
        viewModal.classList.remove('hidden');
    } catch (err) {
        console.error(err);
    }
}

// Close View Modal
document.getElementById('closeViewBtn').addEventListener('click', () => {
    viewModal.classList.add('hidden');
    currentArticleId = null;
});

// Open New Article Modal
document.getElementById('newArticleBtn').addEventListener('click', () => {
    form.reset();
    hiddenId.value = '';
    importFileInput.value = '';
    modalTitle.textContent = "Créer un Nouvel Article";
    articleModal.classList.remove('hidden');
});

// Close Form Modal
document.getElementById('cancelBtn').addEventListener('click', () => {
    articleModal.classList.add('hidden');
});

// File Import Logic
if (importFileInput) {
    importFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Fichiers texte lus localement
        if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                contentInput.value += (contentInput.value ? '\n\n' : '') + event.target.result;
            };
            reader.onerror = (err) => {
                console.error(err);
                alert("Erreur lors de la lecture du fichier.");
            };
            reader.readAsText(file);
        } else {
            // Fichiers médias (images, vidéos, pdf) uploaddés sur le serveur
            const formData = new FormData();
            formData.append('file', file);
            
            try {
                importFileInput.disabled = true;
                const oldText = modalTitle.textContent;
                modalTitle.textContent = "Upload en cours...";
                
                const uploadBase = window.location.origin + '/upload/';
                const res = await fetch(uploadBase, {
                    method: 'POST',
                    body: formData
                });
                
                if (!res.ok) throw new Error("Upload failed");
                const data = await res.json();
                
                let markup = '';
                if (file.type.startsWith('image/')) {
                    markup = `![${data.filename}](${data.url})`;
                } else if (file.type.startsWith('video/')) {
                    markup = `<video controls src="${data.url}" style="max-width:100%; border-radius:8px;"></video>`;
                } else if (file.type === 'application/pdf') {
                    markup = `<embed src="${data.url}" type="application/pdf" width="100%" height="600px" style="border-radius:8px;" />`;
                } else {
                    markup = `[📝 Télécharger ${data.filename}](${data.url})`;
                }

                contentInput.value += (contentInput.value ? '\n\n' : '') + markup;
                modalTitle.textContent = oldText;
            } catch (err) {
                console.error(err);
                alert("Erreur lors de l'upload.");
                modalTitle.textContent = "Erreur upload";
            } finally {
                importFileInput.disabled = false;
                importFileInput.value = '';
            }
        }
    });
}

// Create or Update Article
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Construct Payload
    const rawTags = tagsInput.value.split(',');
    const sanitizedTags = rawTags.map(t => t.trim()).filter(t => t.length > 0);

    const articleData = {
        title: titleInput.value.trim(),
        content: contentInput.value.trim(),
        author: authorInput.value.trim(),
        category: categoryInput.value.trim(),
        tags: sanitizedTags
    };

    const id = hiddenId.value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/${id}` : API_BASE + '/';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(articleData)
        });
        
        if (!res.ok) throw new Error("Erreur de l'API");
        
        articleModal.classList.add('hidden');
        if (id && id == currentArticleId) {
            viewArticle(id); // Reload the view modal with fresh data
        }
        await fetchArticles(); // Refresh list
    } catch(err) {
        console.error(err);
        alert("Erreur lors de la sauvegarde.");
    }
});

// Edit from View
document.getElementById('editFromViewBtn').addEventListener('click', () => {
    viewModal.classList.add('hidden');
    
    // Populate form
    hiddenId.value = currentArticleId;
    titleInput.value = viewTitle.textContent;
    contentInput.value = viewContent.textContent;
    authorInput.value = viewAuthor.textContent;
    categoryInput.value = viewCategory.textContent;
    importFileInput.value = '';
    
    // Extract Tags
    const tagsElements = viewTags.querySelectorAll('.tag');
    const tagsObj = Array.from(tagsElements).map(el => el.textContent.replace('#', ''));
    tagsInput.value = tagsObj.join(', ');

    modalTitle.textContent = "Modifier l'Article";
    articleModal.classList.remove('hidden');
});

// Delete from View
document.getElementById('deleteFromViewBtn').addEventListener('click', async () => {
    if (!confirm("Voulez-vous vraiment supprimer cet article de façon permanente ?")) return;
    
    try {
        await fetch(`${API_BASE}/${currentArticleId}`, { method: 'DELETE' });
        viewModal.classList.add('hidden');
        await fetchArticles();
    } catch (err) {
        console.error(err);
        alert("Erreur lors de la suppression.");
    }
});

// Small sanitization to prevent basic XSS from displaying payload data
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return (unsafe + '')
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

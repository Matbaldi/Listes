const AUTH_KEY = 'adminAuth';

function getAuthHeader() {
    const token = sessionStorage.getItem(AUTH_KEY);
    return token ? { 'Authorization': token } : {};
}

function textUnderscoreMin(text) {
    return text.replace(/ /g, '_').toLowerCase();
}

async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...getAuthHeader(),
            ...(options.headers || {}),
        },
    });

    if (res.status === 401) {
        sessionStorage.removeItem(AUTH_KEY);
        showLogin('Ta session a expiré, reconnecte-toi.');
        throw new Error('Non autorisé');
    }

    return res;
}

const loginView = document.getElementById('login-view');
const adminApp = document.getElementById('admin-app');
const loginError = document.getElementById('login-error');

function showLogin(message) {
    loginView.classList.remove('d-none');
    adminApp.classList.add('d-none');
    if (message) {
        loginError.textContent = message;
        loginError.classList.remove('d-none');
    }
}

function showApp() {
    loginView.classList.add('d-none');
    adminApp.classList.remove('d-none');
    loadCategories();
    loadItems();
}

document.getElementById('login-submit').addEventListener('click', async () => {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value;
    const token = 'Basic ' + btoa(`${user}:${pass}`);
    sessionStorage.setItem(AUTH_KEY, token);

    try {
        const res = await fetch('/api/admin/ping', { headers: getAuthHeader() });
        if (res.ok) {
            loginError.classList.add('d-none');
            showApp();
        } else {
            sessionStorage.removeItem(AUTH_KEY);
            loginError.textContent = 'Identifiants incorrects.';
            loginError.classList.remove('d-none');
        }
    } catch {
        loginError.textContent = 'Erreur de connexion au serveur.';
        loginError.classList.remove('d-none');
    }
});

(async function initAuth() {
    const token = sessionStorage.getItem(AUTH_KEY);
    if (!token) return;
    try {
        const res = await fetch('/api/admin/ping', { headers: getAuthHeader() });
        if (res.ok) showApp();
        else sessionStorage.removeItem(AUTH_KEY);
    } catch {
    }
})();

document.getElementById('tab-items-btn').addEventListener('shown.bs.tab', () => {
    loadItems(document.getElementById('items-filter').value);
});

let categoriesCache = [];

async function loadCategories() {
    const res = await fetch('/api/categories');
    categoriesCache = await res.json();
    renderCategories();
    populateCategorySelects();
}

function renderCategories() {
    const row = document.getElementById('categories-row');
    row.innerHTML = '';

    if (categoriesCache.length === 0) {
        row.innerHTML = '<div class="admin-empty col-12">Aucune catégorie pour le moment.</div>';
        return;
    }

    categoriesCache.forEach(cat => {
        const col = document.createElement('div');
        col.className = 'col admin-card-wrapper';

        col.innerHTML = `
            <div class="admin-card-actions btn-group">
                <button type="button" class="btn btn-sm btn-outline-secondary edit-btn" title="Modifier">✎</button>
                <button type="button" class="btn btn-sm btn-outline-danger delete-btn" title="Supprimer">✕</button>
            </div>
            <div class="card h-100">
                <img src="${cat.url || ''}" class="img-card-size mt-3 mb-3" alt="${cat.alt || ''}">
                <div class="card-body">
                    <h5 class="card-title">${cat.name}</h5>
                </div>
            </div>
        `;

        col.querySelector('.edit-btn').addEventListener('click', () => openCategoryModal(cat));
        col.querySelector('.delete-btn').addEventListener('click', () => deleteCategory(cat));

        row.appendChild(col);
    });
}

function populateCategorySelects() {
    const filterSelect = document.getElementById('items-filter');
    const modalSelect = document.getElementById('item-platform');

    const filterCurrent = filterSelect.value;
    const modalCurrent = modalSelect.value;

    filterSelect.innerHTML = '<option value="">Toutes les catégories</option>';
    modalSelect.innerHTML = '';

    categoriesCache.forEach(cat => {
        const slug = textUnderscoreMin(cat.name);

        const opt1 = document.createElement('option');
        opt1.value = slug;
        opt1.textContent = cat.name;
        filterSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = slug;
        opt2.textContent = cat.name;
        modalSelect.appendChild(opt2);
    });

    if ([...filterSelect.options].some(o => o.value === filterCurrent)) {
        filterSelect.value = filterCurrent;
    }
    if ([...modalSelect.options].some(o => o.value === modalCurrent)) {
        modalSelect.value = modalCurrent;
    }
}

document.getElementById('items-filter').addEventListener('change', () => {
    loadItems(document.getElementById('items-filter').value);
});

const categoryModalEl = document.getElementById('category-modal');
const categoryModal = new bootstrap.Modal(categoryModalEl);

function openCategoryModal(cat) {
    document.getElementById('category-modal-title').textContent = cat ? 'Modifier la catégorie' : 'Ajouter une catégorie';
    document.getElementById('category-id').value = cat ? cat.id : '';
    document.getElementById('category-name').value = cat ? cat.name : '';
    document.getElementById('category-alt').value = cat ? (cat.alt || '') : '';
    document.getElementById('category-url').value = cat ? (cat.url || '') : '';
    updatePreview('category-url', 'category-preview');
    categoryModal.show();
}

document.getElementById('add-category-btn').addEventListener('click', () => openCategoryModal(null));

document.getElementById('category-url').addEventListener('input', () => updatePreview('category-url', 'category-preview'));

document.getElementById('category-save-btn').addEventListener('click', async () => {
    const id = document.getElementById('category-id').value;
    const payload = {
        name: document.getElementById('category-name').value.trim(),
        alt: document.getElementById('category-alt').value.trim(),
        url: document.getElementById('category-url').value.trim(),
    };

    if (!payload.name) {
        alert('Le nom est requis.');
        return;
    }

    try {
        const res = await apiFetch('/api/admin/categories', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify(id ? { id, ...payload } : payload),
        });
        if (!res.ok) {
            const err = await res.json();
            alert('Erreur : ' + (err.error || res.statusText));
            return;
        }
        categoryModal.hide();
        await loadCategories();
    } catch {
    }
});

async function deleteCategory(cat) {
    if (!confirm(`Supprimer la catégorie "${cat.name}" ? Les articles associés resteront en base mais n'apparaîtront plus dans aucune liste.`)) return;

    try {
        const res = await apiFetch(`/api/admin/categories?id=${cat.id}`, { method: 'DELETE' });
        if (!res.ok && res.status !== 204) {
            const err = await res.json();
            alert('Erreur : ' + (err.error || res.statusText));
            return;
        }
        await loadCategories();
    } catch {
    }
}

async function loadItems(platform) {
    const url = platform ? `/api/items?platform=${encodeURIComponent(platform)}` : '/api/items';
    const res = await fetch(url);
    const items = await res.json();
    renderItems(items);
}

function renderItems(items) {
    const row = document.getElementById('items-row');
    row.innerHTML = '';

    if (items.length === 0) {
        row.innerHTML = '<div class="admin-empty col-12">Aucun article pour cette sélection.</div>';
        return;
    }

    items.forEach(item => {
        const col = document.createElement('div');
        col.className = 'col admin-card-wrapper';
console.log(item);
        col.innerHTML = `
            <div class="admin-card-actions btn-group">
                <button type="button" class="btn btn-sm btn-outline-secondary edit-btn" title="Modifier">✎</button>
                <button type="button" class="btn btn-sm btn-outline-danger delete-btn" title="Supprimer">✕</button>
            </div>
            <div class="card h-100">
                <img src="${item.url || ''}" class="img-card-size mt-3 mb-3" alt="${item.alt || ''}">
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text mb-0">${item.price || ''}</p>
                    ${item.date ? `<p class="card-text mb-0">Sortie le ${item.date}</p>` : ''}
                    <span class="badge text-bg-light mt-2">${item.platform}</span>
                </div>
            </div>
        `;

        col.querySelector('.edit-btn').addEventListener('click', () => openItemModal(item));
        col.querySelector('.delete-btn').addEventListener('click', () => deleteItem(item));

        row.appendChild(col);
    });
}

const itemModalEl = document.getElementById('item-modal');
const itemModal = new bootstrap.Modal(itemModalEl);

function openItemModal(item) {
    document.getElementById('item-modal-title').textContent = item ? "Modifier l'article" : 'Ajouter un article';
    document.getElementById('item-id').value = item ? item.id : '';
    document.getElementById('item-platform').value = item ? item.platform : (document.getElementById('items-filter').value || '');
    document.getElementById('item-name').value = item ? item.name : '';
    document.getElementById('item-price').value = item ? (item.price || '') : '';
    document.getElementById('item-alt').value = item ? (item.alt || '') : '';
    document.getElementById('item-url').value = item ? (item.url || '') : '';
    document.getElementById('item-date').value = item ? (item.date || '') : '';
    updatePreview('item-url', 'item-preview');
    itemModal.show();
}

document.getElementById('add-item-btn').addEventListener('click', () => openItemModal(null));

document.getElementById('item-url').addEventListener('input', () => updatePreview('item-url', 'item-preview'));

document.getElementById('item-save-btn').addEventListener('click', async () => {
    const id = document.getElementById('item-id').value;
    const payload = {
        platform: document.getElementById('item-platform').value,
        name: document.getElementById('item-name').value.trim(),
        price: document.getElementById('item-price').value.trim(),
        alt: document.getElementById('item-alt').value.trim(),
        url: document.getElementById('item-url').value.trim(),
        date: document.getElementById('item-date').value.trim(),
    };

    if (!payload.platform || !payload.name) {
        alert('La catégorie et le nom sont requis.');
        return;
    }

    try {
        const res = await apiFetch('/api/admin/items', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify(id ? { id, ...payload } : payload),
        });
        if (!res.ok) {
            const err = await res.json();
            alert('Erreur : ' + (err.error || res.statusText));
            return;
        }
        itemModal.hide();
        await loadItems(document.getElementById('items-filter').value);
    } catch {
    }
});

async function deleteItem(item) {
    if (!confirm(`Supprimer "${item.name}" ?`)) return;

    try {
        const res = await apiFetch(`/api/admin/items?id=${item.id}`, { method: 'DELETE' });
        if (!res.ok && res.status !== 204) {
            const err = await res.json();
            alert('Erreur : ' + (err.error || res.statusText));
            return;
        }
        await loadItems(document.getElementById('items-filter').value);
    } catch {
    }
}

function updatePreview(inputId, previewId) {
    const url = document.getElementById(inputId).value.trim();
    const img = document.getElementById(previewId);
    if (url) {
        img.src = url;
        img.classList.remove('d-none');
    } else {
        img.classList.add('d-none');
        img.src = '';
    }
}
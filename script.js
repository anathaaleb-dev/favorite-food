// Endpoint API DummyJSON Recipes
const API_URL = 'https://dummyjson.com/recipes';

// State Aplikasi
let allRecipes = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentView = 'home'; // 'home' atau 'favorites'

// Elemen DOM
const recipeContainer = document.getElementById('recipe-container');
const searchInput = document.getElementById('search-input');
const filterTag = document.getElementById('filter-tag');
const btnHome = document.getElementById('btn-home');
const btnFavorites = document.getElementById('btn-favorites');
const favCount = document.getElementById('fav-count');
const searchFilterSection = document.getElementById('search-filter-section');
const recipeDetailSection = document.getElementById('recipe-detail-section');
const detailContent = document.getElementById('detail-content');
const btnBack = document.getElementById('btn-back');

// --- 1. FETCH DATA DARI API ---
async function fetchRecipes() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        allRecipes = data.recipes;
        
        populateTags(allRecipes);
        displayRecipes(allRecipes);
        updateFavCount();
    } catch (error) {
        console.error('Gagal mengambil data:', error);
        recipeContainer.innerHTML = '<p>Gagal memuat resep. Silakan periksa koneksi internet Anda.</p>';
    }
}

// --- 2. TAMPILKAN DAFTAR RESEP KE HTML ---
function displayRecipes(recipesToDisplay) {
    recipeContainer.innerHTML = '';

    if (recipesToDisplay.length === 0) {
        recipeContainer.innerHTML = '<p>Tidak ada resep yang ditemukan.</p>';
        return;
    }

    recipesToDisplay.forEach(recipe => {
        const isFav = favorites.some(fav => fav.id === recipe.id);
        
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.name}">
            <div class="recipe-info">
                <div>
                    <h3>${recipe.name}</h3>
                    <p>⭐ ${recipe.rating} | ⏱️ ${recipe.prepTimeMinutes + recipe.cookTimeMinutes} Menit</p>
                </div>
                <div class="card-actions">
                    <button class="btn-primary" onclick="showDetail(${recipe.id})">Lihat Detail</button>
                    <button class="btn-fav ${isFav ? 'active' : ''}" onclick="toggleFavorite(${recipe.id})">❤️</button>
                </div>
            </div>
        `;
        recipeContainer.appendChild(card);
    });
}

// --- 3. ISI PILIHAN KATEGORI/TAG SECARA OTOMATIS ---
function populateTags(recipes) {
    const tagsSet = new Set();
    recipes.forEach(recipe => {
        if (recipe.tags) {
            recipe.tags.forEach(tag => tagsSet.add(tag));
        }
    });

    tagsSet.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
        filterTag.appendChild(option);
    });
}

// --- 4. FITUR SEARCH & FILTER ---
function filterAndSearchRecipes() {
    const keyword = searchInput.value.toLowerCase();
    const selectedTag = filterTag.value;

    let filtered = allRecipes.filter(recipe => {
        const matchesName = recipe.name.toLowerCase().includes(keyword);
        const matchesTag = selectedTag === '' || (recipe.tags && recipe.tags.includes(selectedTag));
        return matchesName && matchesTag;
    });

    // Jika sedang di tab favorit, filter ulang berdasarkan daftar favorit
    if (currentView === 'favorites') {
        filtered = filtered.filter(recipe => favorites.some(fav => fav.id === recipe.id));
    }

    displayRecipes(filtered);
}

searchInput.addEventListener('input', filterAndSearchRecipes);
filterTag.addEventListener('change', filterAndSearchRecipes);

// --- 5. LIHAT DETAIL RESEP ---
function showDetail(id) {
    const recipe = allRecipes.find(r => r.id === id);
    if (!recipe) return;

    searchFilterSection.classList.add('hidden');
    recipeContainer.classList.add('hidden');
    recipeDetailSection.classList.remove('hidden');

    detailContent.innerHTML = `
        <div class="detail-header">
            <img src="${recipe.image}" alt="${recipe.name}">
            <div class="detail-info">
                <h2>${recipe.name}</h2>
                <p><strong>Kategori/Tags:</strong> ${recipe.tags ? recipe.tags.join(', ') : '-'}</p>
                <p><strong>Waktu Persiapan:</strong> ${recipe.prepTimeMinutes} menit</p>
                <p><strong>Waktu Masak:</strong> ${recipe.cookTimeMinutes} menit</p>
                <p><strong>Porsi:</strong> ${recipe.servings} orang</p>
                <p><strong>Rating:</strong> ⭐ ${recipe.rating} (${recipe.reviewCount} ulasan)</p>
            </div>
        </div>
        <h3>Bahan-bahan:</h3>
        <ul class="ingredients-list">
            ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
        </ul>
        <h3>Langkah-langkah Pembuatan:</h3>
        <ol class="instructions-list">
            ${recipe.instructions.map(ins => `<li>${ins}</li>`).join('')}
        </ol>
    `;
}

btnBack.addEventListener('click', () => {
    recipeDetailSection.classList.add('hidden');
    searchFilterSection.classList.remove('hidden');
    recipeContainer.classList.remove('hidden');
});

// --- 6. LOCALSTORAGE & FAVORIT ---
function toggleFavorite(id) {
    const recipe = allRecipes.find(r => r.id === id);
    const index = favorites.findIndex(fav => fav.id === id);

    if (index > -1) {
        favorites.splice(index, 1); // Hapus dari favorit jika sudah ada
    } else {
        favorites.push(recipe); // Tambahkan ke favorit
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavCount();

    // Refresh tampilan sesuai halaman aktif
    if (currentView === 'favorites') {
        displayRecipes(favorites);
    } else {
        filterAndSearchRecipes();
    }
}

function updateFavCount() {
    favCount.textContent = favorites.length;
}

// --- 7. NAVIGASI BERANDA & FAVORIT ---
btnHome.addEventListener('click', () => {
    currentView = 'home';
    btnHome.classList.add('active');
    btnFavorites.classList.remove('active');
    searchFilterSection.classList.remove('hidden');
    recipeDetailSection.classList.add('hidden');
    recipeContainer.classList.remove('hidden');
    filterAndSearchRecipes();
});

btnFavorites.addEventListener('click', () => {
    currentView = 'favorites';
    btnFavorites.classList.add('active');
    btnHome.classList.remove('active');
    searchFilterSection.classList.add('hidden');
    recipeDetailSection.classList.add('hidden');
    recipeContainer.classList.remove('hidden');
    displayRecipes(favorites);
});

// Jalankan aplikasi saat halaman dimuat
fetchRecipes();
document.addEventListener('DOMContentLoaded', () => {
  const animeList = document.getElementById('anime-list');
  const animeTitleInput = document.getElementById('anime-title');
  const addAnimeButton = document.getElementById('add-anime');
  const animeSearchInput = document.getElementById('anime-search');
  const animeCountDisplay = document.getElementById('anime-count');


  // Array for ordered display + Map for quick duplicate checking
  let animeArray = [];
  let animeTitleMap = new Map();

  const STORAGE_KEY = 'animeList';

  // Load data
  const loadData = () => {
    const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    animeArray = Array.isArray(savedData) ? savedData : [];

    animeTitleMap.clear();
    animeArray.forEach((anime, index) => {
      if (anime && anime.title) animeTitleMap.set(anime.title.toLowerCase(), index);
    });
  };

  loadData();

  let saveTimeout = null;
  let renderTimeout = null;
  let isRendering = false;

  // Batch localStorage updates
  function saveAnimeData() {
    if (saveTimeout) clearTimeout(saveTimeout);

    saveTimeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(animeArray));
      saveTimeout = null;
    }, 300);
  }

  function capitalizeFirstLetter(string) {
    return string
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function rebuildTitleMap() {
    animeTitleMap.clear();
    animeArray.forEach((anime, idx) => {
      animeTitleMap.set(anime.title.toLowerCase(), idx);
    });
  }

  // ✅ Proper virtual scrolling (renders based on scroll position)
function renderAnimeList() {
  const searchTerm = (animeSearchInput.value || '').toLowerCase();

  const filtered = searchTerm
    ? animeArray.filter(a => a.title.toLowerCase().includes(searchTerm))
    : animeArray;

  animeCountDisplay.textContent = `${filtered.length}`;

  animeList.innerHTML = '';
  const fragment = document.createDocumentFragment();

  filtered.forEach((anime, i) => {
    const li = document.createElement('li');
    li.className = 'anime-row'; //  for styling

    const titleSpan = document.createElement('span');
    titleSpan.className = 'anime-title-span';
    titleSpan.textContent = `${i + 1}. ${anime.title}`;

    const btn = document.createElement('button');
    btn.className = 'watch-count-button';
    // IMPORTANT: use the real index from animeArray 
    const realIndex = animeArray.indexOf(anime);
    btn.dataset.index = String(realIndex);
    btn.textContent = `${anime.watchCount || 0}`;

    li.appendChild(titleSpan);
    li.appendChild(btn);
    fragment.appendChild(li);
  });

  animeList.appendChild(fragment);
}

  // Click handler bound ONCE 
  animeList.addEventListener('click', (e) => {
    const btn = e.target.closest('.watch-count-button');
    if (!btn) return;

    const index = parseInt(btn.dataset.index, 10);
    if (Number.isNaN(index) || !animeArray[index]) return;

    animeArray[index].watchCount = (animeArray[index].watchCount || 0) + 1;
    saveAnimeData();

    // Update only the clicked button text
    btn.textContent = ` ${animeArray[index].watchCount}`;
  });

  // Add anime
  function addAnime() {
    let title = animeTitleInput.value.trim();
    if (!title) return;

    title = capitalizeFirstLetter(title);
    const key = title.toLowerCase();

    if (animeTitleMap.has(key)) {
      alert('Anime already exists in the list.');
      return;
    }

    animeArray.push({ title, watchCount: 0 });
    rebuildTitleMap();

    saveAnimeData();
    animeTitleInput.value = '';
    renderAnimeList();
  }

  // Delete anime by index
  function deleteAnime(index) {
    if (!animeArray[index]) return;

    animeArray.splice(index, 1);
    rebuildTitleMap();

    saveAnimeData();
    renderAnimeList();
  }

  // Initial render
  renderAnimeList();

  // Enter key adds
  animeTitleInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addAnime();
    }
  });

  addAnimeButton.addEventListener('click', addAnime);

  // Search (debounced)
  animeSearchInput.addEventListener('input', () => {
    if (renderTimeout) clearTimeout(renderTimeout);
    renderTimeout = setTimeout(renderAnimeList, 120);
  });

  // Scroll + resize rerender
  window.addEventListener(
    'scroll',
    () => {
      if (!isRendering) renderAnimeList();
    },
    { passive: true }
  );

  window.addEventListener(
    'resize',
    () => {
      if (renderTimeout) clearTimeout(renderTimeout);
      renderTimeout = setTimeout(renderAnimeList, 120);
    },
    { passive: true }
  );

});

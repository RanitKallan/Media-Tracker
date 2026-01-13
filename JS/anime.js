document.addEventListener('DOMContentLoaded', () => {
  const animeList = document.getElementById('anime-list');
  const animeTitleInput = document.getElementById('anime-title');
  const addAnimeButton = document.getElementById('add-anime');
  const animeSearchInput = document.getElementById('anime-search');
  const animeCountDisplay = document.getElementById('anime-count');

  const STORAGE_KEY = 'animeList';

  // Main data
  let animeArray = [];
  let animeTitleMap = new Map();

  let saveTimeout = null;
  let renderTimeout = null;

  function saveAnimeData() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(animeArray));
      saveTimeout = null;
    }, 200);
  }

  function capitalizeFirstLetter(str) {
    return String(str || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  function rebuildTitleMap() {
    animeTitleMap.clear();
    animeArray.forEach((anime, idx) => {
      animeTitleMap.set(anime.title.toLowerCase(), idx);
    });
  }

  // ✅ Load + CLEAN bad entries so render never breaks mid-list
  function loadData() {
    let savedData = [];
    try {
      savedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      savedData = [];
    }

    const cleaned = (Array.isArray(savedData) ? savedData : [])
      .filter(a => a && typeof a === 'object' && typeof a.title === 'string' && a.title.trim().length > 0)
      .map(a => ({
        title: a.title.trim(),
        watchCount: Number.isFinite(Number(a.watchCount)) ? Number(a.watchCount) : 0
      }));

    animeArray = cleaned;
    rebuildTitleMap();

    // Persist cleaned version so the bug never returns
    localStorage.setItem(STORAGE_KEY, JSON.stringify(animeArray));
  }

  function renderAnimeList() {
    const searchTerm = (animeSearchInput.value || '').toLowerCase().trim();

    // Keep original indices so watch count updates correct item
    const filtered = searchTerm
      ? animeArray
          .map((anime, idx) => ({ anime, idx }))
          .filter(({ anime }) => anime.title.toLowerCase().includes(searchTerm))
      : animeArray.map((anime, idx) => ({ anime, idx }));

    animeCountDisplay.textContent = `${filtered.length}`;

    animeList.innerHTML = '';
    const fragment = document.createDocumentFragment();

    filtered.forEach(({ anime, idx }, i) => {
      const li = document.createElement('li');
      li.className = 'anime-row';
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'center';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'anime-title-span';
      // ✅ SAFE: textContent prevents titles breaking your HTML
      titleSpan.textContent = `${i + 1}. ${anime.title}`;

      const btn = document.createElement('button');
      btn.className = 'watch-count-button';
      btn.dataset.index = String(idx);
      btn.textContent = `${anime.watchCount || 0}`;

      li.appendChild(titleSpan);
      li.appendChild(btn);
      fragment.appendChild(li);
    });

    animeList.appendChild(fragment);
  }

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

  // ✅ Click handler (watch count increment) — bound once
  animeList.addEventListener('click', (e) => {
    const btn = e.target.closest('.watch-count-button');
    if (!btn) return;

    const index = parseInt(btn.dataset.index, 10);
    if (Number.isNaN(index) || !animeArray[index]) return;

    animeArray[index].watchCount = (animeArray[index].watchCount || 0) + 1;
    saveAnimeData();

    btn.textContent = `${animeArray[index].watchCount}`;
  });

  // Enter adds
  animeTitleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAnime();
    }
  });

  addAnimeButton.addEventListener('click', addAnime);

  // Search (debounced)
  animeSearchInput.addEventListener('input', () => {
    if (renderTimeout) clearTimeout(renderTimeout);
    renderTimeout = setTimeout(renderAnimeList, 80);
  });

  // Init
  loadData();
  renderAnimeList();
});

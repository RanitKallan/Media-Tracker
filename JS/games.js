// Top 10 Anime List (manual ranking + move up/down)
document.addEventListener("DOMContentLoaded", () => {
  // Keep existing HTML IDs so you don't have to edit the HTML
  const animeTitleInput = document.getElementById("game-title");
  const addAnimeButton = document.getElementById("add-game");
  const animeListEl = document.getElementById("game-list");
  const searchInput = document.getElementById("game-search");
  const countEl = document.getElementById("game-count");

  const MAX = 10;
  const STORAGE_KEY = "top10Anime";

  let topAnime = safeLoad();

  function safeLoad() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.slice(0, MAX) : [];
    } catch {
      return [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topAnime));
  }

  function normalizeTitle(title) {
    return title
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  function updateCount() {
    if (!countEl) return;
    countEl.textContent = `${topAnime.length} / ${MAX}`;
  }

  function addAnime() {
    const raw = animeTitleInput.value || "";
    let title = normalizeTitle(raw);

    if (!title) return;

    if (topAnime.length >= MAX) {
      alert(`Top 10 means max ${MAX} anime. Remove one to add another.`);
      return;
    }

    const exists = topAnime.some(a => a.title.toLowerCase() === title.toLowerCase());
    if (exists) {
      alert("That anime is already in your Top 10.");
      return;
    }

    topAnime.push({ title });
    save();
    animeTitleInput.value = "";
    render(searchInput.value);
    updateCount();
  }

  function removeAnime(index) {
    topAnime.splice(index, 1);
    save();
    render(searchInput.value);
    updateCount();
  }

  function move(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= topAnime.length) return;

    const temp = topAnime[index];
    topAnime[index] = topAnime[newIndex];
    topAnime[newIndex] = temp;

    save();
    render(searchInput.value);
    updateCount();
  }

  function render(query = "") {
    const q = (query || "").trim().toLowerCase();
    animeListEl.innerHTML = "";

    // Keep REAL indexes so moving still moves the true rank even when searching
    const visible = topAnime
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => item.title.toLowerCase().includes(q));

    visible.forEach(({ item, idx }) => {
      const li = document.createElement("li");

      li.innerHTML = `
        <div class="media-item-content" style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
          <div class="media-item-text">
            <strong>${idx + 1}.</strong> ${item.title}
          </div>

          <div class="rank-controls">
            <button class="rank-btn up" data-index="${idx}" ${idx === 0 ? "disabled" : ""} title="Move up">
              ▲
            </button>
            <button class="rank-btn down" data-index="${idx}" ${idx === topAnime.length - 1 ? "disabled" : ""} title="Move down">
              ▼
            </button>
            <button class="rank-btn delete" data-index="${idx}" title="Remove">
              ✕
            </button>
          </div>
        </div>
      `;

      animeListEl.appendChild(li);
    });
  }

  // Event wiring
  addAnimeButton.addEventListener("click", addAnime);

  animeTitleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addAnime();
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => render(searchInput.value));
  }

  // Delegated button events (so it works after re-render)
  animeListEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const index = Number(btn.dataset.index);
  if (Number.isNaN(index)) return;

  if (btn.classList.contains("up")) move(index, -1);
  if (btn.classList.contains("down")) move(index, +1);
  if (btn.classList.contains("delete")) removeAnime(index);
  });

  // First paint
  render();
  updateCount();
});

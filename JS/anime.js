document.addEventListener('DOMContentLoaded', () => {
    const animeList = document.getElementById('anime-list');
    const animeTitleInput = document.getElementById('anime-title');
    const addAnimeButton = document.getElementById('add-anime');
    const animeSearchInput = document.getElementById('anime-search');
    const animeCountDisplay = document.getElementById('anime-count');
    const deleteSelectedButton = document.getElementById('delete-selected-anime');

    let animeData = JSON.parse(localStorage.getItem('animeList')) || [];
    let saveTimeout = null;

    // Function to batch localStorage updates
    function saveAnimeData() {
        // Clear any existing timeout
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        
        // Set a new timeout - only save after 500ms of inactivity
        saveTimeout = setTimeout(() => {
            localStorage.setItem('animeList', JSON.stringify(animeData));
            saveTimeout = null;
        }, 500);
    }

    function capitalizeFirstLetter(string) {
        return string.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function renderAnimeList() {
        animeList.innerHTML = '';
        const searchTerm = animeSearchInput.value.toLowerCase();
        const filteredAnime = animeData.filter(anime => anime.title.toLowerCase().includes(searchTerm));

        filteredAnime.forEach((anime, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span class="anime-title-span">${index + 1}. ${anime.title}</span>
                <button class="watch-count-button" data-index="${index}"> ${anime.watchCount || 0}</button>
            `;
            animeList.appendChild(listItem);

            listItem.querySelector('.watch-count-button').addEventListener('click', () => {
                anime.watchCount = (anime.watchCount || 0) + 1;
                // Use batched save instead of immediate save
                saveAnimeData();
                renderAnimeList();
            });
        });

        animeCountDisplay.textContent = `${filteredAnime.length}`;
    }

    // Function to add anime
    function addAnime() {
        let title = animeTitleInput.value.trim();
        if (title) {
            title = capitalizeFirstLetter(title);
            if (!animeData.some(anime => anime.title === title)) {
                animeData.push({ title: title, watchCount: 0 });
                // Use batched save instead of immediate save
                saveAnimeData();
                animeTitleInput.value = '';
                renderAnimeList();
            } else {
                alert("Anime already exists in the list.");
            }
        }
    }

    renderAnimeList();

    // Add event listener for Enter key on input field
    animeTitleInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission if within a form
            addAnime();
        }
    });

    // Keep the existing click handler
    addAnimeButton.addEventListener('click', addAnime);

    animeSearchInput.addEventListener('input', () => {
        renderAnimeList();
    });

    // If this button exists in your HTML
    if (deleteSelectedButton) {
        deleteSelectedButton.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.anime-checkbox:checked');
            const indicesToDelete = Array.from(checkboxes).map(checkbox => parseInt(checkbox.dataset.index)).sort((a, b) => b - a);
            indicesToDelete.forEach(index => animeData.splice(index, 1));
            // Use batched save instead of immediate save
            saveAnimeData();
            renderAnimeList();
        });
    }
});
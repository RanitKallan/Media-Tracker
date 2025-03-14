// anime.js
document.addEventListener('DOMContentLoaded', function() {
    const animeTitleInput = document.getElementById('anime-title');
    const addAnimeButton = document.getElementById('add-anime');
    const animeList = document.getElementById('anime-list');
    const animeSearchInput = document.getElementById('anime-search');
    const deleteSelectedAnimeButton = document.getElementById('delete-selected-anime');
    const animeCount = document.getElementById('anime-count');

    async function fetchAnimeImage(title) {
        try {
            // Replace with your actual API endpoint and key
            const response = await fetch(`YOUR_ANIDB_API_ENDPOINT?title=${encodeURIComponent(title)}&YOUR_API_KEY`);
            const data = await response.json();

            if (data && data.image) {
                return data.image;
            } else {
                return '';
            }
        } catch (error) {
            console.error('Error fetching anime image:', error);
            return '';
        }
    }

    async function addAnime() {
        let title = animeTitleInput.value.trim();

        if (title) {
            title = title.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            const animeData = JSON.parse(localStorage.getItem('animeList')) || [];
            if (animeData.some(anime => anime.title.toLowerCase() === title.toLowerCase())) {
                alert('Anime with this name already exists.');
                return;
            }

            const image = await fetchAnimeImage(title);
            const anime = { title: title, image: image };
            animeData.push(anime);
            localStorage.setItem('animeList', JSON.stringify(animeData));

            animeTitleInput.value = '';
            displayAnimeList(animeSearchInput.value);
            updateAnimeCount();
        }
    }

    function displayAnimeList(searchTerm = '') {
        animeList.innerHTML = '';
        const animeData = JSON.parse(localStorage.getItem('animeList')) || [];

        const filteredAnime = animeData.filter(anime =>
            anime.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filteredAnime.forEach((anime, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div class="media-item-content">
                    <div class="media-item-text">
                        ${index + 1}. ${anime.title}
                    </div>
                    <div class="media-item-image">
                        <img src="${anime.image}" alt="${anime.title}" onerror="this.style.display='none'">
                    </div>
                </div>
            `;
            listItem.dataset.index = index;
            animeList.appendChild(listItem);
        });
    }

    function updateAnimeCount() {
        const animeData = JSON.parse(localStorage.getItem('animeList')) || [];
        animeCount.textContent = animeData.length;
    }

    displayAnimeList();
    updateAnimeCount();

    animeTitleInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            addAnime();
        }
    });

    addAnimeButton.addEventListener('click', addAnime);

    animeSearchInput.addEventListener('input', function() {
        displayAnimeList(animeSearchInput.value);
    });

    deleteSelectedAnimeButton.addEventListener('click', function() {
        const selectedItems = Array.from(animeList.querySelectorAll('li.selected'));
        const animeData = JSON.parse(localStorage.getItem('animeList')) || [];
        const indicesToDelete = selectedItems.map(item => parseInt(item.dataset.index)).sort((a, b) => b - a);

        indicesToDelete.forEach(index => {
            animeData.splice(index, 1);
        });

        localStorage.setItem('animeList', JSON.stringify(animeData));
        displayAnimeList(animeSearchInput.value);
        updateAnimeCount();
    });

    animeList.addEventListener('click', function(event) {
        const listItem = event.target.closest('li');
        if (listItem) {
            listItem.classList.toggle('selected');
        }
    });
});

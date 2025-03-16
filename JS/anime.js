document.addEventListener('DOMContentLoaded', () => {
    const animeList = document.getElementById('anime-list');
    const animeTitleInput = document.getElementById('anime-title');
    const addAnimeButton = document.getElementById('add-anime');
    const animeSearchInput = document.getElementById('anime-search');
    const animeCountDisplay = document.getElementById('anime-count');
    const deleteSelectedButton = document.getElementById('delete-selected-anime');

    let animeData = JSON.parse(localStorage.getItem('animeList')) || [];

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
                localStorage.setItem('animeList', JSON.stringify(animeData));
                renderAnimeList();
            });
        });

        animeCountDisplay.textContent = `${filteredAnime.length}`;
    }

    renderAnimeList();

    addAnimeButton.addEventListener('click', () => {
        let title = animeTitleInput.value.trim();
        if (title) {
            title = capitalizeFirstLetter(title);
            if (!animeData.some(anime => anime.title === title)) {
                animeData.push({ title: title, watchCount: 0 });
                localStorage.setItem('animeList', JSON.stringify(animeData));
                animeTitleInput.value = '';
                renderAnimeList();
            } else {
                alert("Anime already exists in the list.");
            }
        }
    });

    animeSearchInput.addEventListener('input', () => {
        renderAnimeList();
    });

    deleteSelectedButton.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.anime-checkbox:checked');
        const indicesToDelete = Array.from(checkboxes).map(checkbox => parseInt(checkbox.dataset.index)).sort((a, b) => b - a);
        indicesToDelete.forEach(index => animeData.splice(index, 1));
        localStorage.setItem('animeList', JSON.stringify(animeData));
        renderAnimeList();
    });
});
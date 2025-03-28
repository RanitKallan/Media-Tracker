// games.js
document.addEventListener('DOMContentLoaded', function() {
    const gameTitleInput = document.getElementById('game-title');
    const addGameButton = document.getElementById('add-game');
    const gameList = document.getElementById('game-list');
    const gameSearchInput = document.getElementById('game-search');
    const deleteSelectedGameButton = document.getElementById('delete-selected-game');
    const gameCount = document.getElementById('game-count');

    let gameData = JSON.parse(localStorage.getItem('gameList')) || [];
    let saveTimeout = null;

    // Function to batch localStorage updates
    function saveGameData() {
        // Clear any existing timeout
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        
        // Set a new timeout - only save after 500ms of inactivity
        saveTimeout = setTimeout(() => {
            localStorage.setItem('gameList', JSON.stringify(gameData));
            saveTimeout = null;
        }, 500);
    }

    async function fetchGameImage(title) {
        try {
            // Replace with your actual API endpoint and key
            const response = await fetch(`YOUR_IGDB_API_ENDPOINT?title=${encodeURIComponent(title)}&YOUR_API_KEY`);
            const data = await response.json();

            if (data && data.cover && data.cover.url) {
                return data.cover.url;
            } else {
                return '';
            }
        } catch (error) {
            console.error('Error fetching game image:', error);
            return '';
        }
    }

    async function addGame() {
        let title = gameTitleInput.value.trim();

        if (title) {
            title = title.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            if (gameData.some(game => game.title.toLowerCase() === title.toLowerCase())) {
                alert('Game with this name already exists.');
                return;
            }

            const image = await fetchGameImage(title);
            const game = { title: title, image: image };
            gameData.push(game);

            // Sort the gameData array alphabetically by title
            gameData.sort((a, b) => a.title.localeCompare(b.title));

            // Use batched save instead of immediate save
            saveGameData();

            gameTitleInput.value = '';
            displayGameList(gameSearchInput.value);
            updateGameCount();
        }
    }

    function displayGameList(searchTerm = '') {
        gameList.innerHTML = '';
        
        const filteredGames = gameData.filter(game =>
            game.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filteredGames.forEach((game, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div class="media-item-content">
                    <div class="media-item-text">
                        ${index + 1}. ${game.title}
                    </div>
                    <div class="media-item-image">
                        <img src="${game.image}" alt="${game.title}" onerror="this.style.display='none'">
                    </div>
                </div>
            `;
            listItem.dataset.index = index;
            gameList.appendChild(listItem);
        });
    }

    function updateGameCount() {
        gameCount.textContent = gameData.length;
    }

    displayGameList();
    updateGameCount();

    gameTitleInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            addGame();
        }
    });

    addGameButton.addEventListener('click', addGame);

    gameSearchInput.addEventListener('input', function() {
        displayGameList(gameSearchInput.value);
    });

    // If this button exists in your HTML
    if (deleteSelectedGameButton) {
        deleteSelectedGameButton.addEventListener('click', function() {
            const selectedItems = Array.from(gameList.querySelectorAll('li.selected'));
            const indicesToDelete = selectedItems.map(item => parseInt(item.dataset.index)).sort((a, b) => b - a);

            indicesToDelete.forEach(index => {
                gameData.splice(index, 1);
            });

            // Use batched save instead of immediate save
            saveGameData();
            
            displayGameList(gameSearchInput.value);
            updateGameCount();
        });
    }

    gameList.addEventListener('click', function(event) {
        const listItem = event.target.closest('li');
        if (listItem) {
            listItem.classList.toggle('selected');
        }
    });
});
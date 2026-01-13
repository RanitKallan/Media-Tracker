document.addEventListener('DOMContentLoaded', () => {
    const animeList = document.getElementById('anime-list');
    const animeTitleInput = document.getElementById('anime-title');
    const addAnimeButton = document.getElementById('add-anime');
    const animeSearchInput = document.getElementById('anime-search');
    const animeCountDisplay = document.getElementById('anime-count');
    const deleteSelectedButton = document.getElementById('delete-selected-anime');

    // Use a Map for O(1) lookup by title (for duplicate checking)
    // but keep an array for ordered display
    let animeArray = [];
    let animeTitleMap = new Map();
    
    // Load data and populate both structures
    const loadData = () => {
        const savedData = JSON.parse(localStorage.getItem('animeList')) || [];
        animeArray = savedData;
        
        // Rebuild map from array
        animeTitleMap.clear();
        animeArray.forEach((anime, index) => {
            animeTitleMap.set(anime.title.toLowerCase(), index);
        });
    };
    
    loadData();
    
    let saveTimeout = null;
    let renderTimeout = null;
    let isRendering = false;

    // Function to batch localStorage updates
    function saveAnimeData() {
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        
        saveTimeout = setTimeout(() => {
            localStorage.setItem('animeList', JSON.stringify(animeArray));
            saveTimeout = null;
        }, 500);
    }

    function capitalizeFirstLetter(string) {
        return string.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    // Implement virtual scrolling to prevent glitches with large lists
    function renderAnimeList() {
        // Prevent multiple simultaneous renders
        if (isRendering) {
            if (renderTimeout) {
                clearTimeout(renderTimeout);
            }
            renderTimeout = setTimeout(renderAnimeList, 100);
            return;
        }
        
        isRendering = true;
        
        const searchTerm = animeSearchInput.value.toLowerCase();
        
        // Filtered display with index tracking for the original array
        const filteredAnime = searchTerm ? 
            animeArray.filter(anime => anime.title.toLowerCase().includes(searchTerm)) : 
            animeArray;
            
        // Update the count display immediately
        animeCountDisplay.textContent = `${filteredAnime.length}`;
        
        // Clear existing content
        animeList.innerHTML = '';
        
        // Use document fragment for batch DOM operations (more efficient)
        const fragment = document.createDocumentFragment();
        
        // Only render the visible portion and a buffer zone
        const itemHeight = 40; // approximate height of each item in pixels
        const visibleHeight = window.innerHeight;
        const maxItemsToRender = Math.min(filteredAnime.length, Math.ceil(visibleHeight / itemHeight) + 20); // visible + buffer
        
        // Create list container with fixed height to prevent layout shifts
        animeList.style.height = `${filteredAnime.length * itemHeight}px`;
        
        // Render the visible items
        for (let i = 0; i < maxItemsToRender && i < filteredAnime.length; i++) {
            const anime = filteredAnime[i];
            const originalIndex = animeArray.indexOf(anime);
            
            const listItem = document.createElement('li');
            listItem.style.height = `${itemHeight}px`;
            listItem.innerHTML = `
                <span class="anime-title-span">${i + 1}. ${anime.title}</span>
                <button class="watch-count-button" data-index="${originalIndex}"> ${anime.watchCount || 0}</button>
            `;
            
            fragment.appendChild(listItem);
        }
        
        animeList.appendChild(fragment);
        
        // Add event listeners after DOM is updated (event delegation)
        animeList.addEventListener('click', (e) => {
            if (e.target.classList.contains('watch-count-button')) {
                const index = parseInt(e.target.dataset.index);
                animeArray[index].watchCount = (animeArray[index].watchCount || 0) + 1;
                saveAnimeData();
                
                // Just update the button text instead of full re-render
                e.target.textContent = ` ${animeArray[index].watchCount}`;
            }
        });
        
        isRendering = false;
    }

    // Handle scrolling to render more items as needed
    window.addEventListener('scroll', () => {
        if (!isRendering) {
            renderAnimeList();
        }
    }, { passive: true });
    
    // Re-render on window resize
    window.addEventListener('resize', () => {
        if (renderTimeout) {
            clearTimeout(renderTimeout);
        }
        renderTimeout = setTimeout(renderAnimeList, 100);
    }, { passive: true });

    // Function to add anime
    function addAnime() {
        let title = animeTitleInput.value.trim();
        if (title) {
            title = capitalizeFirstLetter(title);
            const titleLower = title.toLowerCase();
            
            // O(1) lookup to check for duplicates
            if (!animeTitleMap.has(titleLower)) {
                const newAnime = { title: title, watchCount: 0 };
                animeArray.push(newAnime);
                animeTitleMap.set(titleLower, animeArray.length - 1);
                
                saveAnimeData();
                animeTitleInput.value = '';
                renderAnimeList();
            } else {
                alert("Anime already exists in the list.");
            }
        }
    }

    // Function to delete anime
    function deleteAnime(index) {
        const animeTitle = animeArray[index].title.toLowerCase();
        animeArray.splice(index, 1);
        animeTitleMap.delete(animeTitle);
        
        // Update indices in the map after deletion
        animeTitleMap.clear();
        animeArray.forEach((anime, idx) => {
            animeTitleMap.set(anime.title.toLowerCase(), idx);
        });
        
        saveAnimeData();
        renderAnimeList();
    }

    renderAnimeList();

    // Add event listener for Enter key on input field
    animeTitleInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addAnime();
        }
    });

    addAnimeButton.addEventListener('click', addAnime);

    animeSearchInput.addEventListener('input', () => {
        if (renderTimeout) {
            clearTimeout(renderTimeout);
        }
        renderTimeout = setTimeout(renderAnimeList, 300);
    });

    if (deleteSelectedButton) {
        deleteSelectedButton.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.anime-checkbox:checked');
            const indicesToDelete = Array.from(checkboxes)
                .map(checkbox => parseInt(checkbox.dataset.index))
                .sort((a, b) => b - a);
                
            indicesToDelete.forEach(index => deleteAnime(index));
        });
    }
});
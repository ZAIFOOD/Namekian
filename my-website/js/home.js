const API_KEY = '3f22bf2eeca1d68b317f8524d9aaf029';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem;
let bannerInterval;

function showLoader() {
  document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
  document.getElementById('loader').style.display = 'none';
}

async function fetchTrending(type) {
  try {
    const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
    const data = await res.json();
    return data.results;
  } catch {
    alert('Failed to load content. Please try again later.');
    return [];
  }
}

async function fetchTrendingAnime() {
  let allResults = [];
  for (let page = 1; page <= 3; page++) {
    try {
      const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`);
      const data = await res.json();
      const filtered = data.results.filter(item =>
        item.original_language === 'ja' && item.genre_ids.includes(16)
      );
      allResults = allResults.concat(filtered);
    } catch {}
  }
  return allResults;
}

function displayBanner(item) {
  const banner = document.getElementById('banner');
  banner.style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
  document.getElementById('banner-title').textContent = item.title || item.name;
  setupPlayButton(item); // set play button behavior
}



function setupBannerButtons(item) {
  const playBtn = document.querySelector('.play-btn');

  playBtn.onclick = () => {
    currentItem = item;
    showDetails(item); // opens modal and plays the movie
  };

}


function startBannerRotation(movies) {
  let index = 0;
  bannerInterval = setInterval(() => {
    displayBanner(movies[index]);
    index = (index + 1) % movies.length;
  }, 5000);
}

function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.loading = 'lazy';
    img.onclick = () => showDetails(item);

    const label = document.createElement('div');
    label.className = 'movie-label';
    const title = item.title || item.name;
    const rating = item.vote_average?.toFixed(1) || 'N/A';
    label.innerHTML = `
  <span class="movie-title">${title}</span>
  <span class="movie-rating">★${rating}</span>
`;


    card.appendChild(img);
    card.appendChild(label);
    container.appendChild(card);
  });
}

function showDetails(item) {
  currentItem = item;
  document.body.style.overflow = 'auto';
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-description').textContent = item.overview;
  document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2));
  changeServer();
  document.getElementById('modal').style.display = 'flex';
}

function changeServer() {
  const server = document.getElementById('server').value;
  const type = currentItem.media_type === "movie" ? "movie" : "tv";
  let embedURL = "";

  if (server === "vidsrc.cc") {
    embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  } else if (server === "vidsrc.me") {
    embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  } else if (server === "player.videasy.net") {
    embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
  }

  document.getElementById('modal-video').src = embedURL;
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
  document.body.style.overflow = 'auto';
}

function openSearchModal() {
  document.getElementById('search-modal').style.display = 'flex';
  document.getElementById('search-input').focus();
}

function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
}

async function searchTMDB() {
  const query = document.getElementById('search-input').value.trim();
  const container = document.getElementById('search-results');
  if (!query) return (container.innerHTML = '');

  const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
  const data = await res.json();
  container.innerHTML = '';
  data.results.forEach(item => {
    if (!item.poster_path) return;
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.loading = 'lazy';
    img.onclick = () => {
      closeSearchModal();
      showDetails(item);
    };
    container.appendChild(img);
  });
}

async function init() {
  showLoader();
  const movies = await fetchTrending('movie');
  const tvShows = await fetchTrending('tv');
  const anime = await fetchTrendingAnime();

  displayBanner(movies[0]);
  startBannerRotation(movies);
  displayList(movies, 'movies-list');
  displayList(tvShows, 'tvshows-list');
  displayList(anime, 'anime-list');
  hideLoader();

  // Center search bar
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.style.margin = '0 auto';
    searchInput.style.display = 'block';
    searchInput.style.textAlign = 'center';
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

init();

function setupPlayButton(item) {
  const playBtn = document.querySelector('.play-btn');
  if (playBtn) {
    playBtn.onclick = () => {
      currentItem = item;
      showDetails(item); // opens modal and plays movie
    };
  }
}

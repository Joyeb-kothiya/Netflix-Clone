const $ = id => document.getElementById(id);

async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch {
    return null;
  }
}

const IMG_URL = "https://image.tmdb.org/t/p/w185";
const BANNER_IMG_URL = "https://image.tmdb.org/t/p/w780";

const rowsConfig = {
  trending: { path: "trending/all/week", page: 1 },
  topRated: { path: "movie/top_rated", page: 1 },
  action: { path: "discover/movie?with_genres=28", page: 1 }
};

async function fetchMovies(path, page = 1, query = "") {
  const url = `/api/tmdb?path=${path}&page=${page}&query=${query}`;
  const data = await safeFetch(url);
  return data?.results || [];
}

async function loadBanner() {
  const banner = document.querySelector(".banner");
  if (!banner) return;

  const movies = await fetchMovies("trending/all/week");
  const movie = movies.find(m => m.backdrop_path);
  if (!movie) return;

  document.getElementById("banner-title").innerText =
    movie.title || movie.name || "";
  document.getElementById("banner-desc").innerText =
    movie.overview?.slice(0, 150) || "";

  banner.style.backgroundImage =
    `linear-gradient(to top, rgba(0,0,0,.8), transparent), url(${BANNER_IMG_URL}${movie.backdrop_path})`;
}

async function loadRow(id) {
  const cfg = rowsConfig[id];
  const row = document.getElementById(id);
  const movies = await fetchMovies(cfg.path, cfg.page);

  movies.forEach(m => {
    if (!m.poster_path) return;
    const img = document.createElement("img");
    img.className = "row-poster";
    img.src = `${IMG_URL}${m.poster_path}`;
    row.appendChild(img);
  });

  cfg.page++;
}

function init() {
  Object.keys(rowsConfig).forEach(loadRow);
  loadBanner();
}

init();

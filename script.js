const IMG_URL = "https://image.tmdb.org/t/p/w185";
const BANNER_IMG_URL = "https://image.tmdb.org/t/p/original";

async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch {
    return null;
  }
}

const rowsConfig = {
  trending: { path: "trending/all/week", page: 1 },
  topRated: { path: "movie/top_rated", page: 1 },
  action: { path: "discover/movie", page: 1, genre: 28 }
};

async function fetchMovies(path, page = 1, genre = "") {
  let url = `/api/tmdb?path=${path}&page=${page}`;
  if (genre) url += `&genre=${genre}`;
  const data = await safeFetch(url);
  return data?.results || [];
}

async function loadBanner() {
  const banner = document.querySelector(".banner");
  const movies = await fetchMovies("trending/all/week");
  const movie = movies.find(m => m.backdrop_path);
  if (!movie) return;

  banner.style.backgroundImage = `
    linear-gradient(to top, rgba(0,0,0,0.85), transparent),
    url(${BANNER_IMG_URL}${movie.backdrop_path})
  `;

  document.getElementById("banner-title").textContent =
    movie.title || movie.name || "";

  document.getElementById("banner-desc").textContent =
    movie.overview?.slice(0, 160) + "...";
}

async function loadRow(id) {
  const cfg = rowsConfig[id];
  const row = document.getElementById(id);
  const movies = await fetchMovies(cfg.path, cfg.page, cfg.genre || "");
  row.innerHTML = "";

  movies.forEach(movie => {
    if (!movie.poster_path) return;
    const img = document.createElement("img");
    img.className = "row-poster";
    img.src = `${IMG_URL}${movie.poster_path}`;
    row.appendChild(img);
  });
}

function init() {
  loadBanner();
  Object.keys(rowsConfig).forEach(loadRow);
}

init();

/* Navbar scroll */
window.addEventListener("scroll", () => {
  document.querySelector(".navbar")
    .classList.toggle("scrolled", window.scrollY > 50);
});
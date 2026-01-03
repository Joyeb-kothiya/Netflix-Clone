/* ================= HELPERS ================= */
const $ = id => document.getElementById(id);

async function safeFetch(url, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch {
    return null;
  }
}

/* ================= CONFIG ================= */
const API_KEY =
  window.TMDB_API_KEY ||
  import.meta?.env?.VITE_TMDB_API_KEY ||
  "";

const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w185";
const BANNER_IMG_URL = "https://image.tmdb.org/t/p/w780";

/* ================= ROW CONFIG ================= */
const rowsConfig = {
  trending: `${BASE_URL}/trending/all/week`,
  topRated: `${BASE_URL}/movie/top_rated`,
  action: `${BASE_URL}/discover/movie?with_genres=28`
};

/* ================= FETCH MOVIES ================= */
async function fetchMovies(url, page = 1) {
  const join = url.includes("?") ? "&" : "?";
  const data = await safeFetch(`${url}${join}api_key=${API_KEY}&page=${page}`);
  return data?.results || [];
}

/* ================= BANNER ================= */
async function loadBanner() {
  const banner = document.querySelector(".banner");
  if (!banner) return;

  const movies = await fetchMovies(rowsConfig.trending);
  const movie = movies.find(m => m.backdrop_path);

  if (!movie) return;

  $("banner-title").innerText = movie.title || movie.name;
  $("banner-desc").innerText = movie.overview?.slice(0, 160) || "";

  banner.style.backgroundImage = `
    linear-gradient(to top, rgba(0,0,0,0.85), transparent),
    url(${BANNER_IMG_URL}${movie.backdrop_path})
  `;
}

/* ================= LOAD ROW ================= */
async function loadRow(id, url) {
  const row = $(id);
  if (!row) return;

  row.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    const sk = document.createElement("div");
    sk.className = "poster-skeleton";
    row.appendChild(sk);
  }

  const movies = await fetchMovies(url);
  row.innerHTML = "";

  movies.forEach(movie => {
    if (!movie.poster_path) return;
    const img = document.createElement("img");
    img.className = "row-poster";
    img.src = `${IMG_URL}${movie.poster_path}`;
    img.loading = "lazy";
    img.onclick = () => openDetails(movie);
    row.appendChild(img);
  });
}

/* ================= DETAILS MODAL ================= */
function openDetails(movie) {
  $("detailsPoster").src = movie.poster_path
    ? `${IMG_URL}${movie.poster_path}`
    : "";

  $("detailsTitle").innerText =
    movie.title || movie.name || "Untitled";

  $("detailsOverview").innerText =
    movie.overview || "No description available.";

  $("detailsMeta").innerText =
    `⭐ ${movie.vote_average || "N/A"}`;

  $("detailsModal").classList.remove("hidden");
}

$("closeDetails")?.addEventListener("click", () =>
  $("detailsModal").classList.add("hidden")
);

/* ================= SEARCH ================= */
let searchTimer;
$("searchInput")?.addEventListener("input", e => {
  clearTimeout(searchTimer);
  const q = e.target.value.trim();

  searchTimer = setTimeout(async () => {
    if (!q) {
      loadRow("trending", rowsConfig.trending);
      return;
    }

    const movies = await fetchMovies(
      `${BASE_URL}/search/movie?query=${encodeURIComponent(q)}`
    );

    const row = $("trending");
    row.innerHTML = "";

    movies.forEach(movie => {
      if (!movie.poster_path) return;
      const img = document.createElement("img");
      img.className = "row-poster";
      img.src = `${IMG_URL}${movie.poster_path}`;
      img.onclick = () => openDetails(movie);
      row.appendChild(img);
    });
  }, 400);
});

/* ================= INIT ================= */
function init() {
  loadRow("trending", rowsConfig.trending);
  loadRow("topRated", rowsConfig.topRated);
  loadRow("action", rowsConfig.action);
  loadBanner();
}

init();
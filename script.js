const IMG_URL = "https://image.tmdb.org/t/p/w185";
const BANNER_IMG_URL = "https://image.tmdb.org/t/p/original";

/* ---------------- SAFE FETCH ---------------- */
async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
}

/* ---------------- ROW CONFIG ---------------- */
const rowsConfig = {
  trending: {
    path: "trending/all/week",
    page: 1
  },
  topRated: {
    path: "movie/top_rated",
    page: 1
  },
  action: {
    path: "discover/movie",
    page: 1,
    genre: 28
  }
};

/* ---------------- FETCH MOVIES ---------------- */
async function fetchMovies(path, page = 1, genre = "") {
  let url = `/api/tmdb?path=${path}&page=${page}`;
  if (genre) url += `&genre=${genre}`;

  const data = await safeFetch(url);
  return data?.results || [];
}

/* ---------------- LOAD BANNER ---------------- */
async function loadBanner() {
  const banner = document.querySelector(".banner");
  const movies = await fetchMovies("trending/all/week");

  const movie = movies.find(m => m.backdrop_path);
  if (!movie) return;

  document.getElementById("banner-title").textContent =
    movie.title || movie.name || "";

  document.getElementById("banner-desc").textContent =
    movie.overview?.slice(0, 160) + "..." || "";

  banner.style.backgroundImage = `
    linear-gradient(to top, rgba(0,0,0,0.85), transparent),
    url(${BANNER_IMG_URL}${movie.backdrop_path})
  `;
}

/* ---------------- LOAD ROW ---------------- */
async function loadRow(id) {
  const cfg = rowsConfig[id];
  const row = document.getElementById(id);
  if (!row) return;

  const movies = await fetchMovies(
    cfg.path,
    cfg.page,
    cfg.genre || ""
  );

  row.innerHTML = "";

  movies.forEach(movie => {
    if (!movie.poster_path) return;

    const img = document.createElement("img");
    img.className = "row-poster";
    img.src = `${IMG_URL}${movie.poster_path}`;
    img.alt = movie.title || movie.name;
    img.loading = "lazy";

    row.appendChild(img);
  });

  cfg.page++;
}

/* ---------------- INIT ---------------- */
function init() {
  loadBanner();
  Object.keys(rowsConfig).forEach(loadRow);
}

init();
export default async function handler(req, res) {
  const { path, page = 1, query = "" } = req.query;

  const API_KEY = process.env.TMDB_API_KEY;
  const BASE_URL = "https://api.themoviedb.org/3";

  if (!API_KEY) {
    return res.status(500).json({ error: "TMDB API key missing" });
  }

  let url = `${BASE_URL}/${path}?api_key=${API_KEY}&page=${page}`;

  if (query) {
    url += `&query=${encodeURIComponent(query)}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch from TMDB" });
  }
}

import axios, { AxiosInstance } from 'axios';

// ─────────────────────────────────────────────────────────────
// STREAMFLIX — URLs dos servidores
// ─────────────────────────────────────────────────────────────
const SCRAPER_URL  = 'https://streamflix-scraper-production.up.railway.app'; // Railway — desabilitado por enquanto
const RESOLVER_URL = 'https://soothing-lamentation366.runable.site/api';     // Runable — principal

// ─────────────────────────────────────────────────────────────
// fetchStreamSources — tenta resolver + embeds limpos
// Retorna o mesmo formato que buildSources() usava antes
// ─────────────────────────────────────────────────────────────
export async function fetchStreamSources(
  type: 'movie' | 'tv',
  tmdbId: number,
  imdbId?: string,
  season = 1,
  episode = 1
): Promise<{ label: string; url: string; ptbr: boolean }[]> {

  // 1️⃣ Tenta Resolver Runable — retorna embeds com prioridade PT-BR
  try {
    const params = new URLSearchParams({ type });
    if (imdbId) params.set('imdb', imdbId);
    if (type === 'tv') {
      params.set('season', String(season));
      params.set('episode', String(episode));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(`${RESOLVER_URL}/resolve/embed/${tmdbId}?${params}`, { signal: controller.signal });
    clearTimeout(timeout);

    const data = await res.json();

    if (data.success && data.sources?.length > 0) {
      console.log(`[RESOLVER] ${data.sources.length} fonte(s) — playUrl: ${data.playUrl}`);
      // Retorna fontes PT-BR primeiro
      return data.sources.sort((a: any) => (a.ptbr ? -1 : 1));
    }
  } catch (err) {
    console.log('[RESOLVER] falhou', err);
  }

  // 2️⃣ Fallback — tenta scraper (pode falhar em headless, por isso é fallback)
  try {
    const params = new URLSearchParams({ type, tmdb: String(tmdbId) });
    if (imdbId) params.set('imdb', imdbId);
    if (type === 'tv') {
      params.set('season', String(season));
      params.set('episode', String(episode));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const res = await fetch(`${SCRAPER_URL}/extract?${params}`, { signal: controller.signal });
    clearTimeout(timeout);

    const data = await res.json();

    if (data.success && data.sources?.length > 0) {
      console.log(`[SCRAPER] ${data.sources.length} fonte(s) encontrada(s)`);
      return data.sources.map((s: any) => ({
        label: s.label,
        url: s.directUrl || s.url,
        ptbr: s.ptbr,
      }));
    }
  } catch (err) {
    console.log('[SCRAPER] timeout ou erro', err);
  }

  return [];
}

// ─────────────────────────────────────────────────────────────
// TMDB API
// ─────────────────────────────────────────────────────────────
const TMDB_API_KEYS = [
  '9e61081071c195fca2147469bd25690e',
  '9e61081071c195fca2147469bd25690e',
  '9e61081071c195fca2147469bd25690e',
];

let currentKeyIndex = 0;
let requestCount = 0;
const MAX_REQUESTS_PER_KEY = 40;

function getApiKey(): string {
  requestCount++;
  if (requestCount >= MAX_REQUESTS_PER_KEY) {
    currentKeyIndex = (currentKeyIndex + 1) % TMDB_API_KEYS.length;
    requestCount = 0;
  }
  return TMDB_API_KEYS[currentKeyIndex];
}

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

function createClient(): AxiosInstance {
  return axios.create({
    baseURL: TMDB_BASE_URL,
    params: { api_key: getApiKey(), language: 'pt-BR' },
    timeout: 10000,
  });
}

async function tmdbRequest(endpoint: string, params: Record<string, any> = {}) {
  for (let attempt = 0; attempt < TMDB_API_KEYS.length; attempt++) {
    try {
      const client = createClient();
      const response = await client.get(endpoint, { params });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 429) {
        currentKeyIndex = (currentKeyIndex + 1) % TMDB_API_KEYS.length;
        requestCount = 0;
        continue;
      }
      throw error;
    }
  }
  return null;
}

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  media_type: 'movie';
}

export interface TV {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
  media_type: 'tv';
}

export type Content = Movie | TV;

export const GENRES = {
  movies: [
    { id: 28,    name: 'Ação' },
    { id: 12,    name: 'Aventura' },
    { id: 35,    name: 'Comédia' },
    { id: 80,    name: 'Crime' },
    { id: 18,    name: 'Drama' },
    { id: 10751, name: 'Família' },
    { id: 14,    name: 'Fantasia' },
    { id: 27,    name: 'Horror' },
    { id: 9648,  name: 'Mistério' },
    { id: 10749, name: 'Romance' },
    { id: 878,   name: 'Ficção Científica' },
    { id: 53,    name: 'Suspense' },
  ],
  tv: [
    { id: 10759, name: 'Ação & Aventura' },
    { id: 16,    name: 'Animação' },
    { id: 35,    name: 'Comédia' },
    { id: 80,    name: 'Crime' },
    { id: 18,    name: 'Drama' },
    { id: 10751, name: 'Família' },
    { id: 9648,  name: 'Mistério' },
    { id: 10765, name: 'Sci-Fi & Fantasia' },
    { id: 10764, name: 'Reality' },
  ],
};

export async function fetchTrendingContent(type: 'movie' | 'tv' = 'movie') {
  try {
    const data = await tmdbRequest(`/trending/${type}/week`, { region: 'BR', language: 'pt-BR' });
    return data?.results || [];
  } catch { return []; }
}

export async function fetchContentByGenre(type: 'movie' | 'tv' = 'movie', genreId: number, page = 1) {
  try {
    const data = await tmdbRequest(`/discover/${type}`, {
      with_genres: genreId, page, region: 'BR', sort_by: 'popularity.desc', language: 'pt-BR',
    });
    return data?.results || [];
  } catch { return []; }
}

export async function searchContent(query: string, type: 'multi' | 'movie' | 'tv' = 'multi') {
  try {
    if (!query.trim()) return [];
    const data = await tmdbRequest(`/search/${type}`, { query, page: 1, region: 'BR', language: 'pt-BR' });
    return data?.results || [];
  } catch { return []; }
}

export async function fetchContentDetails(type: 'movie' | 'tv', id: number) {
  try {
    return await tmdbRequest(`/${type}/${id}`, { language: 'pt-BR', append_to_response: 'external_ids' });
  } catch { return null; }
}

export async function fetchDoramas(page = 1) {
  try {
    const data = await tmdbRequest('/discover/tv', {
      with_origin_country: 'KR', page, region: 'BR', sort_by: 'popularity.desc', language: 'pt-BR',
    });
    return data?.results || [];
  } catch { return []; }
}

export async function fetchAnimes(page = 1) {
  try {
    const data = await tmdbRequest('/discover/tv', {
      with_genres: 16, with_origin_country: 'JP', page, region: 'BR', sort_by: 'popularity.desc', language: 'pt-BR',
    });
    return data?.results || [];
  } catch { return []; }
}

export async function fetchDublados(page = 1) {
  try {
    const data = await tmdbRequest('/discover/movie', {
      page, region: 'BR', sort_by: 'popularity.desc', language: 'pt-BR',
      with_original_language: 'en', 'release_date.gte': '2015-01-01',
    });
    return data?.results || [];
  } catch { return []; }
}

export async function fetchPopularMovies(page = 1) {
  try {
    const data = await tmdbRequest('/movie/popular', { page, region: 'BR', language: 'pt-BR' });
    return data?.results || [];
  } catch { return []; }
}

export async function fetchPopularSeries(page = 1) {
  try {
    const data = await tmdbRequest('/tv/popular', { page, language: 'pt-BR' });
    return data?.results || [];
  } catch { return []; }
}

export async function fetchBLs(page = 1) {
  try {
    const data = await tmdbRequest('/discover/tv', {
      with_genres: 10749, with_origin_country: 'TH|KR|TW|JP',
      page, sort_by: 'popularity.desc', language: 'pt-BR',
    });
    return data?.results || [];
  } catch { return []; }
}

export async function fetchNowPlaying(page = 1) {
  try {
    const data = await tmdbRequest('/movie/now_playing', { page, region: 'BR', language: 'pt-BR' });
    return data?.results || [];
  } catch { return []; }
}

export function getImageUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'w780' = 'w342') {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getVidSrcUrl(type: 'movie' | 'tv', id: string | number, seasonNumber?: number, episodeNumber?: number) {
  if (type === 'movie') return `https://vidsrc.to/embed/movie/${id}`;
  return `https://vidsrc.to/embed/tv/${id}/${seasonNumber || 1}/${episodeNumber || 1}`;
}

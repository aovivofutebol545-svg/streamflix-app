import axios from 'axios';

const TMDB_API_KEY = 'e86975bc7a2c1fb2e3ecd4d0e9f9b5f';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const tmdbAPI = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'pt-BR',
  },
});

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
    { id: 28, name: 'Ação' },
    { id: 12, name: 'Aventura' },
    { id: 35, name: 'Comédia' },
    { id: 80, name: 'Crime' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Família' },
    { id: 14, name: 'Fantasia' },
    { id: 27, name: 'Horror' },
    { id: 9648, name: 'Mistério' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Ficção Científica' },
    { id: 53, name: 'Suspense' },
  ],
  tv: [
    { id: 10759, name: 'Ação & Aventura' },
    { id: 16, name: 'Animação' },
    { id: 35, name: 'Comédia' },
    { id: 80, name: 'Crime' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Família' },
    { id: 10762, name: 'Kids' },
    { id: 9648, name: 'Mistério' },
    { id: 10763, name: 'Notícias' },
    { id: 10768, name: 'Guerra & Política' },
    { id: 10765, name: 'Sci-Fi & Fantasia' },
    { id: 10766, name: 'Soap' },
    { id: 10767, name: 'Talk' },
    { id: 10764, name: 'Reality' },
  ],
};

const SPECIAL_CATEGORIES = {
  doramas: { name: 'Doramas', genres: [18], region: 'KR,JP' },
  animes: { name: 'Animes', genres: [16], region: 'JP' },
  bls: { name: 'BLs', genres: [10749], keywords: [6735, 6743] },
  dublados: { name: 'Dublados PT-BR', language: 'pt' },
};

export async function fetchTrendingContent(type: 'movie' | 'tv' = 'movie') {
  try {
    const response = await tmdbAPI.get(`/trending/${type}/week`, {
      params: { region: 'BR' },
    });
    return response.data.results;
  } catch (error) {
    console.error('Erro ao buscar trending:', error);
    return [];
  }
}

export async function fetchContentByGenre(
  type: 'movie' | 'tv' = 'movie',
  genreId: number,
  page: number = 1
) {
  try {
    const response = await tmdbAPI.get(`/discover/${type}`, {
      params: {
        with_genres: genreId,
        page,
        region: 'BR',
        sort_by: 'popularity.desc',
        'with_original_language': 'pt|en',
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Erro ao buscar por gênero:', error);
    return [];
  }
}

export async function searchContent(query: string, type: 'multi' | 'movie' | 'tv' = 'multi') {
  try {
    if (!query.trim()) return [];

    const response = await tmdbAPI.get(`/search/${type}`, {
      params: {
        query,
        page: 1,
        region: 'BR',
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Erro ao buscar:', error);
    return [];
  }
}

export async function fetchContentDetails(type: 'movie' | 'tv', id: number) {
  try {
    const response = await tmdbAPI.get(`/${type}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar detalhes:', error);
    return null;
  }
}

export async function fetchDoramas(page: number = 1) {
  try {
    const response = await tmdbAPI.get('/discover/tv', {
      params: {
        with_origin_country: 'KR',
        page,
        region: 'BR',
        sort_by: 'popularity.desc',
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Erro ao buscar doramas:', error);
    return [];
  }
}

export async function fetchAnimes(page: number = 1) {
  try {
    const response = await tmdbAPI.get('/discover/tv', {
      params: {
        with_genres: 16,
        with_origin_country: 'JP',
        page,
        region: 'BR',
        sort_by: 'popularity.desc',
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Erro ao buscar animes:', error);
    return [];
  }
}

export async function fetchDublados(page: number = 1) {
  try {
    const response = await tmdbAPI.get('/discover/movie', {
      params: {
        with_original_language: 'pt',
        page,
        region: 'BR',
        sort_by: 'popularity.desc',
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Erro ao buscar dublados:', error);
    return [];
  }
}

export function getImageUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'w780' = 'w342') {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getVidSrcUrl(type: 'movie' | 'tv', imdbId: string, seasonNumber?: number, episodeNumber?: number) {
  if (type === 'movie') {
    return `https://vidsrc.to/embed/movie/${imdbId}`;
  }
  return `https://vidsrc.to/embed/tv/${imdbId}/${seasonNumber || 1}/${episodeNumber || 1}`;
}

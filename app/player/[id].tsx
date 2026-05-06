import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StatusBar,
  BackHandler,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { fetchContentDetails } from '../../services/api';

// Fontes de vídeo com prioridade PT-BR
function getVideoSources(type: 'movie' | 'tv', tmdbId: number, imdbId?: string, season = 1, ep = 1) {
  const sources = [];

  // 1. SuperFlixTV — melhor fonte PT-BR
  sources.push(`https://superflixapi.dev/filme/${tmdbId}`);

  // 2. VidSrc.cc com lang PT
  if (imdbId) {
    sources.push(`https://vidsrc.cc/v2/embed/movie/${imdbId}?autoPlay=1`);
  }

  // 3. multiembed com locale pt-BR
  sources.push(`https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`);

  // 4. embedsu
  if (imdbId) {
    sources.push(`https://embed.su/embed/${type === 'movie' ? 'movie' : 'tv'}/${imdbId}`);
  }

  // 5. VidSrc original (fallback)
  if (imdbId) {
    if (type === 'movie') {
      sources.push(`https://vidsrc.to/embed/movie/${imdbId}`);
    } else {
      sources.push(`https://vidsrc.to/embed/tv/${imdbId}/${season}/${ep}`);
    }
  }

  return sources;
}

export default function PlayerScreen() {
  const { id, type: paramType, season, episode } = useLocalSearchParams<{
    id: string;
    type?: string;
    season?: string;
    episode?: string;
  }>();
  const router = useRouter();
  const webviewRef = useRef<any>(null);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    lockLandscape();
    activateKeepAwakeAsync();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);

    if (id) loadVideo();

    return () => {
      unlockOrientation();
      deactivateKeepAwake();
      backHandler.remove();
    };
  }, [id]);

  const lockLandscape = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } catch (e) {}
  };

  const unlockOrientation = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } catch (e) {}
  };

  const handleBack = () => {
    unlockOrientation();
    router.back();
    return true;
  };

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      const mediaType = (paramType as 'movie' | 'tv') || 'movie';
      const s = parseInt(season || '1');
      const e = parseInt(episode || '1');

      let details = await fetchContentDetails('movie', parseInt(id || '0'));
      let detectedType: 'movie' | 'tv' = 'movie';

      if (!details || !details.title) {
        details = await fetchContentDetails('tv', parseInt(id || '0'));
        detectedType = 'tv';
      }

      const imdbId = details?.imdb_id || details?.external_ids?.imdb_id;
      const t = details?.title || details?.name || '';
      setTitle(t);

      const srcs = getVideoSources(detectedType, parseInt(id || '0'), imdbId, s, e);
      setSources(srcs);
      setSourceIndex(0);
    } catch (err) {
      setError('Erro ao carregar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const tryNextSource = () => {
    if (sourceIndex < sources.length - 1) {
      setSourceIndex(sourceIndex + 1);
    } else {
      setError('Nenhuma fonte disponível no momento.');
    }
  };

  const currentUrl = sources[sourceIndex];

  // HTML wrapper que força PT-BR e full screen
  const htmlContent = currentUrl ? `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { 
          width: 100%; height: 100%; 
          background: #000; 
          overflow: hidden;
        }
        iframe {
          width: 100vw;
          height: 100vh;
          border: none;
          display: block;
        }
      </style>
    </head>
    <body>
      <iframe 
        src="${currentUrl}"
        allowfullscreen
        allow="autoplay; fullscreen; picture-in-picture"
        scrolling="no"
        referrerpolicy="no-referrer"
      ></iframe>
      <script>
        // Tenta forçar fullscreen
        setTimeout(() => {
          const iframe = document.querySelector('iframe');
          if (iframe && iframe.requestFullscreen) iframe.requestFullscreen();
        }, 2000);
      </script>
    </body>
    </html>
  ` : '';

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.btn} onPress={loadVideo}>
            <Text style={styles.btnText}>Tentar novamente</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={handleBack}>
            <Text style={styles.btnText}>← Voltar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <WebView
            ref={webviewRef}
            source={{ html: htmlContent, baseUrl: currentUrl }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            onError={tryNextSource}
            onHttpError={tryNextSource}
            originWhitelist={['*']}
            mixedContentMode="always"
            userAgent="Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36"
          />

          {/* Controles flutuantes */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <Text style={styles.backBtnText}>✕</Text>
            </TouchableOpacity>

            {title ? (
              <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
            ) : null}

            {sources.length > 1 && (
              <TouchableOpacity style={styles.sourceBtn} onPress={tryNextSource}>
                <Text style={styles.sourceBtnText}>
                  Fonte {sourceIndex + 1}/{sources.length}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 15,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  btn: {
    backgroundColor: '#E50914',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
    minWidth: 180,
    alignItems: 'center',
  },
  btnSecondary: {
    backgroundColor: '#333',
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  controls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  titleText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sourceBtn: {
    backgroundColor: 'rgba(229,9,20,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  sourceBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});

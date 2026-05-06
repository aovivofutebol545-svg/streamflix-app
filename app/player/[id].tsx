import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StatusBar,
  BackHandler,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { fetchContentDetails } from '../../services/api';

// Fontes que funcionam DENTRO do WebView (sem redirecionar pro browser)
function buildSources(type: 'movie' | 'tv', tmdbId: number, imdbId?: string, season = 1, ep = 1) {
  const id = tmdbId;
  const sources: { label: string; url: string }[] = [];

  if (type === 'movie') {
    if (imdbId) {
      sources.push({ label: 'Fonte 1', url: `https://vidsrc.xyz/embed/movie?imdb=${imdbId}` });
      sources.push({ label: 'Fonte 2', url: `https://vidsrc.cc/v2/embed/movie/${imdbId}` });
      sources.push({ label: 'Fonte 3', url: `https://player.videasy.net/movie/${imdbId}` });
    }
    sources.push({ label: 'Fonte 4', url: `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1` });
    sources.push({ label: 'Fonte 5', url: `https://www.2embed.cc/embed/${id}` });
  } else {
    if (imdbId) {
      sources.push({ label: 'Fonte 1', url: `https://vidsrc.xyz/embed/tv?imdb=${imdbId}&season=${season}&episode=${ep}` });
      sources.push({ label: 'Fonte 2', url: `https://vidsrc.cc/v2/embed/tv/${imdbId}/${season}/${ep}` });
      sources.push({ label: 'Fonte 3', url: `https://player.videasy.net/tv/${imdbId}/${season}/${ep}` });
    }
    sources.push({ label: 'Fonte 4', url: `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${ep}` });
    sources.push({ label: 'Fonte 5', url: `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${ep}` });
  }

  return sources;
}

// HTML que injeta o player sem abrir navegador externo
function buildHTML(embedUrl: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:100%;height:100%;background:#000;overflow:hidden}
  iframe{width:100vw;height:100vh;border:none}
</style>
</head>
<body>
<iframe
  src="${embedUrl}"
  allowfullscreen
  allow="autoplay;fullscreen;picture-in-picture;encrypted-media"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups-to-escape-sandbox"
></iframe>
<script>
  // Bloqueia redirecionamentos externos
  window.open = function(url){ return null; };
  document.addEventListener('click', function(e){
    var el = e.target;
    while(el){
      if(el.tagName === 'A' && el.href && !el.href.includes(location.hostname)){
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      el = el.parentElement;
    }
  }, true);
</script>
</body>
</html>`;
}

export default function PlayerScreen() {
  const { id, type: paramType, season, episode } = useLocalSearchParams<{
    id: string; type?: string; season?: string; episode?: string;
  }>();
  const router = useRouter();
  const webviewRef = useRef<any>(null);
  const [sources, setSources] = useState<{ label: string; url: string }[]>([]);
  const [srcIndex, setSrcIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [showSources, setShowSources] = useState(false);

  useEffect(() => {
    lockLandscape();
    if (id) loadVideo();
    const back = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => { unlockOrientation(); back.remove(); };
  }, [id]);

  const lockLandscape = async () => {
    try { await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE); } catch {}
  };
  const unlockOrientation = async () => {
    try { await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP); } catch {}
  };
  const handleBack = () => { unlockOrientation(); router.back(); return true; };

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError(null);
      const s = parseInt(season || '1');
      const e = parseInt(episode || '1');

      let details = await fetchContentDetails('movie', parseInt(id || '0'));
      let mediaType: 'movie' | 'tv' = 'movie';
      if (!details?.title) {
        details = await fetchContentDetails('tv', parseInt(id || '0'));
        mediaType = 'tv';
      }

      const imdbId = details?.imdb_id || details?.external_ids?.imdb_id;
      setTitle(details?.title || details?.name || '');
      const srcs = buildSources(mediaType, parseInt(id || '0'), imdbId, s, e);
      setSources(srcs);
      setSrcIndex(0);
    } catch {
      setError('Erro ao carregar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const currentSource = sources[srcIndex];

  // Bloqueia navegação externa no WebView
  const handleNavChange = (navState: any) => {
    const url: string = navState.url || '';
    // Permite apenas URLs dos embeds conhecidos
    const allowed = [
      'vidsrc.xyz', 'vidsrc.cc', 'multiembed.mov',
      '2embed.cc', 'videasy.net', 'about:blank', 'blob:'
    ];
    const isAllowed = allowed.some(d => url.includes(d)) || url.startsWith('data:');
    if (!isAllowed && url !== 'about:blank' && !url.startsWith('data:')) {
      webviewRef.current?.stopLoading();
      webviewRef.current?.goBack();
    }
  };

  if (loading) {
    return (
      <View style={s.center}><StatusBar hidden />
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={s.loadTxt}>Carregando...</Text>
      </View>
    );
  }

  if (error || !currentSource) {
    return (
      <View style={s.center}><StatusBar hidden />
        <Text style={{ fontSize: 44, marginBottom: 10 }}>😕</Text>
        <Text style={s.errTxt}>{error || 'Sem fontes disponíveis'}</Text>
        <TouchableOpacity style={s.btn} onPress={loadVideo}>
          <Text style={s.btnTxt}>Tentar novamente</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, { backgroundColor: '#333', marginTop: 8 }]} onPress={handleBack}>
          <Text style={s.btnTxt}>← Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar hidden />

      <WebView
        ref={webviewRef}
        source={{ html: buildHTML(currentSource.url) }}
        style={s.webview}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="always"
        originWhitelist={['*']}
        onNavigationStateChange={handleNavChange}
        onShouldStartLoadWithRequest={(req) => {
          const url = req.url;
          const allowed = ['vidsrc.xyz','vidsrc.cc','multiembed.mov','2embed.cc','videasy.net','about:blank','blob:','data:'];
          return allowed.some(d => url.includes(d)) || url.startsWith('data:') || url.startsWith('blob:');
        }}
        userAgent="Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
      />

      {/* Barra superior */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.closeBtn} onPress={handleBack}>
          <Text style={s.closeTxt}>✕</Text>
        </TouchableOpacity>
        {!!title && <Text style={s.titleTxt} numberOfLines={1}>{title}</Text>}
        <TouchableOpacity style={s.srcBtn} onPress={() => setShowSources(!showSources)}>
          <Text style={s.srcBtnTxt}>{currentSource.label} ▾</Text>
        </TouchableOpacity>
      </View>

      {/* Menu de fontes */}
      {showSources && (
        <View style={s.srcMenu}>
          {sources.map((src, i) => (
            <TouchableOpacity
              key={i}
              style={[s.srcItem, i === srcIndex && s.srcItemActive]}
              onPress={() => { setSrcIndex(i); setShowSources(false); }}
            >
              <Text style={[s.srcItemTxt, i === srcIndex && { color: '#fff', fontWeight: '700' }]}>
                {src.label} {i === srcIndex ? '✓' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  webview: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', padding: 20 },
  loadTxt: { color: '#fff', marginTop: 12, fontSize: 15 },
  errTxt: { color: '#aaa', fontSize: 14, textAlign: 'center', marginBottom: 20 },
  btn: { backgroundColor: '#E50914', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, minWidth: 180, alignItems: 'center' },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  closeTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  titleTxt: { flex: 1, color: '#fff', fontSize: 13, fontWeight: '600' },
  srcBtn: { backgroundColor: 'rgba(229,9,20,0.85)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  srcBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  srcMenu: {
    position: 'absolute', top: 50, right: 12,
    backgroundColor: '#1A1F2E',
    borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: '#2A3350',
    minWidth: 120,
  },
  srcItem: { paddingHorizontal: 16, paddingVertical: 12 },
  srcItemActive: { backgroundColor: '#E50914' },
  srcItemTxt: { color: '#aaa', fontSize: 13 },
});

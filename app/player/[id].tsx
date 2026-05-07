import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text,
  ActivityIndicator, StatusBar, BackHandler,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { fetchContentDetails, fetchStreamSources } from '../../services/api';

export default function PlayerScreen() {
  const { id, type: paramType, season, episode } = useLocalSearchParams<{
    id: string; type?: string; season?: string; episode?: string;
  }>();
  const router = useRouter();
  const webviewRef = useRef<any>(null);
  const [sources, setSources] = useState<{ label: string; url: string; ptbr: boolean }[]>([]);
  const [srcIndex, setSrcIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [webLoading, setWebLoading] = useState(true);
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

      // Busca detalhes pra obter o IMDB ID
      let details = await fetchContentDetails('movie', parseInt(id || '0'));
      let mediaType: 'movie' | 'tv' = 'movie';
      if (!details?.title) {
        details = await fetchContentDetails('tv', parseInt(id || '0'));
        mediaType = 'tv';
      }

      const imdbId = details?.imdb_id || details?.external_ids?.imdb_id;
      setTitle(details?.title || details?.name || '');

      // ── RESOLVER REMOTO — busca fontes via API ──
      const srcs = await fetchStreamSources(mediaType, parseInt(id || '0'), imdbId, s, e);

      if (!srcs || srcs.length === 0) {
        setError('Nenhuma fonte disponível no momento.');
        return;
      }

      setSources(srcs);
      setSrcIndex(0);
    } catch {
      setError('Erro ao carregar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const nextSource = () => {
    if (srcIndex < sources.length - 1) {
      setSrcIndex(srcIndex + 1);
      setWebLoading(true);
    }
  };

  const currentSource = sources[srcIndex];

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
        source={{ uri: currentSource.url }}
        style={s.webview}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="always"
        originWhitelist={['*']}
        onLoadStart={() => setWebLoading(true)}
        onLoadEnd={() => setWebLoading(false)}
        onError={nextSource}
        onHttpError={(e) => { if (e.nativeEvent.statusCode >= 400) nextSource(); }}
        userAgent="Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        injectedJavaScript={`
          (function() {
            window.open = function() { return null; };
            var style = document.createElement('style');
            style.innerHTML = 'iframe[src*="ads"],div[id*="ad-"],div[class*="ad-banner"],.overlay,.popup{display:none!important}';
            document.head && document.head.appendChild(style);
          })();
          true;
        `}
      />

      {/* Loading overlay */}
      {webLoading && (
        <View style={s.webLoadingOverlay}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={s.loadTxt}>Carregando player...</Text>
          {currentSource.ptbr && (
            <View style={s.ptbrBadge}>
              <Text style={s.ptbrTxt}>🇧🇷 Fonte PT-BR</Text>
            </View>
          )}
        </View>
      )}

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
          <Text style={s.srcMenuTitle}>Selecionar fonte:</Text>
          {sources.map((src, i) => (
            <TouchableOpacity
              key={i}
              style={[s.srcItem, i === srcIndex && s.srcItemActive]}
              onPress={() => { setSrcIndex(i); setWebLoading(true); setShowSources(false); }}
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
  webLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center', alignItems: 'center',
  },
  ptbrBadge: {
    marginTop: 16, backgroundColor: '#15803D',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  ptbrTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  closeTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  titleTxt: { flex: 1, color: '#fff', fontSize: 13, fontWeight: '600' },
  srcBtn: { backgroundColor: 'rgba(229,9,20,0.9)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  srcBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  srcMenu: {
    position: 'absolute', top: 50, right: 12,
    backgroundColor: '#1A1F2E', borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: '#2A3350', minWidth: 180,
    elevation: 10,
  },
  srcMenuTitle: {
    color: '#8892AA', fontSize: 11, fontWeight: '600',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  srcItem: { paddingHorizontal: 16, paddingVertical: 12 },
  srcItemActive: { backgroundColor: '#E50914' },
  srcItemTxt: { color: '#C8CEDF', fontSize: 13 },
});

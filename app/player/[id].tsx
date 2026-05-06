import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  WebView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { THEME } from '../../constants/colors';
import { fetchContentDetails, getVidSrcUrl } from '../../services/api';

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<'movie' | 'tv' | null>(null);

  useEffect(() => {
    if (id) {
      loadVideo();
    }
  }, [id]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch as movie first
      let details = await fetchContentDetails('movie', parseInt(id || '0'));
      let type: 'movie' | 'tv' = 'movie';

      // If not found, try as TV
      if (!details || !details.imdb_id) {
        details = await fetchContentDetails('tv', parseInt(id || '0'));
        type = 'tv';
      }

      if (details && details.imdb_id) {
        const url = getVidSrcUrl(type, details.imdb_id.replace('tt', ''));
        setVideoUrl(url);
        setContentType(type);
      } else {
        setError('Não foi possível carregar o vídeo');
      }
    } catch (err) {
      console.error('Erro ao carregar vídeo:', err);
      setError('Erro ao carregar o vídeo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Carregando vídeo...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadVideo}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : videoUrl ? (
        <View style={styles.playerContainer}>
          <WebView
            source={{ uri: videoUrl }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsFullscreenVideo={true}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.md,
  },
  backButton: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
  },
  backButtonText: {
    color: THEME.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  playerContainer: {
    flex: 1,
    backgroundColor: THEME.colors.secondary,
  },
  webview: {
    flex: 1,
  },
  loadingText: {
    color: THEME.colors.text,
    fontSize: 16,
    marginTop: THEME.spacing.md,
  },
  errorText: {
    color: THEME.colors.text,
    fontSize: 16,
    marginBottom: THEME.spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    marginTop: THEME.spacing.md,
  },
  retryButtonText: {
    color: THEME.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

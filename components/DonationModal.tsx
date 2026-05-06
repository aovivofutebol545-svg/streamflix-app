import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Clipboard,
  ScrollView,
} from 'react-native';

const { width } = Dimensions.get('window');

const PIX_FULL_CODE = '00020126360014BR.GOV.BCB.PIX0114+55949914694475204000053039865802BR5925Kaique do Nascimento Alme6009SAO PAULO62140510Rcp21rBhPK6304F1B2';
const PIX_QR_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAdYAAAHWAQAAAADiYZX3AAAD0klEQVR4nO2dQW7bMBBF/1QCuqSAHCBHkW/QIxU9Um8gHSUHKCAvA1CYLjgzpFxEStPAid0/C8OO9SAL+Bh+DoeMKN4a65c3owBZsmTJkiX7WdhVLAYA8wDICQBm6SEnrCInrFIun/3S97gv2ftloaoZqqqqU1IFkn0E0KldsgBAskucyLf4vGSvys6WgoDx6atZ+XEBgJSB+VFV9UkEJbkN73ZfsnfK9hefdX7MMIn56CfjU59l/Pme9yV73+ylrgQQ6HzqMuahyzJOUMxDB52H97wv2ftmt/4qx+inqrp0ilEzVJeufKS/IvvKUNXs71OGTvsvLXaLz0v2OqylqgiMmgEkdfPuM0NLWk1QV2R32VWAcw+RYRX9MXSqE1YxcZ1FdErPIqeUIadzv2U/6jeT/dys16qKoQI8VXVaUlWkL/NXCM/FfEV2J8xfxcBX6qJLpxgXoNRKx+LbYV84dovPS/Y6rM8HFzRV9vZvRWGd6oSqq47+iux+FA1NKQOAyQchLjSLOWpViDIzpK7I7oXpxV+qgypLOOMSSctlxvkg2eOw6oKPb+bRS27qtElkpXQKFOlRV2R3wwSzLU794dYtaZmkFvp2sgexsVE+C9QF8IEPVhwtMvOhkroiuxt1fGsLC2G37FubFNp4meivyB5EU1Owvj4vNnha8gngAtSuP+qK7G40fjw6FvyLjKaHdCrXR3WLuiK7E9Ws+/jmSat1WjY2mv6Yr8gehQupDoZRxFpskbCWHdr2BuqK7E6YruLjVIpY0c1XR8kQF1hvJ3sU7ts9N7UdC9rMAs1fNWVS6orsy9HW0aOVIZxW03gc/aL07WSPo+arKin7KtkioS80q27q8tQV2Zej1q8Q7cbtiFjdeh0CF67jkD2I6sd94Ntaq+hsANBWHKgrsnsRoxpqK0Mtidb6lTst5XyQ7Cui2vN22gf4TsJmLbp9R12R3Q1PUKpta3sZ7qrg4KvSLXaLz0v2OmzM8zaVzyqpyFcWSZV9MmSPo6mLlkhurWJFp+1NRrT5UVdkX44eiIUbYO2B2Hk6LlApu1bTr3KyjF2Scv+Rv5ns52e35zNE20KkqugmrSX5wG7xecleh708T6bpZa8F0zG2eLWbDakrsi+H1aqAjasKkxXVLS/Js85A9q/ZVewcyHMP+b4AdtDH+avKKdlsUeTxmefWkt2N7Xl9nWL+liFIC4DzQ1YgA0jPApwfFPMAwTit/3xfsvfNXp6HrLH92Y7v09hLker+VforsgexmQ/6IuHUlD/NczXt7tznRfYohP8fhyxZsmTJ/sfsb40Q0SQOPIZ3AAAAAElFTkSuQmCC';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function DonationModal({ visible, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(PIX_FULL_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.heartEmoji}>❤️</Text>
              <Text style={styles.title}>Apoie o Streamflix</Text>
              <Text style={styles.subtitle}>
                100% gratuito e sem anúncios.{'\n'}Sua doação mantém o app no ar!
              </Text>
            </View>

            {/* Valores */}
            <View style={styles.valuesRow}>
              {['R$ 5', 'R$ 10', 'R$ 20', 'R$ 50'].map((v) => (
                <View key={v} style={styles.valueChip}>
                  <Text style={styles.valueChipText}>{v}</Text>
                </View>
              ))}
            </View>

            {/* QR Code */}
            <View style={styles.qrCard}>
              <Text style={styles.qrTitle}>📱 Escaneie o QR Code</Text>
              <View style={styles.qrWrapper}>
                <Image
                  source={{ uri: PIX_QR_BASE64 }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.qrSub}>Abra o app do seu banco e escaneie</Text>
            </View>

            {/* Divisor */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Copiar código */}
            <View style={styles.copyCard}>
              <Text style={styles.copyLabel}>Copie o código Pix</Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeText} numberOfLines={2} ellipsizeMode="middle">
                  {PIX_FULL_CODE.substring(0, 40)}...
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.copyBtn, copied && styles.copyBtnDone]}
                onPress={handleCopy}
                activeOpacity={0.85}
              >
                <Text style={styles.copyBtnText}>
                  {copied ? '✓  Copiado com sucesso!' : '📋  Copiar código completo'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.thanks}>
              Muito obrigado pelo apoio! 🙏
            </Text>

            {/* Botão fechar */}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.closeBtnText}>Fechar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.skipBtn}>
              <Text style={styles.skipText}>Agora não</Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function DonationButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.fabText}>❤️</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#12151E',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: '#1E2436',
    borderBottomWidth: 0,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#3A4060',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heartEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#8892AA',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
  valuesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  valueChip: {
    flex: 1,
    backgroundColor: '#1C2235',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3350',
  },
  valueChipText: {
    color: '#E2E8F5',
    fontSize: 13,
    fontWeight: '700',
  },
  qrCard: {
    backgroundColor: '#1C2235',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A3350',
  },
  qrTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  qrSub: {
    color: '#8892AA',
    fontSize: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E2436',
  },
  dividerText: {
    color: '#8892AA',
    fontSize: 12,
    fontWeight: '600',
  },
  copyCard: {
    backgroundColor: '#1C2235',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A3350',
  },
  copyLabel: {
    color: '#8892AA',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  codeBox: {
    backgroundColor: '#0D0F18',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A3350',
  },
  codeText: {
    color: '#8892AA',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  copyBtn: {
    backgroundColor: '#E50914',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  copyBtnDone: {
    backgroundColor: '#16A34A',
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  thanks: {
    color: '#8892AA',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    backgroundColor: '#E50914',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipText: {
    color: '#8892AA',
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 88,
    right: 18,
    backgroundColor: '#E50914',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 20,
  },
});

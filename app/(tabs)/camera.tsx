import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';

const LANGUAGES = ['English', 'Bodo', 'Assamese', 'Bengali', 'Hindi'];

const LANGUAGE_CODES: { [key: string]: string } = {
  English: 'en',
  Bodo: 'brx',
  Assamese: 'as',
  Bengali: 'bn',
  Hindi: 'hi',
};

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [showSourceLangModal, setShowSourceLangModal] = useState(false);
  const [showTargetLangModal, setShowTargetLangModal] = useState(false);
  const [capturedText, setCapturedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Request camera permission if not granted
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          We need camera permission to translate
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const translateTextAPI = async (text: string, from: string, to: string) => {
    if (!text.trim()) return '';

    const sourceCode = LANGUAGE_CODES[from];
    const targetCode = LANGUAGE_CODES[to];

    const endpoint = 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';
    const subscriptionKey = 'KbA_dh-JvZvKpjo152OjtWmHPGindblWZNX-Usvx0SxqP0l0pzGgWoWcRwQ-WuoE';

    const requestData = {
      pipelineTasks: [
        {
          taskType: 'translation',
          config: {
            language: { sourceLanguage: sourceCode, targetLanguage: targetCode },
            serviceId: 'ai4bharat/indictrans-v2-all-gpu--t4',
          },
        },
      ],
      inputData: { input: [{ source: text }] },
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: subscriptionKey,
        },
        body: JSON.stringify(requestData),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        return text;
      }

      return data.pipelineResponse[0]?.output[0]?.target || text;
    } catch (err) {
      console.error('Translation API error:', err);
      return text;
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing) return;

    setIsProcessing(true);
    setIsPaused(true);

    try {
      // Simulate OCR capture - In production, you'd use an OCR service
      // For demo, we'll use mock text
      const mockText = 'Hello World';
      setCapturedText(mockText);

      // Translate the captured text
      const translated = await translateTextAPI(mockText, sourceLang, targetLang);
      setTranslatedText(translated);
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Error', 'Failed to capture and translate text');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResume = () => {
    setIsPaused(false);
    setCapturedText('');
    setTranslatedText('');
  };

  const swapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);

    // Re-translate if we have text
    if (capturedText) {
      translateTextAPI(capturedText, targetLang, temp).then(setTranslatedText);
    }
  };

  const LanguageModal = ({
    visible,
    onClose,
    currentLang,
    onSelect,
    excludeLang,
  }: {
    visible: boolean;
    onClose: () => void;
    currentLang: string;
    onSelect: (lang: string) => void;
    excludeLang?: string;
  }) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Language</Text>
              {LANGUAGES.filter((lang) => lang !== excludeLang).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.languageOption,
                    currentLang === lang && styles.languageOptionActive,
                  ]}
                  onPress={() => {
                    onSelect(lang);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.languageOptionText,
                      currentLang === lang && styles.languageOptionTextActive,
                    ]}
                  >
                    {lang}
                  </Text>
                  {currentLang === lang && (
                    <Ionicons name="checkmark" size={24} color="#00D9FF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        mode="picture"
      >
        {/* Overlay for paused state */}
        {isPaused && (
          <View style={styles.pauseOverlay}>
            <Text style={styles.pauseText}>Tap shutter button to pause.</Text>
          </View>
        )}

        {/* Translation Overlay */}
        {translatedText && (
          <View style={styles.translationOverlay}>
            <View style={styles.translationBox}>
              <Text style={styles.translatedText}>{translatedText}</Text>
            </View>
          </View>
        )}
      </CameraView>

      {/* Language Selector */}
      <View style={styles.languageBar}>
        <TouchableOpacity
          style={styles.langButton}
          onPress={() => setShowSourceLangModal(true)}
        >
          <Text style={styles.langText}>{sourceLang}</Text>
          <Ionicons name="chevron-down" size={16} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.swapButton} onPress={swapLanguages}>
          <MaterialIcons name="swap-horiz" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.langButton}
          onPress={() => setShowTargetLangModal(true)}
        >
          <Text style={styles.langText}>{targetLang}</Text>
          <Ionicons name="chevron-down" size={16} color="#00D9FF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.controls}>
        {/* Gallery Button */}
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="images-outline" size={32} color="#fff" />
        </TouchableOpacity>

        {/* Capture/Resume Button */}
        <TouchableOpacity
          style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
          onPress={isPaused ? handleResume : handleCapture}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="large" color="#00D9FF" />
          ) : (
            <View
              style={[
                styles.captureInner,
                isPaused && styles.captureInnerPaused,
              ]}
            />
          )}
        </TouchableOpacity>

        {/* Flash Button */}
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="flash-outline" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab}>
          <Ionicons name="document-text-outline" size={24} color="#fff" />
          <Text style={styles.tabText}>Translate</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab}>
          <Ionicons name="camera" size={24} color="#00D9FF" />
          <Text style={[styles.tabText, styles.tabTextActive]}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab}>
          <Ionicons name="people-outline" size={24} color="#fff" />
          <Text style={styles.tabText}>Conversation</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab}>
          <Ionicons name="mic-outline" size={24} color="#fff" />
          <Text style={styles.tabText}>Live</Text>
        </TouchableOpacity>
      </View>

      {/* Language Selection Modals */}
      <LanguageModal
        visible={showSourceLangModal}
        onClose={() => setShowSourceLangModal(false)}
        currentLang={sourceLang}
        onSelect={setSourceLang}
        excludeLang={targetLang}
      />
      <LanguageModal
        visible={showTargetLangModal}
        onClose={() => setShowTargetLangModal(false)}
        currentLang={targetLang}
        onSelect={setTargetLang}
        excludeLang={sourceLang}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  camera: {
    flex: 1,
  },
  pauseOverlay: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  pauseText: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  translationOverlay: {
    position: 'absolute',
    top: '35%',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  translationBox: {
    backgroundColor: 'rgba(0, 217, 255, 0.95)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    maxWidth: '90%',
  },
  translatedText: {
    color: '#000',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  languageBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 80,
    left: '50%',
    transform: [{ translateX: -150 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    zIndex: 100,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  langText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  swapButton: {
    padding: 4,
  },
  controls: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
  captureInnerPaused: {
    backgroundColor: '#00D9FF',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 12,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  tab: {
    alignItems: 'center',
    gap: 4,
  },
  tabText: {
    color: '#fff',
    fontSize: 12,
  },
  tabTextActive: {
    color: '#00D9FF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  languageOptionActive: {
    backgroundColor: '#2a2a2a',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#fff',
  },
  languageOptionTextActive: {
    color: '#00D9FF',
    fontWeight: '600',
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#00D9FF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
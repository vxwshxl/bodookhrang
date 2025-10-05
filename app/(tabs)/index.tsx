import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  Clipboard,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface TranslationCard {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}

export default function Page() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [cards, setCards] = useState<TranslationCard[]>([]);
  const [bookmarkedCards, setBookmarkedCards] = useState<Set<string>>(new Set());

  // Simple mock translation (replace with actual API later)
  const translateText = (text: string) => {
    if (!text.trim()) {
      setTranslatedText('');
      return;
    }
    // Mock translation - you'll replace this with actual translation API
    const translations: { [key: string]: string } = {
      'Hello': 'Hola',
      'How are you': '¿Cómo estás?',
      'Good morning': 'Buenos días',
      'Thank you': 'Gracias',
      'Goodbye': 'Adiós',
      'Please': 'Por favor',
      'Yes': 'Sí',
      'No': 'No',
    };
    setTranslatedText(translations[text] || `${text} (traducido)`);
  };

  const handleSourceTextChange = (text: string) => {
    setSourceText(text);
    translateText(text);
  };

  const clearSourceText = () => {
    setSourceText('');
    setTranslatedText('');
  };

  const swapLanguages = () => {
    const temp = sourceText;
    setSourceText(translatedText);
    setTranslatedText(temp);
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Text copied to clipboard');
  };

  const speakText = (text: string, language: string = 'en') => {
    if (!text.trim()) return;
    // Mock TTS - will show alert for now
    Alert.alert('Text to Speech', `Speaking: "${text}" in ${language}`);
  };

  const toggleBookmark = (cardId: string) => {
    setBookmarkedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const createNewCard = () => {
    if (!sourceText.trim() || !translatedText.trim()) return;

    const newCard: TranslationCard = {
      id: Date.now().toString(),
      sourceText,
      translatedText,
      sourceLang: 'English (US)',
      targetLang: 'Spanish (Spain)',
    };

    setCards(prev => [newCard, ...prev]);
    setSourceText('');
    setTranslatedText('');
  };

  const removeCard = (cardId: string) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
    setBookmarkedCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(cardId);
      return newSet;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Translate</Text>
        <TouchableOpacity 
          style={styles.checkButton}
          onPress={createNewCard}
        >
          <Ionicons name="checkmark" size={28} color="#00D9FF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Translation Card */}
        <View style={styles.translationCard}>
          {/* Source Language */}
          <View style={styles.languageSection}>
            <View style={styles.languageHeader}>
              <Text style={styles.languageText}>English (US)</Text>
              <Ionicons name="chevron-down" size={16} color="#999" />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter text"
                placeholderTextColor="#555"
                value={sourceText}
                onChangeText={handleSourceTextChange}
                multiline
              />
              {sourceText.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={clearSourceText}
                >
                  <Ionicons name="close-circle" size={24} color="#666" />
                </TouchableOpacity>
              )}
            </View>
            {sourceText.length > 0 && (
              <TouchableOpacity 
                style={styles.volumeButton}
                onPress={() => speakText(sourceText, 'English (US)')}
              >
                <Ionicons name="volume-high" size={20} color="#00D9FF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Swap Button */}
          <View style={styles.swapContainer}>
            <View style={styles.divider} />
            <TouchableOpacity 
              style={styles.swapButton}
              onPress={swapLanguages}
            >
              <MaterialIcons name="swap-vert" size={24} color="#00D9FF" />
            </TouchableOpacity>
            <View style={styles.divider} />
          </View>

          {/* Target Language */}
          <View style={styles.languageSection}>
            <View style={styles.languageHeader}>
              <Text style={styles.languageTextTarget}>Spanish (Spain)</Text>
              <Ionicons name="chevron-down" size={16} color="#00D9FF" />
            </View>
            <View style={styles.outputContainer}>
              <Text style={styles.output}>
                {translatedText || 'Introducir texto'}
              </Text>
            </View>
            
            {/* Action Buttons */}
            {translatedText && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => copyToClipboard(translatedText)}
                >
                  <MaterialIcons name="content-copy" size={20} color="#00D9FF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="star-outline" size={20} color="#00D9FF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-outline" size={20} color="#00D9FF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.volumeButtonBottom}
                  onPress={() => speakText(translatedText, 'Spanish (Spain)')}
                >
                  <Ionicons name="volume-high" size={20} color="#00D9FF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Saved Cards */}
        {cards.map((card) => (
          <Animated.View key={card.id} style={styles.savedCard}>
            <View style={styles.cardContent}>
              {/* Source */}
              <View style={styles.cardSection}>
                <Text style={styles.cardLang}>{card.sourceLang}</Text>
                <View style={styles.cardTextRow}>
                  <Text style={styles.cardText}>{card.sourceText}</Text>
                  <TouchableOpacity 
                    onPress={() => speakText(card.sourceText, card.sourceLang)}
                  >
                    <Ionicons name="play-circle" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.cardDivider} />

              {/* Translation */}
              <View style={styles.cardSection}>
                <Text style={styles.cardLangTarget}>{card.targetLang}</Text>
                <View style={styles.cardTextRow}>
                  <Text style={styles.cardTextTarget}>{card.translatedText}</Text>
                  <TouchableOpacity 
                    onPress={() => speakText(card.translatedText, card.targetLang)}
                  >
                    <Ionicons name="play-circle" size={24} color="#00D9FF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Card Actions */}
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => copyToClipboard(card.translatedText)}>
                  <MaterialIcons name="content-copy" size={18} color="#00D9FF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleBookmark(card.id)}>
                  <Ionicons 
                    name={bookmarkedCards.has(card.id) ? "star" : "star-outline"} 
                    size={18} 
                    color="#00D9FF" 
                  />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="share-outline" size={18} color="#00D9FF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Delete Button */}
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => removeCard(card.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF4444" />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  checkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  translationCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  languageSection: {
    position: 'relative',
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  languageText: {
    fontSize: 14,
    color: '#999',
    marginRight: 4,
  },
  languageTextTarget: {
    fontSize: 14,
    color: '#00D9FF',
    marginRight: 4,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '500',
    minHeight: 40,
    paddingRight: 40,
  },
  clearButton: {
    position: 'absolute',
    right: 0,
    top: 8,
  },
  volumeButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  outputContainer: {
    minHeight: 40,
  },
  output: {
    fontSize: 28,
    color: '#00D9FF',
    fontWeight: '500',
  },
  swapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 24,
  },
  actionButton: {
    padding: 4,
  },
  volumeButtonBottom: {
    marginLeft: 'auto',
  },
  savedCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
  },
  cardContent: {
    paddingRight: 40,
  },
  cardSection: {
    marginBottom: 12,
  },
  cardLang: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  cardLangTarget: {
    fontSize: 12,
    color: '#00D9FF',
    marginBottom: 8,
  },
  cardTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  cardTextTarget: {
    fontSize: 20,
    color: '#00D9FF',
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
  },
  deleteButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
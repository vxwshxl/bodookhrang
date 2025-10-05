import React, { useState, useEffect } from 'react';
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
  Share,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TranslationCard {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  isBookmarked: boolean;
}

const LANGUAGES = ['English', 'Bodo', 'Assamese', 'Bengali', 'Hindi'];

export default function TranslateScreen() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [cards, setCards] = useState<TranslationCard[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [menuAnimation] = useState(new Animated.Value(0));
  const [favoritesAnimation] = useState(new Animated.Value(0));
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [showSourceLangModal, setShowSourceLangModal] = useState(false);
  const [showTargetLangModal, setShowTargetLangModal] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  useEffect(() => {
    saveCards();
  }, [cards]);

  const loadCards = async () => {
    try {
      const savedCards = await AsyncStorage.getItem('translation_cards');
      if (savedCards) {
        setCards(JSON.parse(savedCards));
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const saveCards = async () => {
    try {
      await AsyncStorage.setItem('translation_cards', JSON.stringify(cards));
    } catch (error) {
      console.error('Error saving cards:', error);
    }
  };

  const translateText = (text: string, from: string, to: string) => {
    if (!text.trim()) {
      setTranslatedText('');
      return;
    }
    const mockTranslations: { [key: string]: { [key: string]: string } } = {
      'Hello': { 'Hindi': 'नमस्ते', 'Bodo': 'आय', 'Assamese': 'নমস্কাৰ', 'Bengali': 'হ্যালো' },
      'How are you': { 'Hindi': 'आप कैसे हैं', 'Bodo': 'नं सायाव', 'Assamese': 'আপুনি কেনে আছে', 'Bengali': 'তুমি কেমন আছো' },
      'Thank you': { 'Hindi': 'धन्यवाद', 'Bodo': 'अनानसे', 'Assamese': 'ধন্যবাদ', 'Bengali': 'ধন্যবাদ' },
    };
    
    if (mockTranslations[text] && mockTranslations[text][to]) {
      setTranslatedText(mockTranslations[text][to]);
    } else {
      setTranslatedText(`[${text}] → ${to}`);
    }
  };

  const handleSourceTextChange = (text: string) => {
    setSourceText(text);
    translateText(text, sourceLang, targetLang);
  };

  const clearSourceText = () => {
    setSourceText('');
    setTranslatedText('');
  };

  const swapLanguages = () => {
    const tempLang = sourceLang;
    const tempText = sourceText;
    
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  const copyToClipboard = (text: string, key: string = 'main') => {
    Clipboard.setString(text);
    setCopiedStates({ ...copiedStates, [key]: true });
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [key]: false });
    }, 3000);
  };

  const shareText = async (text: string) => {
    try {
      await Share.share({
        message: text,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const toggleBookmark = async (cardId: string) => {
    const updatedCards = cards.map(card =>
      card.id === cardId ? { ...card, isBookmarked: !card.isBookmarked } : card
    );
    setCards(updatedCards);
  };

  const createNewCard = () => {
    if (!sourceText.trim() || !translatedText.trim()) return;

    const newCard: TranslationCard = {
      id: Date.now().toString(),
      sourceText,
      translatedText,
      sourceLang,
      targetLang,
      isBookmarked: false,
    };

    setCards(prev => [newCard, ...prev]);
    setSourceText('');
    setTranslatedText('');
    setIsInputFocused(false);
    Keyboard.dismiss();
  };

  const removeCard = (cardId: string) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
  };

  const openMenu = () => {
    setShowMenu(true);
    Animated.spring(menuAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(menuAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowMenu(false));
  };

  const openFavorites = () => {
    setShowFavorites(true);
    Animated.spring(favoritesAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  };

  const closeFavorites = () => {
    Animated.timing(favoritesAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowFavorites(false));
  };

  const menuTranslateY = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  const favoritesTranslateY = favoritesAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [800, 0],
  });

  const favoriteCards = cards.filter(card => card.isBookmarked);

  const LanguageModal = ({ 
    visible, 
    onClose, 
    currentLang, 
    onSelect, 
    excludeLang 
  }: { 
    visible: boolean; 
    onClose: () => void; 
    currentLang: string; 
    onSelect: (lang: string) => void;
    excludeLang?: string;
  }) => (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Language</Text>
              {LANGUAGES.filter(lang => lang !== excludeLang).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.languageOption,
                    currentLang === lang && styles.languageOptionActive
                  ]}
                  onPress={() => {
                    onSelect(lang);
                    onClose();
                  }}
                >
                  <Text style={[
                    styles.languageOptionText,
                    currentLang === lang && styles.languageOptionTextActive
                  ]}>
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={openFavorites}
        >
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Translate</Text>
        {isInputFocused && (sourceText.trim() || translatedText.trim()) ? (
          <TouchableOpacity 
            style={styles.checkButton}
            onPress={createNewCard}
          >
            <Ionicons name="checkmark" size={24} color="#00D9FF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.checkButton}
            onPress={openMenu}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Translation Card */}
        <View style={styles.translationCard}>
          {/* Source Language */}
          <View style={styles.languageSection}>
            <TouchableOpacity 
              style={styles.languageHeader}
              onPress={() => setShowSourceLangModal(true)}
            >
              <Text style={styles.languageText}>{sourceLang}</Text>
              <Ionicons name="chevron-down" size={16} color="#999" />
            </TouchableOpacity>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter text"
                placeholderTextColor="#555"
                value={sourceText}
                onChangeText={handleSourceTextChange}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
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
            <TouchableOpacity 
              style={styles.languageHeader}
              onPress={() => setShowTargetLangModal(true)}
            >
              <Text style={styles.languageTextTarget}>{targetLang}</Text>
              <Ionicons name="chevron-down" size={16} color="#00D9FF" />
            </TouchableOpacity>
            <View style={styles.outputContainer}>
              <Text style={styles.output}>
                {translatedText || 'Translation'}
              </Text>
            </View>
            
            {/* Action Buttons */}
            {translatedText && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => copyToClipboard(translatedText, 'main')}
                >
                  {copiedStates['main'] ? (
                    <Ionicons name="checkmark" size={24} color="#00FF00" />
                  ) : (
                    <MaterialIcons name="content-copy" size={24} color="#00D9FF" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="star-outline" size={24} color="#00D9FF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => shareText(`${sourceText}\n→ ${translatedText}`)}
                >
                  <Ionicons name="share-outline" size={24} color="#00D9FF" />
                </TouchableOpacity>
                {isInputFocused && (
                  <TouchableOpacity 
                    style={styles.nextButton}
                    onPress={createNewCard}
                  >
                    <Text style={styles.nextButtonText}>Next</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Saved Cards */}
        {cards.map((card) => (
          <View key={card.id} style={styles.savedCard}>
            <View style={styles.cardContent}>
              {/* Source */}
              <View style={styles.cardSection}>
                <Text style={styles.cardLang}>{card.sourceLang}</Text>
                <View style={styles.cardTextRow}>
                  <Text style={styles.cardText}>{card.sourceText}</Text>
                  <TouchableOpacity>
                    <Ionicons name="volume-high" size={24} color="#fff" />
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
                  <TouchableOpacity>
                    <Ionicons name="volume-high" size={24} color="#00D9FF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Card Actions */}
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  onPress={() => copyToClipboard(card.translatedText, card.id)}
                >
                  {copiedStates[card.id] ? (
                    <Ionicons name="checkmark" size={24} color="#00FF00" />
                  ) : (
                    <MaterialIcons name="content-copy" size={24} color="#00D9FF" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleBookmark(card.id)}>
                  <Ionicons 
                    name={card.isBookmarked ? "star" : "star-outline"} 
                    size={24} 
                    color="#00D9FF" 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => shareText(`${card.sourceText}\n→ ${card.translatedText}`)}
                >
                  <Ionicons name="share-outline" size={24} color="#00D9FF" />
                </TouchableOpacity>
                <View style={styles.spacer} />
                <TouchableOpacity 
                  onPress={() => removeCard(card.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={24} color="#FF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Menu Modal */}
      {showMenu && (
        <Modal
          visible={showMenu}
          transparent
          animationType="none"
          onRequestClose={closeMenu}
        >
          <TouchableWithoutFeedback onPress={closeMenu}>
            <View style={styles.menuOverlay}>
              <TouchableWithoutFeedback>
                <Animated.View 
                  style={[
                    styles.menuContainer,
                    { transform: [{ translateY: menuTranslateY }] }
                  ]}
                >
                  <View style={styles.menuHandle} />
                  <Text style={styles.menuText}>Hello World</Text>
                  <Text style={styles.menuSubtext}>This is a dummy menu</Text>
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* Favorites Modal */}
      {showFavorites && (
        <Modal
          visible={showFavorites}
          transparent
          animationType="none"
          onRequestClose={closeFavorites}
        >
          <TouchableWithoutFeedback onPress={closeFavorites}>
            <View style={styles.menuOverlay}>
              <TouchableWithoutFeedback>
                <Animated.View 
                  style={[
                    styles.favoritesContainer,
                    { transform: [{ translateY: favoritesTranslateY }] }
                  ]}
                >
                  <View style={styles.favoritesHeader}>
                    <Text style={styles.favoritesTitle}>Favorites</Text>
                    <TouchableOpacity onPress={closeFavorites} style={styles.closeButton}>
                      <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView style={styles.favoritesScroll}>
                    {favoriteCards.length === 0 ? (
                      <Text style={styles.emptyText}>No favorites yet</Text>
                    ) : (
                      favoriteCards.map((card) => (
                        <View key={card.id} style={styles.favoriteCard}>
                          <Text style={styles.favoriteLanguages}>
                            {card.sourceLang} - {card.targetLang}
                          </Text>
                          <View style={styles.favoriteContent}>
                            <View style={styles.favoriteSection}>
                              <Text style={styles.favoriteLang}>{card.sourceLang}</Text>
                              <View style={styles.favoriteTextRow}>
                                <Text style={styles.favoriteText}>{card.sourceText}</Text>
                                <TouchableOpacity>
                                  <Ionicons name="volume-high" size={24} color="#fff" />
                                </TouchableOpacity>
                              </View>
                            </View>
                            
                            <View style={styles.favoriteSection}>
                              <Text style={styles.favoriteLangTarget}>{card.targetLang}</Text>
                              <View style={styles.favoriteTextRow}>
                                <Text style={styles.favoriteTextTarget}>{card.translatedText}</Text>
                                <TouchableOpacity>
                                  <Ionicons name="volume-high" size={24} color="#00D9FF" />
                                </TouchableOpacity>
                              </View>
                            </View>

                            <View style={styles.favoriteActions}>
                              <TouchableOpacity 
                                onPress={() => copyToClipboard(card.translatedText, `fav-${card.id}`)}
                              >
                                {copiedStates[`fav-${card.id}`] ? (
                                  <Ionicons name="checkmark" size={24} color="#00FF00" />
                                ) : (
                                  <MaterialIcons name="content-copy" size={24} color="#00D9FF" />
                                )}
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => toggleBookmark(card.id)}>
                                <Ionicons name="star" size={24} color="#00D9FF" />
                              </TouchableOpacity>
                              <View style={styles.spacer} />
                              <TouchableOpacity 
                                onPress={() => toggleBookmark(card.id)}
                                style={styles.deleteButton}
                              >
                                <Ionicons name="trash-outline" size={24} color="#FF4444" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      ))
                    )}
                  </ScrollView>
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    backgroundColor: '#000',
    paddingHorizontal: 16,
    marginBottom: -40,
  },
  contentContainer: {
    paddingBottom: 150,
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
  nextButton: {
    marginLeft: 'auto',
    backgroundColor: '#00D9FF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  nextButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  savedCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
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
    alignItems: 'center',
    gap: 24,
    marginTop: 8,
  },
  spacer: {
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 200,
  },
  menuHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  menuText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  menuSubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  favoritesContainer: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    paddingTop: 20,
  },
  favoritesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  favoritesTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoritesScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  favoriteCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  favoriteLanguages: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  favoriteContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  favoriteSection: {
    marginBottom: 16,
  },
  favoriteLang: {
    fontSize: 11,
    color: '#999',
    marginBottom: 6,
  },
  favoriteLangTarget: {
    fontSize: 11,
    color: '#00D9FF',
    marginBottom: 6,
  },
  favoriteTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  favoriteText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  favoriteTextTarget: {
    fontSize: 18,
    color: '#00D9FF',
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  favoriteActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
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
  cardContent: {},
});
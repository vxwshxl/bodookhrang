import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Animated,
  StatusBar,
  Keyboard
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { SARVAM_API_KEY, SARVAM_API_ENDPOINT, SARVAM_MODEL, REASONING_EFFORT, MAX_TOKENS } from '@env';
import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Suggestion buttons data
const SUGGESTIONS = [
  { text: 'Decode Scheme', icon: 'document-text-outline' },
  { text: 'Ramayana', icon: 'book-outline' },
  { text: 'Maths Problem', icon: 'calculator-outline' },
  { text: 'Translate', icon: 'language-outline' },
  { text: 'Coding', icon: 'code-slash-outline' },
  { text: "What's in my Aadhaar?", icon: 'card-outline' }
];

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('Think');
  const [model, setModel] = useState('okhrangsa');
  const [modelDropdownVisible, setModelDropdownVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: 'Python task list', selected: true },
    { id: 2, title: 'Vedas summary for test', selected: false },
    { id: 3, title: 'Truth table explanation', selected: false },
    { id: 4, title: 'Extract questions clearly', selected: false }
  ]);
  const [currentChatTitle, setCurrentChatTitle] = useState('New Chat');
  const scrollViewRef = useRef();
  const slideAnim = useRef(new Animated.Value(-300)).current;

  const sendMessage = async (messageText) => {
    Keyboard.dismiss();
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Set chat title from first message
    if (messages.length === 0) {
      setCurrentChatTitle(textToSend.slice(0, 30) + (textToSend.length > 30 ? '...' : ''));
    }

    try {
      const response = await fetch(SARVAM_API_ENDPOINT, {
        method: "POST",
        headers: {
          "api-subscription-key": SARVAM_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: newMessages,
          model: SARVAM_MODEL,
          reasoning_effort: REASONING_EFFORT,
          max_tokens: parseInt(MAX_TOKENS),
          wiki_grounding: mode === 'Wiki',
          temperature: 0.2
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      const reply = data?.choices?.[0]?.message?.content || 'No response received.';
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Error:', err);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: `Error: ${err.message}. Please check your network connection and API key.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    sendMessage(suggestion);
  };

  const toggleSidebar = () => {
    if (sidebarVisible) {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setSidebarVisible(false));
    } else {
      setSidebarVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatTitle('New Chat');
    toggleSidebar();
  };

  const handleLoadChat = (chat) => {
    const updatedHistory = chatHistory.map(c => ({
      ...c,
      selected: c.id === chat.id
    }));
    setChatHistory(updatedHistory);
    setCurrentChatTitle(chat.title);
    toggleSidebar();
    // Load chat messages here
  };

  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -50 : -80}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
              <Feather name="menu" size={24} color="#ECECEC" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>OkhranGPT</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="edit" size={20} color="#ECECEC" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => setMenuVisible(true)}>
              <Feather name="more-vertical" size={20} color="#ECECEC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages Area */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  <MaterialCommunityIcons name="chat-processing" size={48} color="#19C37D" />
                </View>
              </View>
              
              <View style={styles.suggestionsGrid}>
                {SUGGESTIONS.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionButton}
                    onPress={() => handleSuggestionPress(suggestion.text)}
                  >
                    <Ionicons name={suggestion.icon} size={20} color="#8E8EA0" />
                    <Text style={styles.suggestionText}>{suggestion.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <>
              {messages.map((msg, index) => (
                <View key={index} style={[
                  styles.messageRow,
                  msg.role === 'user' && styles.messageRowUser
                ]}>
                  <View style={[
                    styles.messageContent,
                    msg.role === 'user' && styles.messageContentUser
                  ]}>
                    <View style={styles.messageTextContainer}>
                      <Text style={styles.messageText}>{msg.content}</Text>
                      {msg.role === 'assistant' && (
                        <View style={styles.actionButtons}>
                          <TouchableOpacity style={styles.actionButton}>
                           <Octicons name="copy" size={17} color="#fff" />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="volume-high-outline" size={22} color="#fff" />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.actionButton}>
                            <MaterialIcons name="loop" size={20} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
              {loading && (
                <View style={styles.messageRow}>
                  <View style={styles.messageContent}>
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="#19C37D" size="small" />
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputWrapper}>
          {/* Mode Selector */}
          <View style={styles.modeSelector}>
            <View style={styles.modeSelectorLeft}>
              <TouchableOpacity
                style={[styles.modeButton, mode === 'Think' && styles.modeButtonActive]}
                onPress={() => setMode('Think')}
              >
                <Ionicons 
                  name="bulb-outline" 
                  size={18} 
                  color={mode === 'Think' ? '#ECECEC' : '#8E8EA0'} 
                />
                <Text style={[styles.modeText, mode === 'Think' && styles.modeTextActive]}>
                  Think
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modeButton, mode === 'Wiki' && styles.modeButtonActive]}
                onPress={() => setMode('Wiki')}
              >
                <Ionicons 
                  name="library-outline" 
                  size={18} 
                  color={mode === 'Wiki' ? '#ECECEC' : '#8E8EA0'} 
                />
                <Text style={[styles.modeText, mode === 'Wiki' && styles.modeTextActive]}>
                  Wiki
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modelButton}
              onPress={() => setModelDropdownVisible(!modelDropdownVisible)}
            >
              <Text style={styles.modelText}>{model}</Text>
              <Ionicons 
                name={modelDropdownVisible ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#8E8EA0" 
              />
            </TouchableOpacity>
          </View>

          {/* Model Dropdown */}
          {modelDropdownVisible && (
            <View style={styles.modelDropdown}>
              <TouchableOpacity
                style={[styles.modelOption, model === 'okhrangsa' && styles.modelOptionActive]}
                onPress={() => {
                  setModel('okhrangsa');
                  setModelDropdownVisible(false);
                }}
              >
                <Text style={[styles.modelOptionText, model === 'okhrangsa' && styles.modelOptionTextActive]}>
                  okhrangsa
                </Text>
                {model === 'okhrangsa' && (
                  <Ionicons name="checkmark" size={18} color="#19C37D" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modelOption, model === 'aronai-bodo' && styles.modelOptionActive]}
                onPress={() => {
                  setModel('aronai-bodo');
                  setModelDropdownVisible(false);
                }}
              >
                <Text style={[styles.modelOptionText, model === 'aronai-bodo' && styles.modelOptionTextActive]}>
                  aronai-bodo
                </Text>
                {model === 'aronai-bodo' && (
                  <Ionicons name="checkmark" size={18} color="#19C37D" />
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="What's on your mind?"
              placeholderTextColor="#8E8EA0"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={2000}
            />
            {input.trim() && (
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={() => sendMessage()}
                disabled={loading}
              >
                <Ionicons name="arrow-up" size={20} color="#000000" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sidebar Menu */}
        {sidebarVisible && (
          <TouchableOpacity 
            style={styles.overlay} 
            activeOpacity={1} 
            onPress={toggleSidebar}
          >
            <Animated.View 
              style={[
                styles.sidebar,
                { transform: [{ translateX: slideAnim }] }
              ]}
            >
              <TouchableOpacity activeOpacity={1} style={styles.sidebarContent}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={20} color="#8E8EA0" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search"
                    placeholderTextColor="#8E8EA0"
                  />
                </View>

                {/* Scrollable Content */}
                <ScrollView style={styles.sidebarScrollable} showsVerticalScrollIndicator={false}>
                  {/* New Chat Button */}
                  <TouchableOpacity style={styles.newProjectButton} onPress={handleNewChat}>
                    <MaterialCommunityIcons name="folder-plus-outline" size={24} color="#ECECEC" />
                    <Text style={styles.newProjectText}>New chat</Text>
                  </TouchableOpacity>

                  {/* Recent Chats */}
                  <View style={styles.recentChatsHeader}>
                    <Text style={styles.recentChatsTitle}>Recent</Text>
                  </View>

                  <View style={styles.chatList}>
                    {chatHistory.map((chat) => (
                      <TouchableOpacity 
                        key={chat.id} 
                        style={[
                          styles.chatItem,
                          chat.selected && styles.chatItemSelected
                        ]}
                        onPress={() => handleLoadChat(chat)}
                      >
                        <Text style={styles.chatItemText}>{chat.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {/* Upgrade to Pro */}
                <TouchableOpacity style={styles.upgradeButton}>
                  <MaterialCommunityIcons name="crown-outline" size={24} color="#FFD700" />
                  <Text style={styles.upgradeText}>Upgrade to Pro</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        )}

        {/* Three Dots Menu Modal */}
        <Modal
          visible={menuVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <BlurView intensity={30} tint="dark" style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalOverlayTouchable} 
              activeOpacity={1}
              onPress={() => setMenuVisible(false)}
            >
              <BlurView intensity={80} tint="dark" style={styles.menuPopup}>
                <TouchableOpacity style={styles.menuItem}>
                  <Ionicons name="share-outline" size={20} color="#ECECEC" />
                  <Text style={styles.menuItemText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                  <Ionicons name="create-outline" size={20} color="#ECECEC" />
                  <Text style={styles.menuItemText}>Rename</Text>
                  <Ionicons name="chevron-forward" size={20} color="#8E8EA0" style={styles.menuItemArrow} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                  <Ionicons name="flag-outline" size={20} color="#ECECEC" />
                  <Text style={styles.menuItemText}>Report</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                  <Ionicons name="archive-outline" size={20} color="#ECECEC" />
                  <Text style={styles.menuItemText}>Archive</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                  <Ionicons name="trash-outline" size={20} color="#FF453A" />
                  <Text style={[styles.menuItemText, styles.menuItemDangerText]}>Delete</Text>
                </TouchableOpacity>
              </BlurView>
            </TouchableOpacity>
          </BlurView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#2F2F2F',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ECECEC',
    fontFamily: 'twk',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  messagesContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 60,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 100,
    backgroundColor: '#19C37D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    maxWidth: 600,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2F2F2F',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#3F3F3F',
  },
  suggestionText: {
    color: '#ECECEC',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'fgr',
  },
  messageRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageRowUser: {
    alignItems: 'flex-end',
  },
  messageContent: {
    flexDirection: 'row',
    gap: 12,
    maxWidth: '100%',
  },
  messageContentUser: {
    backgroundColor: '#2F2F2F',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },  
  messageTextContainer: {
    flexShrink: 1,
  },
  messageText: {
    fontSize: 18,
    lineHeight: 24,
    color: '#ECECEC',
    fontFamily: 'fgr',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    paddingVertical: 8,
  },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 100 : 65,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modeSelectorLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: '#2F2F2F',
    borderWidth: 1,
    borderColor: '#3F3F3F',
  },
  modeButtonActive: {
    backgroundColor: '#19C37D',
    borderColor: '#19C37D',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    fontFamily: 'fgr',
  },
  modeTextActive: {
    color: '#fff',
  },
  modelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: '#2F2F2F',
    borderWidth: 1,
    borderColor: '#3F3F3F',
  },
  modelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ECECEC',
    fontFamily: 'fgr',
  },
  modelDropdown: {
    backgroundColor: '#2F2F2F',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3F3F3F',
    overflow: 'hidden',
  },
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modelOptionActive: {
    backgroundColor: 'rgba(25, 195, 125, 0.1)',
  },
  modelOptionText: {
    fontSize: 14,
    color: '#ECECEC',
    fontFamily: 'fgr',
  },
  modelOptionTextActive: {
    color: '#19C37D',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F2F2F',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'android' ? 7 : 15,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ECECEC',
    maxHeight: 100,
    fontFamily: 'fgr',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 100,
    backgroundColor: '#ECECEC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 16,
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarScrollable: {
    flex: 1,
    marginBottom: 80,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F2F2F',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'android' ? 2 : 10,
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ECECEC',
    fontFamily: 'fgr',
  },
  newProjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    borderRadius: 100,
    marginBottom: 20,
  },
  newProjectText: {
    fontSize: 16,
    color: '#ECECEC',
    fontWeight: '500',
    fontFamily: 'fgr',
  },
  recentChatsHeader: {
    paddingVertical: 12,
    marginBottom: 8,
  },
  recentChatsTitle: {
    fontSize: 16,
    color: '#8E8EA0',
    fontWeight: '500',
    fontFamily: 'fgr',
  },
  chatList: {
    gap: 4,
    marginBottom: 20,
  },
  chatItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  chatItemSelected: {
    backgroundColor: '#2F2F2F',
  },
  chatItemText: {
    fontSize: 17,
    color: '#ECECEC',
    fontFamily: 'fgr',
  },
  upgradeButton: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 100 : 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 14,
    backgroundColor: '#2F2F2F',
    borderRadius: 12,
    width: '100%',
  },
  upgradeText: {
    fontSize: 16,
    color: '#ECECEC',
    fontWeight: '600',
    fontFamily: 'fgr',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlayTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  menuPopup: {
    borderRadius: 20,
    width: '80%',
    maxWidth: 340,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#ECECEC',
    flex: 1,
    fontFamily: 'fgr',
  },
  menuItemArrow: {
    marginLeft: 'auto',
  },
  menuItemDangerText: {
    color: '#FF453A',
  },
});
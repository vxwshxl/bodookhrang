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
  ActivityIndicator
} from 'react-native';

// Suggestion buttons data
const SUGGESTIONS = [
  'Decode Scheme',
  'Ramayana',
  'Maths Problem',
  'Translate',
  'Code in Hinglish',
  "What's in my Aadhaar?"
];

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('Think'); // 'Think' or 'Wiki'
  const scrollViewRef = useRef();

  const API_KEY = "sk_6l2ncq41_epFu3PndVb88rx07Yu4Xnyby";
  const API_URL = "https://api.sarvam.ai/v1/chat/completions";

  const sendMessage = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'api-subscription-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sarvam-m',
          messages: newMessages,
          reasoning_effort: 'high',
          max_tokens: 30000,
          wiki_grounding: mode === 'Wiki',
        }),
      });

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content || 'No response received.';
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Error:', err);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error connecting to Sarvam AI.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    sendMessage(suggestion);
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backIcon}>›</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
          <TouchableOpacity style={styles.historyButton}>
            <View style={styles.historyIcon}>
              <View style={styles.historyCircle} />
              <View style={styles.historyArrow} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Messages Area */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.logo}>
                <View style={styles.logoRays} />
              </View>
              
              <View style={styles.suggestionsGrid}>
                {SUGGESTIONS.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionButton}
                    onPress={() => handleSuggestionPress(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            messages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.messageBubble,
                  msg.role === 'user' ? styles.userBubble : styles.assistantBubble
                ]}
              >
                <Text style={[
                  styles.messageText,
                  msg.role === 'user' ? styles.userText : styles.assistantText
                ]}>
                  {msg.content}
                </Text>
              </View>
            ))
          )}
          {loading && (
            <View style={styles.loadingBubble}>
              <ActivityIndicator color="#f97316" />
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="What's on your mind?"
              placeholderTextColor="#9ca3af"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </TouchableOpacity>
          </View>
          
          {/* Mode Selector */}
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'Think' && styles.modeButtonActive]}
              onPress={() => setMode('Think')}
            >
              <Text style={styles.modeIcon}>🧠</Text>
              <Text style={[styles.modeText, mode === 'Think' && styles.modeTextActive]}>
                Think
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modeButton, mode === 'Wiki' && styles.modeButtonActive]}
              onPress={() => setMode('Wiki')}
            >
              <Text style={styles.modeIcon}>📚</Text>
              <Text style={[styles.modeText, mode === 'Wiki' && styles.modeTextActive]}>
                Wiki
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafaf9',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 32,
    fontWeight: '300',
    transform: [{ rotate: '180deg' }],
    color: '#000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  historyButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyIcon: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 12,
    position: 'relative',
  },
  historyCircle: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 2,
    height: 6,
    backgroundColor: '#000',
  },
  historyArrow: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 4,
    height: 2,
    backgroundColor: '#000',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 120,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoRays: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#f97316',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  suggestionButton: {
    backgroundColor: '#fef3f2',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ffe4e1',
  },
  suggestionText: {
    color: '#1f2937',
    fontSize: 15,
    fontWeight: '500',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#1f2937',
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 18,
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f9fafb',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#78716c',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: '#fef3f2',
    borderColor: '#fed7d7',
  },
  modeIcon: {
    fontSize: 16,
  },
  modeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
  },
  modeTextActive: {
    color: '#f97316',
  },
});
// components/CustomMarkdown.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Ionicons, Octicons } from '@expo/vector-icons';
import ThinkingBlock from './ThinkingBlock'; // make sure the path is correct

const CustomMarkdown = ({ children: content, index, copiedCode, onCopy, thinkingExpanded, onToggleThinking }) => {
  // Extract thinking block
  const thinkRegex = /<think>([\s\S]*?)<\/think>/;
  const thinkMatch = content.match(thinkRegex);

  let thinkingContent = null;
  let mainContent = content;

  if (thinkMatch) {
    thinkingContent = thinkMatch[1].trim();
    mainContent = content.replace(thinkRegex, '').trim();
  }

  // Split code blocks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let blockIndex = 0;

  while ((match = codeBlockRegex.exec(mainContent)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'markdown',
        content: mainContent.substring(lastIndex, match.index),
        key: `md-${blockIndex}`
      });
    }

    const language = match[1] || 'code';
    const code = match[2].trim();
    const codeKey = `${index}-${blockIndex}`;
    const isCopied = copiedCode === codeKey;

    parts.push({
      type: 'code',
      language,
      code,
      codeKey,
      isCopied,
      key: `code-${blockIndex}`
    });

    lastIndex = match.index + match[0].length;
    blockIndex++;
  }

  if (lastIndex < mainContent.length) {
    parts.push({
      type: 'markdown',
      content: mainContent.substring(lastIndex),
      key: `md-${blockIndex}`
    });
  }

  if (parts.length === 0 && !thinkingContent) {
    return <Markdown style={markdownStyles}>{content}</Markdown>;
  }

  return (
    <>
      {thinkingContent && (
        <ThinkingBlock 
          content={thinkingContent}
          index={index}
          thinkingExpanded={thinkingExpanded}
          onToggle={onToggleThinking}
        />
      )}
      {parts.map((part) => {
        if (part.type === 'markdown') {
          return <Markdown key={part.key} style={markdownStyles}>{part.content}</Markdown>;
        } else {
          return (
            <View key={part.key} style={styles.codeBlockContainer}>
              <View style={styles.codeBlockHeader}>
                <Text style={styles.codeLanguage}>{part.language}</Text>
                <TouchableOpacity style={styles.copyCodeButton} onPress={() => onCopy(part.code, part.codeKey)}>
                  {part.isCopied ? (
                    <>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                      <Text style={styles.copiedText}>Copied</Text>
                    </>
                  ) : (
                    <>
                      <Octicons name="copy" size={14} color="#8E8EA0" />
                      <Text style={styles.copyText}>Copy</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={styles.codeBlockContent}>{part.code}</Text>
              </ScrollView>
            </View>
          );
        }
      })}
    </>
  );
};

export default CustomMarkdown;

// ------------------ Styles ------------------
const styles = StyleSheet.create({
  codeBlockContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2F2F2F',
    marginVertical: 8,
    overflow: 'hidden',
  },
  codeBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2F2F2F',
    backgroundColor: '#0A0A0A',
  },
  codeLanguage: {
    color: '#ECECEC',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'fgr',
  },
  copyCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  copyText: {
    color: '#8E8EA0',
    fontSize: 14,
    fontFamily: 'fgr',
  },
  copiedText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'fgr',
  },
  codeBlockContent: {
    color: '#ECECEC',
    fontSize: 14,
    padding: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 20,
  },
});

const markdownStyles = {
  body: { color: '#ECECEC', fontSize: 17, lineHeight: 24, fontFamily: 'fgr' },
  heading1: { color: '#ECECEC', fontSize: 24, fontWeight: '700', marginTop: 16, marginBottom: 12, lineHeight: 32 },
  heading2: { color: '#ECECEC', fontSize: 22, fontWeight: '700', marginTop: 14, marginBottom: 10, lineHeight: 28 },
  heading3: { color: '#ECECEC', fontSize: 21, fontWeight: '600', marginTop: 12, marginBottom: 8, lineHeight: 26 },
  heading4: { color: '#ECECEC', fontSize: 20, fontWeight: '600', marginTop: 10, marginBottom: 6, lineHeight: 24 },
  heading5: { color: '#ECECEC', fontSize: 19, fontWeight: '600', marginTop: 8, marginBottom: 4, lineHeight: 22 },
  heading6: { color: '#ECECEC', fontSize: 18, fontWeight: '600', marginTop: 6, marginBottom: 4, lineHeight: 20 },
  paragraph: { color: '#ECECEC', fontSize: 17, lineHeight: 24, marginTop: 0, marginBottom: 12 },
  strong: { color: '#ECECEC', fontWeight: '700' },
  em: { color: '#ECECEC', fontStyle: 'italic' },
  link: { color: '#fff', textDecorationLine: 'underline' },
  blockquote: { backgroundColor: '#2F2F2F', borderLeftColor: '#fff', borderLeftWidth: 4, marginLeft: 0, marginRight: 0, paddingHorizontal: 16, paddingVertical: 8, marginVertical: 8 },
  code_inline: { backgroundColor: '#000', color: '#fff', fontSize: 14, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  code_block: { backgroundColor: '#1A1A1A', color: '#ECECEC', fontSize: 14, padding: 12, borderRadius: 8, marginVertical: 8, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', borderWidth: 1, borderColor: '#2F2F2F' },
};

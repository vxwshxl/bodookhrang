import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ThinkingBlock({ content, index, thinkingExpanded, onToggle }) {
  return (
    <View style={styles.thinkingContainer}>
      <TouchableOpacity 
        style={styles.thinkingHeader}
        onPress={() => onToggle(index)}
      >
        <MaterialCommunityIcons name="brain" size={18} color="#FF6B6B" />
        <Text style={styles.thinkingTitle}>Show Thinking</Text>
        <Ionicons 
          name={thinkingExpanded ? "chevron-up" : "chevron-down"} 
          size={18} 
          color="#FF6B6B" 
        />
      </TouchableOpacity>
      {thinkingExpanded && (
        <View style={styles.thinkingContent}>
          <View style={styles.thinkingBorder} />
          <Text style={styles.thinkingText}>{content}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  thinkingContainer: {
    marginVertical: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2F2F2F',
    overflow: 'hidden',
  },
  thinkingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  thinkingTitle: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  thinkingContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#0A0A0A',
  },
  thinkingBorder: {
    height: 1,
    backgroundColor: '#2F2F2F',
    marginBottom: 8,
  },
  thinkingText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'fgr',
  },
});

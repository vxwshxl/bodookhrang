import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SARVAM_API_KEY } from "@env"; // ✅ import from .env

const API_URL = "https://api.sarvam.ai/v1/chat/completions";

export default function OkhranGPT() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SARVAM_API_KEY}`, // ✅ uses env variable
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sarvam-m",
          messages: newMessages,
        }),
      });

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content || "No response.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: "assistant", content: "Error connecting to Sarvam AI." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OkhranGPT 🤖</Text>

      <ScrollView style={styles.chat} contentContainerStyle={{ paddingBottom: 20 }}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.message,
              msg.role === "user" ? styles.userMsg : styles.botMsg,
            ]}
          >
            <Text style={styles.msgText}>{msg.content}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.button} onPress={sendMessage} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "..." : "Send"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 60,
  },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
  },
  chat: {
    flex: 1,
    paddingHorizontal: 12,
  },
  message: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 12,
    maxWidth: "80%",
  },
  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#2563eb",
  },
  botMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e7eb",
  },
  msgText: {
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#d1d5db",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#2563eb",
    marginLeft: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
  },
});

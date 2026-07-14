import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

export default function ChatbotWidget() {
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const { isAuthenticated } = useAuthStore();
  const flatListRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const sendMsg = useMutation({
    mutationFn: async (message) => {
      const { data } = await api.post('/ai/chat', { message });
      return data;
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, isAi: true }]);
    },
  });

  const toggleChat = () => {
    Animated.spring(slideAnim, {
      toValue: isOpen ? 0 : 1,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
    setIsOpen(!isOpen);
  };

  const handleSend = () => {
    if (!input.trim() || sendMsg.isPending) return;
    const userMsg = { role: 'user', content: input.trim(), isAi: false };
    setMessages((prev) => [...prev, userMsg]);
    sendMsg.mutate(input.trim());
    setInput('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'مرحباً! 🌸 أنا ليلى، مستشارة التجميل. كيف يمكنني مساعدتكِ اليوم؟',
        isAi: true,
      }]);
    }
  }, [isOpen]);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* FAB Button — positioned above tab bar using safe insets */}
      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 70 }]} onPress={toggleChat} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>{isOpen ? '✕' : '💬'}</Text>
      </TouchableOpacity>

      {/* Chat Panel */}
      {isOpen && (
        <Animated.View style={[styles.panel, { transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [600, 0] }) }] }]}>
          <View style={styles.panelHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.avatar}><Text style={{ fontSize: 18 }}>🤖</Text></View>
              <View>
                <Text style={styles.headerTitle}>ليلى</Text>
                <Text style={styles.headerSub}>مستشارة التجميل</Text>
              </View>
            </View>
            <TouchableOpacity onPress={toggleChat}><Text style={{ fontSize: 20, color: '#9CA3AF' }}>✕</Text></TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(_, i) => String(i)}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 12, gap: 8 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.isAi ? styles.bubbleAi : styles.bubbleUser]}>
                <Text style={[styles.bubbleText, item.isAi ? styles.textAi : styles.textUser]}>
                  {item.content}
                </Text>
              </View>
            )}
          />

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="اسألي ليلى..."
                placeholderTextColor="#9CA3AF"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!input.trim() || sendMsg.isPending) && { opacity: 0.4 }]}
                onPress={handleSend}
                disabled={!input.trim() || sendMsg.isPending}
              >
                <Text style={{ color: '#fff', fontSize: 16 }}>↑</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8, zIndex: 100,
  },
  fabIcon: { fontSize: 24, color: '#fff' },
  panel: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%',
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10, zIndex: 99,
  },
  panelHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    backgroundColor: '#FAFAFF',
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerSub: { fontSize: 12, color: '#9CA3AF' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  bubbleAi: { alignSelf: 'flex-start', backgroundColor: '#F3F4F6', borderBottomLeftRadius: 4 },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: '#7C3AED', borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 22 },
  textAi: { color: '#374151' },
  textUser: { color: '#fff' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 8 },
  input: { flex: 1, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 20, fontSize: 14, color: '#111827' },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center' },
});

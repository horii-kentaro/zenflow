import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { api } from '@/lib/api';
import * as SecureStore from 'expo-secure-store';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadow } from '@/constants/theme';

const API_BASE = __DEV__
  ? 'http://localhost:3000'
  : 'https://zenflow-alpha.vercel.app';

const suggestedTopics = [
  { label: '今日の気分について', icon: 'chatbubble-ellipses-outline' as const },
  { label: '最近嬉しかったこと', icon: 'heart-outline' as const },
  { label: '悩んでいること', icon: 'help-circle-outline' as const },
];

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type JournalEntry = {
  id: string;
  title: string | null;
  sentiment: string | null;
  createdAt: string;
};

type Screen = 'list' | 'chat';

export default function JournalScreen() {
  const [screen, setScreen] = useState<Screen>('list');
  const [journalId, setJournalId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loadingJournals, setLoadingJournals] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    setLoadingJournals(true);
    try {
      const data = await api.get<{ journals: JournalEntry[] }>('/api/journal?limit=20');
      setJournals(data.journals);
    } catch {
      // silently fail
    } finally {
      setLoadingJournals(false);
    }
  };

  const startNewJournal = async (topic?: string) => {
    try {
      const journal = await api.post<{ id: string }>('/api/journal');
      setJournalId(journal.id);
      setMessages([]);
      setScreen('chat');

      if (topic) {
        sendMessage(journal.id, topic);
      }
    } catch (e: any) {
      // fallback
    }
  };

  const sendMessage = async (jId: string, text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);
    setStreaming(true);

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const token = await SecureStore.getItemAsync('session_token');
      const res = await fetch(`${API_BASE}/api/journal/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ journalId: jId, message: text.trim() }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.text) {
                  fullText += data.text;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsg.id ? { ...m, content: fullText } : m
                    )
                  );
                }
                if (data.done) break;
              } catch {}
            }
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: '応答の取得に失敗しました。もう一度お試しください。' }
            : m
        )
      );
    } finally {
      setSending(false);
      setStreaming(false);
    }
  };

  const handleSend = () => {
    if (!journalId || !input.trim() || sending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(journalId, input);
  };

  // Chat screen
  if (screen === 'chat') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Chat header */}
        <View style={styles.chatHeader}>
          <Pressable
            onPress={() => {
              setScreen('list');
              fetchJournals();
            }}
            style={styles.chatBackButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.neutral[600]} />
          </Pressable>
          <Text style={styles.chatTitle}>AIジャーナル</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 && (
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={styles.chatWelcome}
            >
              <Ionicons name="leaf" size={48} color={colors.primary[500]} />
              <Text style={styles.chatWelcomeText}>
                何でも気軽に話してくださいね。{'\n'}あなたの気持ちに寄り添います。
              </Text>
            </MotiView>
          )}

          {messages.map((msg) => (
            <MotiView
              key={msg.id}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.role === 'user' ? styles.userText : styles.assistantText,
                ]}
              >
                {msg.content || (streaming ? '...' : '')}
              </Text>
            </MotiView>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="メッセージを入力..."
            placeholderTextColor={colors.neutral[400]}
            style={styles.textInput}
            multiline
            maxLength={1000}
            editable={!sending}
          />
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || sending}
            style={[
              styles.sendButton,
              (!input.trim() || sending) && styles.sendButtonDisabled,
            ]}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={18} color={colors.white} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Journal list screen
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerArea}>
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
        >
          <Text style={styles.title}>AIジャーナル</Text>
          <Text style={styles.subtitle}>AIと対話しながら気持ちを整理しましょう</Text>
        </MotiView>
      </View>

      <View style={styles.content}>
        {/* New Journal */}
        <AnimatedCard delay={100}>
          <Text style={styles.sectionTitle}>新しいジャーナル</Text>
          <Text style={styles.topicLabel}>おすすめトピック</Text>
          <View style={styles.topicChips}>
            {suggestedTopics.map((topic, i) => (
              <MotiView
                key={topic.label}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'spring', delay: 200 + i * 100 }}
              >
                <Pressable
                  onPress={() => startNewJournal(topic.label)}
                  style={({ pressed }) => [
                    styles.topicChip,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Ionicons name={topic.icon} size={18} color={colors.primary[600]} />
                  <Text style={styles.topicText}>{topic.label}</Text>
                </Pressable>
              </MotiView>
            ))}
          </View>

          <Pressable
            onPress={() => startNewJournal()}
            style={({ pressed }) => [
              styles.startButton,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary[600]} />
            <Text style={styles.startButtonText}>自由に書き始める</Text>
          </Pressable>
        </AnimatedCard>

        {/* Journal History */}
        <AnimatedCard delay={300}>
          <Text style={styles.sectionTitle}>過去のジャーナル</Text>
          {loadingJournals ? (
            <ActivityIndicator color={colors.primary[500]} style={{ paddingVertical: spacing.xl }} />
          ) : journals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color={colors.neutral[300]} />
              <Text style={styles.emptyText}>まだジャーナルがありません</Text>
              <Text style={styles.emptySubtext}>上のトピックから始めてみましょう</Text>
            </View>
          ) : (
            <View style={styles.journalList}>
              {journals.map((j) => (
                <Pressable
                  key={j.id}
                  style={({ pressed }) => [
                    styles.journalItem,
                    pressed && { backgroundColor: colors.neutral[50] },
                  ]}
                >
                  <View style={styles.journalItemLeft}>
                    <Text style={styles.journalItemTitle}>
                      {j.title || '無題のジャーナル'}
                    </Text>
                    <Text style={styles.journalItemDate}>
                      {new Date(j.createdAt).toLocaleDateString('ja-JP')}
                    </Text>
                  </View>
                  {j.sentiment && (
                    <View
                      style={[
                        styles.sentimentBadge,
                        {
                          backgroundColor:
                            j.sentiment === 'positive'
                              ? '#f0fdf4'
                              : j.sentiment === 'negative'
                              ? '#fef2f2'
                              : '#fefce8',
                        },
                      ]}
                    >
                      <Ionicons
                        name={j.sentiment === 'positive' ? 'happy' : j.sentiment === 'negative' ? 'sad' : 'remove-circle-outline'}
                        size={16}
                        color={j.sentiment === 'positive' ? '#16a34a' : j.sentiment === 'negative' ? '#dc2626' : '#ca8a04'}
                      />
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={18} color={colors.neutral[300]} />
                </Pressable>
              ))}
            </View>
          )}
        </AnimatedCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  headerArea: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.neutral[500],
    marginTop: spacing.xs,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.md,
  },
  topicLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    marginBottom: spacing.sm,
  },
  topicChips: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary[200],
    gap: spacing.sm,
  },
  topicIcon: {
    width: 18,
  },
  topicText: {
    fontSize: fontSize.sm,
    color: colors.primary[700],
    fontWeight: fontWeight.medium,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.primary[300],
    borderStyle: 'dashed',
  },
  startButtonText: {
    fontSize: fontSize.md,
    color: colors.primary[600],
    fontWeight: fontWeight.semibold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.neutral[400],
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
  // Journal list
  journalList: {
    gap: 1,
  },
  journalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  journalItemLeft: {
    flex: 1,
  },
  journalItemTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[800],
  },
  journalItemDate: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
    marginTop: 2,
  },
  sentimentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  sentimentIcon: {
    width: 16,
  },
  // Chat
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  chatBackButton: {
    padding: spacing.sm,
  },
  chatTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[800],
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  chatWelcome: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  chatWelcomeIcon: {
    marginBottom: spacing.md,
  },
  chatWelcomeText: {
    fontSize: fontSize.md,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 24,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary[500],
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    ...shadow.sm,
  },
  messageText: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  userText: {
    color: colors.white,
  },
  assistantText: {
    color: colors.neutral[800],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.neutral[800],
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.neutral[300],
  },
});

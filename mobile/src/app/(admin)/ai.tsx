import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  useColorScheme, 
  ActivityIndicator 
} from 'react-native';
import { 
  Bot, 
  Send, 
  BarChart3, 
  Users, 
  DollarSign, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp,
  RotateCcw,
  Copy,
  Check
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import { api } from '../../lib/api';
import { useUIStore } from '../../store/useUIStore';
import { useChatKeyboard } from '../../hooks/useChatKeyboard';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  uiComponent?: {
    type: string;
    title: string;
    data: any[];
  };
}

const ADMIN_THINKING_STAGES = [
  'Analyzing gym operations...',
  'Querying member database & revenue...',
  'Evaluating risk and retention cohorts...',
  'Generating executive insights...'
];

const ADMIN_PROMPTS = [
  { id: '1', title: 'Revenue Breakdown', icon: DollarSign, prompt: 'Generate the revenue trend chart and summary for this year.' },
  { id: '2', title: 'At-Risk Members', icon: AlertTriangle, prompt: 'Scan the database for at-risk members who have been inactive.' },
  { id: '3', title: 'Membership Growth', icon: TrendingUp, prompt: 'Analyze recent member signups and overall gym retention trends.' },
  { id: '4', title: 'Recovery Campaign', icon: Users, prompt: 'What actions can I take right now to recover failed payments and win back churned users?' },
];

export default function AdminAIAssistantScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const {
    insets,
    bottomSpacing,
    onContainerLayout,
    keyboardHeight,
    isKeyboardVisible,
  } = useChatKeyboard();
  const { showToast } = useUIStore();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: 'Welcome, Executive. I am your **UFC GYM Business Intelligence Copilot**.\n\nI have real-time access to revenue metrics, active memberships, churn prevention campaigns, and trainer operations. What would you like to inspect today?',
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Cycle thinking state text
  useEffect(() => {
    if (!isTyping) {
      setThinkingIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setThinkingIndex((prev) => (prev + 1) % ADMIN_THINKING_STAGES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isTyping]);

  const handleCopy = async (id: string, text: string) => {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopiedId(id);
    showToast('Copied to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (textToSend: string = input) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: trimmed,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    const history = messages
      .slice(-6)
      .map(m => ({
        role: m.sender === 'ai' ? 'assistant' : 'user',
        content: m.text
      }));

    try {
      const response = await api.post('/admin/ai', { prompt: trimmed, history });
      const fullContent = response.data?.content || "No content returned. Please try rephrasing.";
      const uiComponent = response.data?.uiComponent;
      
      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: fullContent,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        uiComponent
      };
      
      setIsTyping(false);
      setMessages(prev => [...prev, newAiMsg]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
    } catch (error) {
      console.error('Admin AI Error:', error);
      setIsTyping(false);
      showToast('Admin AI service reconnecting. Please retry.', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleResetSession = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMessages([
      {
        id: Date.now().toString(),
        text: "New intelligence session initialized. Ready for operations queries.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    showToast('Started new executive session', 'info');
  };

  // Helper to render GenUI dynamically
  const renderGenUI = (uiComponent: Message['uiComponent']) => {
    if (!uiComponent) return null;

    if (uiComponent.type === 'bar_chart') {
      const maxValue = Math.max(...uiComponent.data.map((d: any) => d.value), 1);
      return (
        <Animated.View 
          entering={FadeInDown.duration(260)} 
          style={[styles.genUIContainer, isDark ? styles.genUIDark : styles.genUILight]}
        >
          <View style={styles.genUIHeader}>
            <View style={styles.genUIIconBadge}>
              <BarChart3 size={16} color="#10b981" />
            </View>
            <Text style={[styles.genUITitle, isDark ? styles.textWhite : styles.textBlack]}>
              {uiComponent.title}
            </Text>
          </View>

          <View style={styles.chartArea}>
            {uiComponent.data.map((item: any, i: number) => {
              const heightPct = Math.max((item.value / maxValue) * 100, 8);
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={[styles.barVal, isDark ? styles.textGray : styles.textSlate]}>
                    ₹{item.value}
                  </Text>
                  <View style={styles.barTrack}>
                    <LinearGradient 
                      colors={['#10b981', '#059669']} 
                      style={[styles.barFill, { height: `${heightPct}%` }]} 
                    />
                  </View>
                  <Text style={[styles.barLabel, isDark ? styles.textWhite : styles.textBlack]}>
                    {item.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>
      );
    }
    return null;
  };

  return (
    <View 
      style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}
      onLayout={onContainerLayout}
    >
      {/* ─── Executive Header ─── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <LinearGradient 
            colors={['#10b981', '#059669']} 
            style={styles.adminAvatar}
          >
            <Bot color="#FFF" size={20} />
          </LinearGradient>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>
                EXECUTIVE COPILOT
              </Text>
              <View style={styles.liveDot} />
            </View>
            <Text style={styles.headerSubtitle}>
              {isTyping ? ADMIN_THINKING_STAGES[thinkingIndex] : 'AI Operations Intelligence Engine'}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.resetBtn, isDark ? styles.resetBtnDark : styles.resetBtnLight]} 
          onPress={handleResetSession}
        >
          <RotateCcw color={isDark ? '#94A3B8' : '#64748B'} size={18} />
        </TouchableOpacity>
      </View>

      {/* ─── Chat Feed ─── */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messageScroll}
        contentContainerStyle={styles.chatContainer}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {/* Quick prompt cards for fresh session */}
        {messages.length <= 1 && (
          <Animated.View entering={FadeInDown.duration(260)} style={styles.heroAdminCard}>
            <Text style={[styles.heroCardTitle, isDark ? styles.textWhite : styles.textBlack]}>
              Executive Quick Actions
            </Text>
            <Text style={[styles.heroCardSub, isDark ? styles.textGray : styles.textSlate]}>
              Instant analysis across membership, revenue streams, and automated retention tools.
            </Text>

            <View style={styles.promptGrid}>
              {ADMIN_PROMPTS.map((p, i) => (
                <Animated.View 
                  key={p.id} 
                  entering={FadeInDown.delay(i * 50).duration(260)} 
                  style={{ width: '48%' }}
                >
                  <TouchableOpacity 
                    style={[styles.promptCard, isDark ? styles.promptCardDark : styles.promptCardLight]}
                    onPress={() => handleSend(p.prompt)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.promptIconWrap}>
                      <p.icon size={16} color="#10b981" />
                    </View>
                    <Text style={[styles.promptCardText, isDark ? styles.textWhite : styles.textBlack]}>
                      {p.title}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {messages.map((msg) => (
          <Animated.View 
            key={msg.id}
            entering={FadeInUp.duration(260)}
            style={[
              styles.messageWrapper, 
              msg.sender === 'user' ? styles.messageWrapperUser : styles.messageWrapperAi
            ]}
          >
            {msg.sender === 'ai' && (
              <LinearGradient colors={['#10b981', '#059669']} style={styles.messageAvatar}>
                <Bot color="#FFF" size={14} />
              </LinearGradient>
            )}
            
            <View style={{ flex: 1, alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <View style={[
                styles.messageBubble,
                msg.sender === 'user' 
                  ? (isDark ? styles.bubbleUserDark : styles.bubbleUserLight)
                  : (isDark ? styles.bubbleAiDark : styles.bubbleAiLight)
              ]}>
                {msg.sender === 'user' ? (
                  <Text style={styles.userMsgText}>
                    {msg.text}
                  </Text>
                ) : (
                  <Markdown 
                    style={{
                      body: { 
                        fontSize: 15, 
                        lineHeight: 23, 
                        color: isDark ? '#F1F5F9' : '#0F172A',
                        fontFamily: 'System'
                      },
                      strong: {
                        color: isDark ? '#FFFFFF' : '#000000',
                        fontWeight: '700'
                      },
                      table: {
                        borderWidth: 1,
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                        borderRadius: 8,
                        marginVertical: 8
                      },
                      th: {
                        backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                        padding: 6
                      },
                      td: {
                        padding: 6
                      }
                    }}
                  >
                    {msg.text}
                  </Markdown>
                )}

                <View style={styles.messageFooter}>
                  <Text style={[
                    styles.timestamp,
                    msg.sender === 'user' ? { color: 'rgba(255,255,255,0.7)' } : (isDark ? styles.textGray : styles.textSlate)
                  ]}>
                    {msg.timestamp}
                  </Text>

                  {msg.sender === 'ai' && (
                    <TouchableOpacity 
                      onPress={() => handleCopy(msg.id, msg.text)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {copiedId === msg.id ? (
                        <Check size={13} color="#10b981" />
                      ) : (
                        <Copy size={13} color={isDark ? '#94A3B8' : '#64748B'} />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {msg.sender === 'ai' && renderGenUI(msg.uiComponent)}
            </View>
          </Animated.View>
        ))}

        {isTyping && (
          <Animated.View 
            entering={FadeInUp.duration(200)} 
            style={[styles.messageWrapper, styles.messageWrapperAi]}
          >
            <LinearGradient colors={['#10b981', '#059669']} style={styles.messageAvatar}>
              <Bot color="#FFF" size={14} />
            </LinearGradient>
            <View style={[styles.messageBubble, isDark ? styles.bubbleAiDark : styles.bubbleAiLight, styles.typingRow]}>
              <ActivityIndicator color="#10b981" size="small" />
              <Text style={[styles.thinkingStageText, isDark ? styles.textGray : styles.textSlate]}>
                {ADMIN_THINKING_STAGES[thinkingIndex]}
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* ─── Executive Input Pill ─── */}
      <View style={[
        styles.inputWrapper, 
        { backgroundColor: isDark ? 'rgba(13, 17, 23, 0.95)' : 'rgba(255, 255, 255, 0.95)' }
      ]}>
        <View style={[
          styles.inputPill, 
          isDark ? styles.inputPillDark : styles.inputPillLight
        ]}>
          <TextInput
            style={[styles.inputField, isDark ? styles.textWhite : styles.textBlack]}
            placeholder="Ask Copilot (e.g. 'Show monthly revenue', 'At-risk members')..."
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity 
            style={[
              styles.sendBtn, 
              { backgroundColor: input.trim() ? '#10b981' : (isDark ? '#243042' : '#E2E8F0') }
            ]}
            onPress={() => handleSend(input)}
            disabled={!input.trim()}
            activeOpacity={0.8}
          >
            <Send color={input.trim() ? '#FFF' : (isDark ? '#64748B' : '#94A3B8')} size={16} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dynamic bottom spacing: clears TabBar or Keyboard smoothly */}
      <View style={{ height: bottomSpacing }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgDark: { backgroundColor: '#090D12' },
  bgLight: { backgroundColor: '#F8FAFC' },
  
  header: { 
    paddingHorizontal: 20, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.06)', 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  adminAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#10b981' },
  
  headerTitle: { fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  headerSubtitle: { fontSize: 12, fontWeight: '500', color: '#10b981', marginTop: 1 },

  resetBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  resetBtnDark: { backgroundColor: '#161F2C', borderWidth: 1, borderColor: '#243042' },
  resetBtnLight: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },

  messageScroll: { flex: 1 },
  chatContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, gap: 16 },

  heroAdminCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 8,
  },
  heroCardTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  heroCardSub: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  promptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  promptCard: { 
    padding: 14, 
    borderRadius: 16, 
    borderWidth: 1, 
    gap: 8,
    minHeight: 85,
    justifyContent: 'space-between'
  },
  promptCardDark: { backgroundColor: '#131A24', borderColor: '#222D3D' },
  promptCardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  promptIconWrap: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: 'rgba(16, 185, 129, 0.12)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  promptCardText: { fontSize: 13, fontWeight: '600' },

  messageWrapper: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 4 },
  messageWrapperUser: { justifyContent: 'flex-end' },
  messageWrapperAi: { justifyContent: 'flex-start' },
  
  messageAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  
  messageBubble: { maxWidth: '84%', padding: 15, borderRadius: 20 },
  bubbleUserDark: { backgroundColor: '#059669', borderBottomRightRadius: 4 },
  bubbleUserLight: { backgroundColor: '#059669', borderBottomRightRadius: 4 },
  bubbleAiDark: { 
    backgroundColor: '#131B26', 
    borderBottomLeftRadius: 4, 
    borderWidth: 1, 
    borderColor: '#243042',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 2
  },
  bubbleAiLight: { 
    backgroundColor: '#FFFFFF', 
    borderBottomLeftRadius: 4, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1
  },

  userMsgText: { fontSize: 15, lineHeight: 22, color: '#FFFFFF', fontWeight: '500' },
  messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  timestamp: { fontSize: 10, fontWeight: '500' },

  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 18 },
  thinkingStageText: { fontSize: 13, fontWeight: '500' },

  inputWrapper: { 
    width: '100%', 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.06)', 
    paddingTop: 10, 
    paddingBottom: 10,
    paddingHorizontal: 16
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
    maxHeight: 110,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
  },
  inputPillDark: { backgroundColor: '#131A24', borderColor: '#253245' },
  inputPillLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  inputField: { flex: 1, fontSize: 15, paddingVertical: 6, marginRight: 8 },
  sendBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },

  genUIContainer: { marginTop: 12, borderRadius: 18, padding: 18, width: '100%', borderWidth: 1 },
  genUILight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  genUIDark: { backgroundColor: '#131B26', borderColor: '#243042' },
  genUIHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  genUIIconBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(16, 185, 129, 0.12)', alignItems: 'center', justifyContent: 'center' },
  genUITitle: { fontSize: 15, fontWeight: '700' },
  chartArea: { flexDirection: 'row', height: 140, alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 10 },
  barCol: { alignItems: 'center', flex: 1 },
  barTrack: { height: 90, width: 22, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 11, justifyContent: 'flex-end', marginVertical: 8, overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 11 },
  barVal: { fontSize: 10, fontWeight: '600' },
  barLabel: { fontSize: 11, fontWeight: '600' },

  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#0F172A' },
  textGray: { color: '#94A3B8' },
  textSlate: { color: '#64748B' },
});

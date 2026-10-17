import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  useColorScheme, 
  ActivityIndicator, 
  Image 
} from 'react-native';
import { 
  Send, 
  Sparkles, 
  Activity, 
  Utensils, 
  CreditCard, 
  Camera, 
  X, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Mic, 
  RotateCcw,
  Zap
} from 'lucide-react-native';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  useSharedValue 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';

let Audio: any = null;
try {
  Audio = require('expo-av').Audio;
} catch (e) {
  // Optional audio fallback
}

import { api } from '../../lib/api';
import { useUIStore } from '../../store/useUIStore';
import { useChatKeyboard } from '../../hooks/useChatKeyboard';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  image?: string;
}

const THINKING_STAGES = [
  'Thinking...',
  'Searching nutrition & workouts...',
  'Analyzing body metrics...',
  'Composing tailored guidance...'
];

const SUGGESTIONS = [
  { id: '1', title: "Today's Workout", icon: Activity, prompt: "What is my personalized workout routine for today?" },
  { id: '2', title: 'Macro & Diet Plan', icon: Utensils, prompt: 'Can you recommend an Indian high-protein diet plan tailored to my goals?' },
  { id: '3', title: 'Membership Status', icon: CreditCard, prompt: 'What is my current gym membership status and expiration?' },
  { id: '4', title: 'Form & Recovery', icon: Zap, prompt: 'How can I optimize muscle recovery and soreness after a heavy session?' },
];

export default function UserAIAssistant() {
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
      text: "Welcome to your **UFC GYM AI Coach**. 🥊\n\nI am connected to your live membership, customized workout splits, and nutrition goals. You can ask for real-time fitness advice, log meals, or snap photos of gym equipment.",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingStageIndex, setThinkingStageIndex] = useState(0);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<any | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Animated Orb Pulse for Empty State / Processing
  const orbScale = useSharedValue(1);
  const orbRotate = useSharedValue(0);
  const orbGlow = useSharedValue(0.6);

  useEffect(() => {
    orbScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1800 }),
        withTiming(1, { duration: 1800 })
      ),
      -1,
      true
    );
    orbGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400 }),
        withTiming(0.5, { duration: 1400 })
      ),
      -1,
      true
    );
  }, []);

  const orbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
    opacity: orbGlow.value,
  }));

  // Cycle thinking stages while AI is generating
  useEffect(() => {
    if (!isTyping) {
      setThinkingStageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setThinkingStageIndex((prev) => (prev + 1) % THINKING_STAGES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isTyping]);

  // Clean up audio & speech on unmount
  useEffect(() => {
    return () => {
      if (recording) recording.stopAndUnloadAsync().catch(() => {});
      Speech.stop();
    };
  }, []);

  const speakText = (text: string) => {
    const cleanText = text.replace(/[*#_`]/g, '');
    setIsSpeaking(true);
    Speech.speak(cleanText, {
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
      rate: 0.95,
      pitch: 1,
    });
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const handleCopy = async (id: string, text: string) => {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopiedId(id);
    showToast('Copied to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (textToSend: string = input) => {
    const trimmed = textToSend.trim();
    if (!trimmed && !selectedImage) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isSpeaking) stopSpeaking();
    
    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: trimmed || 'Image attached',
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: selectedImage || undefined
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setIsTyping(true);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    const history = messages
      .slice(-6)
      .map(m => ({
        role: m.sender === 'ai' ? 'assistant' : 'user',
        content: m.text
      }));

    try {
      const payload: any = { 
        prompt: trimmed || 'Please analyze this uploaded gym or food image.', 
        history 
      };
      if (imageToSend) payload.imageBase64 = imageToSend;

      const response = await api.post('/user/ai', payload);
      const fullContent = response.data?.content || "I couldn't process that query. Please try again.";

      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: fullContent,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setIsTyping(false);
      setMessages(prev => [...prev, newAiMsg]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (isVoiceMode) {
        speakText(fullContent);
      }

      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
    } catch (error) {
      console.error('Mobile User AI Error:', error);
      setIsTyping(false);
      showToast('AI Coach is momentarily reconnecting. Please retry.', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0].base64) {
        setSelectedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (e) {
      showToast('Could not open photos.', 'error');
    }
  };

  const startRecording = async () => {
    if (!Audio) {
      showToast('Voice recording unavailable on this device.', 'info');
      return;
    }
    try {
      if (isSpeaking) stopSpeaking();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== 'granted') {
        showToast('Microphone permission required.', 'error');
        return;
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      setRecording(null);
      // Example default speech prompt
      handleSend("Give me a quick high-protein snack recommendation.");
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const handleResetConversation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMessages([
      {
        id: Date.now().toString(),
        text: "New session started! 🥊 What would you like to achieve today?",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    showToast('Started new AI session', 'info');
  };

  return (
    <View 
      style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}
      onLayout={onContainerLayout}
    >
      {/* ─── Top Branded Header ─── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.orbBadge}>
            <LinearGradient 
              colors={['#f97316', '#d96638', '#b45309']} 
              style={styles.orbBadgeGradient}
            >
              <Sparkles color="#FFF" size={18} />
            </LinearGradient>
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>
                UFC AI COACH
              </Text>
              <View style={styles.statusLiveDot} />
            </View>
            <Text style={styles.headerSubtitle}>
              {isTyping ? THINKING_STAGES[thinkingStageIndex] : 'Interactive Training & Diet Brain'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.iconButton, isDark ? styles.iconButtonDark : styles.iconButtonLight]} 
            onPress={handleResetConversation}
            accessibilityLabel="Reset conversation"
          >
            <RotateCcw color={isDark ? '#94A3B8' : '#64748B'} size={18} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.iconButton, 
              isVoiceMode 
                ? { backgroundColor: '#d96638' } 
                : (isDark ? styles.iconButtonDark : styles.iconButtonLight)
            ]} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (isSpeaking) stopSpeaking();
              setIsVoiceMode(!isVoiceMode);
            }}
          >
            {isVoiceMode ? (
              <Volume2 color="#FFF" size={18} />
            ) : (
              <VolumeX color={isDark ? '#94A3B8' : '#64748B'} size={18} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Chat Stream ─── */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messageScroll}
        contentContainerStyle={styles.chatContainer}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {/* ─── Hero Orb for Fresh Conversation ─── */}
        {messages.length <= 1 && (
          <Animated.View 
            entering={FadeInDown.duration(260)} 
            style={styles.heroOrbCard}
          >
            <View style={styles.orbGlowWrap}>
              <Animated.View style={[styles.heroOrbAura, orbAnimatedStyle]} />
              <LinearGradient 
                colors={['#ea580c', '#d96638', '#7c2d12']} 
                style={styles.heroOrbCore}
              >
                <Sparkles color="#FFFFFF" size={32} />
              </LinearGradient>
            </View>

            <Text style={[styles.heroOrbTitle, isDark ? styles.textWhite : styles.textBlack]}>
              Ready for Elite Performance?
            </Text>
            <Text style={[styles.heroOrbDesc, isDark ? styles.textGray : styles.textSlate]}>
              Ask about today's lifts, calculate your meal calories, check membership perks, or get injury prevention tips.
            </Text>

            <View style={styles.suggestionsContainer}>
              {SUGGESTIONS.map((sugg, i) => (
                <Animated.View 
                  key={sugg.id} 
                  entering={FadeInDown.delay(i * 60).duration(260)}
                >
                  <TouchableOpacity 
                    style={[styles.suggestionChip, isDark ? styles.chipDark : styles.chipLight]}
                    onPress={() => handleSend(sugg.prompt)}
                    activeOpacity={0.8}
                  >
                    <sugg.icon size={15} color="#d96638" />
                    <Text style={[styles.suggestionText, isDark ? styles.textWhite : styles.textBlack]}>
                      {sugg.title}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* ─── Messages ─── */}
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
              <LinearGradient colors={['#f97316', '#d96638']} style={styles.messageAvatar}>
                <Sparkles color="#FFF" size={13} />
              </LinearGradient>
            )}
            
            <View style={[
              styles.messageBubble,
              msg.sender === 'user' 
                ? (isDark ? styles.bubbleUserDark : styles.bubbleUserLight)
                : (isDark ? styles.bubbleAiDark : styles.bubbleAiLight)
            ]}>
              {msg.image && (
                <Image 
                  source={{ uri: msg.image }} 
                  style={styles.attachedImage} 
                  resizeMode="cover"
                />
              )}

              {msg.sender === 'user' ? (
                <Text style={styles.userMessageText}>
                  {msg.text}
                </Text>
              ) : (
                <Markdown 
                  style={{
                    body: { 
                      fontSize: 15, 
                      lineHeight: 23, 
                      color: isDark ? '#E2E8F0' : '#1E293B',
                      fontFamily: 'System'
                    },
                    strong: {
                      color: isDark ? '#FFFFFF' : '#0F172A',
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

              {/* Message Footer */}
              <View style={styles.messageFooter}>
                <Text style={[
                  styles.timestamp,
                  msg.sender === 'user' ? { color: 'rgba(255,255,255,0.7)' } : (isDark ? styles.textGray : styles.textSlate)
                ]}>
                  {msg.timestamp}
                </Text>

                {msg.sender === 'ai' && (
                  <View style={styles.bubbleActions}>
                    <TouchableOpacity 
                      onPress={() => speakText(msg.text)}
                      style={styles.bubbleActionBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Volume2 size={13} color={isDark ? '#94A3B8' : '#64748B'} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleCopy(msg.id, msg.text)}
                      style={styles.bubbleActionBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {copiedId === msg.id ? (
                        <Check size={13} color="#10b981" />
                      ) : (
                        <Copy size={13} color={isDark ? '#94A3B8' : '#64748B'} />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        ))}

        {/* ─── Animated Thinking Indicator ─── */}
        {isTyping && (
          <Animated.View 
            entering={FadeInUp.duration(200)} 
            style={[styles.messageWrapper, styles.messageWrapperAi]}
          >
            <LinearGradient colors={['#f97316', '#d96638']} style={styles.messageAvatar}>
              <Sparkles color="#FFF" size={13} />
            </LinearGradient>
            <View style={[styles.messageBubble, isDark ? styles.bubbleAiDark : styles.bubbleAiLight, styles.thinkingBubble]}>
              <ActivityIndicator color="#d96638" size="small" />
              <Text style={[styles.thinkingText, isDark ? styles.textGray : styles.textSlate]}>
                {THINKING_STAGES[thinkingStageIndex]}
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* ─── Premium Morph-Style Input Bar ─── */}
      <View style={[
        styles.inputWrapper, 
        { 
          backgroundColor: isDark ? 'rgba(13, 17, 23, 0.95)' : 'rgba(255, 255, 255, 0.95)' 
        }
      ]}>
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <TouchableOpacity 
              style={styles.imagePreviewClose} 
              onPress={() => setSelectedImage(null)}
            >
              <X color="#FFF" size={12} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputRow}>
          <TouchableOpacity
            onPress={pickImage}
            style={styles.toolBtn}
            activeOpacity={0.7}
          >
            <View style={[styles.toolBtnInner, isDark ? styles.toolBtnDark : styles.toolBtnLight]}>
              <Camera color={isDark ? '#94A3B8' : '#64748B'} size={20} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPressIn={startRecording}
            onPressOut={stopRecording}
            style={styles.toolBtn}
            activeOpacity={0.7}
          >
            <View style={[
              styles.toolBtnInner, 
              isRecording 
                ? { backgroundColor: '#d96638' } 
                : (isDark ? styles.toolBtnDark : styles.toolBtnLight)
            ]}>
              <Mic color={isRecording ? '#FFF' : (isDark ? '#E2E8F0' : '#334155')} size={20} />
            </View>
          </TouchableOpacity>

          <View style={[
            styles.inputPill, 
            isDark ? styles.inputPillDark : styles.inputPillLight
          ]}>
            <TextInput
              style={[styles.inputField, isDark ? styles.textWhite : styles.textBlack]}
              placeholder={isRecording ? "Listening to your voice..." : "Ask your UFC Coach anything..."}
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={input}
              onChangeText={setInput}
              multiline
              editable={!isRecording}
              maxLength={1000}
            />

            {(input.trim().length > 0 || selectedImage) && (
              <TouchableOpacity 
                style={styles.sendOrbBtn}
                onPress={() => handleSend(input)}
                activeOpacity={0.8}
              >
                <LinearGradient 
                  colors={['#ea580c', '#d96638']} 
                  style={styles.sendOrbGradient}
                >
                  <Send color="#FFF" size={16} />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isVoiceMode && (
          <Text style={[styles.voiceHint, isDark ? styles.textGray : styles.textSlate]}>
            Voice Assistant Active • Auto-speaks coach guidance
          </Text>
        )}
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
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.06)' 
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orbBadge: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  orbBadgeGradient: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  statusLiveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#10b981' },
  
  headerTitle: { fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  headerSubtitle: { fontSize: 12, fontWeight: '500', color: '#d96638', marginTop: 1 },

  iconButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  iconButtonDark: { backgroundColor: '#161F2C', borderWidth: 1, borderColor: '#243042' },
  iconButtonLight: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },

  messageScroll: { flex: 1 },
  chatContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, gap: 16 },

  heroOrbCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  orbGlowWrap: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroOrbAura: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(217, 102, 56, 0.25)',
  },
  heroOrbCore: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#d96638',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  heroOrbTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', letterSpacing: -0.3, marginBottom: 6 },
  heroOrbDesc: { fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 300, marginBottom: 20 },

  suggestionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  suggestionChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 7, 
    paddingVertical: 10, 
    paddingHorizontal: 14, 
    borderRadius: 20, 
    borderWidth: 1 
  },
  chipDark: { backgroundColor: '#131A24', borderColor: '#222D3D' },
  chipLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  suggestionText: { fontSize: 13, fontWeight: '600' },

  messageWrapper: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 4 },
  messageWrapperUser: { justifyContent: 'flex-end' },
  messageWrapperAi: { justifyContent: 'flex-start' },
  
  messageAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  
  messageBubble: { maxWidth: '84%', padding: 15, borderRadius: 20 },
  bubbleUserDark: { backgroundColor: '#d96638', borderBottomRightRadius: 4 },
  bubbleUserLight: { backgroundColor: '#d96638', borderBottomRightRadius: 4 },
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

  userMessageText: { fontSize: 15, lineHeight: 22, color: '#FFFFFF', fontWeight: '500' },
  attachedImage: { width: 200, height: 160, borderRadius: 12, marginBottom: 10 },

  messageFooter: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 8, 
    gap: 12 
  },
  timestamp: { fontSize: 10, fontWeight: '500' },
  bubbleActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bubbleActionBtn: { padding: 2 },

  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  thinkingText: { fontSize: 13, fontWeight: '500' },

  inputWrapper: { 
    width: '100%', 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.06)', 
    paddingTop: 10, 
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  imagePreviewContainer: { 
    marginBottom: 10, 
    width: 56, 
    height: 56, 
    borderRadius: 12, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d96638'
  },
  imagePreview: { width: '100%', height: '100%' },
  imagePreviewClose: { 
    position: 'absolute', 
    top: 3, 
    right: 3, 
    backgroundColor: 'rgba(0,0,0,0.65)', 
    width: 18, 
    height: 18, 
    borderRadius: 9, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },

  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toolBtn: { marginBottom: 2 },
  toolBtnInner: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  toolBtnDark: { backgroundColor: '#131A24', borderWidth: 1, borderColor: '#222D3D' },
  toolBtnLight: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },

  inputPill: {
    flex: 1,
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

  inputField: { 
    flex: 1, 
    fontSize: 15, 
    paddingVertical: 6,
    marginRight: 6
  },
  sendOrbBtn: { 
    width: 34, 
    height: 34, 
    borderRadius: 17, 
    overflow: 'hidden', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  sendOrbGradient: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },

  voiceHint: { textAlign: 'center', fontSize: 11, marginTop: 8, fontWeight: '500' },
  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#0F172A' },
  textGray: { color: '#94A3B8' },
  textSlate: { color: '#64748B' },
});

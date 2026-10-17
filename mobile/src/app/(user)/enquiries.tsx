import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { Send, User as UserIcon } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Skeleton } from '../../components/ui/Skeleton';
import { useChatKeyboard } from '../../hooks/useChatKeyboard';

const messageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(500, 'Message is too long'),
});

type MessageFormData = z.infer<typeof messageSchema>;

export default function UserEnquiries() {
  const [message, setMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const {
    isKeyboardVisible,
    keyboardHeight,
    bottomSpacing,
    onContainerLayout
  } = useChatKeyboard();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: '' }
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['supportMessages'],
    queryFn: async () => {
      const response = await api.get('/user/support');
      return response.data;
    },
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await api.post('/user/support', { message: text });
      return response.data.message;
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData(['supportMessages'], (old: any) => [...(old || []), newMessage]);
      reset();
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  });

  const onSubmit = (data: MessageFormData) => {
    if (sendMutation.isPending) return;
    sendMutation.mutate(data.message);
  };

  useEffect(() => {
    if (isKeyboardVisible) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isKeyboardVisible, keyboardHeight]);

  if (isLoading) {
    return (
      <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
        <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight, { paddingTop: insets.top + 20 }]}>
          <Skeleton width={48} height={48} borderRadius={24} isDark={isDark} />
          <View style={{ marginLeft: 16 }}>
            <Skeleton width={120} height={24} isDark={isDark} style={{ marginBottom: 4 }} />
            <Skeleton width={100} height={14} isDark={isDark} />
          </View>
        </View>
        <View style={{ flex: 1, padding: 20, gap: 16 }}>
           <Skeleton width="70%" height={80} borderRadius={16} isDark={isDark} style={{ alignSelf: 'flex-start' }} />
           <Skeleton width="60%" height={60} borderRadius={16} isDark={isDark} style={{ alignSelf: 'flex-end' }} />
           <Skeleton width="80%" height={100} borderRadius={16} isDark={isDark} style={{ alignSelf: 'flex-start' }} />
        </View>
      </View>
    );
  }

  return (
    <View 
      style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}
      onLayout={onContainerLayout}
    >
      {/* Header */}
      <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerIconContainer}>
          <UserIcon color="#3A4C56" size={24} />
        </View>
        <View>
          <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Enquiries</Text>
          <Text style={styles.headerSubtitle}>Admin Team • Online</Text>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={{ paddingBottom: 16, paddingTop: 16 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
        {messages?.map((msg: any) => {
          const isUser = msg.senderId === user?.id;
          return (
            <View 
              key={msg.id} 
              style={[
                styles.messageBubble,
                isUser ? styles.messageUser : [styles.messageAdmin, isDark ? styles.bgDarker : styles.bgLighter],
                isUser ? { borderTopRightRadius: 8 } : { borderTopLeftRadius: 8 }
              ]}
            >
              <Text style={[styles.messageText, isDark ? styles.textWhite : styles.textBlack, isUser && { color: '#3A4C56' }]}>{msg.message}</Text>
              <Text style={[styles.timeText, isUser ? { color: 'rgba(58, 76, 86, 0.6)' } : { color: '#8E8E93' }]}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Input Area */}
      <View style={[
        styles.inputArea, 
        isDark ? styles.inputAreaDark : styles.inputAreaLight, 
      ]}>
        <View style={styles.inputWrapper}>
          <Controller
            control={control}
            name="message"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.input, 
                  isDark ? styles.inputDark : styles.inputLight, 
                  isDark ? styles.textWhite : styles.textBlack,
                  errors.message && styles.inputError
                ]}
                placeholder="Type a message..."
                placeholderTextColor={isDark ? '#636366' : '#8E8E93'}
                value={value}
                onChangeText={onChange}
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />
        </View>
        <TouchableOpacity 
          onPress={handleSubmit(onSubmit)}
          disabled={sendMutation.isPending}
          style={[
            styles.sendButton,
            !sendMutation.isPending ? styles.sendButtonActive : (isDark ? styles.sendButtonDisabledDark : styles.sendButtonDisabledLight)
          ]}
        >
          {sendMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Send color="#FFFFFF" size={20} style={{ marginLeft: 4 }} />
          )}
        </TouchableOpacity>
      </View>

      {/* Dynamic bottom spacing: exactly clears TabBar when closed, Keyboard when open */}
      <View style={{ height: bottomSpacing }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgDark: { backgroundColor: '#0D1117' },
  bgLight: { backgroundColor: '#F4F7F6' },
  bgDarker: { backgroundColor: '#161B22' },
  bgLighter: { backgroundColor: '#FFFFFF' },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerDark: { backgroundColor: '#0D1117', borderBottomColor: '#30363D' },
  headerLight: { backgroundColor: '#F4F7F6', borderBottomColor: '#E2E8F0' },
  headerIconContainer: { width: 48, height: 48, backgroundColor: '#A8C6CB', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: '#8E8E93', fontWeight: '600' },
  
  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  
  messagesContainer: { flex: 1, paddingHorizontal: 20 },
  messageBubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, marginBottom: 12 },
  messageUser: { backgroundColor: '#F9D3AF', alignSelf: 'flex-end' },
  messageAdmin: { alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  messageText: { fontSize: 16, lineHeight: 22 },
  timeText: { fontSize: 11, marginTop: 4, textAlign: 'right', fontWeight: '500' },
  
  inputArea: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1 },
  inputAreaDark: { backgroundColor: '#0D1117', borderTopColor: '#30363D' },
  inputAreaLight: { backgroundColor: '#F4F7F6', borderTopColor: '#E2E8F0' },
  inputWrapper: { flex: 1, marginRight: 12 },
  input: { height: 56, borderRadius: 28, paddingHorizontal: 20, fontSize: 16 },
  inputDark: { backgroundColor: '#161B22', borderWidth: 1, borderColor: '#30363D' },
  inputLight: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  inputError: { borderColor: '#FF3B30' },
  
  sendButton: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  sendButtonActive: { backgroundColor: '#3A4C56' },
  sendButtonDisabledDark: { backgroundColor: '#161B22' },
  sendButtonDisabledLight: { backgroundColor: '#FFFFFF' }
});

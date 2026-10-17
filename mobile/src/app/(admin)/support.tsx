import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme, ActivityIndicator, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MessageSquare, ChevronRight, User, Send, X, CheckCheck } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import * as Haptics from 'expo-haptics';
import { RefreshControl } from 'react-native';
import { Skeleton } from '../../components/ui/Skeleton';
import { useUIStore } from '../../store/useUIStore';

export default function AdminSupport() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { scrollInset } = useAppBottomInset();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [replyText, setReplyText] = useState('');

  const { data: messages = [], isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['adminSupport'],
    queryFn: async () => {
      const response = await api.get('/admin/support');
      return Array.isArray(response.data) ? response.data : [];
    },
    refetchInterval: 5000,
  });

  const sendReplyMutation = useMutation({
    mutationFn: async ({ receiverId, message }: { receiverId: string; message: string }) => {
      const response = await api.post('/admin/support', { receiverId, message });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSupport'] });
      setReplyText('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Reply dispatched to member!', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to send reply', 'error');
    }
  });

  const handleOpenConversation = async (user: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedUser(user);
    setIsChatModalVisible(true);
    try {
      await api.post('/admin/support/read', { userId: user.id });
      queryClient.invalidateQueries({ queryKey: ['adminSupport'] });
    } catch (e) {
      // Ignored
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedUser) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sendReplyMutation.mutate({
      receiverId: selectedUser.id,
      message: replyText.trim()
    });
  };

  // Group messages by user
  const getConversations = () => {
    if (!messages || !Array.isArray(messages)) return [];
    
    const conversations = new Map();
    
    messages.forEach((msg: any) => {
      const otherUser = msg.sender?.role === 'admin' ? msg.receiver : msg.sender;
      if (!otherUser) return;
      
      if (!conversations.has(otherUser.id)) {
        conversations.set(otherUser.id, {
          user: otherUser,
          lastMessage: msg.message,
          timestamp: msg.createdAt,
          unread: msg.sender?.role !== 'admin' && !msg.isRead
        });
      } else {
        const existing = conversations.get(otherUser.id);
        if (new Date(msg.createdAt) > new Date(existing.timestamp)) {
          conversations.set(otherUser.id, {
            ...existing,
            lastMessage: msg.message,
            timestamp: msg.createdAt,
            unread: msg.sender?.role !== 'admin' && !msg.isRead
          });
        }
      }
    });
    
    return Array.from(conversations.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const conversations = getConversations();

  // Filter messages for active conversation
  const activeConversationMessages = selectedUser 
    ? messages.filter((m: any) => m.senderId === selectedUser.id || m.receiverId === selectedUser.id)
    : [];

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Support & Chat</Text>
        <Text style={[styles.headerSub, isDark ? styles.textGray : styles.textSlate]}>Member Inquiries & Two-Way Desk</Text>
      </View>

      {isLoading && !isRefetching ? (
        <View style={styles.scrollContent}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: isDark ? '#30363D' : '#E2E8F0' }}>
              <Skeleton width={52} height={52} borderRadius={26} isDark={isDark} />
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton width="60%" height={20} isDark={isDark} />
                <Skeleton width="90%" height={16} isDark={isDark} />
              </View>
            </View>
          ))}
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, isDark ? styles.textWhite : styles.textBlack]}>Failed to load conversations</Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollInset }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={isDark ? '#FFFFFF' : '#3A4C56'}
            />
          }
        >
          {conversations.map((conv, index) => (
            <Animated.View 
              key={conv.user.id}
              entering={FadeInDown.delay(index * 50).duration(260)}
            >
              <TouchableOpacity 
                style={[styles.chatCard, isDark ? styles.cardDark : styles.cardLight]}
                onPress={() => handleOpenConversation(conv.user)}
                activeOpacity={0.7}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{conv.user.name?.charAt(0).toUpperCase() || 'U'}</Text>
                  {conv.unread && <View style={styles.unreadDot} />}
                </View>
                
                <View style={styles.chatInfo}>
                  <View style={styles.chatHeader}>
                    <Text style={[styles.chatName, isDark ? styles.textWhite : styles.textBlack]}>{conv.user.name}</Text>
                    <Text style={[styles.chatTime, isDark ? styles.textGray : styles.textSlate]}>
                      {new Date(conv.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text 
                    style={[styles.chatPreview, isDark ? styles.textGray : styles.textSlate, conv.unread && styles.textBold]} 
                    numberOfLines={1}
                  >
                    {conv.lastMessage}
                  </Text>
                </View>
                
                <ChevronRight color={isDark ? '#30363D' : '#E2E8F0'} size={20} />
              </TouchableOpacity>
            </Animated.View>
          ))}

          {conversations.length === 0 && (
            <View style={styles.emptyContainer}>
              <MessageSquare color={isDark ? '#30363D' : '#E2E8F0'} size={64} />
              <Text style={[styles.emptyText, isDark ? styles.textGray : styles.textSlate]}>No member messages yet</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Two-Way Member Chat Modal */}
      <Modal
        visible={isChatModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsChatModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.modalContainer, isDark ? styles.bgDark : styles.bgLight]}
        >
          {/* Modal Header */}
          <View style={[styles.modalHeader, isDark ? styles.modalHeaderDark : styles.modalHeaderLight]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={styles.smallAvatar}>
                <Text style={styles.smallAvatarText}>{selectedUser?.name?.charAt(0).toUpperCase() || 'U'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalUserName, isDark ? styles.textWhite : styles.textBlack]} numberOfLines={1}>
                  {selectedUser?.name}
                </Text>
                <Text style={[styles.modalUserEmail, isDark ? styles.textGray : styles.textSlate]} numberOfLines={1}>
                  {selectedUser?.email || 'Member'}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => setIsChatModalVisible(false)}
              style={styles.closeIconBtn}
            >
              <X color={isDark ? '#FFF' : '#000'} size={20} />
            </TouchableOpacity>
          </View>

          {/* Chat Messages Stream */}
          <ScrollView 
            contentContainerStyle={styles.chatStreamContent}
            showsVerticalScrollIndicator={false}
          >
            {activeConversationMessages.length === 0 ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
                <Text style={[styles.emptyText, isDark ? styles.textGray : styles.textSlate]}>No chat history found</Text>
              </View>
            ) : (
              activeConversationMessages.map((m: any, idx: number) => {
                const isAdminMsg = m.sender?.role === 'admin' || m.senderId !== selectedUser?.id;
                return (
                  <View 
                    key={m.id || idx}
                    style={[
                      styles.messageBubbleWrapper,
                      isAdminMsg ? styles.messageWrapperAdmin : styles.messageWrapperUser
                    ]}
                  >
                    <View 
                      style={[
                        styles.messageBubble,
                        isAdminMsg ? styles.bubbleAdmin : (isDark ? styles.bubbleUserDark : styles.bubbleUserLight)
                      ]}
                    >
                      <Text style={[styles.messageText, isAdminMsg ? styles.textWhite : (isDark ? styles.textWhite : styles.textBlack)]}>
                        {m.message}
                      </Text>
                      <Text style={[styles.messageTime, isAdminMsg ? styles.timeAdmin : (isDark ? styles.textGray : styles.textSlate)]}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Chat Composer Input */}
          <View style={[styles.composerContainer, isDark ? styles.composerDark : styles.composerLight]}>
            <TextInput
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Reply to member..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              style={[styles.composerInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              onPress={handleSendReply}
              disabled={!replyText.trim() || sendReplyMutation.isPending}
              style={[styles.sendBtn, (!replyText.trim() || sendReplyMutation.isPending) && { opacity: 0.5 }]}
            >
              {sendReplyMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Send color="#FFFFFF" size={18} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgDark: { backgroundColor: '#0D1117' },
  bgLight: { backgroundColor: '#F4F7F6' },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.1)' },
  headerTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  headerSub: { fontSize: 14, fontWeight: '500', marginTop: 2 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, fontWeight: '600' },
  scrollContent: { padding: 20, gap: 12 },
  
  chatCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, borderWidth: 1 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#D4E2F3', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#3A4C56' },
  unreadDot: { position: 'absolute', top: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#d96638', borderWidth: 2, borderColor: '#FFF' },
  
  chatInfo: { flex: 1, justifyContent: 'center', paddingRight: 16 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chatName: { fontSize: 17, fontWeight: '700' },
  chatTime: { fontSize: 12, fontWeight: '500' },
  chatPreview: { fontSize: 14, lineHeight: 20 },
  textBold: { fontWeight: '700', color: '#d96638' },
  
  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600' },

  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalHeaderDark: { backgroundColor: '#161B22', borderBottomColor: '#30363D' },
  modalHeaderLight: { backgroundColor: '#FFFFFF', borderBottomColor: '#E2E8F0' },
  smallAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F9D3AF', alignItems: 'center', justifyContent: 'center' },
  smallAvatarText: { fontSize: 16, fontWeight: '800', color: '#3A4C56' },
  modalUserName: { fontSize: 16, fontWeight: '700' },
  modalUserEmail: { fontSize: 12 },
  closeIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(150,150,150,0.1)', alignItems: 'center', justifyContent: 'center' },
  
  chatStreamContent: { padding: 20, gap: 12 },
  messageBubbleWrapper: { flexDirection: 'row', width: '100%' },
  messageWrapperAdmin: { justifyContent: 'flex-end' },
  messageWrapperUser: { justifyContent: 'flex-start' },
  messageBubble: { maxWidth: '80%', padding: 14, borderRadius: 20 },
  bubbleAdmin: { backgroundColor: '#d96638', borderBottomRightRadius: 4 },
  bubbleUserDark: { backgroundColor: '#161B22', borderColor: '#30363D', borderWidth: 1, borderBottomLeftRadius: 4 },
  bubbleUserLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1, borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 21 },
  messageTime: { fontSize: 11, marginTop: 4, alignSelf: 'flex-end' },
  timeAdmin: { color: 'rgba(255,255,255,0.7)' },
  
  composerContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12, borderTopWidth: 1, gap: 8 },
  composerDark: { backgroundColor: '#161B22', borderTopColor: '#30363D' },
  composerLight: { backgroundColor: '#FFFFFF', borderTopColor: '#E2E8F0' },
  composerInput: { flex: 1, minHeight: 44, maxHeight: 100, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, borderWidth: 1 },
  inputDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  inputLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#d96638', alignItems: 'center', justifyContent: 'center' }
});

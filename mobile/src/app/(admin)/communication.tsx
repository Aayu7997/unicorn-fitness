import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, TextInput, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Send, ChevronLeft, Plus, Users, Bell, Mail, MessageSquare, Radio, CheckCircle2, X, Sparkles, Filter } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useUIStore } from '../../store/useUIStore';
import { Skeleton } from '../../components/ui/Skeleton';

const CHANNELS = ['All', 'Push App', 'Email', 'WhatsApp', 'SMS'];
const AUDIENCES = ['All Members', 'Active Members', 'Expiring Members', 'Inactive Members'];

export default function AdminCommunication() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { scrollInset } = useAppBottomInset();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  const [activeChannel, setActiveChannel] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [channelType, setChannelType] = useState('Push App');
  const [audience, setAudience] = useState('All Members');
  const [message, setMessage] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-communication'],
    queryFn: async () => {
      const res = await api.get('/admin/communication');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const campaigns = data || [];

  const filteredCampaigns = useMemo(() => {
    if (activeChannel === 'All') return campaigns;
    return campaigns.filter((c: any) => c.type === activeChannel);
  }, [campaigns, activeChannel]);

  const sendMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/admin/communication', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communication'] });
      setIsModalOpen(false);
      setTitle('');
      setMessage('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Broadcast dispatched successfully!', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to dispatch broadcast', 'error');
    }
  });

  const handleSendBroadcast = () => {
    if (!title.trim() || !message.trim()) {
      showToast('Title and message are required', 'error');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    sendMutation.mutate({
      title: title.trim(),
      type: channelType,
      audience,
      message: message.trim(),
    });
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'Push App':
        return <Bell color="#d96638" size={18} />;
      case 'Email':
        return <Mail color="#3B82F6" size={18} />;
      case 'WhatsApp':
        return <MessageSquare color="#10B981" size={18} />;
      default:
        return <Send color="#A855F7" size={18} />;
    }
  };

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={[styles.headerBtn, isDark ? styles.btnDark : styles.btnLight]}
        >
          <ChevronLeft color={isDark ? '#FFF' : '#000'} size={24} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Broadcast Comms</Text>
          <Text style={[styles.headerSubtitle, isDark ? styles.textGray : styles.textSlate]}>
            Omnichannel Member Alerts
          </Text>
        </View>

        <TouchableOpacity 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsModalOpen(true);
          }} 
          style={styles.addBtn}
        >
          <Plus color="#FFF" size={20} />
        </TouchableOpacity>
      </View>

      {/* Channel Filters */}
      <View style={styles.channelScrollWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.channelScroll}>
          {CHANNELS.map((ch) => {
            const isActive = activeChannel === ch;
            return (
              <TouchableOpacity
                key={ch}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveChannel(ch);
                }}
                style={[
                  styles.channelPill,
                  isActive ? styles.channelPillActive : (isDark ? styles.pillDark : styles.pillLight)
                ]}
              >
                <Text style={[styles.channelPillText, isActive ? styles.textWhite : (isDark ? styles.textGray : styles.textSlate)]}>
                  {ch}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollInset }]}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Strip */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, isDark ? styles.cardDark : styles.cardLight]}>
            <Text style={[styles.kpiLabel, isDark ? styles.textGray : styles.textSlate]}>CAMPAIGNS</Text>
            <Text style={[styles.kpiValue, isDark ? styles.textWhite : styles.textBlack]}>{campaigns.length}</Text>
          </View>
          <View style={[styles.kpiCard, isDark ? styles.cardDark : styles.cardLight]}>
            <Text style={[styles.kpiLabel, isDark ? styles.textGray : styles.textSlate]}>DELIVERABILITY</Text>
            <Text style={[styles.kpiValue, { color: '#10B981' }]}>99.4%</Text>
          </View>
          <View style={[styles.kpiCard, isDark ? styles.cardDark : styles.cardLight]}>
            <Text style={[styles.kpiLabel, isDark ? styles.textGray : styles.textSlate]}>CHANNELS</Text>
            <Text style={[styles.kpiValue, { color: '#d96638' }]}>4 Live</Text>
          </View>
        </View>

        {/* Campaign List */}
        {isLoading && !isRefetching ? (
          <View style={{ gap: 14 }}>
            <Skeleton width="100%" height={100} borderRadius={20} isDark={isDark} />
            <Skeleton width="100%" height={100} borderRadius={20} isDark={isDark} />
            <Skeleton width="100%" height={100} borderRadius={20} isDark={isDark} />
          </View>
        ) : filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((camp: any, index: number) => (
            <Animated.View 
              key={camp.id || index}
              entering={FadeInDown.delay(index * 50).duration(260)}
              style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
            >
              <View style={styles.campHeader}>
                <View style={styles.campIconWrap}>
                  {getChannelIcon(camp.type)}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.campTitle, isDark ? styles.textWhite : styles.textBlack]} numberOfLines={1}>
                    {camp.title}
                  </Text>
                  <Text style={[styles.campMeta, isDark ? styles.textGray : styles.textSlate]}>
                    Target: {camp.audience} • {camp.date}
                  </Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>{camp.status || 'Sent'}</Text>
                </View>
              </View>

              <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

              <View style={styles.campFooter}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, isDark ? styles.textGray : styles.textSlate]}>Recipients:</Text>
                  <Text style={[styles.statNum, isDark ? styles.textWhite : styles.textBlack]}>{camp.sent || 'All'}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, isDark ? styles.textGray : styles.textSlate]}>Channel:</Text>
                  <Text style={[styles.statNum, { color: '#d96638' }]}>{camp.type}</Text>
                </View>
              </View>
            </Animated.View>
          ))
        ) : (
          <Animated.View entering={FadeInDown.duration(260)} style={[styles.emptyState, isDark ? styles.cardDark : styles.cardLight]}>
            <Send color="#d96638" size={44} style={{ marginBottom: 14 }} />
            <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textBlack]}>No Broadcasts Yet</Text>
            <Text style={[styles.emptyDesc, isDark ? styles.textGray : styles.textSlate]}>
              Create your first omnichannel announcement to notify gym members about schedule changes, offers, or upcoming events.
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Compose Broadcast Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, isDark ? styles.modalDark : styles.modalLight]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Send color="#d96638" size={24} />
                <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>New Broadcast</Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.closeBtn}>
                <X color={isDark ? '#8E8E93' : '#64748B'} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 24 }}>
              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>CAMPAIGN TITLE *</Text>
                <TextInput
                  style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="e.g. Schedule Change: MMA Open Sparring"
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>DELIVERY CHANNEL</Text>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {['Push App', 'Email', 'WhatsApp', 'SMS'].map((ch) => (
                    <TouchableOpacity
                      key={ch}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setChannelType(ch);
                      }}
                      style={[
                        styles.chipOption,
                        channelType === ch ? styles.chipActive : (isDark ? styles.pillDark : styles.pillLight)
                      ]}
                    >
                      <Text style={[styles.chipText, channelType === ch ? styles.textWhite : (isDark ? styles.textGray : styles.textSlate)]}>
                        {ch}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>TARGET AUDIENCE</Text>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {AUDIENCES.map((aud) => (
                    <TouchableOpacity
                      key={aud}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setAudience(aud);
                      }}
                      style={[
                        styles.chipOption,
                        audience === aud ? styles.chipActive : (isDark ? styles.pillDark : styles.pillLight)
                      ]}
                    >
                      <Text style={[styles.chipText, audience === aud ? styles.textWhite : (isDark ? styles.textGray : styles.textSlate)]}>
                        {aud}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>MESSAGE BODY *</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="Write clear announcement copy..."
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!title.trim() || !message.trim() || sendMutation.isPending) && styles.submitBtnDisabled
                ]}
                disabled={!title.trim() || !message.trim() || sendMutation.isPending}
                onPress={handleSendBroadcast}
              >
                {sendMutation.isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Send color="#FFF" size={18} />
                    <Text style={styles.submitBtnText}>Dispatch Campaign</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
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

  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)'
  },
  headerBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  btnDark: { backgroundColor: '#161B22', borderWidth: 1, borderColor: '#30363D' },
  btnLight: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  headerSubtitle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  addBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#d96638', alignItems: 'center', justifyContent: 'center' },

  channelScrollWrap: { borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.1)' },
  channelScroll: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  channelPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  channelPillActive: { backgroundColor: '#d96638' },
  pillDark: { backgroundColor: '#161B22', borderWidth: 1, borderColor: '#30363D' },
  pillLight: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  channelPillText: { fontSize: 13, fontWeight: '700' },

  scrollContent: { padding: 20, gap: 16 },

  kpiRow: { flexDirection: 'row', gap: 10 },
  kpiCard: { flex: 1, padding: 14, borderRadius: 18, borderWidth: 1 },
  kpiLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  kpiValue: { fontSize: 20, fontWeight: '900' },

  card: { padding: 18, borderRadius: 22, borderWidth: 1 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },

  campHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  campIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(217, 102, 56, 0.12)', alignItems: 'center', justifyContent: 'center' },
  campTitle: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  campMeta: { fontSize: 12, fontWeight: '500' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  statusPillText: { color: '#10B981', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

  divider: { height: 1, marginVertical: 12 },
  dividerDark: { backgroundColor: '#30363D' },
  dividerLight: { backgroundColor: '#F1F5F9' },

  campFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statLabel: { fontSize: 12, fontWeight: '500' },
  statNum: { fontSize: 13, fontWeight: '700' },

  emptyState: { padding: 36, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18, paddingHorizontal: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '88%' },
  modalDark: { backgroundColor: '#161B22' },
  modalLight: { backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  closeBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(150,150,150,0.1)' },

  formLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  formInput: { height: 48, borderRadius: 14, paddingHorizontal: 14, fontSize: 15, borderWidth: 1 },
  textArea: { height: 90, paddingTop: 12, textAlignVertical: 'top' },
  inputDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  inputLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },

  chipOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, borderWidth: 1 },
  chipActive: { backgroundColor: '#d96638', borderColor: '#d96638' },
  chipText: { fontSize: 12, fontWeight: '700' },

  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#d96638', height: 50, borderRadius: 16, marginTop: 12 },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
});

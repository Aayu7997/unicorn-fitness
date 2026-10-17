import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, ActivityIndicator, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Search, ChevronRight, Users, Edit, CreditCard, BadgeInfo, MoreVertical, MessageSquare, Send, X, Sparkles, Plus } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import * as Haptics from 'expo-haptics';
import { Skeleton } from '../../components/ui/Skeleton';
import { useDebounce } from '../../hooks/useDebounce';
import { RefreshControl } from 'react-native';
import { useUIStore } from '../../store/useUIStore';
import { useLocalSearchParams } from 'expo-router';

type Tab = 'live' | 'expiring' | 'expired';

export default function AdminMembers() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { scrollInset } = useAppBottomInset();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const params = useLocalSearchParams();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('live');

  // Add Member Modal State
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  React.useEffect(() => {
    if (params.action === 'add') {
      setIsAddModalVisible(true);
    }
    if (params.filter === 'expiring' || params.filter === 'expired' || params.filter === 'live') {
      setActiveTab(params.filter as Tab);
    }
  }, [params.action, params.filter]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [promoModalVisible, setPromoModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [promoPrompt, setPromoPrompt] = useState('');
  const [promoResult, setPromoResult] = useState('');
  const [isGeneratingPromo, setIsGeneratingPromo] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const addMemberMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; phone?: string; password?: string }) => {
      const res = await api.post('/admin/members', {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password || 'ChangeMe@123!',
        role: 'user',
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMembers'] });
      setIsAddModalVisible(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewPassword('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Member added successfully!', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to add member', 'error');
    }
  });

  const handleGeneratePromo = async () => {
    if (!selectedMember || !promoPrompt.trim()) return;
    setIsGeneratingPromo(true);
    setPromoResult('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const response = await api.post('/admin/promo', { memberName: selectedMember.name, prompt: promoPrompt });
      setPromoResult(response.data.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setPromoResult('Failed to generate promo message. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsGeneratingPromo(false);
    }
  };

  const { data: members, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['adminMembers', debouncedSearch],
    queryFn: async () => {
      // In a real app we would paginate or filter on the backend.
      // For now, we fetch all and filter client-side for the tabs.
      const response = await api.get(`/admin/members?search=${debouncedSearch}&limit=100`);
      return response.data.users;
    },
  });

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    const now = new Date();
    
    return members.filter((member: any) => {
      const memStatus = member.membership?.status;
      const endDate = member.membership?.endDate ? new Date(member.membership.endDate) : null;
      
      let isLive = false;
      let isExpiring = false;
      let isExpired = false;

      if (memStatus === 'active' && endDate) {
        const daysDiff = (endDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
        if (daysDiff > 15) isLive = true;
        else if (daysDiff >= 0 && daysDiff <= 15) isExpiring = true;
        else isExpired = true; // edge case
      } else if (memStatus === 'expired' || (endDate && endDate < now)) {
        isExpired = true;
      } else if (!memStatus) {
        // No plan yet, let's treat them as expired/inactive for this view, or just exclude.
        isExpired = true;
      }

      if (activeTab === 'live' && !isLive) return false;
      if (activeTab === 'expiring' && !isExpiring) return false;
      if (activeTab === 'expired' && !isExpired) return false;

      return true;
    });
  }, [members, activeTab]);

  const renderTab = (title: string, tab: Tab, count: number) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity 
        style={[
          styles.tab, 
          isActive && (isDark ? styles.tabActiveDark : styles.tabActiveLight)
        ]}
        onPress={() => {
          Haptics.selectionAsync();
          setActiveTab(tab);
        }}
      >
        <Text style={[
          styles.tabText, 
          isActive ? (isDark ? styles.textWhite : styles.textBlack) : styles.textGray
        ]}>{title} ({count})</Text>
      </TouchableOpacity>
    );
  };

  const liveCount = filteredMembers.filter((m: any) => activeTab === 'live' ? true : false).length || (members ? members.filter((m: any) => {
    const memStatus = m.membership?.status;
    const endDate = m.membership?.endDate ? new Date(m.membership.endDate) : null;
    if (memStatus === 'active' && endDate) {
      const daysDiff = (endDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
      return daysDiff > 15;
    }
    return false;
  }).length : 0);
  
  const expiringCount = members ? members.filter((m: any) => {
    const memStatus = m.membership?.status;
    const endDate = m.membership?.endDate ? new Date(m.membership.endDate) : null;
    if (memStatus === 'active' && endDate) {
      const daysDiff = (endDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
      return daysDiff >= 0 && daysDiff <= 15;
    }
    return false;
  }).length : 0;

  const expiredCount = members ? members.filter((m: any) => {
    const memStatus = m.membership?.status;
    const endDate = m.membership?.endDate ? new Date(m.membership.endDate) : null;
    if (memStatus === 'expired' || (endDate && endDate < new Date()) || !memStatus) {
      return true;
    }
    return false;
  }).length : 0;

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Manage Members</Text>
          <TouchableOpacity 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsAddModalVisible(true);
            }}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#d96638', alignItems: 'center', justifyContent: 'center' }}
          >
            <Plus color="#FFF" size={22} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.searchContainer, isDark ? styles.searchDark : styles.searchLight]}>
          <Search color={isDark ? '#8E8E93' : '#64748B'} size={20} />
          <TextInput
            style={[styles.searchInput, isDark ? styles.textWhite : styles.textBlack]}
            placeholder="Search by name, phone..."
            placeholderTextColor={isDark ? '#8E8E93' : '#64748B'}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {renderTab('Live', 'live', liveCount)}
            {renderTab('Expiring', 'expiring', expiringCount)}
            {renderTab('Expired', 'expired', expiredCount)}
          </ScrollView>
        </View>
      </View>

      {isLoading && !isRefetching ? (
        <View style={styles.scrollContent}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} width="100%" height={120} borderRadius={24} isDark={isDark} />
          ))}
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, isDark ? styles.textWhite : styles.textBlack]}>Failed to load members</Text>
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
          {filteredMembers.map((member: any, index: number) => (
            <Animated.View 
              key={member.id}
              entering={FadeInDown.delay(index * 50).duration(260)}
              style={[styles.memberCard, isDark ? styles.cardDark : styles.cardLight]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.avatarText}>{member.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={[styles.memberName, isDark ? styles.textWhite : styles.textBlack]}>{member.name}</Text>
                  <Text style={[styles.memberSub, isDark ? styles.textGray : styles.textSlate]}>{member.phone || member.email}</Text>
                  {member.membership?.plan && (
                    <Text style={[styles.planName, { color: '#F9D3AF' }]}>{member.membership.plan.name}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <MoreVertical color={isDark ? '#8E8E93' : '#CBD5E1'} size={24} />
                </TouchableOpacity>
              </View>

              <View style={[styles.divider, isDark ? styles.borderDark : styles.borderLight]} />
              
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => Haptics.selectionAsync()}>
                  <BadgeInfo color={isDark ? '#E2E8F0' : '#475569'} size={18} />
                  <Text style={[styles.actionText, isDark ? styles.textWhite : styles.textBlack]}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedMember(member);
                  setPromoPrompt('');
                  setPromoResult('');
                  setPromoModalVisible(true);
                }}>
                  <Sparkles color="#A855F7" size={18} />
                  <Text style={[styles.actionText, { color: '#A855F7' }]}>Promo AI</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => Haptics.selectionAsync()}>
                  <Edit color={isDark ? '#E2E8F0' : '#475569'} size={18} />
                  <Text style={[styles.actionText, isDark ? styles.textWhite : styles.textBlack]}>Edit</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))}
          
          {filteredMembers.length === 0 && (
            <View style={styles.emptyContainer}>
              <Users color={isDark ? '#30363D' : '#E2E8F0'} size={64} />
              <Text style={[styles.emptyText, isDark ? styles.textGray : styles.textSlate]}>No members in this category</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* AI Promo Modal */}
      <Modal
        visible={promoModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPromoModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, isDark ? styles.modalDark : styles.modalLight, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Sparkles color="#A855F7" size={24} />
                <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>AI Promos</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setPromoModalVisible(false)}
                style={styles.closeBtn}
              >
                <X color={isDark ? '#8E8E93' : '#64748B'} size={24} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, isDark ? styles.textGray : styles.textSlate]}>
              Draft a high-converting message for {selectedMember?.name}
            </Text>

            <View style={[styles.inputWrapper, isDark ? styles.inputWrapperDark : styles.inputWrapperLight]}>
              <TextInput
                style={[styles.promoInput, isDark ? styles.textWhite : styles.textBlack]}
                placeholder="e.g., Offer 20% off PT if they renew today"
                placeholderTextColor={isDark ? '#8E8E93' : '#94A3B8'}
                value={promoPrompt}
                onChangeText={setPromoPrompt}
                multiline
                maxLength={150}
              />
              <TouchableOpacity 
                style={[styles.generateBtn, !promoPrompt.trim() && styles.generateBtnDisabled]}
                onPress={handleGeneratePromo}
                disabled={isGeneratingPromo || !promoPrompt.trim()}
              >
                {isGeneratingPromo ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Sparkles color="#FFFFFF" size={16} />
                    <Text style={styles.generateBtnText}>Generate</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {promoResult ? (
              <Animated.View entering={FadeInDown.duration(260)} style={[styles.resultBox, isDark ? styles.resultBoxDark : styles.resultBoxLight]}>
                <Text style={[styles.resultLabel, isDark ? styles.textGray : styles.textSlate]}>Generated Message</Text>
                <TextInput
                  style={[styles.resultText, isDark ? styles.textWhite : styles.textBlack]}
                  value={promoResult}
                  onChangeText={setPromoResult}
                  multiline
                />
                <TouchableOpacity style={styles.sendBtn} onPress={async () => {
                  Haptics.selectionAsync();
                  try {
                    await api.post('/admin/promo/send', {
                      memberId: selectedMember?.id,
                      message: promoResult
                    });
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setPromoModalVisible(false);
                    alert('Message Sent to ' + selectedMember?.name);
                  } catch (e) {
                    alert('Failed to send message');
                  }
                }}>
                  <Send color="#FFFFFF" size={18} />
                  <Text style={styles.sendBtnText}>Send Message</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : null}

          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, isDark ? styles.modalDark : styles.modalLight]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Users color="#d96638" size={24} />
                <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>New Member</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeBtn} 
                onPress={() => setIsAddModalVisible(false)}
              >
                <X color={isDark ? '#8E8E93' : '#64748B'} size={20} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, isDark ? styles.textGray : styles.textSlate]}>
              Create a new user account with initial membership credentials.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 20 }}>
              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>FULL NAME *</Text>
                <TextInput
                  style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="e.g. John Doe"
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>EMAIL ADDRESS *</Text>
                <TextInput
                  style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="e.g. john@example.com"
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>PHONE NUMBER</Text>
                <TextInput
                  style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="e.g. +91 98765 43210"
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={newPhone}
                  onChangeText={setNewPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>TEMPORARY PASSWORD</Text>
                <TextInput
                  style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="Default: ChangeMe@123!"
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                style={[
                  styles.submitBtn,
                  (!newName.trim() || !newEmail.trim() || addMemberMutation.isPending) && styles.submitBtnDisabled
                ]}
                disabled={!newName.trim() || !newEmail.trim() || addMemberMutation.isPending}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  addMemberMutation.mutate({
                    name: newName.trim(),
                    email: newEmail.trim(),
                    phone: newPhone.trim() || undefined,
                    password: newPassword.trim() || undefined
                  });
                }}
              >
                {addMemberMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Plus color="#FFFFFF" size={18} />
                    <Text style={styles.submitBtnText}>Create Member Account</Text>
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
  header: { paddingHorizontal: 0, paddingBottom: 0, borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.1)' },
  headerTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -1, marginBottom: 16, paddingHorizontal: 20 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 48, borderRadius: 24, marginHorizontal: 20, marginBottom: 16 },
  searchDark: { backgroundColor: '#161B22', borderWidth: 1, borderColor: '#30363D' },
  searchLight: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '500' },
  
  tabsContainer: { borderBottomWidth: 1, borderBottomColor: 'transparent' },
  tabsScroll: { paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'transparent' },
  tabActiveDark: { backgroundColor: '#30363D' },
  tabActiveLight: { backgroundColor: '#E2E8F0' },
  tabText: { fontSize: 14, fontWeight: '700' },

  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, fontWeight: '600' },
  scrollContent: { padding: 20, gap: 16 },
  
  memberCard: { padding: 16, borderRadius: 24, borderWidth: 1 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  memberAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#3A4C56', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#F9D3AF' },
  
  memberInfo: { flex: 1, justifyContent: 'center' },
  memberName: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  memberSub: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  planName: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  divider: { height: 1, marginVertical: 16 },
  borderDark: { backgroundColor: '#30363D' },
  borderLight: { backgroundColor: '#F1F5F9' },
  
  actionRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(150,150,150,0.1)' },
  actionText: { fontSize: 13, fontWeight: '600' },
  
  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, minHeight: '50%' },
  modalDark: { backgroundColor: '#161B22' },
  modalLight: { backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalTitle: { fontSize: 24, fontWeight: '800' },
  closeBtn: { padding: 8, backgroundColor: 'rgba(150,150,150,0.1)', borderRadius: 20 },
  modalSubtitle: { fontSize: 15, marginBottom: 24 },
  
  inputWrapper: { borderRadius: 20, padding: 16, marginBottom: 24, borderWidth: 1 },
  inputWrapperDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  inputWrapperLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  promoInput: { fontSize: 16, minHeight: 60, textAlignVertical: 'top' },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#A855F7', paddingVertical: 12, borderRadius: 12, marginTop: 12 },
  generateBtnDisabled: { opacity: 0.5 },
  generateBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  
  resultBox: { padding: 16, borderRadius: 20, borderWidth: 1 },
  resultBoxDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  resultBoxLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  resultLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  resultText: { fontSize: 16, lineHeight: 24 },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  sendBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  formLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
  formInput: { height: 48, borderRadius: 14, paddingHorizontal: 14, fontSize: 15, borderWidth: 1 },
  inputDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  inputLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#d96638', height: 50, borderRadius: 16, marginTop: 12 },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});

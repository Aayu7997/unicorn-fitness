import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, ActivityIndicator, Linking, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Inbox, ChevronRight, Mail, Phone, Calendar, CheckCircle, Plus, X, Send } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import * as Haptics from 'expo-haptics';
import { RefreshControl } from 'react-native';
import { Skeleton } from '../../components/ui/Skeleton';
import { useUIStore } from '../../store/useUIStore';
import { useLocalSearchParams } from 'expo-router';

export default function AdminEnquiries() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { scrollInset } = useAppBottomInset();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'replied' | 'closed'>('all');

  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  // New Inquiry Modal State
  const [isNewModalVisible, setIsNewModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Auto-open if navigated with ?action=new
  useEffect(() => {
    if (params.action === 'new') {
      setIsNewModalVisible(true);
    }
  }, [params.action]);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['adminEnquiries'],
    queryFn: async () => {
      const response = await api.get('/admin/inquiries?limit=50');
      return response.data;
    },
  });

  const createInquiryMutation = useMutation({
    mutationFn: async (payload: { name: string; email: string; phone?: string; subject: string; message: string }) => {
      const response = await api.post('/contact', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEnquiries'] });
      setIsNewModalVisible(false);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Enquiry recorded successfully!', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to submit enquiry', 'error');
    }
  });

  const closeInquiryMutation = useMutation({
    mutationFn: async (inquiryId: string) => {
      // Backend expects PUT /api/admin/inquiries/:id
      await api.put(`/admin/inquiries/${inquiryId}`, { status: 'closed' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEnquiries'] });
      showToast('Enquiry closed successfully', 'success');
    },
    onError: () => {
      showToast('Failed to close enquiry', 'error');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(`/admin/inquiries/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEnquiries'] });
      showToast('Status updated', 'success');
    },
    onError: () => {
      showToast('Failed to update status', 'error');
    }
  });

  const handleCreateInquiry = () => {
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      showToast('Name, email, subject, and message are required', 'error');
      return;
    }
    createInquiryMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      subject: subject.trim(),
      message: message.trim(),
    });
  };

  const filteredInquiries = data?.inquiries?.filter((inq: any) => {
    if (activeTab === 'all') return true;
    return inq.status === activeTab;
  }) || [];

  const handleCall = (phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Enquiries</Text>
          {data?.newCount != null && data.newCount > 0 && (
            <View style={[styles.badge, { backgroundColor: '#FF3B30' }]}>
              <Text style={[styles.badgeText, { color: '#FFF' }]}>{data.newCount} New</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#d96638' }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsNewModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Plus color="#FFF" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {(['all', 'new', 'replied', 'closed'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && (isDark ? styles.tabActiveDark : styles.tabActiveLight)
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveTab(tab);
            }}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab ? (isDark ? styles.textWhite : styles.textBlack) : (isDark ? styles.textGray : styles.textSlate)
            ]}>
              {tab === 'all' ? 'All Leads' : tab === 'new' ? 'New' : tab === 'replied' ? 'Replied' : 'Closed'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && !isRefetching ? (
        <View style={styles.scrollContent}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={200} borderRadius={24} isDark={isDark} />
          ))}
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, isDark ? styles.textWhite : styles.textBlack]}>Failed to load enquiries</Text>
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
          {filteredInquiries.map((inquiry: any, index: number) => (
            <Animated.View 
              key={inquiry.id}
              entering={FadeInDown.delay(index * 50).duration(260)}
            >
              <View style={[styles.inquiryCard, isDark ? styles.cardDark : styles.cardLight]}>
                <View style={styles.inquiryHeader}>
                  <Text style={[styles.inquiryName, isDark ? styles.textWhite : styles.textBlack]}>{inquiry.name}</Text>
                  <View style={[styles.statusBadge, 
                    { backgroundColor: inquiry.status === 'new' ? '#F9D3AF' : inquiry.status === 'closed' ? '#D7C8B4' : isDark ? '#30363D' : '#E2E8F0' }
                  ]}>
                    <Text style={[styles.statusText, { color: inquiry.status === 'new' || inquiry.status === 'closed' ? '#3A4C56' : isDark ? '#8E8E93' : '#64748B' }]}>
                      {inquiry.status}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.inquirySubject, isDark ? styles.textGray : styles.textSlate]} numberOfLines={1}>
                  {inquiry.subject}
                </Text>
                
                <Text style={[styles.inquiryMessage, isDark ? styles.textWhite : styles.textBlack]} numberOfLines={2}>
                  {inquiry.message}
                </Text>
                
                {inquiry.nextFollowUp && (
                  <View style={[styles.followUpContainer, { backgroundColor: isDark ? '#231B1A' : '#FFF0ED' }]}>
                    <Calendar color="#FF453A" size={14} />
                    <Text style={[styles.followUpText, { color: '#FF453A' }]}>Follow-up: {inquiry.nextFollowUp}</Text>
                  </View>
                )}
                
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, isDark ? styles.btnDark : styles.btnLight]}
                    onPress={() => inquiry.email && handleEmail(inquiry.email)}
                  >
                    <Mail color={isDark ? '#FFF' : '#1E293B'} size={18} />
                    <Text style={[styles.actionBtnText, isDark ? styles.textWhite : styles.textBlack]}>Email</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionBtn, isDark ? styles.btnDark : styles.btnLight]}
                    onPress={() => inquiry.phone && handleCall(inquiry.phone)}
                  >
                    <Phone color={isDark ? '#FFF' : '#1E293B'} size={18} />
                    <Text style={[styles.actionBtnText, isDark ? styles.textWhite : styles.textBlack]}>Call</Text>
                  </TouchableOpacity>
                  {inquiry.status !== 'closed' && (
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: '#D7C8B4' }]}
                      onPress={() => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        closeInquiryMutation.mutate(inquiry.id);
                      }}
                      disabled={closeInquiryMutation.isPending}
                    >
                      {closeInquiryMutation.isPending ? (
                        <ActivityIndicator color="#3A4C56" size="small" />
                      ) : (
                        <CheckCircle color="#3A4C56" size={18} />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Animated.View>
          ))}
          
          {filteredInquiries.length === 0 && (
            <View style={styles.emptyContainer}>
              <Inbox color={isDark ? '#30363D' : '#E2E8F0'} size={64} />
              <Text style={[styles.emptyText, isDark ? styles.textGray : styles.textSlate]}>No enquiries found</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* New Enquiry Modal */}
      <Modal
        visible={isNewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsNewModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalCard, isDark ? styles.modalDark : styles.modalLight]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>Record New Enquiry</Text>
              <TouchableOpacity onPress={() => setIsNewModalVisible(false)} style={styles.closeBtn}>
                <X color={isDark ? '#FFF' : '#1E293B'} size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Prospect Full Name</Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                  placeholder="e.g. Rahul Sharma"
                  placeholderTextColor={isDark ? '#8E8E93' : '#94A3B8'}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Email Address</Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                  placeholder="e.g. rahul@example.com"
                  placeholderTextColor={isDark ? '#8E8E93' : '#94A3B8'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Phone Number</Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={isDark ? '#8E8E93' : '#94A3B8'}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Subject / Interest</Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                  placeholder="e.g. Boxing Pro Membership Inquiry"
                  placeholderTextColor={isDark ? '#8E8E93' : '#94A3B8'}
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Detailed Notes / Message</Text>
                <TextInput
                  style={[styles.input, styles.textArea, isDark ? styles.inputDark : styles.inputLight]}
                  placeholder="Enter details of conversation or inquiry..."
                  placeholderTextColor={isDark ? '#8E8E93' : '#94A3B8'}
                  multiline
                  numberOfLines={4}
                  value={message}
                  onChangeText={setMessage}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, createInquiryMutation.isPending && styles.submitButtonDisabled]}
                onPress={handleCreateInquiry}
                disabled={createInquiryMutation.isPending}
                activeOpacity={0.8}
              >
                {createInquiryMutation.isPending ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Send color="#FFF" size={18} />
                    <Text style={styles.submitButtonText}>Save Enquiry</Text>
                  </View>
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
  header: { paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  badgeText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  addButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#d96638', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'transparent' },
  tabActiveLight: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  tabActiveDark: { backgroundColor: '#21262D' },
  tabText: { fontSize: 14, fontWeight: '600' },
  
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, fontWeight: '600' },
  scrollContent: { padding: 20, gap: 16 },
  
  inquiryCard: { padding: 20, borderRadius: 24, borderWidth: 1 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  
  inquiryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  inquiryName: { fontSize: 18, fontWeight: '700' },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  inquirySubject: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  inquiryMessage: { fontSize: 14, lineHeight: 20, marginBottom: 16, opacity: 0.9 },
  
  followUpContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderRadius: 8, marginBottom: 16 },
  followUpText: { fontSize: 12, fontWeight: '600' },
  
  actionRow: { flexDirection: 'row', gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(150,150,150,0.1)' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 16 },
  btnLight: { backgroundColor: '#F4F7F6' },
  btnDark: { backgroundColor: '#21262D' },
  actionBtnText: { fontSize: 14, fontWeight: '600' },
  
  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%' },
  modalDark: { backgroundColor: '#161B22' },
  modalLight: { backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  closeBtn: { padding: 4 },
  formContainer: { gap: 16, paddingBottom: 24 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '600' },
  input: { height: 50, borderRadius: 16, paddingHorizontal: 16, fontSize: 15, borderWidth: 1 },
  textArea: { height: 100, paddingTop: 14, textAlignVertical: 'top' },
  inputDark: { backgroundColor: '#0D1117', borderColor: '#30363D', color: '#FFF' },
  inputLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', color: '#1E293B' },
  submitButton: { height: 54, backgroundColor: '#d96638', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

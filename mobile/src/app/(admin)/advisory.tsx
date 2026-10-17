import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Compass, Apple, ChevronRight, Plus, X, User, Check, Trash2, CheckCircle2, Clock } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import * as Haptics from 'expo-haptics';
import { api } from '../../lib/api';
import { RefreshControl } from 'react-native';
import { Skeleton } from '../../components/ui/Skeleton';
import { useUIStore } from '../../store/useUIStore';

export default function AdvisoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { scrollInset } = useAppBottomInset();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Completed'>('Upcoming');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedMemberName, setSelectedMemberName] = useState('');
  const [topic, setTopic] = useState('');
  const [advisor, setAdvisor] = useState('Head Coach Carter');

  const { data: members = [] } = useQuery({
    queryKey: ['adminMembersForAdvisory'],
    queryFn: async () => {
      const response = await api.get('/admin/members?limit=50');
      return response.data?.users || [];
    },
  });

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminAdvisory'],
    queryFn: async () => {
      const response = await api.get('/admin/advisory');
      return response.data || [];
    },
  });

  const addSessionMutation = useMutation({
    mutationFn: async (payload: { userId: string; topic: string; advisor: string; status: string }) => {
      const response = await api.post('/admin/advisory', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAdvisory'] });
      setIsModalOpen(false);
      setSelectedUserId('');
      setSelectedMemberName('');
      setTopic('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Advisory session booked successfully!', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to schedule session', 'error');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      await api.put(`/admin/advisory/${id}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAdvisory'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Session status updated', 'success');
    },
    onError: () => {
      showToast('Failed to update session status', 'error');
    }
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/advisory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAdvisory'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Session removed', 'success');
    },
    onError: () => {
      showToast('Failed to remove session', 'error');
    }
  });

  const handleDeleteSession = (id: string, topicName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Advisory Session',
      `Are you sure you want to delete session "${topicName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteSessionMutation.mutate(id)
        }
      ]
    );
  };

  const handleSaveSession = () => {
    if (!selectedUserId) {
      showToast('Please select a member', 'error');
      return;
    }
    if (!topic.trim()) {
      showToast('Please enter an advisory topic', 'error');
      return;
    }
    addSessionMutation.mutate({
      userId: selectedUserId,
      topic: topic.trim(),
      advisor: advisor.trim() || 'Head Coach Carter',
      status: 'Upcoming'
    });
  };

  const filteredData = data?.filter((session: any) => session.status === activeTab) || [];

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Advisory Sessions</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#d96638' }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsModalOpen(true);
          }}
          activeOpacity={0.8}
        >
          <Plus color="#FFF" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {(['Upcoming', 'Completed'] as const).map((tab) => (
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[
                styles.tabText,
                activeTab === tab ? (isDark ? styles.textWhite : styles.textBlack) : (isDark ? styles.textGray : styles.textSlate)
              ]}>
                {tab}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && !isRefetching ? (
        <View style={styles.scrollContent}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={120} borderRadius={24} isDark={isDark} />
          ))}
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
          {filteredData.map((session: any, index: number) => (
            <Animated.View 
              key={session.id}
              entering={FadeInDown.delay(index * 50).duration(260)}
            >
              <TouchableOpacity 
                style={[styles.planCard, isDark ? styles.cardDark : styles.cardLight]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.planName, isDark ? styles.textWhite : styles.textBlack]}>{session.topic}</Text>
                  <TouchableOpacity
                    style={styles.deleteIconBtn}
                    onPress={() => handleDeleteSession(session.id, session.topic)}
                  >
                    <Trash2 color="#FF3B30" size={16} />
                  </TouchableOpacity>
                </View>

                <View style={styles.statsRow}>
                  <View style={[styles.statBadge, { backgroundColor: isDark ? '#30363D' : '#F1F5F9' }]}>
                    <Text style={[styles.statText, isDark ? styles.textGray : styles.textSlate]}>{new Date(session.date).toLocaleDateString()}</Text>
                  </View>
                  <View style={[styles.statBadge, { backgroundColor: isDark ? '#30363D' : '#F1F5F9' }]}>
                    <Text style={[styles.statText, isDark ? styles.textGray : styles.textSlate]}>{session.advisor}</Text>
                  </View>
                </View>

                <View style={[styles.assignedRow, { borderTopColor: isDark ? '#30363D' : '#F1F5F9' }]}>
                  <Text style={[styles.assignedText, isDark ? styles.textGray : styles.textSlate]}>
                    Member: {session.member}
                  </Text>
                  
                  <TouchableOpacity
                    style={[
                      styles.statusToggleBtn,
                      session.status === 'Completed'
                        ? { backgroundColor: 'rgba(52, 199, 89, 0.15)' }
                        : { backgroundColor: 'rgba(217, 102, 56, 0.15)' }
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      const nextStatus = session.status === 'Completed' ? 'Upcoming' : 'Completed';
                      toggleStatusMutation.mutate({ id: session.id, newStatus: nextStatus });
                    }}
                  >
                    {session.status === 'Completed' ? (
                      <CheckCircle2 color="#34C759" size={14} />
                    ) : (
                      <Clock color="#d96638" size={14} />
                    )}
                    <Text style={[
                      styles.statusToggleText,
                      { color: session.status === 'Completed' ? '#34C759' : '#d96638' }
                    ]}>
                      {session.status === 'Completed' ? 'Completed' : 'Mark Done'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
          {filteredData.length === 0 && (
            <View style={styles.centerContainer}>
              <Text style={[styles.textGray, { marginTop: 40 }]}>No {activeTab.toLowerCase()} sessions found.</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Schedule Advisory Modal */}
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
          <View style={[styles.modalCard, isDark ? styles.modalDark : styles.modalLight]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.modalIconBg, { backgroundColor: 'rgba(217, 102, 56, 0.15)' }]}>
                  <Compass color="#d96638" size={20} />
                </View>
                <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>Schedule Session</Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.closeBtn}>
                <X color={isDark ? '#FFF' : '#1E293B'} size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
              {/* Member Selector */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Member *</Text>
                <TouchableOpacity
                  style={[styles.input, styles.pickerTrigger, isDark ? styles.inputDark : styles.inputLight]}
                  onPress={() => setMemberPickerOpen(!memberPickerOpen)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <User color={selectedMemberName ? '#d96638' : isDark ? '#8E8E93' : '#94A3B8'} size={18} />
                    <Text style={{ fontSize: 15, color: selectedMemberName ? (isDark ? '#FFF' : '#1E293B') : (isDark ? '#8E8E93' : '#94A3B8') }}>
                      {selectedMemberName || 'Select Member'}
                    </Text>
                  </View>
                  <ChevronRight color={isDark ? '#8E8E93' : '#94A3B8'} size={18} />
                </TouchableOpacity>

                {memberPickerOpen && (
                  <View style={[styles.pickerDropdown, isDark ? styles.dropdownDark : styles.dropdownLight]}>
                    <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
                      {members.map((m: any) => (
                        <TouchableOpacity
                          key={m.id}
                          style={[styles.pickerItem, selectedUserId === m.id && styles.pickerItemActive]}
                          onPress={() => {
                            setSelectedUserId(m.id);
                            setSelectedMemberName(m.name || m.email);
                            setMemberPickerOpen(false);
                          }}
                        >
                          <Text style={[styles.pickerItemText, isDark ? styles.textWhite : styles.textBlack]}>
                            {m.name || m.email}
                          </Text>
                          {selectedUserId === m.id && <Check color="#d96638" size={16} />}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Topic Input with Quick Preset Chips */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Topic / Consultation Scope *</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {['Macro Nutrition & Cut', 'Strength & Hypertrophy', 'Recovery & Injury Care', 'Keto & Intermittent Fasting'].map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.chip, topic === t ? styles.chipActive : isDark ? styles.chipDark : styles.chipLight]}
                      onPress={() => setTopic(t)}
                    >
                      <Text style={[styles.chipText, topic === t ? styles.chipTextActive : isDark ? styles.textGray : styles.textSlate]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                  placeholder="e.g. Personalized Macro Diet Assessment"
                  placeholderTextColor={isDark ? '#8E8E93' : '#94A3B8'}
                  value={topic}
                  onChangeText={setTopic}
                />
              </View>

              {/* Advisor / Coach */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Lead Coach / Advisor</Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                  placeholder="e.g. Head Coach Carter"
                  placeholderTextColor={isDark ? '#8E8E93' : '#94A3B8'}
                  value={advisor}
                  onChangeText={setAdvisor}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, addSessionMutation.isPending && styles.submitButtonDisabled]}
                onPress={handleSaveSession}
                disabled={addSessionMutation.isPending}
                activeOpacity={0.8}
              >
                {addSessionMutation.isPending ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Schedule Consultation</Text>
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
  addButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#d96638', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: 'transparent', alignItems: 'center' },
  tabActiveLight: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  tabActiveDark: { backgroundColor: '#21262D' },
  tabText: { fontSize: 14, fontWeight: '600' },
  
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, gap: 16 },
  
  planCard: { padding: 20, borderRadius: 24, borderWidth: 1 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  planName: { fontSize: 18, fontWeight: '700', flex: 1 },
  deleteIconBtn: { padding: 6, borderRadius: 8, backgroundColor: 'rgba(255, 59, 48, 0.1)', marginLeft: 8 },
  
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statText: { fontSize: 12, fontWeight: '600' },
  
  assignedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTopWidth: 1 },
  assignedText: { fontSize: 13, fontWeight: '500' },
  statusToggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusToggleText: { fontSize: 12, fontWeight: '700' },
  
  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%' },
  modalDark: { backgroundColor: '#161B22' },
  modalLight: { backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalIconBg: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  closeBtn: { padding: 4 },
  formContainer: { gap: 16, paddingBottom: 24 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '600' },
  input: { height: 50, borderRadius: 16, paddingHorizontal: 16, fontSize: 15, borderWidth: 1 },
  pickerTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerDropdown: { borderRadius: 16, borderWidth: 1, marginTop: 4, overflow: 'hidden' },
  dropdownDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  dropdownLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.08)' },
  pickerItemActive: { backgroundColor: 'rgba(217, 102, 56, 0.1)' },
  pickerItemText: { fontSize: 14, fontWeight: '500' },
  inputDark: { backgroundColor: '#0D1117', borderColor: '#30363D', color: '#FFF' },
  inputLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', color: '#1E293B' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  chipDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  chipLight: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  chipActive: { backgroundColor: '#d96638', borderColor: '#d96638' },
  chipText: { fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#FFF', fontWeight: '700' },
  submitButton: { height: 54, backgroundColor: '#d96638', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

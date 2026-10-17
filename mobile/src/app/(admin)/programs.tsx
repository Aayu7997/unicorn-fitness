import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, TextInput, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LayoutTemplate, ChevronLeft, Plus, PlayCircle, Star, Trash2, X, CheckCircle } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import { router } from 'expo-router';
import { Skeleton } from '../../components/ui/Skeleton';
import * as Haptics from 'expo-haptics';
import { useUIStore } from '../../store/useUIStore';

export default function AdminPrograms() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { scrollInset } = useAppBottomInset();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  
  const [activeTab, setActiveTab] = useState<'programs' | 'plans'>('programs');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Program Fields
  const [progName, setProgName] = useState('');
  const [progDuration, setProgDuration] = useState('4 Weeks');
  const [progLevel, setProgLevel] = useState('All Levels');
  const [progTrainer, setProgTrainer] = useState('Head Coach');
  const [progPrice, setProgPrice] = useState('0');
  const [progDesc, setProgDesc] = useState('');

  // Plan Fields
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState('2999');
  const [planPeriod, setPlanPeriod] = useState('month');
  const [planDesc, setPlanDesc] = useState('');

  const { data: programsData, isLoading: isLoadingPrograms } = useQuery({
    queryKey: ['admin-programs'],
    queryFn: async () => {
      const res = await api.get('/admin/programs');
      return res.data;
    }
  });

  const { data: plansData, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => {
      const res = await api.get('/admin/plans');
      return res.data;
    }
  });

  const programs = Array.isArray(programsData) ? programsData : (programsData?.programs || []);
  const plans = Array.isArray(plansData) ? plansData : (plansData?.plans || []);

  const addProgramMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/admin/programs', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-programs'] });
      setIsModalOpen(false);
      setProgName('');
      setProgDesc('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Program created successfully', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to create program', 'error');
    }
  });

  const addPlanMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/admin/plans', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      setIsModalOpen(false);
      setPlanName('');
      setPlanDesc('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Plan created successfully', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to create plan', 'error');
    }
  });

  const deleteProgramMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/programs/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-programs'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Program removed', 'success');
    }
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/plans/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Plan removed', 'success');
    }
  });

  const handleDelete = (id: string, name: string, type: 'program' | 'plan') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      `Delete ${type === 'program' ? 'Program' : 'Plan'}`,
      `Are you sure you want to permanently remove "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (type === 'program') deleteProgramMutation.mutate(id);
            else deletePlanMutation.mutate(id);
          }
        }
      ]
    );
  };

  const handleCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (activeTab === 'programs') {
      const slug = progName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `prog-${Date.now()}`;
      addProgramMutation.mutate({
        name: progName.trim(),
        slug,
        description: progDesc.trim() || 'High-performance martial arts and conditioning curriculum.',
        duration: progDuration.trim() || '4 Weeks',
        level: progLevel.trim() || 'All Levels',
        trainer: progTrainer.trim() || 'Head Coach',
        price: parseFloat(progPrice) || 0,
        benefits: ['Cardio Endurance', 'Combat Strength', 'Professional Coaching'],
      });
    } else {
      addPlanMutation.mutate({
        name: planName.trim(),
        price: parseFloat(planPrice) || 0,
        period: planPeriod,
        description: planDesc.trim() || 'Full gym access, lockers and UFC Octagon training.',
        features: ['Full Gym Access', 'Octagon Access', 'Locker Room & Sauna', 'Diet Plan Consultation'],
        popular: false,
      });
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
          <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Curriculum & Plans</Text>
          <Text style={[styles.headerSubtitle, isDark ? styles.textGray : styles.textSlate]}>
            {programs.length} Programs • {plans.length} Membership Tiers
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

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'programs' && styles.tabButtonActive]} 
          onPress={() => {
            Haptics.selectionAsync();
            setActiveTab('programs');
          }}
        >
          <Text style={[styles.tabText, activeTab === 'programs' ? styles.tabTextActive : (isDark ? styles.textGray : styles.textSlate)]}>
            Programs ({programs.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'plans' && styles.tabButtonActive]} 
          onPress={() => {
            Haptics.selectionAsync();
            setActiveTab('plans');
          }}
        >
          <Text style={[styles.tabText, activeTab === 'plans' ? styles.tabTextActive : (isDark ? styles.textGray : styles.textSlate)]}>
            Membership Plans ({plans.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollInset }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'programs' ? (
          isLoadingPrograms ? (
            <View style={{ gap: 16 }}>
              <Skeleton width="100%" height={120} borderRadius={20} isDark={isDark} />
              <Skeleton width="100%" height={120} borderRadius={20} isDark={isDark} />
            </View>
          ) : programs.length > 0 ? (
            programs.map((prog: any, index: number) => (
              <Animated.View key={prog.id} entering={FadeInDown.delay(index * 60).duration(260)} style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <View style={styles.iconCircle}>
                      <PlayCircle color="#d96638" size={22} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, isDark ? styles.textWhite : styles.textBlack]}>{prog.name}</Text>
                      <Text style={[styles.cardSubtitle, isDark ? styles.textGray : styles.textSlate]}>
                        {prog.level || 'All Levels'} • {prog.duration || '4 Weeks'} • Coach: {prog.trainer || 'UFC Coach'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleDelete(prog.id, prog.name, 'program')}
                    style={styles.deleteBtn}
                  >
                    <Trash2 color="#EF4444" size={17} />
                  </TouchableOpacity>
                </View>
                {prog.description ? (
                  <Text style={[styles.cardDesc, isDark ? styles.textGray : styles.textSlate]} numberOfLines={2}>
                    {prog.description}
                  </Text>
                ) : null}
              </Animated.View>
            ))
          ) : (
            <Animated.View entering={FadeInDown.duration(260)} style={[styles.emptyState, isDark ? styles.cardDark : styles.cardLight]}>
              <PlayCircle color="#d96638" size={40} style={{ marginBottom: 16 }} />
              <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textBlack]}>No Programs</Text>
              <Text style={[styles.emptyDesc, isDark ? styles.textGray : styles.textSlate]}>Create custom conditioning and martial arts training regimens.</Text>
            </Animated.View>
          )
        ) : (
          isLoadingPlans ? (
            <View style={{ gap: 16 }}>
              <Skeleton width="100%" height={120} borderRadius={20} isDark={isDark} />
              <Skeleton width="100%" height={120} borderRadius={20} isDark={isDark} />
            </View>
          ) : plans.length > 0 ? (
            plans.map((plan: any, index: number) => (
              <Animated.View key={plan.id} entering={FadeInDown.delay(index * 60).duration(260)} style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <View style={styles.iconCircle}>
                      <Star color="#d96638" size={22} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, isDark ? styles.textWhite : styles.textBlack]}>{plan.name}</Text>
                      <Text style={[styles.cardSubtitle, isDark ? styles.textGray : styles.textSlate]}>
                        ₹{plan.price?.toLocaleString?.('en-IN') || plan.price} / {plan.period || 'month'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleDelete(plan.id, plan.name, 'plan')}
                    style={styles.deleteBtn}
                  >
                    <Trash2 color="#EF4444" size={17} />
                  </TouchableOpacity>
                </View>
                {plan.description ? (
                  <Text style={[styles.cardDesc, isDark ? styles.textGray : styles.textSlate]} numberOfLines={2}>
                    {plan.description}
                  </Text>
                ) : null}
              </Animated.View>
            ))
          ) : (
            <Animated.View entering={FadeInDown.duration(260)} style={[styles.emptyState, isDark ? styles.cardDark : styles.cardLight]}>
              <Star color="#d96638" size={40} style={{ marginBottom: 16 }} />
              <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textBlack]}>No Membership Plans</Text>
              <Text style={[styles.emptyDesc, isDark ? styles.textGray : styles.textSlate]}>Define monthly, quarterly and annual membership tiers.</Text>
            </Animated.View>
          )
        )}
      </ScrollView>

      {/* Creation Modal */}
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
              <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>
                {activeTab === 'programs' ? 'New Training Program' : 'New Membership Plan'}
              </Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.closeBtn}>
                <X color={isDark ? '#FFF' : '#000'} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 24 }}>
              {activeTab === 'programs' ? (
                <>
                  <View>
                    <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>PROGRAM NAME *</Text>
                    <TextInput
                      style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                      placeholder="e.g. 8-Week Muay Thai Striking"
                      placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                      value={progName}
                      onChangeText={setProgName}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>DURATION</Text>
                      <TextInput
                        style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                        placeholder="e.g. 6 Weeks"
                        placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                        value={progDuration}
                        onChangeText={setProgDuration}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>LEVEL</Text>
                      <TextInput
                        style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                        placeholder="e.g. Advanced"
                        placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                        value={progLevel}
                        onChangeText={setProgLevel}
                      />
                    </View>
                  </View>
                  <View>
                    <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>LEAD INSTRUCTOR</Text>
                    <TextInput
                      style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                      placeholder="e.g. Coach Anderson"
                      placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                      value={progTrainer}
                      onChangeText={setProgTrainer}
                    />
                  </View>
                  <View>
                    <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>DESCRIPTION</Text>
                    <TextInput
                      style={[styles.formInput, styles.textArea, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                      placeholder="Objectives and syllabus summary..."
                      placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                      value={progDesc}
                      onChangeText={setProgDesc}
                      multiline
                    />
                  </View>
                </>
              ) : (
                <>
                  <View>
                    <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>TIER NAME *</Text>
                    <TextInput
                      style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                      placeholder="e.g. Championship VIP"
                      placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                      value={planName}
                      onChangeText={setPlanName}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>PRICE (INR) *</Text>
                      <TextInput
                        style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                        placeholder="e.g. 4999"
                        placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                        value={planPrice}
                        onChangeText={setPlanPrice}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>PERIOD</Text>
                      <TextInput
                        style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                        placeholder="month / year / 3 months"
                        placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                        value={planPeriod}
                        onChangeText={setPlanPeriod}
                      />
                    </View>
                  </View>
                  <View>
                    <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>DESCRIPTION</Text>
                    <TextInput
                      style={[styles.formInput, styles.textArea, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                      placeholder="Benefits and inclusions..."
                      placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                      value={planDesc}
                      onChangeText={setPlanDesc}
                      multiline
                    />
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  ((activeTab === 'programs' && !progName.trim()) || (activeTab === 'plans' && !planName.trim()) || addProgramMutation.isPending || addPlanMutation.isPending) && styles.submitBtnDisabled
                ]}
                disabled={(activeTab === 'programs' && !progName.trim()) || (activeTab === 'plans' && !planName.trim()) || addProgramMutation.isPending || addPlanMutation.isPending}
                onPress={handleCreate}
              >
                {addProgramMutation.isPending || addPlanMutation.isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Plus color="#FFF" size={18} />
                    <Text style={styles.submitBtnText}>
                      {activeTab === 'programs' ? 'Publish Program' : 'Create Membership Plan'}
                    </Text>
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
  headerSubtitle: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  addBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#d96638', alignItems: 'center', justifyContent: 'center' },

  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 10 },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: 'center', backgroundColor: 'rgba(150,150,150,0.1)' },
  tabButtonActive: { backgroundColor: '#d96638' },
  tabText: { fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: '#FFFFFF', fontWeight: '800' },

  scrollContent: { padding: 20, gap: 16 },

  card: { padding: 18, borderRadius: 20, borderWidth: 1 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconCircle: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(217, 102, 56, 0.12)', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  cardSubtitle: { fontSize: 12, fontWeight: '600' },
  cardDesc: { fontSize: 13, lineHeight: 18, marginTop: 10 },

  deleteBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(239, 68, 68, 0.1)', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },

  emptyState: { padding: 40, borderRadius: 24, alignItems: 'center', borderWidth: 1, marginTop: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '88%' },
  modalDark: { backgroundColor: '#161B22' },
  modalLight: { backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  closeBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(150,150,150,0.1)' },

  formLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
  formInput: { height: 48, borderRadius: 14, paddingHorizontal: 14, fontSize: 15, borderWidth: 1 },
  textArea: { height: 74, paddingTop: 12, textAlignVertical: 'top' },
  inputDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  inputLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#d96638', height: 50, borderRadius: 16, marginTop: 12 },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
});

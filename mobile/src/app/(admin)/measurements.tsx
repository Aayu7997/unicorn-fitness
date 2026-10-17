import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Activity, TrendingDown, TrendingUp, Calendar, ChevronRight, Plus, X, User, Check, Scale } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import * as Haptics from 'expo-haptics';
import { RefreshControl } from 'react-native';
import { Skeleton } from '../../components/ui/Skeleton';
import { useLocalSearchParams } from 'expo-router';
import { useUIStore } from '../../store/useUIStore';

export default function MeasurementsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { scrollInset } = useAppBottomInset();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedMemberName, setSelectedMemberName] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [goal, setGoal] = useState('Weight Loss');

  // Auto-open if navigated with ?action=new
  useEffect(() => {
    if (params.action === 'new') {
      setIsModalVisible(true);
    }
  }, [params.action]);

  const { data: members = [] } = useQuery({
    queryKey: ['adminMembersForMeasurements'],
    queryFn: async () => {
      const response = await api.get('/admin/members?limit=50');
      return response.data?.users || [];
    },
  });

  const addMeasurementMutation = useMutation({
    mutationFn: async (payload: { userId: string; weight: number; bodyFat?: number; muscleMass?: number; goal?: string }) => {
      const response = await api.post('/admin/measurements', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMeasurements'] });
      setIsModalVisible(false);
      resetForm();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Measurement logged successfully!', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to record measurement', 'error');
    }
  });

  const resetForm = () => {
    setSelectedUserId('');
    setSelectedMemberName('');
    setWeight('');
    setBodyFat('');
    setMuscleMass('');
    setGoal('Weight Loss');
  };

  const handleSaveMeasurement = () => {
    if (!selectedUserId) {
      showToast('Please select a member', 'error');
      return;
    }
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
      showToast('Please enter a valid weight in kg', 'error');
      return;
    }

    addMeasurementMutation.mutate({
      userId: selectedUserId,
      weight: Number(weight),
      bodyFat: bodyFat ? Number(bodyFat) : undefined,
      muscleMass: muscleMass ? Number(muscleMass) : undefined,
      goal,
    });
  };

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminMeasurements'],
    queryFn: async () => {
      const response = await api.get('/admin/measurements');
      const measurements = response.data || [];
      
      // Calculate changes if we group by user and sort by date (naive approach for UI)
      // Since data is ordered by date descending from backend
      const userLastMap = new Map();
      const results = measurements.map((m: any) => {
        const weightVal = parseFloat(m.weight) || 0;
        const bfVal = parseFloat(m.bodyFat) || 0;
        
        const last = userLastMap.get(m.userId);
        
        let weightChange = 0;
        let bodyFatChange = 0;
        
        if (last) {
          weightChange = weightVal - last.weight;
          bodyFatChange = bfVal - last.bodyFat;
        }
        
        // Save current as last for the next iteration (which is older in time)
        userLastMap.set(m.userId, { weight: weightVal, bodyFat: bfVal });
        
        return {
          id: m.id,
          memberName: m.member,
          date: m.date,
          weight: m.weight,
          weightChange: Number(weightChange.toFixed(1)),
          bodyFat: m.bodyFat,
          bodyFatChange: Number(bodyFatChange.toFixed(1)),
        };
      });
      return results;
    },
  });

  const renderTrendIcon = (change: number) => {
    if (change < 0) return <TrendingDown color="#34C759" size={16} />;
    if (change > 0) return <TrendingUp color="#FF3B30" size={16} />;
    return <Activity color={isDark ? '#8E8E93' : '#64748B'} size={16} />;
  };

  const formatChange = (change: number) => {
    return change > 0 ? `+${change}` : `${change}`;
  };

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Measurements</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#d96638' }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Plus color="#FFF" size={20} />
        </TouchableOpacity>
      </View>

      {isLoading && !isRefetching ? (
        <View style={styles.scrollContent}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={240} borderRadius={24} isDark={isDark} />
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
          {data?.map((log: any, index: number) => (
            <Animated.View 
              key={log.id}
              entering={FadeInDown.delay(index * 50).duration(260)}
            >
              <TouchableOpacity 
                style={[styles.logCard, isDark ? styles.cardDark : styles.cardLight]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.memberName, isDark ? styles.textWhite : styles.textBlack]}>{log.memberName}</Text>
                  <View style={styles.dateContainer}>
                    <Calendar color={isDark ? '#8E8E93' : '#64748B'} size={14} />
                    <Text style={[styles.dateText, isDark ? styles.textGray : styles.textSlate]}>{log.date}</Text>
                  </View>
                </View>

                <View style={styles.metricsRow}>
                  <View style={[styles.metricBox, { backgroundColor: isDark ? '#21262D' : '#F8FAFC' }]}>
                    <Text style={[styles.metricLabel, isDark ? styles.textGray : styles.textSlate]}>Weight (kg)</Text>
                    <View style={styles.metricValueRow}>
                      <Text style={[styles.metricValue, isDark ? styles.textWhite : styles.textBlack]}>{log.weight}</Text>
                      <View style={[styles.trendBadge, { backgroundColor: log.weightChange <= 0 ? (isDark ? 'rgba(52,199,89,0.1)' : '#E8F5E9') : (isDark ? 'rgba(255,59,48,0.1)' : '#FFEBEE') }]}>
                        {renderTrendIcon(log.weightChange)}
                        <Text style={[styles.trendText, { color: log.weightChange <= 0 ? '#34C759' : '#FF3B30' }]}>
                          {formatChange(log.weightChange)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.metricBox, { backgroundColor: isDark ? '#21262D' : '#F8FAFC' }]}>
                    <Text style={[styles.metricLabel, isDark ? styles.textGray : styles.textSlate]}>Body Fat (%)</Text>
                    <View style={styles.metricValueRow}>
                      <Text style={[styles.metricValue, isDark ? styles.textWhite : styles.textBlack]}>{log.bodyFat}</Text>
                      <View style={[styles.trendBadge, { backgroundColor: log.bodyFatChange <= 0 ? (isDark ? 'rgba(52,199,89,0.1)' : '#E8F5E9') : (isDark ? 'rgba(255,59,48,0.1)' : '#FFEBEE') }]}>
                        {renderTrendIcon(log.bodyFatChange)}
                        <Text style={[styles.trendText, { color: log.bodyFatChange <= 0 ? '#34C759' : '#FF3B30' }]}>
                          {formatChange(log.bodyFatChange)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.viewHistoryRow}>
                  <Text style={{ color: '#3A4C56', fontWeight: '600' }}>View Full History</Text>
                  <ChevronRight color="#3A4C56" size={16} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      )}

      {/* Record Measurement Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalCard, isDark ? styles.modalDark : styles.modalLight]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.modalIconBg, { backgroundColor: 'rgba(217, 102, 56, 0.15)' }]}>
                  <Scale color="#d96638" size={20} />
                </View>
                <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>Record Measurement</Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeBtn}>
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

              {/* Weight (kg) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Weight (kg) *</Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                  placeholder="e.g. 74.5"
                  placeholderTextColor={isDark ? '#8E8E93' : '#94A3B8'}
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>

              {/* Body Fat (%) & Muscle Mass (kg) Row */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Body Fat (%)</Text>
                  <TextInput
                    style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                    placeholder="e.g. 15.2"
                    placeholderTextColor={isDark ? '#8E8E93' : '#94A3B8'}
                    keyboardType="numeric"
                    value={bodyFat}
                    onChangeText={setBodyFat}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Muscle Mass (kg)</Text>
                  <TextInput
                    style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                    placeholder="e.g. 38.0"
                    placeholderTextColor={isDark ? '#8E8E93' : '#94A3B8'}
                    keyboardType="numeric"
                    value={muscleMass}
                    onChangeText={setMuscleMass}
                  />
                </View>
              </View>

              {/* Fitness Goal */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Primary Goal</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {['Weight Loss', 'Hypertrophy', 'Strength', 'Endurance', 'MMA Conditioning'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.chip,
                        goal === g ? styles.chipActive : isDark ? styles.chipDark : styles.chipLight
                      ]}
                      onPress={() => setGoal(g)}
                    >
                      <Text style={[styles.chipText, goal === g ? styles.chipTextActive : isDark ? styles.textGray : styles.textSlate]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, addMeasurementMutation.isPending && styles.submitButtonDisabled]}
                onPress={handleSaveMeasurement}
                disabled={addMeasurementMutation.isPending}
                activeOpacity={0.8}
              >
                {addMeasurementMutation.isPending ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Save Measurement</Text>
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
  header: { paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.1)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  addButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#d96638', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, gap: 16 },
  
  logCard: { padding: 20, borderRadius: 24, borderWidth: 1 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  memberName: { fontSize: 18, fontWeight: '700' },
  dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 13, fontWeight: '500' },
  
  metricsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  metricBox: { flex: 1, padding: 16, borderRadius: 16 },
  metricLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  metricValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricValue: { fontSize: 24, fontWeight: '800' },
  
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  trendText: { fontSize: 12, fontWeight: '700' },
  
  viewHistoryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(150,150,150,0.1)' },
  
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
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, borderWidth: 1 },
  chipDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  chipLight: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  chipActive: { backgroundColor: '#d96638', borderColor: '#d96638' },
  chipText: { fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#FFF', fontWeight: '700' },
  submitButton: { height: 54, backgroundColor: '#d96638', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

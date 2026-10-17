import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, Modal, TextInput, Alert, RefreshControl } from 'react-native';
import { Calendar, Clock, MapPin, Users, Plus, ChevronLeft, Trash2, X } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useUIStore } from '../../store/useUIStore';
import { Skeleton } from '../../components/ui/Skeleton';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const classSchema = z.object({
  title: z.string().min(2, 'Class name is required'),
  instructor: z.string().min(2, 'Trainer name is required'),
  day: z.string().min(2, 'Day is required'),
  time: z.string().min(2, 'Time is required (e.g. 09:00 AM)'),
  location: z.string().min(1, 'Location is required'),
  capacity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Capacity must be a positive number',
  }),
});

type ClassFormData = z.infer<typeof classSchema>;

const DAYS = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AdminClasses() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { scrollInset } = useAppBottomInset();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  const [activeDay, setActiveDay] = useState('All');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      title: '',
      instructor: '',
      day: 'Monday',
      time: '08:00 AM',
      location: 'Main Studio',
      capacity: '20',
    }
  });

  const { data: classes = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminClasses'],
    queryFn: async () => {
      const res = await api.get('/admin/classes');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const addClassMutation = useMutation({
    mutationFn: async (data: ClassFormData) => {
      const res = await api.post('/admin/classes', {
        title: data.title,
        instructor: data.instructor,
        day: data.day,
        time: data.time,
        location: data.location,
        capacity: Number(data.capacity),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminClasses'] });
      setIsModalVisible(false);
      reset();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Class scheduled successfully!', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to schedule class', 'error');
    }
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/classes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminClasses'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Class deleted', 'success');
    },
    onError: () => {
      showToast('Failed to delete class', 'error');
    }
  });

  const handleDelete = (id: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete "${name}"? All registered bookings for this class will be cancelled.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteClassMutation.mutate(id) 
        }
      ]
    );
  };

  const filteredClasses = classes.filter((c: any) => {
    if (activeDay === 'All') return true;
    return c.dayOfWeek?.toLowerCase() === activeDay.toLowerCase();
  });

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={isDark ? '#FFF' : '#000'} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Classes & Schedule</Text>
        <TouchableOpacity 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsModalVisible(true);
          }} 
          style={styles.addButton}
        >
          <Plus color={isDark ? '#FFF' : '#000'} size={24} />
        </TouchableOpacity>
      </View>

      {/* Days Filter Pills */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {DAYS.map((day) => {
            const isActive = activeDay === day;
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.filterPill,
                  isActive ? styles.filterPillActive : (isDark ? styles.filterPillDark : styles.filterPillLight)
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveDay(day);
                }}
              >
                <Text style={[
                  styles.filterPillText,
                  isActive ? { color: '#FFF', fontWeight: '700' } : (isDark ? styles.textGray : styles.textSlate)
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Classes List */}
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
        {isLoading ? (
          <View style={{ gap: 16 }}>
            <Skeleton width="100%" height={160} borderRadius={20} isDark={isDark} />
            <Skeleton width="100%" height={160} borderRadius={20} isDark={isDark} />
            <Skeleton width="100%" height={160} borderRadius={20} isDark={isDark} />
          </View>
        ) : filteredClasses.length > 0 ? (
          filteredClasses.map((item: any, index: number) => {
            const capacity = item.capacity || 20;
            const booked = item.bookedCount || 0;
            const fillRatio = Math.min(100, Math.round((booked / capacity) * 100));

            return (
              <Animated.View 
                key={item.id} 
                entering={FadeInDown.delay(index * 50).duration(260)}
                style={[styles.classCard, isDark ? styles.cardDark : styles.cardLight]}
              >
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.className, isDark ? styles.textWhite : styles.textBlack]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.trainerName, { color: '#d96638' }]}>
                      Coach {item.trainer}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleDelete(item.id, item.name)}
                    style={styles.deleteButton}
                  >
                    <Trash2 color={isDark ? '#EF4444' : '#DC2626'} size={18} />
                  </TouchableOpacity>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaBadge}>
                    <Calendar size={13} color={isDark ? '#8E8E93' : '#64748B'} />
                    <Text style={[styles.metaText, isDark ? styles.textGray : styles.textSlate]}>{item.dayOfWeek}</Text>
                  </View>
                  <View style={styles.metaBadge}>
                    <Clock size={13} color={isDark ? '#8E8E93' : '#64748B'} />
                    <Text style={[styles.metaText, isDark ? styles.textGray : styles.textSlate]}>{item.time}</Text>
                  </View>
                  <View style={styles.metaBadge}>
                    <MapPin size={13} color={isDark ? '#8E8E93' : '#64748B'} />
                    <Text style={[styles.metaText, isDark ? styles.textGray : styles.textSlate]}>{item.room}</Text>
                  </View>
                </View>

                {/* Capacity Progress Bar */}
                <View style={styles.capacitySection}>
                  <View style={styles.capacityHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Users size={14} color={isDark ? '#8E8E93' : '#64748B'} />
                      <Text style={[styles.capacityLabel, isDark ? styles.textGray : styles.textSlate]}>
                        Booked: {booked} / {capacity}
                      </Text>
                    </View>
                    <Text style={[styles.capacityPercent, { color: fillRatio >= 90 ? '#EF4444' : '#d96638' }]}>
                      {fillRatio}% full
                    </Text>
                  </View>
                  <View style={[styles.progressBarTrack, isDark ? { backgroundColor: '#30363D' } : { backgroundColor: '#E2E8F0' }]}>
                    <View style={[styles.progressBarFill, { width: `${fillRatio}%`, backgroundColor: fillRatio >= 90 ? '#EF4444' : '#d96638' }]} />
                  </View>
                </View>
              </Animated.View>
            );
          })
        ) : (
          <View style={[styles.emptyContainer, isDark ? styles.cardDark : styles.cardLight]}>
            <Calendar size={48} color={isDark ? '#30363D' : '#CBD5E1'} />
            <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textBlack]}>No classes found</Text>
            <Text style={[styles.emptySub, isDark ? styles.textGray : styles.textSlate]}>
              Tap the (+) icon in the top right corner to schedule a new gym class.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Class Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark ? styles.modalDark : styles.modalLight, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>Schedule New Class</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.modalClose}>
                <X color={isDark ? '#8E8E93' : '#64748B'} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Class Name</Text>
                <Controller
                  control={control}
                  name="title"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, isDark ? styles.inputDark : styles.inputLight, errors.title && styles.inputError]}
                      placeholder="e.g. HIIT Bootcamp"
                      placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Trainer / Coach</Text>
                <Controller
                  control={control}
                  name="instructor"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, isDark ? styles.inputDark : styles.inputLight, errors.instructor && styles.inputError]}
                      placeholder="e.g. Coach Alex"
                      placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.instructor && <Text style={styles.errorText}>{errors.instructor.message}</Text>}
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Day</Text>
                  <Controller
                    control={control}
                    name="day"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                        placeholder="Monday"
                        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Time</Text>
                  <Controller
                    control={control}
                    name="time"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                        placeholder="09:00 AM"
                        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Room / Location</Text>
                  <Controller
                    control={control}
                    name="location"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                        placeholder="Main Studio"
                        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Capacity</Text>
                  <Controller
                    control={control}
                    name="capacity"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[styles.input, isDark ? styles.inputDark : styles.inputLight, errors.capacity && styles.inputError]}
                        placeholder="20"
                        keyboardType="numeric"
                        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit((data: any) => addClassMutation.mutate(data))}
                disabled={addClassMutation.isPending}
              >
                <Text style={styles.submitButtonText}>
                  {addClassMutation.isPending ? 'Scheduling...' : 'Create Class'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
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
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  addButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  filterWrapper: { paddingVertical: 12 },
  filterScroll: { paddingHorizontal: 20, gap: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterPillActive: { backgroundColor: '#d96638', borderColor: '#d96638' },
  filterPillDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  filterPillLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  filterPillText: { fontSize: 13, fontWeight: '600' },

  scrollContent: { paddingHorizontal: 20, gap: 14, paddingTop: 4 },
  
  classCard: { padding: 18, borderRadius: 20, borderWidth: 1 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },

  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  className: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  trainerName: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  deleteButton: { padding: 8 },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(150, 150, 150, 0.08)' },
  metaText: { fontSize: 12, fontWeight: '500' },

  capacitySection: { marginTop: 4 },
  capacityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  capacityLabel: { fontSize: 12, fontWeight: '600' },
  capacityPercent: { fontSize: 12, fontWeight: '700' },
  progressBarTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },

  emptyContainer: { padding: 32, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, gap: 8, marginTop: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '85%' },
  modalDark: { backgroundColor: '#161B22' },
  modalLight: { backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalClose: { padding: 4 },

  formGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { height: 48, borderRadius: 14, paddingHorizontal: 16, fontSize: 15, borderWidth: 1 },
  inputDark: { backgroundColor: '#0D1117', borderColor: '#30363D', color: '#FFF' },
  inputLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', color: '#1E293B' },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 11, marginTop: 4 },
  row: { flexDirection: 'row' },

  submitButton: { backgroundColor: '#d96638', height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
});

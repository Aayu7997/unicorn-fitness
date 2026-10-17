import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, useColorScheme, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar as CalendarIcon, User as UserIcon, Check } from 'lucide-react-native';
import { api } from '../../lib/api';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { RefreshControl } from 'react-native';
import { Skeleton } from '../../components/ui/Skeleton';
import { useUIStore } from '../../store/useUIStore';

import { useAppBottomInset } from '../../hooks/useAppBottomInset';

const { width } = Dimensions.get('window');

const DATES = [
  { day: 'Mon', date: '19', active: true },
  { day: 'Tue', date: '20', active: false },
  { day: 'Wed', date: '21', active: false },
  { day: 'Thu', date: '22', active: false },
  { day: 'Fri', date: '23', active: false },
  { day: 'Sat', date: '24', active: false },
];

const CATEGORIES = ['All type', 'Full body', 'BJJ', 'Boxing', 'Yoga', 'HIIT'];

export default function UserClasses() {
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { insets, scrollInset } = useAppBottomInset();
  const [activeCategory, setActiveCategory] = useState('All type');
  const { showToast } = useUIStore();

  const { data: classes, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['userClasses'],
    queryFn: async () => {
      const response = await api.get('/user/classes');
      return response.data;
    },
    refetchInterval: 3000,
  });

  const bookMutation = useMutation({
    mutationFn: async (classId: string) => {
      const response = await api.post('/user/classes/book', { classId });
      return response.data;
    },
    onSuccess: (_, classId) => {
      queryClient.setQueryData(['userClasses'], (old: any[]) => {
        if (!old) return old;
        return old.map(c => 
          c.id === classId ? { ...c, booked: c.booked + 1, isBookedByMe: true } : c
        );
      });
      queryClient.invalidateQueries({ queryKey: ['userClasses'] });
      queryClient.invalidateQueries({ queryKey: ['adminClasses'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Your spot has been reserved. See you there!', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || 'Failed to book the class. Please try again.';
      showToast(msg, 'error');
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (classId: string) => {
      const response = await api.delete('/user/classes/book', { data: { classId } });
      return response.data;
    },
    onSuccess: (_, classId) => {
      queryClient.setQueryData(['userClasses'], (old: any[]) => {
        if (!old) return old;
        return old.map(c => 
          c.id === classId ? { ...c, booked: Math.max(0, c.booked - 1), isBookedByMe: false } : c
        );
      });
      queryClient.invalidateQueries({ queryKey: ['userClasses'] });
      queryClient.invalidateQueries({ queryKey: ['adminClasses'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Class reservation cancelled successfully.', 'info');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || 'Failed to cancel reservation.';
      showToast(msg, 'error');
    }
  });

  const handleClassAction = (c: any) => {
    if (c.isBookedByMe) {
      Alert.alert(
        'Cancel Reservation',
        `Would you like to cancel your reserved spot in "${c.name}" with ${c.trainer}?`,
        [
          { text: 'Keep Spot', style: 'cancel' },
          {
            text: 'Cancel Spot',
            style: 'destructive',
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              cancelMutation.mutate(c.id);
            }
          }
        ]
      );
      return;
    }

    if (c.booked >= c.capacity) {
      showToast('This class is at full capacity.', 'info');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    bookMutation.mutate(c.id);
  };


  if (isLoading && !isRefetching) {
    return (
      <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
        <View style={[styles.headerContainer, { paddingTop: insets.top + 20 }, isDark ? styles.bgDark : styles.bgLight]}>
          <Skeleton width={180} height={28} isDark={isDark} style={{ marginHorizontal: 20, marginBottom: 4 }} />
          <Skeleton width={250} height={36} isDark={isDark} style={{ marginHorizontal: 20, marginBottom: 24 }} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroller} style={{ marginBottom: 24 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} width={64} height={80} borderRadius={24} isDark={isDark} />
            ))}
          </ScrollView>
        </View>
        <View style={{ padding: 20, gap: 20 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={180} borderRadius={40} isDark={isDark} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Fixed Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 20 }, isDark ? styles.bgDark : styles.bgLight]}>
        <Text style={[styles.headerTitle, isDark ? styles.textGray : styles.textSlate]}>Top classes for</Text>
        <Text style={[styles.headerSubtitle, isDark ? styles.textWhite : styles.textBlack]}>Your wellness journey</Text>
        
        {/* Horizontal Date Scroller */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroller} style={{ marginBottom: 24 }}>
          {DATES.map((item, index) => (
            <Animated.View key={index} entering={FadeInRight.delay(index * 50).duration(260)}>
              <TouchableOpacity style={[styles.dateBox, item.active ? styles.dateBoxActive : (isDark ? styles.dateBoxDark : styles.dateBoxLight)]}>
                <Text style={[styles.dateDay, item.active ? styles.textWhite : (isDark ? styles.textGray : styles.textSlate)]}>{item.day}</Text>
                <Text style={[styles.dateNum, item.active ? styles.textWhite : (isDark ? styles.textWhite : styles.textBlack)]}>{item.date}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroller} style={{ marginBottom: 12 }}>
          {CATEGORIES.map((cat, index) => {
            const isActive = activeCategory === cat;
            return (
              <Animated.View key={index} entering={FadeInRight.delay(index * 50 + 100).duration(260)}>
                <TouchableOpacity 
                  onPress={() => setActiveCategory(cat)}
                  style={[styles.categoryPill, isActive ? styles.categoryPillActive : (isDark ? styles.categoryPillDark : styles.categoryPillLight)]}
                >
                  <Text style={[styles.categoryText, isActive ? styles.textWhite : (isDark ? styles.textGray : styles.textSlate)]}>{cat}</Text>
                </TouchableOpacity>
              </Animated.View>
            )
          })}
        </ScrollView>
      </View>

      {/* Class List */}
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: scrollInset, paddingTop: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={isDark ? '#FFFFFF' : '#3A4C56'}
          />
        }
      >
        {(() => {
          const validClasses = Array.isArray(classes) ? classes : [];
          const filteredClasses = activeCategory === 'All type' 
            ? validClasses 
            : validClasses.filter((c: any) => c.name.toLowerCase().includes(activeCategory.toLowerCase()));

          if (filteredClasses.length === 0) {
            return (
              <Animated.View entering={FadeInDown.duration(260)} style={[styles.emptyStateCard, isDark ? styles.bgDarker : styles.bgLightest]}>
                <View style={[styles.emptyIconWrapper, { backgroundColor: '#F9D3AF' }]}>
                   <CalendarIcon color="#3A4C56" size={32} />
                </View>
                <Text style={[styles.emptyStateTitle, isDark ? styles.textWhite : styles.textBlack]}>No classes found</Text>
                <Text style={[styles.emptyStateSub, isDark ? styles.textGray : styles.textSlate]}>
                  There are no {activeCategory} classes scheduled for today. Check back later!
                </Text>
                <TouchableOpacity onPress={() => setActiveCategory('All type')} style={styles.emptyStateButton}>
                  <Text style={styles.emptyStateButtonText}>Show All Classes</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          }

          return filteredClasses.map((c: any, index: number) => {
            const isFull = c.booked >= c.capacity;
            const isBooked = c.isBookedByMe;

            return (
              <Animated.View key={c.id} entering={FadeInDown.delay(100 + index * 50).duration(260)} style={styles.cardWrapper}>
                <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
                  <View style={styles.cardContent}>
                    
                    {/* Left Side: Info */}
                    <View style={styles.infoSection}>
                      <View style={styles.instructorRow}>
                        <View style={styles.avatarPlaceholder}>
                           <UserIcon color={isDark ? '#FFF' : '#3A4C56'} size={16} />
                        </View>
                        <Text style={[styles.instructorName, isDark ? styles.textWhite : styles.textBlack]}>{c.trainer}</Text>
                      </View>

                      <Text style={[styles.className, isDark ? styles.textWhite : styles.textBlack]}>{c.name}</Text>
                      
                      <View style={styles.tagsRow}>
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>{c.time}</Text>
                        </View>
                        <View style={[styles.tag, { backgroundColor: 'rgba(58, 76, 86, 0.1)' }]}>
                          <Text style={styles.tagTextHighlight}>Wellness</Text>
                        </View>
                      </View>
                      
                      {/* Start/Book/Cancel Button */}
                      <TouchableOpacity 
                        disabled={bookMutation.isPending || cancelMutation.isPending}
                        onPress={() => handleClassAction(c)}
                        style={[
                          styles.bookButton,
                          isBooked ? styles.bookButtonActive 
                          : isFull ? styles.bookButtonFull 
                          : styles.bookButtonAvailable
                        ]}
                      >
                        <Text style={[
                          styles.bookButtonText,
                          isBooked ? styles.bookButtonTextActive 
                          : isFull ? styles.bookButtonTextFull 
                          : styles.bookButtonTextAvailable
                        ]}>
                          {isBooked ? 'Reserved • Cancel' : isFull ? 'Class Full' : 'Book Class'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    
                  </View>
                </View>
              </Animated.View>
            );
          });
        })()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgDark: { backgroundColor: '#0D1117' },
  bgLight: { backgroundColor: '#F4F7F6' },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerContainer: { paddingHorizontal: 0, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.1)' },
  headerTitle: { paddingHorizontal: 20, fontSize: 24, fontWeight: '500', letterSpacing: -0.5 },
  headerSubtitle: { paddingHorizontal: 20, fontSize: 32, fontWeight: '800', letterSpacing: -1, marginBottom: 24 },
  
  dateScroller: { paddingHorizontal: 20, gap: 12 },
  dateBox: { width: 64, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  dateBoxActive: { backgroundColor: '#3A4C56' },
  dateBoxDark: { backgroundColor: '#161B22', borderWidth: 1, borderColor: '#30363D' },
  dateBoxLight: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  dateDay: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  dateNum: { fontSize: 22, fontWeight: '800' },

  categoryScroller: { paddingHorizontal: 20, gap: 8 },
  categoryPill: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 99 },
  categoryPillActive: { backgroundColor: '#3A4C56' },
  categoryPillDark: { backgroundColor: '#161B22', borderWidth: 1, borderColor: '#30363D' },
  categoryPillLight: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  categoryText: { fontSize: 14, fontWeight: '700' },

  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
  
  cardWrapper: { marginBottom: 20 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D', borderWidth: 1 },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1 },
  card: { borderRadius: 40, overflow: 'hidden', minHeight: 180 },
  cardContent: { flexDirection: 'row', padding: 28, flex: 1 },
  
  infoSection: { flex: 1, zIndex: 10 },
  instructorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarPlaceholder: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: 'rgba(255,255,255,0.4)' },
  instructorName: { color: '#3A4C56', fontSize: 14, fontWeight: '700' },
  
  className: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 12, lineHeight: 32, color: '#3A4C56' },
  
  tagsRow: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.4)' },
  tagText: { fontSize: 12, fontWeight: '700', color: '#3A4C56' },
  tagTextHighlight: { fontSize: 12, fontWeight: '700', color: '#3A4C56' },
  
  bookButton: { alignSelf: 'flex-start', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  bookButtonAvailable: { backgroundColor: '#3A4C56' },
  bookButtonActive: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#3A4C56' },
  bookButtonFull: { backgroundColor: 'rgba(58,76,86,0.2)' },
  bookButtonText: { fontSize: 14, fontWeight: '800' },
  bookButtonTextAvailable: { color: '#FFFFFF' },
  bookButtonTextActive: { color: '#3A4C56' },
  bookButtonTextFull: { color: '#3A4C56' },

  emptyStateCard: { alignItems: 'center', justifyContent: 'center', padding: 40, borderRadius: 40, marginTop: 40, borderWidth: 1, borderColor: 'rgba(150,150,150,0.1)' },
  bgDarker: { backgroundColor: '#161B22' },
  bgLightest: { backgroundColor: '#FFFFFF' },
  emptyIconWrapper: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyStateTitle: { fontSize: 24, fontWeight: '800', marginBottom: 12, textAlign: 'center', letterSpacing: -0.5 },
  emptyStateSub: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  emptyStateButton: { backgroundColor: '#3A4C56', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 99 },
  emptyStateButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 }
});

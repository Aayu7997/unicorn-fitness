import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, Image, ActivityIndicator, Alert } from 'react-native';
import { Library, Clock, Users, ChevronLeft, CheckCircle2, Sparkles, Plus, Award } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import { router } from 'expo-router';
import { Skeleton } from '../../components/ui/Skeleton';
import * as Haptics from 'expo-haptics';
import { useUIStore } from '../../store/useUIStore';

export default function ProgramsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { insets, scrollInset } = useAppBottomInset();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<'my' | 'explore'>('my');

  // Enrolled programs
  const { data: myData, isLoading: isMyLoading, refetch: refetchMy } = useQuery({
    queryKey: ['user-programs'],
    queryFn: async () => {
      const res = await api.get('/user/programs');
      return res.data?.programs || [];
    }
  });

  // All available programs
  const { data: allPrograms, isLoading: isAllLoading } = useQuery({
    queryKey: ['public-programs'],
    queryFn: async () => {
      const res = await api.get('/programs');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const myPrograms = myData || [];
  const enrolledIds = new Set(myPrograms.map((p: any) => p.id));

  const enrollMutation = useMutation({
    mutationFn: async (programId: string) => {
      const res = await api.post('/user/programs/enroll', { programId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-programs'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Enrolled in program successfully!', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to enroll in program', 'error');
    }
  });

  const handleEnroll = (program: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Enroll in Program',
      `Would you like to enroll in "${program.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm Enrollment', 
          onPress: () => enrollMutation.mutate(program.id) 
        }
      ]
    );
  };

  const displayedList = activeTab === 'my' ? myPrograms : (allPrograms || []);
  const isLoading = activeTab === 'my' ? isMyLoading : isAllLoading;

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
          <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Training Programs</Text>
          <Text style={[styles.headerSubtitle, isDark ? styles.textGray : styles.textSlate]}>
            {myPrograms.length} Enrolled {myPrograms.length === 1 ? 'Program' : 'Programs'}
          </Text>
        </View>

        <View style={{ width: 42 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          onPress={() => {
            Haptics.selectionAsync();
            setActiveTab('my');
          }}
          style={[styles.tabButton, activeTab === 'my' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, activeTab === 'my' ? styles.tabTextActive : (isDark ? styles.textGray : styles.textSlate)]}>
            My Programs ({myPrograms.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => {
            Haptics.selectionAsync();
            setActiveTab('explore');
          }}
          style={[styles.tabButton, activeTab === 'explore' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, activeTab === 'explore' ? styles.tabTextActive : (isDark ? styles.textGray : styles.textSlate)]}>
            Explore All ({allPrograms?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollInset }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={{ gap: 16 }}>
            <Skeleton width="100%" height={220} borderRadius={24} isDark={isDark} />
            <Skeleton width="100%" height={220} borderRadius={24} isDark={isDark} />
          </View>
        ) : displayedList.length > 0 ? (
          displayedList.map((prog: any, index: number) => {
            const isEnrolled = enrolledIds.has(prog.id);

            return (
              <Animated.View 
                key={prog.id} 
                entering={FadeInDown.delay(index * 60).duration(260)} 
                style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
              >
                {prog.imageUrl ? (
                  <View style={styles.imageWrap}>
                    <Image source={{ uri: prog.imageUrl }} style={styles.image} resizeMode="cover" />
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{prog.level || 'ALL LEVELS'}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.imageWrap, styles.imagePlaceholder]}>
                    <Library color="#d96638" size={36} />
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{prog.level || 'ALL LEVELS'}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.cardBody}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={[styles.title, isDark ? styles.textWhite : styles.textBlack]}>
                      {prog.name}
                    </Text>
                    {isEnrolled && (
                      <View style={styles.enrolledBadge}>
                        <CheckCircle2 color="#10B981" size={14} />
                        <Text style={styles.enrolledText}>Enrolled</Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.description, isDark ? styles.textGray : styles.textSlate]} numberOfLines={2}>
                    {prog.description || 'A structured training regimen crafted to optimize physical performance.'}
                  </Text>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Clock color="#d96638" size={15} />
                      <Text style={[styles.metaText, isDark ? styles.textGray : styles.textSlate]}>
                        {prog.duration || '4 Weeks'}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Users color="#d96638" size={15} />
                      <Text style={[styles.metaText, isDark ? styles.textGray : styles.textSlate]}>
                        {prog.trainer || 'Head Coach'}
                      </Text>
                    </View>
                  </View>

                  {!isEnrolled && activeTab === 'explore' && (
                    <TouchableOpacity
                      style={[styles.enrollBtn, enrollMutation.isPending && styles.btnDisabled]}
                      disabled={enrollMutation.isPending}
                      onPress={() => handleEnroll(prog)}
                    >
                      {enrollMutation.isPending ? (
                        <ActivityIndicator color="#FFF" />
                      ) : (
                        <>
                          <Plus color="#FFF" size={16} />
                          <Text style={styles.enrollBtnText}>Enroll in Program</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            );
          })
        ) : (
          <Animated.View entering={FadeInDown.duration(260)} style={[styles.emptyState, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={styles.iconCircle}>
              <Library color="#d96638" size={40} />
            </View>
            <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textBlack]}>
              {activeTab === 'my' ? 'No Enrolled Programs' : 'No Programs Available'}
            </Text>
            <Text style={[styles.emptyDesc, isDark ? styles.textGray : styles.textSlate]}>
              {activeTab === 'my' 
                ? 'Discover expert conditioning regimens and start elevating your performance.' 
                : 'Check back soon for upcoming martial arts and conditioning curricula.'}
            </Text>
            {activeTab === 'my' && (
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveTab('explore');
                }}
              >
                <Text style={styles.primaryButtonText}>Browse All Programs</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
      </ScrollView>
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

  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 10 },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: 'center', backgroundColor: 'rgba(150,150,150,0.1)' },
  tabButtonActive: { backgroundColor: '#d96638' },
  tabText: { fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: '#FFFFFF', fontWeight: '800' },

  scrollContent: { padding: 20, gap: 16 },

  card: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },

  imageWrap: { height: 160, width: '100%', position: 'relative' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { backgroundColor: 'rgba(217, 102, 56, 0.1)', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  cardBody: { padding: 18 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 6, flex: 1 },
  description: { fontSize: 13, lineHeight: 19, marginBottom: 14 },

  enrolledBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  enrolledText: { color: '#10B981', fontSize: 12, fontWeight: '700' },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, fontWeight: '600' },

  enrollBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#d96638', height: 44, borderRadius: 14, marginTop: 16 },
  btnDisabled: { opacity: 0.5 },
  enrollBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  emptyState: { padding: 36, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(217, 102, 56, 0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  primaryButton: { backgroundColor: '#d96638', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 },
  primaryButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
});

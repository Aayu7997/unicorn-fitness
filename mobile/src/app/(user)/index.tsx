import React, { useState } from 'react';
import { router } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, Image } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Activity, Flame, Clock, Trophy, Calendar, Target, Library, ChevronRight, Info, LayoutDashboard, Sparkles } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Skeleton } from '../../components/ui/Skeleton';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import { NotificationBellButton } from '../../components/NotificationBellButton';

export default function UserDashboard() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { insets, scrollInset } = useAppBottomInset();

  const { data: dashboardData, isLoading, isError, refetch } = useQuery({
    queryKey: ['userOverview'],
    queryFn: async () => {
      const response = await api.get('/dashboard/overview');
      return response.data;
    },
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
        <View style={[styles.scrollContent, { paddingTop: insets.top + 20 }]}>
          <View style={styles.header}>
            <Skeleton width={200} height={24} isDark={isDark} style={{ marginBottom: 8 }} />
            <Skeleton width={150} height={16} isDark={isDark} />
          </View>
          <Skeleton width="100%" height={220} borderRadius={24} isDark={isDark} style={{ marginBottom: 24 }} />
          <Skeleton width="100%" height={250} borderRadius={24} isDark={isDark} style={{ marginBottom: 24 }} />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.centerContainer, isDark ? styles.bgDark : styles.bgLight]}>
        <Text style={[styles.errorText, isDark ? styles.textWhite : styles.textBlack]}>Failed to load overview</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const membership = dashboardData?.membership;
  const stats = dashboardData?.stats || { workouts: 0, calories: 0, hours: 0, trophies: 0 };
  const upcomingClasses = dashboardData?.upcomingClasses || [];
  const activePrograms = dashboardData?.activePrograms || [];
  
  const cardBg = isDark ? styles.cardDark : styles.cardLight;
  const textColor = isDark ? styles.textWhite : styles.textBlack;
  const mutedText = isDark ? styles.textGray : styles.textSlate;

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: scrollInset }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(260)} style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <LayoutDashboard color="#d96638" size={28} />
                <Text style={[styles.nameText, textColor]} numberOfLines={1}>
                  Welcome back, {user?.name?.split(' ')[0]}!
                </Text>
              </View>
              <Text style={[styles.subtitle, mutedText, { marginTop: 4 }]}>
                Here's your fitness overview and quick stats.
              </Text>
            </View>
            <NotificationBellButton />
          </View>
        </Animated.View>

        {/* Proactive AI Coach Message */}
        {dashboardData?.coachMessage && (
          <Animated.View entering={FadeInDown.delay(120).duration(260)} style={{ marginBottom: 24 }}>
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(user)/ai' as any); }}
              style={[styles.coachBanner, cardBg]}
            >
              <LinearGradient
                colors={['rgba(217, 102, 56, 0.1)', 'transparent']}
                style={StyleSheet.absoluteFill as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={styles.coachAvatar}>
                  <Text style={{ fontSize: 20 }}>🥊</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.coachTitle, textColor]}>Your AI Coach says:</Text>
                  <Text style={[styles.coachMessageText, mutedText]}>"{dashboardData.coachMessage}"</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Admin Promo Message */}
        {dashboardData?.promoMessage && (
          <Animated.View entering={FadeInDown.delay(130).duration(260)} style={{ marginBottom: 24 }}>
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => Haptics.selectionAsync()}
              style={[styles.coachBanner, cardBg, { borderColor: '#A855F7', borderWidth: 1 }]}
            >
              <LinearGradient
                colors={['rgba(168, 85, 247, 0.15)', 'transparent']}
                style={StyleSheet.absoluteFill as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.coachAvatar, { backgroundColor: '#A855F7' }]}>
                  <Sparkles color="#FFFFFF" size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.coachTitle, textColor]}>Special Offer</Text>
                  <Text style={[styles.coachMessageText, mutedText, { color: isDark ? '#E2E8F0' : '#1E293B', fontWeight: '500' }]}>"{dashboardData.promoMessage}"</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Membership Status Card */}
        <Animated.View entering={FadeInDown.delay(150).duration(260)}>
          <View style={[styles.membershipCard, cardBg]}>
            <LinearGradient
              colors={isDark ? ['rgba(217, 102, 56, 0.15)', 'transparent'] : ['rgba(217, 102, 56, 0.05)', 'transparent']}
              style={StyleSheet.absoluteFill as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            <View style={styles.memHeader}>
              <View>
                <Text style={[styles.label, mutedText]}>MEMBERSHIP STATUS</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 12 }}>
                  <Text style={[styles.planName, textColor]}>{membership?.planName || 'Free Plan'}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{membership?.status || 'Inactive'}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.memDetails}>
              <View>
                <Text style={[styles.label, mutedText]}>VALID THRU</Text>
                <Text style={[styles.valueText, textColor]}>
                  {membership?.endDate ? new Date(membership.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.label, mutedText]}>MEMBER ID</Text>
                <Text style={[styles.valueText, mutedText]}>
                  {user?.memberId || user?.id?.slice(-8).toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={[styles.infoBox, isDark ? styles.infoBoxDark : styles.infoBoxLight]}>
              <Info color="#d96638" size={16} style={{ marginTop: 2 }} />
              <Text style={[styles.infoText, mutedText]}>
                For payment related inquiries or upgrades, please visit the gym reception or call us directly.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(200).duration(260)}>
          <Text style={[styles.sectionTitle, textColor]}>Quick Actions</Text>
          <View style={[styles.actionsContainer, cardBg]}>
            
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(user)/programs' as any); }}
              style={styles.actionRow}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={[styles.actionIconBg, isDark ? styles.bgDarker : styles.bgLight]}>
                  <Library color="#d96638" size={20} />
                </View>
                <Text style={[styles.actionText, textColor]}>Browse Programs</Text>
              </View>
              <ChevronRight color={isDark ? '#8E8E93' : '#64748B'} size={20} />
            </TouchableOpacity>

            <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(user)/billing' as any); }}
              style={styles.actionRow}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={[styles.actionIconBg, isDark ? styles.bgDarker : styles.bgLight]}>
                  <Target color="#d96638" size={20} />
                </View>
                <Text style={[styles.actionText, textColor]}>Upgrade Plan</Text>
              </View>
              <ChevronRight color={isDark ? '#8E8E93' : '#64748B'} size={20} />
            </TouchableOpacity>

            <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(user)/schedule' as any); }}
              style={styles.actionRow}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={[styles.actionIconBg, isDark ? styles.bgDarker : styles.bgLight]}>
                  <Calendar color="#d96638" size={20} />
                </View>
                <Text style={[styles.actionText, textColor]}>Book Class</Text>
              </View>
              <ChevronRight color={isDark ? '#8E8E93' : '#64748B'} size={20} />
            </TouchableOpacity>

          </View>
        </Animated.View>

        {/* Your Progress */}
        <Animated.View entering={FadeInDown.delay(250).duration(260)}>
          <Text style={[styles.sectionTitle, textColor, { marginTop: 32 }]}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, cardBg]}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(217, 102, 56, 0.1)' }]}>
                <Activity color="#d96638" size={24} />
              </View>
              <Text style={[styles.statValue, textColor]}>{stats.workouts}</Text>
              <Text style={[styles.statLabel, mutedText]}>WORKOUTS</Text>
            </View>
            
            <View style={[styles.statCard, cardBg]}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(217, 102, 56, 0.1)' }]}>
                <Flame color="#d96638" size={24} />
              </View>
              <Text style={[styles.statValue, textColor]}>
                {stats.calories >= 1000 ? (stats.calories / 1000).toFixed(1) + 'K' : stats.calories}
              </Text>
              <Text style={[styles.statLabel, mutedText]}>CALORIES</Text>
            </View>
            
            <View style={[styles.statCard, cardBg]}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(215, 200, 180, 0.2)' }]}>
                <Clock color="#D7C8B4" size={24} />
              </View>
              <Text style={[styles.statValue, textColor]}>{stats.hours}h</Text>
              <Text style={[styles.statLabel, mutedText]}>HOURS</Text>
            </View>
            
            <View style={[styles.statCard, cardBg]}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(215, 200, 180, 0.2)' }]}>
                <Trophy color="#D7C8B4" size={24} />
              </View>
              <Text style={[styles.statValue, textColor]}>{stats.trophies}</Text>
              <Text style={[styles.statLabel, mutedText]}>TROPHIES</Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Enrolled Programs (if any) */}
        {activePrograms.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(260)}>
            <Text style={[styles.sectionTitle, textColor, { marginTop: 32 }]}>Enrolled Programs</Text>
            {activePrograms.map((prog: any, i: number) => (
              <TouchableOpacity 
                key={i} 
                activeOpacity={0.8}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(user)/programs' as any); }}
                style={[styles.programCard, cardBg]}
              >
                <View style={[styles.progImage, isDark ? styles.bgDarker : styles.bgLight]}>
                  {prog.imageUrl ? (
                    <Image source={{ uri: prog.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <Library color={isDark ? '#D7C8B4' : '#3A4C56'} size={24} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.progName, textColor]}>{prog.name}</Text>
                  <Text style={[styles.progSubtitle, mutedText]}>{prog.level || 'Beginner'} • {prog.duration || '4 Weeks'}</Text>
                </View>
              </TouchableOpacity>
            ))}
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
  bgDarker: { backgroundColor: '#161B22' },
  
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#d96638', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 99 },
  retryText: { color: '#FFFFFF', fontWeight: '700' },
  
  scrollContent: { paddingHorizontal: 20 },
  header: { marginBottom: 24 },
  nameText: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontWeight: '500' },
  
  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
  
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D', borderWidth: 1 },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1 },
  
  coachBanner: { padding: 16, borderRadius: 24, overflow: 'hidden', borderWidth: 1 },
  coachAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(217, 102, 56, 0.1)', alignItems: 'center', justifyContent: 'center' },
  coachTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  coachMessageText: { fontSize: 14, fontWeight: '500', lineHeight: 20, fontStyle: 'italic' },

  membershipCard: { padding: 24, borderRadius: 32, marginBottom: 32, overflow: 'hidden' },
  memHeader: { marginBottom: 24 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  planName: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  statusBadge: { backgroundColor: 'rgba(217, 102, 56, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(217, 102, 56, 0.2)' },
  statusBadgeText: { color: '#d96638', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  
  memDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  valueText: { fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  
  infoBox: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 16 },
  infoBoxDark: { backgroundColor: 'rgba(255,255,255,0.03)' },
  infoBoxLight: { backgroundColor: 'rgba(0,0,0,0.03)' },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '500' },

  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, letterSpacing: -0.5 },
  
  actionsContainer: { borderRadius: 24, padding: 8 },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, paddingVertical: 16 },
  actionIconBg: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 16, fontWeight: '700' },
  divider: { height: 1, marginHorizontal: 12 },
  dividerDark: { backgroundColor: '#30363D' },
  dividerLight: { backgroundColor: '#E2E8F0' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '48%', padding: 20, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  statIcon: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  statValue: { fontSize: 28, fontWeight: '900', letterSpacing: -1, marginBottom: 4 },
  statLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  
  programCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, marginBottom: 12, gap: 16 },
  progImage: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  progName: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  progSubtitle: { fontSize: 13, fontWeight: '600' }
});

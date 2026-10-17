import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, RefreshControl } from 'react-native';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Mail, Award, ChevronLeft, ArrowUpRight } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import { router } from 'expo-router';
import { Skeleton } from '../../components/ui/Skeleton';

function AnalyticsBar({ value, maxValue, delay, label, isDark }: { value: number; maxValue: number; delay: number; label: string; isDark: boolean }) {
  const height = useSharedValue(0);

  useEffect(() => {
    const target = maxValue > 0 ? (value / maxValue) * 100 : 0;
    height.value = withDelay(delay, withTiming(Math.max(4, target), { duration: 900 }));
  }, [value, maxValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${height.value}%`
  }));

  return (
    <View style={{ flex: 1, alignItems: 'center', height: 140, justifyContent: 'flex-end', paddingHorizontal: 3 }}>
      <Text style={{ fontSize: 10, fontWeight: '700', marginBottom: 4, color: '#d96638' }}>{value}</Text>
      <View style={{ width: '100%', height: 90, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 6 }}>
        <Animated.View 
          style={[
            { width: '100%', backgroundColor: '#d96638', borderRadius: 6, minHeight: 4, maxWidth: 24 },
            animatedStyle
          ]} 
        />
      </View>
      <Text style={{ fontSize: 10, fontWeight: '600', color: isDark ? '#8E8E93' : '#64748B' }} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export default function AdminAnalytics() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { scrollInset } = useAppBottomInset();

  const { data: analytics, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const res = await api.get('/admin/analytics');
      return res.data;
    }
  });

  const registrations = analytics?.monthlyRegistrations || [];
  const maxRegCount = Math.max(1, ...registrations.map((r: any) => Number(r.count) || 0));

  const planDist = analytics?.planDistribution || [];

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={isDark ? '#FFF' : '#000'} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Analytics & Reports</Text>
        <View style={{ width: 40 }} />
      </View>

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
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Skeleton width="48%" height={100} borderRadius={20} isDark={isDark} />
              <Skeleton width="48%" height={100} borderRadius={20} isDark={isDark} />
            </View>
            <Skeleton width="100%" height={220} borderRadius={24} isDark={isDark} />
            <Skeleton width="100%" height={180} borderRadius={24} isDark={isDark} />
          </View>
        ) : (
          <>
            {/* Top KPIs 2x2 Grid */}
            <Animated.View entering={FadeInDown.delay(50).duration(260)} style={styles.kpiGrid}>
              <View style={[styles.kpiCard, isDark ? styles.cardDark : styles.cardLight]}>
                <View style={styles.kpiHeader}>
                  <Users color="#d96638" size={18} />
                  <Text style={[styles.kpiLabel, isDark ? styles.textGray : styles.textSlate]}>Total Members</Text>
                </View>
                <Text style={[styles.kpiValue, isDark ? styles.textWhite : styles.textBlack]}>
                  {analytics?.totalMembers || 0}
                </Text>
                <Text style={{ fontSize: 11, color: '#10B981', fontWeight: '600', marginTop: 4 }}>
                  +{analytics?.newThisMonth || 0} new this month
                </Text>
              </View>

              <View style={[styles.kpiCard, isDark ? styles.cardDark : styles.cardLight]}>
                <View style={styles.kpiHeader}>
                  <Mail color="#3B82F6" size={18} />
                  <Text style={[styles.kpiLabel, isDark ? styles.textGray : styles.textSlate]}>Inquiries</Text>
                </View>
                <Text style={[styles.kpiValue, isDark ? styles.textWhite : styles.textBlack]}>
                  {analytics?.totalInquiries || 0}
                </Text>
                <Text style={{ fontSize: 11, color: '#3B82F6', fontWeight: '600', marginTop: 4 }}>
                  {analytics?.newInquiries || 0} unread leads
                </Text>
              </View>

              <View style={[styles.kpiCard, isDark ? styles.cardDark : styles.cardLight]}>
                <View style={styles.kpiHeader}>
                  <Award color="#F59E0B" size={18} />
                  <Text style={[styles.kpiLabel, isDark ? styles.textGray : styles.textSlate]}>Active Plans</Text>
                </View>
                <Text style={[styles.kpiValue, isDark ? styles.textWhite : styles.textBlack]}>
                  {analytics?.activePlans || 0}
                </Text>
                <Text style={[styles.kpiSub, isDark ? styles.textGray : styles.textSlate]}>
                  Tiered Memberships
                </Text>
              </View>

              <View style={[styles.kpiCard, isDark ? styles.cardDark : styles.cardLight]}>
                <View style={styles.kpiHeader}>
                  <Calendar color="#8B5CF6" size={18} />
                  <Text style={[styles.kpiLabel, isDark ? styles.textGray : styles.textSlate]}>Programs</Text>
                </View>
                <Text style={[styles.kpiValue, isDark ? styles.textWhite : styles.textBlack]}>
                  {analytics?.totalPrograms || 0}
                </Text>
                <Text style={[styles.kpiSub, isDark ? styles.textGray : styles.textSlate]}>
                  Training Courses
                </Text>
              </View>
            </Animated.View>

            {/* Member Growth Chart */}
            <Animated.View entering={FadeInDown.delay(120).duration(260)} style={[styles.chartCard, isDark ? styles.cardDark : styles.cardLight]}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={[styles.cardTitle, isDark ? styles.textWhite : styles.textBlack]}>Member Registrations</Text>
                  <Text style={[styles.cardSub, isDark ? styles.textGray : styles.textSlate]}>6-Month Member Growth Trajectory</Text>
                </View>
                <TrendingUp color="#10B981" size={20} />
              </View>

              <View style={styles.chartArea}>
                {registrations.length > 0 ? (
                  registrations.slice(0, 6).reverse().map((r: any, i: number) => (
                    <AnalyticsBar
                      key={i}
                      value={Number(r.count) || 0}
                      maxValue={maxRegCount}
                      delay={i * 80}
                      label={r.month?.split(' ')[0] || `M${i+1}`}
                      isDark={isDark}
                    />
                  ))
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 120 }}>
                    <Text style={[isDark ? styles.textGray : styles.textSlate]}>No growth data recorded yet</Text>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* Plan Distribution */}
            {planDist.length > 0 && (
              <Animated.View entering={FadeInDown.delay(180).duration(260)} style={[styles.chartCard, isDark ? styles.cardDark : styles.cardLight]}>
                <Text style={[styles.cardTitle, isDark ? styles.textWhite : styles.textBlack, { marginBottom: 14 }]}>
                  Membership Distribution
                </Text>
                {planDist.map((item: any, idx: number) => (
                  <View key={idx} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={[styles.planName, isDark ? styles.textWhite : styles.textBlack]}>{item.name}</Text>
                      <Text style={[styles.planCount, { color: '#d96638' }]}>{item.count} members</Text>
                    </View>
                    <View style={[styles.progressTrack, isDark ? { backgroundColor: '#30363D' } : { backgroundColor: '#E2E8F0' }]}>
                      <View style={[styles.progressFill, { width: `${Math.min(100, (item.count / (analytics?.totalMembers || 1)) * 100)}%` }]} />
                    </View>
                  </View>
                ))}
              </Animated.View>
            )}

            {/* Recent Registrations Feed */}
            {analytics?.recentMembers?.length > 0 && (
              <Animated.View entering={FadeInDown.delay(220).duration(260)} style={[styles.chartCard, isDark ? styles.cardDark : styles.cardLight]}>
                <Text style={[styles.cardTitle, isDark ? styles.textWhite : styles.textBlack, { marginBottom: 12 }]}>
                  Recent Joiners
                </Text>
                {analytics.recentMembers.slice(0, 5).map((m: any) => (
                  <View key={m.id} style={[styles.recentRow, { borderBottomColor: isDark ? '#30363D' : '#E2E8F0' }]}>
                    <View style={[styles.avatar, isDark ? { backgroundColor: '#30363D' } : { backgroundColor: '#E2E8F0' }]}>
                      <Text style={{ fontWeight: '700', color: '#d96638' }}>{m.name?.charAt(0) || 'U'}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.recentName, isDark ? styles.textWhite : styles.textBlack]}>{m.name}</Text>
                      <Text style={[styles.recentEmail, isDark ? styles.textGray : styles.textSlate]}>{m.email}</Text>
                    </View>
                    <Text style={[styles.planBadge, { color: '#d96638' }]}>
                      {m.membership?.plan?.name || 'Member'}
                    </Text>
                  </View>
                ))}
              </Animated.View>
            )}
          </>
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
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  scrollContent: { paddingHorizontal: 20, gap: 16, paddingTop: 16 },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kpiCard: { width: '48%', padding: 16, borderRadius: 20, borderWidth: 1 },
  kpiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  kpiLabel: { fontSize: 11, fontWeight: '600' },
  kpiValue: { fontSize: 24, fontWeight: '800' },
  kpiSub: { fontSize: 11, fontWeight: '500', marginTop: 4 },

  chartCard: { padding: 20, borderRadius: 24, borderWidth: 1 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },

  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: '800' },
  cardSub: { fontSize: 12, marginTop: 2 },

  chartArea: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 140, paddingTop: 10 },

  planName: { fontSize: 13, fontWeight: '600' },
  planCount: { fontSize: 12, fontWeight: '700' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#d96638', borderRadius: 3 },

  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  recentName: { fontSize: 14, fontWeight: '700' },
  recentEmail: { fontSize: 12 },
  planBadge: { fontSize: 11, fontWeight: '700' },

  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
});

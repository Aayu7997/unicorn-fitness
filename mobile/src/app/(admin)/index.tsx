import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Activity, Users, RefreshCcw, DollarSign, TrendingUp, AlertCircle, Clock, FileText } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import * as Haptics from 'expo-haptics';
import { Skeleton } from '../../components/ui/Skeleton';
import { NotificationBellButton } from '../../components/NotificationBellButton';

function AnimatedBar({ value, maxValue, delay, day, isDark }: { value: number, maxValue: number, delay: number, day: string, isDark: boolean }) {
  const height = useSharedValue(0);
  
  useEffect(() => {
    height.value = withDelay(delay, withTiming(value === 0 ? 0 : (value / maxValue) * 100, { duration: 1000 }));
  }, [value, maxValue]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: `${height.value}%`
    };
  });

  return (
    <View style={{ flex: 1, alignItems: 'center', height: 160, justifyContent: 'flex-end', paddingHorizontal: 2 }}>
      <View style={{ width: '100%', height: 120, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 8, paddingHorizontal: 2 }}>
        <Animated.View style={[
          { width: '100%', backgroundColor: '#D7C8B4', borderRadius: 6, minHeight: 4, maxWidth: 28 },
          animatedStyle
        ]} />
      </View>
      <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? '#8E8E93' : '#64748B' }}>{day}</Text>
    </View>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { scrollInset } = useAppBottomInset();

  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard-stats');
      return response.data;
    },
    refetchInterval: 3000,
  });

  const router = useRouter();

  const handlePress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (route) {
      router.push(route as any);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
        <View style={[styles.scrollContent, { paddingTop: insets.top + 20 }]}>
          <View style={styles.header}>
            <Skeleton width={120} height={14} isDark={isDark} style={{ marginBottom: 8 }} />
            <Skeleton width={200} height={36} isDark={isDark} />
          </View>
          <Skeleton width="100%" height={220} borderRadius={40} isDark={isDark} style={{ marginBottom: 32 }} />
          <Skeleton width={180} height={26} isDark={isDark} style={{ marginBottom: 16 }} />
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Skeleton width={140} height={180} borderRadius={32} isDark={isDark} />
            <Skeleton width={140} height={180} borderRadius={32} isDark={isDark} />
          </View>
        </View>
      </View>
    );
  }

  if (isError || !stats) {
    return (
      <View style={[styles.centerContainer, isDark ? styles.bgDark : styles.bgLight]}>
        <Text style={[styles.errorText, isDark ? styles.textWhite : styles.textBlack]}>Failed to load dashboard</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <RefreshCcw color="#FFFFFF" size={20} />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: scrollInset }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(260).damping(16)} style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={[styles.welcomeText, isDark ? styles.textGray : styles.textSlate]}>ADMIN PORTAL</Text>
              <Text style={[styles.nameText, isDark ? styles.textWhite : styles.textBlack]}>
                Gym Overview
              </Text>
            </View>
            <NotificationBellButton />
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(150).duration(260)} style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
            {[
              { icon: Users, label: 'Add Member', route: '/(admin)/members?action=add' },
              { icon: DollarSign, label: 'New Invoice', route: '/(admin)/invoices?action=new' },
              { icon: FileText, label: 'New Enquiry', route: '/(admin)/enquiries?action=new' },
              { icon: Activity, label: 'Log Measurement', route: '/(admin)/measurements?action=new' },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickActionCard, isDark ? styles.bgDarker : styles.bgLighter, { marginRight: 12 }]}
                onPress={() => handlePress(action.route)}
                activeOpacity={0.8}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: isDark ? 'rgba(58, 76, 86, 0.2)' : '#E2E8F0' }]}>
                  <action.icon color={isDark ? '#D7C8B4' : '#3A4C56'} size={20} />
                </View>
                <Text style={[styles.quickActionLabel, isDark ? styles.textWhite : styles.textBlack]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Hero Card - Collection */}
        <Animated.View entering={FadeInDown.delay(200).duration(260)} style={styles.heroCardContainer}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => handlePress('/(admin)/invoices')}>
            <View style={[styles.heroCard, { backgroundColor: '#D7C8B4' }]}>
              <View style={styles.heroContent}>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>This Week</Text>
                </View>
                <View style={styles.heroTextContainer}>
                  <Text style={styles.heroScoreText}>₹{(stats.financials.totalCollection / 1000).toFixed(1)}k</Text>
                  <Text style={styles.heroSubtitle}>Total Revenue Collected</Text>
                </View>
                <View style={styles.heroButton}>
                  <TrendingUp color="#FFFFFF" size={24} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Business Health Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(260)}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>Business Health</Text>
          </View>

          <View style={styles.statsGrid}>
            {/* Live Members Card */}
            <TouchableOpacity activeOpacity={0.8} style={styles.gridCardWrapper} onPress={() => handlePress('/(admin)/members')}>
              <View style={[styles.habitCard, isDark ? styles.cardDark : styles.cardLight]}>
                 <View style={[styles.iconContainer, { backgroundColor: 'rgba(217, 102, 56, 0.1)' }]}>
                   <Users color="#d96638" size={24} />
                 </View>
                 <View style={styles.habitTextContainer}>
                   <Text style={[styles.habitValue, isDark ? styles.textWhite : styles.textBlack]}>{stats.memberships.activeMembers}</Text>
                   <Text style={[styles.habitLabel, isDark ? styles.textGray : styles.textSlate]}>Active Members</Text>
                 </View>
              </View>
            </TouchableOpacity>

            {/* Expiring Soon Card */}
            <TouchableOpacity activeOpacity={0.8} style={styles.gridCardWrapper} onPress={() => handlePress('/(admin)/members?filter=expiring')}>
              <View style={[styles.habitCard, isDark ? styles.cardDark : styles.cardLight]}>
                 <View style={[styles.iconContainer, { backgroundColor: 'rgba(215, 200, 180, 0.2)' }]}>
                   <Clock color="#D7C8B4" size={24} />
                 </View>
                 <View style={styles.habitTextContainer}>
                   <Text style={[styles.habitValue, isDark ? styles.textWhite : styles.textBlack]}>{stats.memberships.activeExpiring}</Text>
                   <Text style={[styles.habitLabel, isDark ? styles.textGray : styles.textSlate]}>Exp. in 15 Days</Text>
                 </View>
              </View>
            </TouchableOpacity>

            {/* Total Expired Card */}
            <TouchableOpacity activeOpacity={0.8} style={styles.gridCardWrapper} onPress={() => handlePress('/(admin)/members?filter=expired')}>
              <View style={[styles.habitCard, isDark ? styles.cardDark : styles.cardLight]}>
                 <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                   <AlertCircle color="#ef4444" size={24} />
                 </View>
                 <View style={styles.habitTextContainer}>
                   <Text style={[styles.habitValue, isDark ? styles.textWhite : styles.textBlack]}>{stats.memberships.totalExpired}</Text>
                   <Text style={[styles.habitLabel, isDark ? styles.textGray : styles.textSlate]}>Total Expired</Text>
                 </View>
              </View>
            </TouchableOpacity>

            {/* Pending Dues Card */}
            <TouchableOpacity activeOpacity={0.8} style={styles.gridCardWrapper} onPress={() => handlePress('/(admin)/invoices')}>
              <View style={[styles.habitCard, isDark ? styles.cardDark : styles.cardLight]}>
                 <View style={[styles.iconContainer, { backgroundColor: 'rgba(217, 102, 56, 0.1)' }]}>
                   <DollarSign color="#d96638" size={24} />
                 </View>
                 <View style={styles.habitTextContainer}>
                   <Text style={[styles.habitValue, isDark ? styles.textWhite : styles.textBlack]}>₹{(stats.financials.balanceCollection / 1000).toFixed(1)}k</Text>
                   <Text style={[styles.habitLabel, isDark ? styles.textGray : styles.textSlate]}>Pending Dues</Text>
                 </View>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
        
        {/* Revenue Trends Chart */}
        <Animated.View entering={FadeInDown.delay(350).duration(260)}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>Revenue Trends</Text>
          </View>
          <View style={[styles.chartCard, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
              <View>
                <Text style={[styles.chartSubtitle, isDark ? styles.textGray : styles.textSlate]}>This Week</Text>
                <Text style={[styles.chartTitle, isDark ? styles.textWhite : styles.textBlack]}>₹{(stats.financials.totalCollection / 1000).toFixed(1)}k</Text>
              </View>
              <View style={[styles.trendBadge, { backgroundColor: 'rgba(58, 76, 86, 0.1)' }]}>
                <TrendingUp color="#3A4C56" size={14} style={{ marginRight: 4 }} />
                <Text style={styles.trendText}>+12.5%</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 160 }}>
              {[
                { day: 'Mon', value: 12 },
                { day: 'Tue', value: 15 },
                { day: 'Wed', value: 8 },
                { day: 'Thu', value: 22 },
                { day: 'Fri', value: 18 },
                { day: 'Sat', value: 35 },
                { day: 'Sun', value: Math.max((stats.financials.totalCollection / 1000), 5) },
              ].map((data, index) => (
                <AnimatedBar key={index} value={data.value} maxValue={35} delay={index * 100} day={data.day} isDark={isDark} />
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Detailed Stats / Alerts */}
        <Animated.View entering={FadeInDown.delay(400).duration(260)}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>Action Required</Text>
          </View>
          <TouchableOpacity 
            style={[styles.scheduleCard, isDark ? styles.cardDark : styles.cardLight]} 
            onPress={() => handlePress('/(admin)/invoices')}
            activeOpacity={0.8}
          >
            <View style={[styles.scheduleIconContainer, { backgroundColor: '#F3D0D7' }]}>
              <AlertCircle color="#3A4C56" size={24} />
            </View>
            <View style={styles.scheduleTextContainer}>
              <Text style={[styles.scheduleLabel, isDark ? styles.textGray : styles.textSlate]}>Pending Invoices</Text>
              <Text style={[styles.scheduleValue, isDark ? styles.textWhite : styles.textBlack]}>
                You have {stats.financials.balanceCollection > 0 ? 'outstanding dues' : 'no pending dues'}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgDark: { backgroundColor: '#0D1117' },
  bgLight: { backgroundColor: '#F4F7F6' },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#d96638', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 99 },
  retryText: { color: '#FFFFFF', fontWeight: '700', marginLeft: 8 },
  scrollContent: { paddingHorizontal: 20 },
  header: { marginBottom: 24 },
  welcomeText: { fontSize: 12, fontWeight: '700', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' },
  nameText: { fontSize: 32, fontWeight: '800', letterSpacing: -1, width: '80%', lineHeight: 38 },
  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D', borderWidth: 1 },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1 },

  heroCardContainer: { marginBottom: 32, borderRadius: 40, overflow: 'hidden' },
  heroCard: { padding: 32, minHeight: 220, position: 'relative' },
  heroContent: { zIndex: 10, flex: 1, justifyContent: 'space-between' },
  heroBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.4)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 24 },
  heroBadgeText: { color: '#3A4C56', fontSize: 12, fontWeight: '700' },
  heroTextContainer: { alignItems: 'flex-start', marginBottom: 20 },
  heroScoreText: { fontSize: 32, fontWeight: '800', color: '#3A4C56', letterSpacing: -1 },
  heroSubtitle: { fontSize: 14, color: '#3A4C56', fontWeight: '600', opacity: 0.8 },
  heroButton: { backgroundColor: '#3A4C56', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', position: 'absolute', bottom: 0, right: 0 },

  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '800' },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  gridCardWrapper: { width: '47%' },
  habitCard: { width: '100%', padding: 20, borderRadius: 32, justifyContent: 'space-between', minHeight: 160 },
  iconContainer: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  habitTextContainer: { marginTop: 'auto' },
  habitValue: { fontSize: 24, fontWeight: '800', color: '#3A4C56', marginBottom: 2 },
  habitUnit: { fontSize: 14, fontWeight: '600', opacity: 0.6 },
  habitLabel: { fontSize: 13, fontWeight: '700', color: '#3A4C56', opacity: 0.8 },
  
  chartCard: { padding: 24, borderRadius: 32, marginBottom: 24 },
  chartSubtitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  chartTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  trendText: { color: '#3A4C56', fontSize: 12, fontWeight: '700' },

  scheduleCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 32, marginBottom: 24 },
  scheduleIconContainer: { padding: 16, borderRadius: 24, marginRight: 16 },
  scheduleTextContainer: { flex: 1 },
  scheduleLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  scheduleValue: { fontSize: 16, fontWeight: '700' },
  quickActionCard: { padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', width: 110, borderWidth: 1, borderColor: 'rgba(150, 150, 150, 0.1)' },
  bgDarker: { backgroundColor: '#161B22' },
  bgLighter: { backgroundColor: '#FFFFFF' },
  quickActionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickActionLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
});

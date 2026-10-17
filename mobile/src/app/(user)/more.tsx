import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, Alert, Appearance } from 'react-native';
import { LogOut, User, Activity, MessageSquare, ChevronRight, HelpCircle, Shield, Bell, FileText, Bot, Target, Award, Calendar, PlayCircle, Compass, Dumbbell, Calculator } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useUIStore } from '../../store/useUIStore';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import * as Haptics from 'expo-haptics';
import { NotificationModal } from '../../components/NotificationModal';

export default function UserMore() {
  const { logout, user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { insets, scrollInset } = useAppBottomInset();
  const { showToast } = useUIStore();
  const [notificationModalVisible, setNotificationModalVisible] = React.useState(false);

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await logout();
      router.replace('/login');
      showToast('Logged out successfully', 'success');
    } catch (e) {
      showToast('Failed to log out', 'error');
    }
  };

  const toggleTheme = () => {
    Appearance.setColorScheme(isDark ? 'light' : 'dark');
  };

  const handlePress = (route?: string, title?: string, type?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === 'notifications') {
      setNotificationModalVisible(true);
      return;
    }
    if (route) {
      router.push(route as any);
    } else if (type) {
      router.push({ pathname: '/(user)/settings', params: { type, title } } as any);
    }
  };

  const menuItems = [
    { title: 'My Profile', icon: <User color={isDark ? '#8E8E93' : '#64748B'} size={24} />, type: 'profile' },
    { title: 'Body Composition & BMI', icon: <Calculator color={isDark ? '#8E8E93' : '#64748B'} size={24} />, route: '/(user)/bmi' },
    { title: 'Exercise Guide & Library', icon: <Dumbbell color={isDark ? '#8E8E93' : '#64748B'} size={24} />, route: '/(user)/exercises' },
    { title: 'My Goals', icon: <Award color={isDark ? '#8E8E93' : '#64748B'} size={24} />, route: '/(user)/goals' },
    { title: 'My Programs', icon: <PlayCircle color={isDark ? '#8E8E93' : '#64748B'} size={24} />, route: '/(user)/programs' },
    { title: 'My Plans & Invoices', icon: <FileText color={isDark ? '#8E8E93' : '#64748B'} size={24} />, route: '/(user)/plans' },
    { title: 'My Referrals', icon: <Compass color={isDark ? '#8E8E93' : '#64748B'} size={24} />, route: '/(user)/referrals' },
    { title: 'My Support Enquiries', icon: <MessageSquare color={isDark ? '#8E8E93' : '#64748B'} size={24} />, route: '/(user)/support' },
    { title: 'AI Assistant', icon: <Bot color={isDark ? '#8E8E93' : '#64748B'} size={24} />, route: '/(user)/ai' },
  ];

  const settingsItems = [
    { title: 'Notifications', icon: <Bell color={isDark ? '#8E8E93' : '#64748B'} size={24} />, type: 'notifications' },
    { title: 'Privacy & Security', icon: <Shield color={isDark ? '#8E8E93' : '#64748B'} size={24} />, type: 'security' },
    { title: 'FAQ', icon: <HelpCircle color={isDark ? '#8E8E93' : '#64748B'} size={24} />, type: 'help' },
  ];

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <View style={[styles.header, { paddingTop: insets.top + 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Menu</Text>
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollInset }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(260)} style={[styles.profileCard, isDark ? styles.cardDark : styles.cardLight]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, isDark ? styles.textWhite : styles.textBlack]}>{user?.name}</Text>
            <Text style={[styles.profileEmail, isDark ? styles.textGray : styles.textSlate]}>{user?.email}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(260)} style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.menuItem, 
                isDark ? styles.cardDark : styles.cardLight,
                index === 0 && styles.menuItemFirst,
                index === menuItems.length - 1 && styles.menuItemLast
              ]}
              onPress={() => handlePress(item.route, item.title, (item as any).type)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                {item.icon}
                <Text style={[styles.menuItemText, isDark ? styles.textWhite : styles.textBlack]}>{item.title}</Text>
              </View>
              <ChevronRight color={isDark ? '#30363D' : '#E2E8F0'} size={20} />
            </TouchableOpacity>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(260)} style={styles.menuContainer}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.menuItem, 
                isDark ? styles.cardDark : styles.cardLight,
                index === 0 && styles.menuItemFirst,
                index === settingsItems.length - 1 && styles.menuItemLast
              ]}
              onPress={() => handlePress(undefined, item.title, (item as any).type)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                {item.icon}
                <Text style={[styles.menuItemText, isDark ? styles.textWhite : styles.textBlack]}>{item.title}</Text>
              </View>
              <ChevronRight color={isDark ? '#30363D' : '#E2E8F0'} size={20} />
            </TouchableOpacity>
          ))}
        </Animated.View>

        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
          <Animated.View entering={FadeInDown.delay(350).duration(260)}>
            <TouchableOpacity 
              style={[styles.logoutButton, { backgroundColor: 'rgba(58, 76, 86, 0.1)', borderColor: 'rgba(58, 76, 86, 0.2)', marginBottom: 16 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.replace('/(admin)');
              }}
              activeOpacity={0.7}
            >
              <Shield color="#3A4C56" size={20} />
              <Text style={[styles.logoutText, { color: '#3A4C56' }]}>Switch to Admin View</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(400).duration(260)}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut color="#FF3B30" size={20} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <NotificationModal
        visible={notificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgDark: { backgroundColor: '#0D1117' },
  bgLight: { backgroundColor: '#F4F7F6' },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  scrollContent: { padding: 20, gap: 24 },
  
  profileCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 1 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F9D3AF', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#3A4C56' },
  
  profileInfo: { flex: 1, justifyContent: 'center' },
  profileName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  profileEmail: { fontSize: 15, fontWeight: '500' },
  
  menuContainer: { overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderWidth: 1, borderBottomWidth: 0 },
  menuItemFirst: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  menuItemLast: { borderBottomLeftRadius: 24, borderBottomRightRadius: 24, borderBottomWidth: 1 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  menuItemText: { fontSize: 16, fontWeight: '600' },
  
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16, borderRadius: 24, backgroundColor: 'rgba(255, 59, 48, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 59, 48, 0.2)' },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#FF3B30' },
  
  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
});

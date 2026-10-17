import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Switch, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Bell, Shield, HelpCircle, Settings, User, LayoutDashboard, Lock, Server, CheckCircle2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import { useUIStore } from '../../store/useUIStore';

export default function SettingsScreen() {
  const { type, title } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { scrollInset } = useAppBottomInset();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { showToast } = useUIStore();

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Preference Toggles
  const [twoFactor, setTwoFactor] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      showToast('Please enter your current password', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setIsChangingPassword(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await api.post('/admin/change-password', {
        currentPassword,
        newPassword
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Password changed successfully. Please log in again.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(async () => {
        await logout();
        router.replace('/login');
      }, 1500);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const screenTitle = title || (type === 'profile' ? 'Admin Profile' : type === 'security' ? 'Security & Passwords' : 'Admin Preferences');

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={handleBack} style={[styles.backButton, isDark ? styles.btnDark : styles.btnLight]}>
          <ChevronLeft color={isDark ? '#FFF' : '#000'} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>{screenTitle}</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollInset }]}
        showsVerticalScrollIndicator={false}
      >
        {type === 'profile' && (
          <Animated.View entering={FadeInDown.duration(260)} style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'A'}</Text>
              </View>
              <Text style={[styles.profileName, isDark ? styles.textWhite : styles.textBlack]}>{user?.name || 'Administrator'}</Text>
              <Text style={[styles.profileRole, isDark ? styles.textGray : styles.textSlate]}>Super Administrator • Full Access</Text>
            </View>

            <View style={{ gap: 14 }}>
              <View>
                <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>ADMINISTRATOR NAME</Text>
                <View style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}>
                  <Text style={[isDark ? styles.textWhite : styles.textBlack]}>{user?.name || 'Administrator'}</Text>
                </View>
              </View>

              <View>
                <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>EMAIL ADDRESS</Text>
                <View style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}>
                  <Text style={[isDark ? styles.textWhite : styles.textBlack]}>{user?.email || 'admin@ufcgym.com'}</Text>
                </View>
              </View>

              <View>
                <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>ACCESS LEVEL</Text>
                <View style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}>
                  <Text style={{ color: '#d96638', fontWeight: '700' }}>ROLE_ADMIN (Highest Security Clearance)</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {type === 'security' && (
          <Animated.View entering={FadeInDown.duration(260)} style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Lock color="#d96638" size={22} />
              <Text style={[styles.cardTitle, isDark ? styles.textWhite : styles.textBlack]}>Update Admin Password</Text>
            </View>

            <View style={{ gap: 14 }}>
              <View>
                <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>CURRENT PASSWORD</Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter existing password"
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  secureTextEntry
                />
              </View>

              <View>
                <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>NEW PASSWORD</Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Minimum 8 characters"
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  secureTextEntry
                />
              </View>

              <View>
                <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>CONFIRM NEW PASSWORD</Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                style={[styles.primaryBtn, isChangingPassword && styles.btnDisabled]}
                disabled={isChangingPassword}
                onPress={handleChangePassword}
              >
                {isChangingPassword ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Update Master Password</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight, { marginVertical: 20 }]} />

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={[styles.switchTitle, isDark ? styles.textWhite : styles.textBlack]}>Two-Factor Security</Text>
                <Text style={[styles.switchSub, isDark ? styles.textGray : styles.textSlate]}>Enforce OTP verification for sensitive operations</Text>
              </View>
              <Switch 
                value={twoFactor} 
                onValueChange={(val) => {
                  Haptics.selectionAsync();
                  setTwoFactor(val);
                }} 
                trackColor={{ false: isDark ? '#263040' : '#CBD5E1', true: '#d96638' }} 
                thumbColor={Platform.OS === 'android' ? (twoFactor ? '#FFFFFF' : (isDark ? '#94A3B8' : '#FFFFFF')) : undefined}
                ios_backgroundColor={isDark ? '#263040' : '#CBD5E1'}
              />
            </View>
          </Animated.View>
        )}

        {type === 'master' && (
          <Animated.View entering={FadeInDown.duration(260)} style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Server color="#d96638" size={22} />
              <Text style={[styles.cardTitle, isDark ? styles.textWhite : styles.textBlack]}>System Status & Database</Text>
            </View>

            <View style={{ gap: 12 }}>
              <View style={[styles.statusBox, isDark ? styles.statusBoxDark : styles.statusBoxLight]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 color="#10B981" size={18} />
                  <Text style={[styles.statusTitle, isDark ? styles.textWhite : styles.textBlack]}>Prisma ORM & PostgreSQL</Text>
                </View>
                <Text style={[styles.statusSub, isDark ? styles.textGray : styles.textSlate]}>Operational • Real-time queries active</Text>
              </View>

              <View style={[styles.statusBox, isDark ? styles.statusBoxDark : styles.statusBoxLight]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 color="#10B981" size={18} />
                  <Text style={[styles.statusTitle, isDark ? styles.textWhite : styles.textBlack]}>API Server & Bearer Auth</Text>
                </View>
                <Text style={[styles.statusSub, isDark ? styles.textGray : styles.textSlate]}>Connected via JWT Secure Store</Text>
              </View>

              <View style={[styles.statusBox, isDark ? styles.statusBoxDark : styles.statusBoxLight]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 color="#10B981" size={18} />
                  <Text style={[styles.statusTitle, isDark ? styles.textWhite : styles.textBlack]}>Frosted Glass UI Architecture</Text>
                </View>
                <Text style={[styles.statusSub, isDark ? styles.textGray : styles.textSlate]}>Apple Optical Blur + Linear Gradient</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {(!type || (type !== 'profile' && type !== 'security' && type !== 'master')) && (
          <Animated.View entering={FadeInDown.duration(260)} style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={[styles.switchTitle, isDark ? styles.textWhite : styles.textBlack]}>Admin Push Alerts</Text>
                <Text style={[styles.switchSub, isDark ? styles.textGray : styles.textSlate]}>Receive notifications for new member enrollments</Text>
              </View>
              <Switch 
                value={pushAlerts} 
                onValueChange={(val) => {
                  Haptics.selectionAsync();
                  setPushAlerts(val);
                }} 
                trackColor={{ false: isDark ? '#263040' : '#CBD5E1', true: '#d96638' }} 
                thumbColor={Platform.OS === 'android' ? (pushAlerts ? '#FFFFFF' : (isDark ? '#94A3B8' : '#FFFFFF')) : undefined}
                ios_backgroundColor={isDark ? '#263040' : '#CBD5E1'}
              />
            </View>

            <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={[styles.switchTitle, isDark ? styles.textWhite : styles.textBlack]}>Weekly Financial Summary</Text>
                <Text style={[styles.switchSub, isDark ? styles.textGray : styles.textSlate]}>Email automated revenue and expense reports</Text>
              </View>
              <Switch 
                value={emailAlerts} 
                onValueChange={(val) => {
                  Haptics.selectionAsync();
                  setEmailAlerts(val);
                }} 
                trackColor={{ false: isDark ? '#263040' : '#CBD5E1', true: '#d96638' }} 
                thumbColor={Platform.OS === 'android' ? (emailAlerts ? '#FFFFFF' : (isDark ? '#94A3B8' : '#FFFFFF')) : undefined}
                ios_backgroundColor={isDark ? '#263040' : '#CBD5E1'}
              />
            </View>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)'
  },
  backButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  btnDark: { backgroundColor: '#161B22', borderWidth: 1, borderColor: '#30363D' },
  btnLight: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  headerTitle: { fontSize: 18, fontWeight: '800' },

  scrollContent: { padding: 20, gap: 16 },

  card: { padding: 20, borderRadius: 24, borderWidth: 1 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  cardTitle: { fontSize: 17, fontWeight: '800' },

  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#d96638', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#FFF' },
  profileName: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  profileRole: { fontSize: 13, fontWeight: '600' },

  label: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  input: { height: 48, borderRadius: 14, paddingHorizontal: 14, fontSize: 15, borderWidth: 1, justifyContent: 'center' },
  inputDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  inputLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },

  primaryBtn: { height: 50, borderRadius: 16, backgroundColor: '#d96638', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  switchTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  switchSub: { fontSize: 13, lineHeight: 18 },

  divider: { height: 1, marginVertical: 14 },
  dividerDark: { backgroundColor: '#30363D' },
  dividerLight: { backgroundColor: '#F1F5F9' },

  statusBox: { padding: 14, borderRadius: 16, borderWidth: 1 },
  statusBoxDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  statusBoxLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  statusTitle: { fontSize: 14, fontWeight: '700' },
  statusSub: { fontSize: 12, marginTop: 4 },

  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
});

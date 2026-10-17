import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Switch, Image, ActivityIndicator, Alert, TextInput, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Bell, Shield, HelpCircle, Settings, User, Target, Award, Compass, Lock, Phone, Calendar, Ruler, Scale, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../hooks/useAuth';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import { api } from '../../lib/api';
import { useUIStore } from '../../store/useUIStore';

export default function SettingsScreen() {
  const { type, title } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { insets, scrollInset } = useAppBottomInset();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  // Profile Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('Male');
  const [weight, setWeight] = useState('');

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preferences
  const [pushEnabled, setPushEnabled] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);

  // Fetch live profile details
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await api.get('/user/profile');
      return res.data?.user;
    }
  });

  // FAQs State & Query
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const { data: faqs = [], isLoading: isLoadingFaqs } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const res = await api.get('/faqs');
      return res.data || [];
    },
    enabled: type === 'help' || !type,
  });

  useEffect(() => {
    if (profileData) {
      if (profileData.name) setName(profileData.name);
      if (profileData.phone) setPhone(profileData.phone);
      if (profileData.age) setAge(String(profileData.age));
      if (profileData.height) setHeight(String(profileData.height));
      if (profileData.gender) setGender(profileData.gender);
      if (profileData.avatarUrl) setAvatarUri(profileData.avatarUrl);
      if (profileData.progressLogs?.[0]?.weight) {
        setWeight(String(profileData.progressLogs[0].weight));
      }
    } else if (user) {
      setName(user.name || '');
    }
  }, [profileData, user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/user/profile', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Profile updated successfully', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to update profile', 'error');
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      const res = await api.put('/user/profile/password', payload);
      return res.data;
    },
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Password changed successfully', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to change password', 'error');
    }
  });

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setIsUploading(true);
        const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setAvatarUri(result.assets[0].uri);

        await api.post('/user/profile', { avatarBase64: base64Img });
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast('Profile photo updated', 'success');
      }
    } catch (error) {
      showToast('Failed to upload image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateProfileMutation.mutate({
      name: name.trim(),
      phone: phone.trim() || undefined,
      age: age ? parseInt(age) : undefined,
      height: height ? parseFloat(height) : undefined,
      gender,
      weight: weight ? parseFloat(weight) : undefined,
    });
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      showToast('Please enter your current password', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const screenTitle = title || (type === 'profile' ? 'Profile Details' : type === 'security' ? 'Security & Passwords' : 'Settings');

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={handleBack} style={[styles.backButton, isDark ? styles.btnDark : styles.btnLight]}>
          <ChevronLeft color={isDark ? '#FFF' : '#000'} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>
          {screenTitle}
        </Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollInset }]}
        showsVerticalScrollIndicator={false}
      >
        {type === 'profile' && (
          <Animated.View entering={FadeInDown.duration(260)} style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            {/* Avatar Section */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <TouchableOpacity onPress={handlePickImage} disabled={isUploading} style={styles.avatarContainer}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <View style={[styles.avatarPlaceholder, isDark ? styles.avatarPlaceholderDark : styles.avatarPlaceholderLight]}>
                    <User color={isDark ? '#FFF' : '#1E293B'} size={40} />
                  </View>
                )}
                {isUploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={[styles.avatarLabel, isDark ? styles.textGray : styles.textSlate]}>
                Tap to change photo
              </Text>
            </View>

            {/* Form Fields */}
            <View style={{ gap: 14 }}>
              <View>
                <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>FULL NAME</Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your Name"
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                />
              </View>

              <View>
                <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>EMAIL ADDRESS (READ ONLY)</Text>
                <View style={[styles.input, isDark ? styles.inputDark : styles.inputLight, { opacity: 0.6 }]}>
                  <Text style={[isDark ? styles.textWhite : styles.textBlack]}>{user?.email || 'N/A'}</Text>
                </View>
              </View>

              <View>
                <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>PHONE NUMBER</Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>AGE</Text>
                  <TextInput
                    style={[styles.input, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                    value={age}
                    onChangeText={setAge}
                    placeholder="25"
                    placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>HEIGHT (CM)</Text>
                  <TextInput
                    style={[styles.input, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                    value={height}
                    onChangeText={setHeight}
                    placeholder="178"
                    placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View>
                <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>CURRENT WEIGHT (KG)</Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="75"
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity 
                style={[styles.primaryBtn, updateProfileMutation.isPending && styles.btnDisabled]}
                disabled={updateProfileMutation.isPending}
                onPress={handleSaveProfile}
              >
                {updateProfileMutation.isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Save Profile Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {type === 'security' && (
          <Animated.View entering={FadeInDown.duration(260)} style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Lock color="#d96638" size={22} />
              <Text style={[styles.cardTitle, isDark ? styles.textWhite : styles.textBlack]}>Update Password</Text>
            </View>

            <View style={{ gap: 14 }}>
              <View>
                <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>CURRENT PASSWORD</Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
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
                style={[styles.primaryBtn, changePasswordMutation.isPending && styles.btnDisabled]}
                disabled={changePasswordMutation.isPending}
                onPress={handleChangePassword}
              >
                {changePasswordMutation.isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {type === 'notifications' && (
          <Animated.View entering={FadeInDown.duration(260)} style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={[styles.switchTitle, isDark ? styles.textWhite : styles.textBlack]}>Push Notifications</Text>
                <Text style={[styles.switchSub, isDark ? styles.textGray : styles.textSlate]}>Receive instant updates on classes and training plans</Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={(val) => {
                  Haptics.selectionAsync();
                  setPushEnabled(val);
                }}
                trackColor={{ false: isDark ? '#263040' : '#CBD5E1', true: '#d96638' }}
                thumbColor={Platform.OS === 'android' ? (pushEnabled ? '#FFFFFF' : (isDark ? '#94A3B8' : '#FFFFFF')) : undefined}
                ios_backgroundColor={isDark ? '#263040' : '#CBD5E1'}
              />
            </View>

            <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={[styles.switchTitle, isDark ? styles.textWhite : styles.textBlack]}>Workout Reminders</Text>
                <Text style={[styles.switchSub, isDark ? styles.textGray : styles.textSlate]}>Daily motivation and booked session check-ins</Text>
              </View>
              <Switch
                value={workoutReminders}
                onValueChange={(val) => {
                  Haptics.selectionAsync();
                  setWorkoutReminders(val);
                }}
                trackColor={{ false: isDark ? '#263040' : '#CBD5E1', true: '#d96638' }}
                thumbColor={Platform.OS === 'android' ? (workoutReminders ? '#FFFFFF' : (isDark ? '#94A3B8' : '#FFFFFF')) : undefined}
                ios_backgroundColor={isDark ? '#263040' : '#CBD5E1'}
              />
            </View>
          </Animated.View>
        )}

        {(!type || (type !== 'profile' && type !== 'security' && type !== 'notifications')) && (
          <Animated.View entering={FadeInDown.duration(260)} style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <HelpCircle color="#d96638" size={44} style={{ marginBottom: 12 }} />
              <Text style={[styles.cardTitle, isDark ? styles.textWhite : styles.textBlack]}>UFC Gym Help & FAQs</Text>
              <Text style={[styles.switchSub, { textAlign: 'center', marginTop: 6, paddingHorizontal: 12 }, isDark ? styles.textGray : styles.textSlate]}>
                Find answers to common questions about your membership, scheduling, and training.
              </Text>

              {/* FAQs Accordion */}
              <View style={{ width: '100%', marginTop: 20, gap: 10 }}>
                {isLoadingFaqs ? (
                  <ActivityIndicator color="#d96638" style={{ marginVertical: 16 }} />
                ) : faqs.length === 0 ? (
                  <Text style={[{ textAlign: 'center', paddingVertical: 12, fontSize: 13 }, isDark ? styles.textGray : styles.textSlate]}>
                    No FAQ articles found at this time.
                  </Text>
                ) : (
                  faqs.map((faq: any) => {
                    const isExpanded = expandedFaqId === faq.id;
                    return (
                      <TouchableOpacity
                        key={faq.id}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setExpandedFaqId(isExpanded ? null : faq.id);
                        }}
                        style={[
                          styles.faqItem,
                          isDark ? styles.faqDark : styles.faqLight,
                          isExpanded && styles.faqExpanded
                        ]}
                        activeOpacity={0.8}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <Text style={[styles.faqQuestion, isDark ? styles.textWhite : styles.textBlack, { flex: 1 }]}>
                            {faq.question}
                          </Text>
                          {isExpanded ? (
                            <ChevronUp color="#d96638" size={18} />
                          ) : (
                            <ChevronDown color={isDark ? '#8E8E93' : '#64748B'} size={18} />
                          )}
                        </View>
                        {isExpanded && (
                          <Text style={[styles.faqAnswer, isDark ? styles.textGray : styles.textSlate]}>
                            {faq.answer}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>

              {/* Support Ticket CTA */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(user)/support' as any);
                }}
                style={styles.supportTicketBtn}
                activeOpacity={0.8}
              >
                <MessageSquare color="#FFF" size={18} />
                <Text style={styles.supportTicketText}>Open Support Ticket</Text>
              </TouchableOpacity>

              <View style={{ marginTop: 20, width: '100%', gap: 10 }}>
                <View style={[styles.infoRow, isDark ? styles.infoDark : styles.infoLight]}>
                  <Text style={[styles.infoLabel, isDark ? styles.textGray : styles.textSlate]}>Club Location</Text>
                  <Text style={[styles.infoValue, isDark ? styles.textWhite : styles.textBlack]}>UFC Gym Main Center</Text>
                </View>
                <View style={[styles.infoRow, isDark ? styles.infoDark : styles.infoLight]}>
                  <Text style={[styles.infoLabel, isDark ? styles.textGray : styles.textSlate]}>Support Hotline</Text>
                  <Text style={[styles.infoValue, isDark ? styles.textWhite : styles.textBlack]}>+91 98765 00000</Text>
                </View>
                <View style={[styles.infoRow, isDark ? styles.infoDark : styles.infoLight]}>
                  <Text style={[styles.infoLabel, isDark ? styles.textGray : styles.textSlate]}>App Version</Text>
                  <Text style={[styles.infoValue, isDark ? styles.textWhite : styles.textBlack]}>v2.0.0 (Parity Release)</Text>
                </View>
              </View>
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
  cardTitle: { fontSize: 18, fontWeight: '800' },

  avatarContainer: { width: 96, height: 96, borderRadius: 48, overflow: 'hidden', position: 'relative' },
  avatarImage: { width: '100%', height: '100%' },
  avatarPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  avatarPlaceholderDark: { backgroundColor: '#0D1117' },
  avatarPlaceholderLight: { backgroundColor: '#F1F5F9' },
  uploadingOverlay: { ...(StyleSheet.absoluteFill as any), backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { fontSize: 12, fontWeight: '600', marginTop: 8 },

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

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 14 },
  infoDark: { backgroundColor: '#0D1117' },
  infoLight: { backgroundColor: '#F8FAFC' },
  infoLabel: { fontSize: 13, fontWeight: '600' },
  infoValue: { fontSize: 14, fontWeight: '700' },

  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },

  faqItem: { padding: 14, borderRadius: 16, borderWidth: 1, gap: 8 },
  faqDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  faqLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  faqExpanded: { borderColor: '#d96638' },
  faqQuestion: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  faqAnswer: { fontSize: 13, lineHeight: 19, marginTop: 4 },

  supportTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#d96638',
    height: 48,
    borderRadius: 16,
    width: '100%',
  },
  supportTicketText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});

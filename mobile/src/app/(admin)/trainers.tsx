import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, Image, Modal, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Users, ChevronLeft, Plus, Trash2, Award, Briefcase, FileText, X, CheckCircle, Sparkles } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import { router } from 'expo-router';
import { Skeleton } from '../../components/ui/Skeleton';
import * as Haptics from 'expo-haptics';
import { useUIStore } from '../../store/useUIStore';

export default function AdminTrainers() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { scrollInset } = useAppBottomInset();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Personal Trainer');
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState('3+ Years');
  const [bio, setBio] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-trainers'],
    queryFn: async () => {
      const res = await api.get('/admin/trainers');
      return Array.isArray(res.data) ? res.data : (res.data?.trainers || []);
    }
  });

  const trainers = data || [];

  const addTrainerMutation = useMutation({
    mutationFn: async (payload: { name: string; role: string; specialty: string; experience: string; bio: string; imageUrl?: string }) => {
      const res = await api.post('/admin/trainers', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trainers'] });
      setIsAddModalVisible(false);
      setName('');
      setSpecialty('');
      setBio('');
      setImageUrl('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Trainer added successfully!', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to add trainer', 'error');
    }
  });

  const deleteTrainerMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/trainers/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trainers'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Trainer removed', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to remove trainer', 'error');
    }
  });

  const handleDelete = (id: string, trainerName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Remove Trainer',
      `Are you sure you want to delete ${trainerName} from the coaching roster?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteTrainerMutation.mutate(id)
        }
      ]
    );
  };

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
          <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Coaches & Trainers</Text>
          <Text style={[styles.headerSubtitle, isDark ? styles.textGray : styles.textSlate]}>
            {trainers.length} Registered {trainers.length === 1 ? 'Instructor' : 'Instructors'}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsAddModalVisible(true);
          }} 
          style={styles.addBtn}
        >
          <Plus color="#FFF" size={20} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollInset }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && !isRefetching ? (
          <View style={{ gap: 16 }}>
            <Skeleton width="100%" height={160} borderRadius={24} isDark={isDark} />
            <Skeleton width="100%" height={160} borderRadius={24} isDark={isDark} />
            <Skeleton width="100%" height={160} borderRadius={24} isDark={isDark} />
          </View>
        ) : trainers.length > 0 ? (
          trainers.map((trainer: any, index: number) => (
            <Animated.View 
              key={trainer.id} 
              entering={FadeInDown.delay(index * 60).duration(260)} 
              style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.profileRow}>
                  {trainer.imageUrl ? (
                    <Image source={{ uri: trainer.imageUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitial}>
                        {(trainer.name || 'T').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.name, isDark ? styles.textWhite : styles.textBlack]} numberOfLines={1}>
                      {trainer.name}
                    </Text>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleText}>{trainer.role || 'Coach'}</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={() => handleDelete(trainer.id, trainer.name)}
                  style={styles.deleteBtn}
                >
                  <Trash2 color="#EF4444" size={18} />
                </TouchableOpacity>
              </View>

              <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Award color="#d96638" size={16} />
                  <Text style={[styles.metaLabel, isDark ? styles.textGray : styles.textSlate]}>Specialty:</Text>
                  <Text style={[styles.metaVal, isDark ? styles.textWhite : styles.textBlack]} numberOfLines={1}>
                    {trainer.specialty || 'General Fitness'}
                  </Text>
                </View>

                <View style={styles.metaItem}>
                  <Briefcase color="#10B981" size={16} />
                  <Text style={[styles.metaLabel, isDark ? styles.textGray : styles.textSlate]}>Exp:</Text>
                  <Text style={[styles.metaVal, isDark ? styles.textWhite : styles.textBlack]}>
                    {trainer.experience || 'N/A'}
                  </Text>
                </View>
              </View>

              {trainer.bio ? (
                <Text style={[styles.bioText, isDark ? styles.textGray : styles.textSlate]} numberOfLines={2}>
                  {trainer.bio}
                </Text>
              ) : null}
            </Animated.View>
          ))
        ) : (
          <Animated.View entering={FadeInDown.duration(260)} style={[styles.emptyState, isDark ? styles.cardDark : styles.cardLight]}>
            <Users color="#d96638" size={48} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textBlack]}>No Coaches Yet</Text>
            <Text style={[styles.emptyDesc, isDark ? styles.textGray : styles.textSlate]}>
              Add personal trainers and martial arts instructors to appear in the UFC Gym schedule.
            </Text>
            <TouchableOpacity 
              style={styles.emptyAddBtn}
              onPress={() => setIsAddModalVisible(true)}
            >
              <Plus color="#FFF" size={18} />
              <Text style={styles.emptyAddText}>Add First Trainer</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      {/* Add Trainer Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, isDark ? styles.modalDark : styles.modalLight]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Users color="#d96638" size={24} />
                <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>Add Trainer</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeBtn} 
                onPress={() => setIsAddModalVisible(false)}
              >
                <X color={isDark ? '#8E8E93' : '#64748B'} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 24 }}>
              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>COACH FULL NAME *</Text>
                <TextInput
                  style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="e.g. Khabib Nurmagomedov"
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>ROLE TITLE *</Text>
                <TextInput
                  style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="e.g. Head MMA & Grappling Coach"
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={role}
                  onChangeText={setRole}
                />
              </View>

              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>SPECIALTY DISCIPLINE *</Text>
                <TextInput
                  style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="e.g. Sambo, BJJ Black Belt, Wrestling"
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={specialty}
                  onChangeText={setSpecialty}
                />
              </View>

              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>YEARS OF EXPERIENCE *</Text>
                <TextInput
                  style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="e.g. 10+ Years"
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={experience}
                  onChangeText={setExperience}
                />
              </View>

              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>BIOGRAPHY & CREDENTIALS *</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="Brief background and accomplishments..."
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>AVATAR PHOTO URL (OPTIONAL)</Text>
                <TextInput
                  style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="https://..."
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity 
                style={[
                  styles.submitBtn,
                  (!name.trim() || !role.trim() || !specialty.trim() || addTrainerMutation.isPending) && styles.submitBtnDisabled
                ]}
                disabled={!name.trim() || !role.trim() || !specialty.trim() || addTrainerMutation.isPending}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  addTrainerMutation.mutate({
                    name: name.trim(),
                    role: role.trim(),
                    specialty: specialty.trim(),
                    experience: experience.trim() || '2+ Years',
                    bio: bio.trim() || 'Certified fitness & combat instructor.',
                    imageUrl: imageUrl.trim() || undefined
                  });
                }}
              >
                {addTrainerMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Plus color="#FFFFFF" size={18} />
                    <Text style={styles.submitBtnText}>Add Coach to Roster</Text>
                  </>
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
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)'
  },
  headerBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  btnDark: { backgroundColor: '#161B22', borderWidth: 1, borderColor: '#30363D' },
  btnLight: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  addBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#d96638', alignItems: 'center', justifyContent: 'center' },

  scrollContent: { padding: 20, gap: 16 },

  card: { padding: 18, borderRadius: 24, borderWidth: 1 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },

  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileRow: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarPlaceholder: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(217, 102, 56, 0.15)', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 20, fontWeight: '800', color: '#d96638' },
  name: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(217, 102, 56, 0.12)' },
  roleText: { color: '#d96638', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  deleteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(239, 68, 68, 0.1)', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },

  divider: { height: 1, marginVertical: 14 },
  dividerDark: { backgroundColor: '#30363D' },
  dividerLight: { backgroundColor: '#F1F5F9' },

  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  metaLabel: { fontSize: 12, fontWeight: '600' },
  metaVal: { fontSize: 13, fontWeight: '700', flexShrink: 1 },

  bioText: { fontSize: 13, lineHeight: 18, marginTop: 10 },

  emptyState: { padding: 36, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  emptyAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#d96638', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14 },
  emptyAddText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '88%' },
  modalDark: { backgroundColor: '#161B22' },
  modalLight: { backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  closeBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(150,150,150,0.1)' },

  formLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
  formInput: { height: 48, borderRadius: 14, paddingHorizontal: 14, fontSize: 15, borderWidth: 1 },
  textArea: { height: 80, paddingTop: 12, textAlignVertical: 'top' },
  inputDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  inputLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#d96638', height: 50, borderRadius: 16, marginTop: 12 },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
});

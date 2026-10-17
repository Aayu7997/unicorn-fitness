import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Switch,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import {
  Megaphone,
  ChevronLeft,
  Save,
  Globe,
  Smartphone,
  Sparkles,
  HelpCircle,
  Star,
  Trash2,
  Plus,
  Check,
  X,
  MessageSquare,
} from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useUIStore } from '../../store/useUIStore';
import { Skeleton } from '../../components/ui/Skeleton';

export default function AdminContent() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { scrollInset } = useAppBottomInset();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<'config' | 'faqs' | 'testimonials'>('config');

  // --- Site Config State ---
  const [heroTitle, setHeroTitle] = useState('UNLEASH YOUR INNER FIGHTER');
  const [heroSubtitle, setHeroSubtitle] = useState('World-class MMA training, Brazilian Jiu-Jitsu, and elite strength & conditioning.');
  const [bannerNotice, setBannerNotice] = useState('Special Offer: Get 20% off all quarterly memberships this week!');
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const [allowAppRegistration, setAllowAppRegistration] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showTestimonials, setShowTestimonials] = useState(true);

  // --- FAQ State ---
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  // --- Queries ---
  const { data: contentData, isLoading: isContentLoading } = useQuery({
    queryKey: ['admin-site-content'],
    queryFn: async () => {
      const res = await api.get('/admin/site-content');
      return res.data;
    },
  });

  const { data: faqs = [], isLoading: isFaqsLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: async () => {
      const res = await api.get('/admin/faqs');
      return res.data || [];
    },
    enabled: activeTab === 'faqs',
  });

  const { data: testimonials = [], isLoading: isTestimonialsLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: async () => {
      const res = await api.get('/admin/testimonials');
      return res.data || [];
    },
    enabled: activeTab === 'testimonials',
  });

  useEffect(() => {
    if (contentData) {
      if (contentData.heroTitle) setHeroTitle(contentData.heroTitle);
      if (contentData.heroSubtitle) setHeroSubtitle(contentData.heroSubtitle);
      if (contentData.bannerNotice) setBannerNotice(contentData.bannerNotice);
      if (contentData.showPromoBanner !== undefined) setShowPromoBanner(contentData.showPromoBanner);
      if (contentData.allowAppRegistration !== undefined) setAllowAppRegistration(contentData.allowAppRegistration);
      if (contentData.maintenanceMode !== undefined) setMaintenanceMode(contentData.maintenanceMode);
      if (contentData.showTestimonials !== undefined) setShowTestimonials(contentData.showTestimonials);
    }
  }, [contentData]);

  // --- Mutations ---
  const saveContentMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.put('/admin/site-content', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-site-content'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Site content and config updated', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to update site content', 'error');
    },
  });

  const createFaqMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/admin/faqs', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setShowFaqModal(false);
      setFaqQuestion('');
      setFaqAnswer('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('FAQ added successfully', 'success');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.error || 'Failed to add FAQ', 'error');
    },
  });

  const deleteFaqMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/faqs/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('FAQ deleted', 'success');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.error || 'Failed to delete FAQ', 'error');
    },
  });

  const toggleTestimonialMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const res = await api.put(`/admin/testimonials/${id}`, { approved });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Testimonial status updated', 'success');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.error || 'Failed to update testimonial', 'error');
    },
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/testimonials/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Testimonial removed', 'success');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.error || 'Failed to delete testimonial', 'error');
    },
  });

  const handleSaveConfig = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    saveContentMutation.mutate({
      heroTitle,
      heroSubtitle,
      bannerNotice,
      showPromoBanner,
      allowAppRegistration,
      maintenanceMode,
      showTestimonials,
    });
  };

  const handleCreateFaq = () => {
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      showToast('Please provide both question and answer', 'error');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createFaqMutation.mutate({
      question: faqQuestion.trim(),
      answer: faqAnswer.trim(),
      sortOrder: faqs.length + 1,
      active: true,
    });
  };

  const handleDeleteFaq = (id: string) => {
    Alert.alert('Delete FAQ', 'Are you sure you want to delete this FAQ?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          deleteFaqMutation.mutate(id);
        },
      },
    ]);
  };

  const handleDeleteTestimonial = (id: string) => {
    Alert.alert('Delete Testimonial', 'Are you sure you want to remove this testimonial?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          deleteTestimonialMutation.mutate(id);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.headerBtn, isDark ? styles.btnDark : styles.btnLight]}
          activeOpacity={0.7}
        >
          <ChevronLeft color={isDark ? '#FFF' : '#000'} size={24} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>
            Site & Governance
          </Text>
          <Text style={[styles.headerSubtitle, isDark ? styles.textGray : styles.textSlate]}>
            CMS, FAQs & Member Stories
          </Text>
        </View>

        {activeTab === 'config' ? (
          <TouchableOpacity
            onPress={handleSaveConfig}
            disabled={saveContentMutation.isPending}
            style={[styles.saveBtn, saveContentMutation.isPending && { opacity: 0.5 }]}
            activeOpacity={0.7}
          >
            {saveContentMutation.isPending ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Save color="#FFF" size={20} />
            )}
          </TouchableOpacity>
        ) : activeTab === 'faqs' ? (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowFaqModal(true);
            }}
            style={styles.saveBtn}
            activeOpacity={0.7}
          >
            <Plus color="#FFF" size={20} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 42 }} />
        )}
      </View>

      {/* Segmented Tab Selector */}
      <View style={styles.segmentContainer}>
        {(
          [
            { id: 'config', label: 'Site Config' },
            { id: 'faqs', label: `FAQs (${faqs.length})` },
            { id: 'testimonials', label: `Stories (${testimonials.length})` },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab(tab.id);
              }}
              style={[
                styles.segmentTab,
                isActive && (isDark ? styles.segmentActiveDark : styles.segmentActiveLight),
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentText,
                  isActive
                    ? isDark
                      ? styles.textWhite
                      : styles.textBlack
                    : isDark
                    ? styles.textGray
                    : styles.textSlate,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollInset }]}
        showsVerticalScrollIndicator={false}
      >
        {/* TAB 1: SITE CONFIG */}
        {activeTab === 'config' && (
          <>
            {isContentLoading ? (
              <View style={{ gap: 16 }}>
                <Skeleton width="100%" height={160} borderRadius={24} isDark={isDark} />
                <Skeleton width="100%" height={160} borderRadius={24} isDark={isDark} />
              </View>
            ) : (
              <>
                {/* Landing Hero Copy */}
                <Animated.View
                  entering={FadeInDown.duration(260)}
                  style={[styles.section, isDark ? styles.cardDark : styles.cardLight]}
                >
                  <View style={styles.sectionHeader}>
                    <Sparkles color="#d96638" size={20} />
                    <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
                      Landing Hero Copy
                    </Text>
                  </View>

                  <View style={{ gap: 14 }}>
                    <View>
                      <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>
                        HERO HEADLINE
                      </Text>
                      <TextInput
                        style={[
                          styles.formInput,
                          isDark ? styles.inputDark : styles.inputLight,
                          isDark ? styles.textWhite : styles.textBlack,
                        ]}
                        value={heroTitle}
                        onChangeText={setHeroTitle}
                        placeholder="Headline text..."
                        placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                      />
                    </View>

                    <View>
                      <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>
                        SUBTITLE & MISSION
                      </Text>
                      <TextInput
                        style={[
                          styles.formInput,
                          styles.textArea,
                          isDark ? styles.inputDark : styles.inputLight,
                          isDark ? styles.textWhite : styles.textBlack,
                        ]}
                        value={heroSubtitle}
                        onChangeText={setHeroSubtitle}
                        placeholder="Subtitle text..."
                        placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                        multiline
                      />
                    </View>

                    <View>
                      <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>
                        ANNOUNCEMENT BANNER TEXT
                      </Text>
                      <TextInput
                        style={[
                          styles.formInput,
                          isDark ? styles.inputDark : styles.inputLight,
                          isDark ? styles.textWhite : styles.textBlack,
                        ]}
                        value={bannerNotice}
                        onChangeText={setBannerNotice}
                        placeholder="Notice text..."
                        placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                      />
                    </View>
                  </View>
                </Animated.View>

                {/* Global Toggles */}
                <Animated.View
                  entering={FadeInDown.delay(100).duration(260)}
                  style={[styles.section, isDark ? styles.cardDark : styles.cardLight]}
                >
                  <View style={styles.sectionHeader}>
                    <Globe color="#d96638" size={20} />
                    <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
                      Global Visibility Toggles
                    </Text>
                  </View>

                  <View style={styles.settingRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={[styles.settingTitle, isDark ? styles.textWhite : styles.textBlack]}>
                        Promotional Banner
                      </Text>
                      <Text style={[styles.settingDesc, isDark ? styles.textGray : styles.textSlate]}>
                        Display banner across top header ribbons.
                      </Text>
                    </View>
                    <Switch
                      value={showPromoBanner}
                      onValueChange={(val) => {
                        Haptics.selectionAsync();
                        setShowPromoBanner(val);
                      }}
                      trackColor={{ false: isDark ? '#263040' : '#CBD5E1', true: '#d96638' }}
                      thumbColor={Platform.OS === 'android' ? (showPromoBanner ? '#FFFFFF' : (isDark ? '#94A3B8' : '#FFFFFF')) : undefined}
                      ios_backgroundColor={isDark ? '#263040' : '#CBD5E1'}
                    />
                  </View>

                  <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

                  <View style={styles.settingRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={[styles.settingTitle, isDark ? styles.textWhite : styles.textBlack]}>
                        Member Testimonials
                      </Text>
                      <Text style={[styles.settingDesc, isDark ? styles.textGray : styles.textSlate]}>
                        Show approved member stories on public web pages.
                      </Text>
                    </View>
                    <Switch
                      value={showTestimonials}
                      onValueChange={(val) => {
                        Haptics.selectionAsync();
                        setShowTestimonials(val);
                      }}
                      trackColor={{ false: isDark ? '#263040' : '#CBD5E1', true: '#d96638' }}
                      thumbColor={Platform.OS === 'android' ? (showTestimonials ? '#FFFFFF' : (isDark ? '#94A3B8' : '#FFFFFF')) : undefined}
                      ios_backgroundColor={isDark ? '#263040' : '#CBD5E1'}
                    />
                  </View>
                </Animated.View>

                {/* App Access & Maintenance */}
                <Animated.View
                  entering={FadeInDown.delay(200).duration(260)}
                  style={[styles.section, isDark ? styles.cardDark : styles.cardLight]}
                >
                  <View style={styles.sectionHeader}>
                    <Smartphone color="#d96638" size={20} />
                    <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
                      Platform Governance
                    </Text>
                  </View>

                  <View style={styles.settingRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={[styles.settingTitle, isDark ? styles.textWhite : styles.textBlack]}>
                        Allow User Registrations
                      </Text>
                      <Text style={[styles.settingDesc, isDark ? styles.textGray : styles.textSlate]}>
                        Permit self-serve member account creation.
                      </Text>
                    </View>
                    <Switch
                      value={allowAppRegistration}
                      onValueChange={(val) => {
                        Haptics.selectionAsync();
                        setAllowAppRegistration(val);
                      }}
                      trackColor={{ false: isDark ? '#263040' : '#CBD5E1', true: '#10B981' }}
                      thumbColor={Platform.OS === 'android' ? (allowAppRegistration ? '#FFFFFF' : (isDark ? '#94A3B8' : '#FFFFFF')) : undefined}
                      ios_backgroundColor={isDark ? '#263040' : '#CBD5E1'}
                    />
                  </View>

                  <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

                  <View style={styles.settingRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={[styles.settingTitle, isDark ? styles.textWhite : styles.textBlack]}>
                        Maintenance Mode
                      </Text>
                      <Text style={[styles.settingDesc, isDark ? styles.textGray : styles.textSlate]}>
                        Display scheduled maintenance message to non-admins.
                      </Text>
                    </View>
                    <Switch
                      value={maintenanceMode}
                      onValueChange={(val) => {
                        Haptics.selectionAsync();
                        setMaintenanceMode(val);
                      }}
                      trackColor={{ false: isDark ? '#263040' : '#CBD5E1', true: '#EF4444' }}
                      thumbColor={Platform.OS === 'android' ? (maintenanceMode ? '#FFFFFF' : (isDark ? '#94A3B8' : '#FFFFFF')) : undefined}
                      ios_backgroundColor={isDark ? '#263040' : '#CBD5E1'}
                    />
                  </View>
                </Animated.View>
              </>
            )}
          </>
        )}

        {/* TAB 2: FAQS CMS */}
        {activeTab === 'faqs' && (
          <View style={{ gap: 14 }}>
            {isFaqsLoading ? (
              <ActivityIndicator color="#d96638" style={{ paddingVertical: 40 }} />
            ) : faqs.length === 0 ? (
              <View style={[styles.section, isDark ? styles.cardDark : styles.cardLight, { alignItems: 'center', paddingVertical: 40 }]}>
                <HelpCircle color={isDark ? '#475569' : '#94A3B8'} size={44} style={{ marginBottom: 12 }} />
                <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
                  No FAQ Articles
                </Text>
                <Text style={[{ textAlign: 'center', marginTop: 4, fontSize: 13 }, isDark ? styles.textGray : styles.textSlate]}>
                  Tap the '+' button above to create common questions for gym members.
                </Text>
              </View>
            ) : (
              faqs.map((faq: any) => (
                <View
                  key={faq.id}
                  style={[styles.faqCard, isDark ? styles.cardDark : styles.cardLight]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <Text style={[styles.faqQ, isDark ? styles.textWhite : styles.textBlack, { flex: 1 }]}>
                      {faq.question}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteFaq(faq.id)}
                      style={[styles.iconActionBtn, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2' }]}
                      activeOpacity={0.7}
                    >
                      <Trash2 color="#EF4444" size={16} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.faqA, isDark ? styles.textGray : styles.textSlate]}>
                    {faq.answer}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <View style={[styles.badgePill, { backgroundColor: faq.active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)' }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: faq.active ? '#10B981' : '#64748B' }}>
                        {faq.active ? 'Active' : 'Draft'}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: isDark ? '#64748B' : '#94A3B8' }}>
                      Order: #{faq.sortOrder}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 3: TESTIMONIALS */}
        {activeTab === 'testimonials' && (
          <View style={{ gap: 14 }}>
            {isTestimonialsLoading ? (
              <ActivityIndicator color="#d96638" style={{ paddingVertical: 40 }} />
            ) : testimonials.length === 0 ? (
              <View style={[styles.section, isDark ? styles.cardDark : styles.cardLight, { alignItems: 'center', paddingVertical: 40 }]}>
                <Star color={isDark ? '#475569' : '#94A3B8'} size={44} style={{ marginBottom: 12 }} />
                <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
                  No Member Stories
                </Text>
                <Text style={[{ textAlign: 'center', marginTop: 4, fontSize: 13 }, isDark ? styles.textGray : styles.textSlate]}>
                  Member testimonials and transformation reviews will appear here.
                </Text>
              </View>
            ) : (
              testimonials.map((t: any) => (
                <View
                  key={t.id}
                  style={[styles.testimonialCard, isDark ? styles.cardDark : styles.cardLight]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                      <Text style={[styles.tName, isDark ? styles.textWhite : styles.textBlack]}>
                        {t.name}
                      </Text>
                      <Text style={[styles.tRole, isDark ? styles.textGray : styles.textSlate]}>
                        {t.role} {t.location ? `• ${t.location}` : ''}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.selectionAsync();
                          toggleTestimonialMutation.mutate({ id: t.id, approved: !t.approved });
                        }}
                        style={[
                          styles.iconActionBtn,
                          {
                            backgroundColor: t.approved
                              ? isDark
                                ? 'rgba(16, 185, 129, 0.15)'
                                : '#D1FAE5'
                              : isDark
                              ? 'rgba(245, 158, 11, 0.15)'
                              : '#FEF3C7',
                          },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Check color={t.approved ? '#10B981' : '#F59E0B'} size={16} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteTestimonial(t.id)}
                        style={[styles.iconActionBtn, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2' }]}
                        activeOpacity={0.7}
                      >
                        <Trash2 color="#EF4444" size={16} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={[styles.tContent, isDark ? styles.textWhite : styles.textBlack]}>
                    "{t.content}"
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          color={s <= (t.rating || 5) ? '#F59E0B' : '#64748B'}
                          fill={s <= (t.rating || 5) ? '#F59E0B' : 'transparent'}
                          size={14}
                        />
                      ))}
                    </View>
                    <View
                      style={[
                        styles.badgePill,
                        { backgroundColor: t.approved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)' },
                      ]}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: t.approved ? '#10B981' : '#F59E0B' }}>
                        {t.approved ? 'Published' : 'Pending Review'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* CREATE FAQ MODAL */}
      <Modal visible={showFaqModal} transparent animationType="slide" onRequestClose={() => setShowFaqModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, isDark ? styles.modalDark : styles.modalLight]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>
                Add New FAQ
              </Text>
              <TouchableOpacity onPress={() => setShowFaqModal(false)} style={styles.modalCloseBtn}>
                <X color={isDark ? '#FFF' : '#000'} size={20} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 14 }}>
              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>QUESTION</Text>
                <TextInput
                  style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="e.g., What are the gym open hours?"
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={faqQuestion}
                  onChangeText={setFaqQuestion}
                />
              </View>

              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>ANSWER</Text>
                <TextInput
                  style={[styles.formInput, { height: 90, textAlignVertical: 'top', paddingTop: 12 }, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="Detailed answer for members..."
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={faqAnswer}
                  onChangeText={setFaqAnswer}
                  multiline
                />
              </View>

              <TouchableOpacity
                onPress={handleCreateFaq}
                disabled={createFaqMutation.isPending}
                style={[styles.submitBtn, createFaqMutation.isPending && { opacity: 0.6 }]}
                activeOpacity={0.8}
              >
                {createFaqMutation.isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Publish FAQ</Text>
                )}
              </TouchableOpacity>
            </View>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  headerBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  btnDark: { backgroundColor: '#161B22', borderWidth: 1, borderColor: '#30363D' },
  btnLight: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  headerSubtitle: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  saveBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#d96638', alignItems: 'center', justifyContent: 'center' },

  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 6,
    padding: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActiveDark: {
    backgroundColor: '#161B22',
  },
  segmentActiveLight: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
  },

  scrollContent: { padding: 20, gap: 16 },

  section: { padding: 20, borderRadius: 24, borderWidth: 1 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '800' },

  formLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  formInput: { height: 48, borderRadius: 14, paddingHorizontal: 14, fontSize: 15, borderWidth: 1 },
  textArea: { height: 72, paddingTop: 12, textAlignVertical: 'top' },
  inputDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  inputLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },

  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  settingTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  settingDesc: { fontSize: 13, lineHeight: 18 },

  divider: { height: 1, marginVertical: 12 },
  dividerDark: { backgroundColor: '#30363D' },
  dividerLight: { backgroundColor: '#F1F5F9' },

  faqCard: { padding: 18, borderRadius: 20, borderWidth: 1, gap: 8 },
  faqQ: { fontSize: 15, fontWeight: '700', lineHeight: 21 },
  faqA: { fontSize: 13, lineHeight: 19 },

  testimonialCard: { padding: 18, borderRadius: 20, borderWidth: 1, gap: 8 },
  tName: { fontSize: 16, fontWeight: '800' },
  tRole: { fontSize: 12, marginTop: 1 },
  tContent: { fontSize: 14, lineHeight: 20, fontStyle: 'italic', marginTop: 4 },

  badgePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
  iconActionBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBox: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 16 },
  modalDark: { backgroundColor: '#161B22' },
  modalLight: { backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  submitBtn: { height: 50, borderRadius: 16, backgroundColor: '#d96638', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
});

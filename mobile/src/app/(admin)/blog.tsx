import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, TextInput, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, Alert, Image, Switch } from 'react-native';
import { BookOpen, ChevronLeft, Plus, Trash2, X, Eye, EyeOff, Tag, Image as ImageIcon, CheckCircle2 } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useUIStore } from '../../store/useUIStore';
import { Skeleton } from '../../components/ui/Skeleton';

export default function AdminBlog() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { scrollInset } = useAppBottomInset();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [tagsStr, setTagsStr] = useState('Training, MMA, Conditioning');
  const [published, setPublished] = useState(true);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-blog'],
    queryFn: async () => {
      const res = await api.get('/admin/blog');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const posts = data || [];

  const createPostMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/admin/blog', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
      setIsModalOpen(false);
      setTitle('');
      setExcerpt('');
      setContent('');
      setCoverUrl('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Article published successfully!', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to publish article', 'error');
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/blog/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Article deleted', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to delete article', 'error');
    }
  });

  const handleDelete = (id: string, postTitle: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Article',
      `Are you sure you want to delete "${postTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deletePostMutation.mutate(id)
        }
      ]
    );
  };

  const handleCreate = () => {
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      showToast('Title, excerpt, and content body are required', 'error');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `post-${Date.now()}`;

    const tags = tagsStr
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    createPostMutation.mutate({
      title: title.trim(),
      slug,
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverUrl: coverUrl.trim() || undefined,
      published,
      author: 'UFC Gym Coaching Team',
      tags,
    });
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
          <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Blog & Editorial</Text>
          <Text style={[styles.headerSubtitle, isDark ? styles.textGray : styles.textSlate]}>
            {posts.length} {posts.length === 1 ? 'Article' : 'Articles'} Published
          </Text>
        </View>

        <TouchableOpacity 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsModalOpen(true);
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
            <Skeleton width="100%" height={180} borderRadius={24} isDark={isDark} />
            <Skeleton width="100%" height={180} borderRadius={24} isDark={isDark} />
          </View>
        ) : posts.length > 0 ? (
          posts.map((post: any, index: number) => (
            <Animated.View 
              key={post.id || index} 
              entering={FadeInDown.delay(index * 60).duration(260)} 
              style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
            >
              {post.coverUrl ? (
                <View style={styles.coverWrap}>
                  <Image source={{ uri: post.coverUrl }} style={styles.coverImage} resizeMode="cover" />
                  <View style={[styles.statusBadge, post.published ? styles.badgePublished : styles.badgeDraft]}>
                    <Text style={styles.badgeText}>{post.published ? 'Published' : 'Draft'}</Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.cardBody}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={[styles.postTitle, isDark ? styles.textWhite : styles.textBlack]} numberOfLines={2}>
                    {post.title}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => handleDelete(post.id, post.title)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 color="#EF4444" size={17} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.postExcerpt, isDark ? styles.textGray : styles.textSlate]} numberOfLines={2}>
                  {post.excerpt}
                </Text>

                {/* Tags */}
                {post.tags && post.tags.length > 0 ? (
                  <View style={styles.tagsRow}>
                    {post.tags.slice(0, 3).map((t: string, i: number) => (
                      <View key={i} style={styles.tagPill}>
                        <Text style={styles.tagText}>#{t}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                <View style={styles.cardFooter}>
                  <Text style={[styles.authorText, isDark ? styles.textGray : styles.textSlate]}>
                    By {post.author || 'UFC Coach'}
                  </Text>
                  <Text style={[styles.dateText, isDark ? styles.textGray : styles.textSlate]}>
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))
        ) : (
          <Animated.View entering={FadeInDown.duration(260)} style={[styles.emptyState, isDark ? styles.cardDark : styles.cardLight]}>
            <BookOpen color="#d96638" size={44} style={{ marginBottom: 14 }} />
            <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textBlack]}>No Articles Published</Text>
            <Text style={[styles.emptyDesc, isDark ? styles.textGray : styles.textSlate]}>
              Publish training curriculums, combat prep tips, and gym announcements to the public blog.
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Creation Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, isDark ? styles.modalDark : styles.modalLight]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <BookOpen color="#d96638" size={24} />
                <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>New Article</Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.closeBtn}>
                <X color={isDark ? '#8E8E93' : '#64748B'} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 24 }}>
              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>ARTICLE TITLE *</Text>
                <TextInput
                  style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="e.g. 5 Core Drills for Heavybag Power"
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>SHORT EXCERPT *</Text>
                <TextInput
                  style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="Brief 1-sentence teaser..."
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={excerpt}
                  onChangeText={setExcerpt}
                />
              </View>

              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>TAGS (COMMA SEPARATED)</Text>
                <TextInput
                  style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="Boxing, Sparring, Nutrition"
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={tagsStr}
                  onChangeText={setTagsStr}
                />
              </View>

              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>COVER IMAGE URL (OPTIONAL)</Text>
                <TextInput
                  style={[styles.formInput, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="https://images.unsplash.com/..."
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={coverUrl}
                  onChangeText={setCoverUrl}
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text style={[styles.formLabel, isDark ? styles.textGray : styles.textSlate]}>CONTENT BODY *</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="Write full article content..."
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={content}
                  onChangeText={setContent}
                  multiline
                  numberOfLines={6}
                />
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.switchTitle, isDark ? styles.textWhite : styles.textBlack]}>Publish Immediately</Text>
                  <Text style={[styles.switchSub, isDark ? styles.textGray : styles.textSlate]}>Make visible on gym website & member app</Text>
                </View>
                <Switch 
                  value={published}
                  onValueChange={(val) => {
                    Haptics.selectionAsync();
                    setPublished(val);
                  }}
                  trackColor={{ false: isDark ? '#263040' : '#CBD5E1', true: '#10B981' }}
                  thumbColor={Platform.OS === 'android' ? (published ? '#FFFFFF' : (isDark ? '#94A3B8' : '#FFFFFF')) : undefined}
                  ios_backgroundColor={isDark ? '#263040' : '#CBD5E1'}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!title.trim() || !excerpt.trim() || !content.trim() || createPostMutation.isPending) && styles.submitBtnDisabled
                ]}
                disabled={!title.trim() || !excerpt.trim() || !content.trim() || createPostMutation.isPending}
                onPress={handleCreate}
              >
                {createPostMutation.isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <BookOpen color="#FFF" size={18} />
                    <Text style={styles.submitBtnText}>Publish to Blog</Text>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)'
  },
  headerBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  btnDark: { backgroundColor: '#161B22', borderWidth: 1, borderColor: '#30363D' },
  btnLight: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  headerSubtitle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  addBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#d96638', alignItems: 'center', justifyContent: 'center' },

  scrollContent: { padding: 20, gap: 16 },

  card: { borderRadius: 22, borderWidth: 1, overflow: 'hidden' },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },

  coverWrap: { height: 160, width: '100%', position: 'relative' },
  coverImage: { width: '100%', height: '100%' },
  statusBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgePublished: { backgroundColor: 'rgba(16, 185, 129, 0.9)' },
  badgeDraft: { backgroundColor: 'rgba(245, 158, 11, 0.9)' },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

  cardBody: { padding: 18 },
  postTitle: { fontSize: 17, fontWeight: '800', flex: 1, marginBottom: 6 },
  postExcerpt: { fontSize: 13, lineHeight: 19, marginBottom: 12 },

  deleteBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(239, 68, 68, 0.1)', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tagPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: 'rgba(217, 102, 56, 0.12)' },
  tagText: { color: '#d96638', fontSize: 11, fontWeight: '700' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(150,150,150,0.1)' },
  authorText: { fontSize: 12, fontWeight: '600' },
  dateText: { fontSize: 12, fontWeight: '500' },

  emptyState: { padding: 36, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18, paddingHorizontal: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '88%' },
  modalDark: { backgroundColor: '#161B22' },
  modalLight: { backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  closeBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(150,150,150,0.1)' },

  formLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  formInput: { height: 48, borderRadius: 14, paddingHorizontal: 14, fontSize: 15, borderWidth: 1 },
  textArea: { height: 110, paddingTop: 12, textAlignVertical: 'top' },
  inputDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  inputLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },

  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  switchTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  switchSub: { fontSize: 12 },

  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#d96638', height: 50, borderRadius: 16, marginTop: 12 },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
});

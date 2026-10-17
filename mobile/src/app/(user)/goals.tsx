import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, TextInput, ActivityIndicator } from 'react-native';
import { Award, Target, Brain, ChevronLeft, Loader2, Info } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { api } from '../../lib/api';
import { useUIStore } from '../../store/useUIStore';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';

export default function Goals() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { insets, scrollInset } = useAppBottomInset();
  const { showToast } = useUIStore();
  
  const [newWeight, setNewWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [insights, setInsights] = useState('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const handleLogProgress = async () => {
    if (!newWeight) return;
    setIsSubmitting(true);
    try {
      await api.post('/user/progress', { weight: newWeight });
      showToast('Progress logged successfully!', 'success');
      setNewWeight('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast('Failed to log progress.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const res = await api.post('/ai/health-insights', {
        age: (user as any)?.age || 30,
        weight: (user as any)?.weight || 75,
        height: (user as any)?.height || 180,
        goals: 'General Fitness'
      });
      if (res.data.success) {
        setInsights(res.data.insights);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        showToast(res.data.error || 'Failed to analyze.', 'error');
      }
    } catch (err) {
      showToast('Network error while reaching AI.', 'error');
    } finally {
      setIsLoadingInsights(false);
    }
  };

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={isDark ? '#FFF' : '#000'} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Goal Tracking</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollInset }]}>
        <Animated.View entering={FadeInDown.delay(100).duration(260)}>
          <Text style={[styles.pageSubtitle, isDark ? styles.textGray : styles.textSlate]}>
            Monitor your progress and get AI-powered health insights.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(260)} style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
             <View style={styles.iconCircle}>
               <Target color="#d96638" size={24} />
             </View>
             <Text style={[styles.cardTitle, isDark ? styles.textWhite : styles.textBlack]}>Log Body Weight</Text>
           </View>
           <View style={styles.inputRow}>
             <TextInput 
               style={[styles.input, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
               placeholder="Enter weight in kg"
               placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
               keyboardType="numeric"
               value={newWeight}
               onChangeText={setNewWeight}
             />
             <TouchableOpacity style={styles.saveButton} onPress={handleLogProgress} disabled={isSubmitting}>
               {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Save</Text>}
             </TouchableOpacity>
           </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(260)} style={[styles.card, isDark ? styles.cardDark : styles.cardLight, { overflow: 'hidden' }]}>
           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
             <View style={[styles.iconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
               <Brain color="#6366F1" size={24} />
             </View>
             <Text style={[styles.cardTitle, isDark ? styles.textWhite : styles.textBlack]}>AI Health Insights</Text>
           </View>
           
           {!insights ? (
             <TouchableOpacity style={styles.aiButton} onPress={fetchInsights} disabled={isLoadingInsights}>
               {isLoadingInsights ? <ActivityIndicator color="#FFF" /> : <Text style={styles.aiButtonText}>Generate AI Insights</Text>}
             </TouchableOpacity>
           ) : (
             <View style={styles.insightsBox}>
               <Text style={styles.insightsText}>{insights}</Text>
             </View>
           )}
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgDark: { backgroundColor: '#0D1117' },
  bgLight: { backgroundColor: '#F4F7F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  scrollContent: { padding: 20 },
  
  pageSubtitle: { fontSize: 15, marginBottom: 24 },
  
  card: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 20 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(217, 102, 56, 0.1)', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '800' },
  
  inputRow: { flexDirection: 'row', gap: 12 },
  input: { flex: 1, height: 56, borderRadius: 16, paddingHorizontal: 20, fontSize: 16, borderWidth: 1 },
  inputDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  inputLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  saveButton: { height: 56, paddingHorizontal: 24, backgroundColor: '#d96638', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  
  aiButton: { height: 56, backgroundColor: '#6366F1', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  aiButtonText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  insightsBox: { padding: 16, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.2)' },
  insightsText: { color: '#E0E7FF', fontSize: 15, lineHeight: 24 },
  
  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
});

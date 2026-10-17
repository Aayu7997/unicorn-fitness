import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, useColorScheme, ActivityIndicator, Image, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Utensils, Flame, CheckCircle2, Circle, Bot, Image as ImageIcon, Compass, Plus, X, Calendar, Clock, User } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { RefreshControl } from 'react-native';
import { Skeleton } from '../../components/ui/Skeleton';
import { router } from 'expo-router';
import { useUIStore } from '../../store/useUIStore';

import { useAppBottomInset } from '../../hooks/useAppBottomInset';

const { width } = Dimensions.get('window');

// Soft pastel circular gauge
const CircularGauge = ({ percentage, radius, strokeWidth, color, bgColor }: { percentage: number, radius: number, strokeWidth: number, color: string, bgColor: string }) => {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <View style={{ width: radius * 2 + strokeWidth, height: radius * 2 + strokeWidth, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth} viewBox={`0 0 ${radius * 2 + strokeWidth} ${radius * 2 + strokeWidth}`}>
        <SvgCircle
          cx={(radius * 2 + strokeWidth) / 2}
          cy={(radius * 2 + strokeWidth) / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <SvgCircle
          cx={(radius * 2 + strokeWidth) / 2}
          cy={(radius * 2 + strokeWidth) / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${(radius * 2 + strokeWidth) / 2} ${(radius * 2 + strokeWidth) / 2})`}
        />
      </Svg>
    </View>
  );
};

export default function UserAdvisory() {
  const [activeTab, setActiveTab] = useState<'diet' | 'workout' | 'consultations'>('diet');
  const [completedLines, setCompletedLines] = useState<number[]>([]);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [advisor, setAdvisor] = useState('Head Coach Carter');

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { insets, scrollInset, fixedActionBottom } = useAppBottomInset();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  const { data: plansData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['userPlans'],
    queryFn: async () => {
      const response = await api.get('/user/plans');
      return response.data;
    },
    refetchInterval: 5000,
  });

  const { data: advisorySessions = [], isLoading: isAdvisoryLoading, refetch: refetchAdvisory, isRefetching: isAdvisoryRefetching } = useQuery({
    queryKey: ['userAdvisory'],
    queryFn: async () => {
      const response = await api.get('/user/advisory');
      return Array.isArray(response.data) ? response.data : [];
    },
    refetchInterval: 5000,
  });

  const bookSessionMutation = useMutation({
    mutationFn: async (payload: { topic: string; advisor: string }) => {
      const response = await api.post('/user/advisory', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAdvisory'] });
      queryClient.invalidateQueries({ queryKey: ['adminAdvisory'] });
      setIsBookModalOpen(false);
      setTopic('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('1-on-1 Consultation booked with coach!', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to book consultation', 'error');
    }
  });


  React.useEffect(() => {
    const loadCompleted = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const data = await AsyncStorage.getItem(`workout_${today}`);
        if (data) setCompletedLines(JSON.parse(data));
      } catch (e) {}
    };
    loadCompleted();
  }, []);

  const toggleLine = async (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    let newCompleted;
    if (completedLines.includes(index)) {
      newCompleted = completedLines.filter(i => i !== index);
    } else {
      newCompleted = [...completedLines, index];
    }
    setCompletedLines(newCompleted);
    try {
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(`workout_${today}`, JSON.stringify(newCompleted));
    } catch (e) {}
  };

  const dietData = plansData?.diet;
  const isDietObj = typeof dietData === 'object' && dietData !== null;
  const dietLines = isDietObj ? [] : (dietData || '').split('\n').filter((l: string) => l.trim().length > 0);

  const workoutData = plansData?.workout;
  const isWorkoutObj = typeof workoutData === 'object' && workoutData !== null;
  const workoutLines = isWorkoutObj ? [] : (workoutData || '').split('\n').filter((l: string) => l.trim().length > 0);

  const renderDietTab = () => (
    <Animated.ScrollView 
      entering={FadeInDown.duration(400)} 
      contentContainerStyle={[styles.tabContent, { paddingBottom: scrollInset }]} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={isDark ? '#FFFFFF' : '#3A4C56'}
        />
      }
    >


      {/* Diet Plan Guidelines */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>Diet Guidelines</Text>
      </View>
      
      {isLoading && !isRefetching ? (
        <View style={{ gap: 12 }}>
          <Skeleton width="100%" height={70} borderRadius={20} isDark={isDark} />
          <Skeleton width="100%" height={70} borderRadius={20} isDark={isDark} />
          <Skeleton width="100%" height={70} borderRadius={20} isDark={isDark} />
        </View>
      ) : dietLines.length === 0 ? (
        <Animated.View entering={FadeInDown.duration(260)} style={[styles.emptyStateCard, isDark ? styles.bgDarker : { backgroundColor: '#FFFFFF' }]}>
          <View style={[styles.emptyIconWrapper, { backgroundColor: isDark ? 'rgba(217,102,56,0.1)' : 'rgba(217,102,56,0.05)' }]}>
             <Utensils color="#d96638" size={32} />
          </View>
          <Text style={[styles.emptyStateTitle, isDark ? styles.textWhite : styles.textBlack]}>No diet plan found</Text>
          <Text style={[styles.emptyStateSub, isDark ? styles.textGray : styles.textSlate]}>
            Your coach hasn't assigned a nutrition plan yet. Check back later or message support.
          </Text>
          <TouchableOpacity 
            style={[styles.stickyButton, { marginTop: 20, width: '100%', flexDirection: 'row', gap: 8 }]} 
            onPress={() => router.push('/ai')}
          >
            <Bot color="#FFF" size={20} />
            <Text style={styles.stickyButtonText}>Generate with AI Coach</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : isDietObj ? (
        <Animated.View entering={FadeInDown.duration(260)} style={[styles.mealCard, isDark ? styles.cardDark : styles.cardLight]}>
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack, { marginBottom: 8 }]}>{dietData.planName || 'Diet Plan'}</Text>
          <Text style={[styles.emptyStateSub, isDark ? styles.textGray : styles.textSlate, { marginBottom: 16 }]}>
            Calories: {dietData.calories || 'N/A'} • Macros: {dietData.macros || 'N/A'}
          </Text>
          {dietData.imageUrl && (
             <View style={{ borderRadius: 16, overflow: 'hidden', width: '100%', aspectRatio: 1, backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}>
               <Image source={{ uri: dietData.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
             </View>
          )}
        </Animated.View>
      ) : dietLines.length > 0 ? (
        dietLines.map((line: string, index: number) => {
          return (
            <Animated.View key={`diet-${index}`} entering={FadeInDown.delay(index * 100)} style={[styles.mealCard, isDark ? styles.cardDark : styles.cardLight, { borderLeftWidth: 4, borderLeftColor: '#D7C8B4' }]}>
              <View style={styles.mealLeft}>
                <View style={[styles.mealIconPlaceholder, isDark ? { backgroundColor: 'rgba(217,102,56,0.1)' } : { backgroundColor: 'rgba(217,102,56,0.05)' }]}>
                  <Utensils size={20} color="#d96638" />
                </View>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={[styles.mealName, isDark ? styles.textWhite : styles.textBlack]}>{line.substring(0, 40)}{line.length > 40 ? '...' : ''}</Text>
                  {line.length > 40 && <Text style={[styles.mealCals, isDark ? styles.textGray : styles.textSlate]}>{line.substring(40)}</Text>}
                </View>
              </View>
            </Animated.View>
          )
        })
      ) : null}
    </Animated.ScrollView>
  );

  const renderWorkoutTab = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={{ flex: 1 }}>
      <ScrollView 
        contentContainerStyle={[styles.tabContent, { paddingBottom: workoutLines.length > 0 ? fixedActionBottom + 88 : scrollInset }]} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={isDark ? '#FFFFFF' : '#3A4C56'}
          />
        }
      >
        
        {/* Training Routine */}
        <View style={styles.routineHeader}>
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>Training Protocol</Text>
          {!isWorkoutObj && workoutLines.length > 0 && <Text style={styles.routineCount}>{completedLines.length}/{workoutLines.length} Complete</Text>}
        </View>

        {isLoading && !isRefetching ? (
          <View style={{ gap: 12 }}>
            <Skeleton width="100%" height={90} borderRadius={24} isDark={isDark} />
            <Skeleton width="100%" height={90} borderRadius={24} isDark={isDark} />
          </View>
        ) : workoutLines.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(260)} style={[styles.emptyStateCard, isDark ? styles.bgDarker : { backgroundColor: '#FFFFFF' }]}>
            <View style={[styles.emptyIconWrapper, { backgroundColor: isDark ? 'rgba(217,102,56,0.1)' : 'rgba(217,102,56,0.05)' }]}>
               <Flame color="#d96638" size={32} />
            </View>
            <Text style={[styles.emptyStateTitle, isDark ? styles.textWhite : styles.textBlack]}>No workout plan found</Text>
            <Text style={[styles.emptyStateSub, isDark ? styles.textGray : styles.textSlate]}>
              Your training protocol hasn't been created yet. Enjoy your rest day!
            </Text>
            <TouchableOpacity 
              style={[styles.stickyButton, { marginTop: 20, width: '100%', flexDirection: 'row', gap: 8 }]} 
              onPress={() => router.push('/ai')}
            >
              <Bot color="#FFF" size={20} />
              <Text style={styles.stickyButtonText}>Generate with AI Coach</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : isWorkoutObj ? (
          <Animated.View entering={FadeInDown.duration(260)} style={[styles.mealCard, isDark ? styles.cardDark : styles.cardLight]}>
            <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack, { marginBottom: 8 }]}>{workoutData.planName || 'Workout Plan'}</Text>
            <Text style={[styles.emptyStateSub, isDark ? styles.textGray : styles.textSlate, { marginBottom: 16 }]}>
              Frequency: {workoutData.frequency || 'N/A'} • Difficulty: {workoutData.difficulty || 'N/A'}
            </Text>
            {workoutData.imageUrl && (
               <View style={{ borderRadius: 16, overflow: 'hidden', width: '100%', aspectRatio: 1, backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}>
                 <Image source={{ uri: workoutData.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
               </View>
            )}
          </Animated.View>
        ) : workoutLines.length > 0 ? (
          <View style={[styles.routineContainer, isDark ? styles.cardDark : styles.cardLight]}>
            {workoutLines.map((line: string, idx: number) => {
              const isCompleted = completedLines.includes(idx);
              return (
                <TouchableOpacity 
                  key={`workout-${idx}`} 
                  activeOpacity={0.7} 
                  onPress={() => toggleLine(idx)}
                  style={[styles.exerciseRow, idx !== workoutLines.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#30363D' : '#E2E8F0' }]}
                >
                  <View style={[styles.exerciseIconWrapper, isDark ? { backgroundColor: 'rgba(217,102,56,0.1)' } : { backgroundColor: 'rgba(217,102,56,0.05)' }]}>
                    <Flame size={20} color={isCompleted ? (isDark ? '#30363D' : '#E2E8F0') : "#d96638"} />
                  </View>
                  <View style={styles.exerciseDetails}>
                    <Text style={[styles.exerciseTitle, isDark ? styles.textWhite : styles.textBlack, isCompleted && { opacity: 0.5, textDecorationLine: 'line-through' }]}>
                      {line.substring(0, 35)}{line.length > 35 ? '...' : ''}
                    </Text>
                    {line.length > 35 && <Text style={[styles.exerciseSub, isDark ? styles.textGray : styles.textSlate]}>{line.substring(35, 80)}</Text>}
                  </View>
                  <View style={styles.checkboxContainer}>
                    {isCompleted ? (
                      <CheckCircle2 color="#d96638" fill={isDark ? "rgba(217,102,56,0.2)" : "rgba(217,102,56,0.1)"} size={28} />
                    ) : (
                      <Circle color={isDark ? "#30363D" : "#E2E8F0"} size={28} />
                    )}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        ) : null}
      </ScrollView>
      
      {/* Sticky Button */}
      {workoutLines.length > 0 && (
        <Animated.View entering={FadeInUp.delay(300).duration(260)} style={[styles.stickyButtonContainer, { bottom: fixedActionBottom, paddingBottom: 12 }]}>
          <TouchableOpacity style={styles.stickyButton}>
            <Text style={styles.stickyButtonText}>Continue Workout</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );

  const renderConsultationsTab = () => (
    <Animated.ScrollView 
      entering={FadeInDown.duration(400)} 
      contentContainerStyle={[styles.tabContent, { paddingBottom: scrollInset }]} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isAdvisoryRefetching}
          onRefresh={refetchAdvisory}
          tintColor={isDark ? '#FFFFFF' : '#3A4C56'}
        />
      }
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <View>
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>Coach Consultations</Text>
          <Text style={[styles.exerciseSub, isDark ? styles.textGray : styles.textSlate]}>1-on-1 Personalized Advisory</Text>
        </View>
        <TouchableOpacity 
          style={styles.bookHeaderBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsBookModalOpen(true);
          }}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.bookHeaderBtnText}>Book Session</Text>
        </TouchableOpacity>
      </View>

      {isAdvisoryLoading && !isAdvisoryRefetching ? (
        <View style={{ gap: 12 }}>
          <Skeleton width="100%" height={110} borderRadius={24} isDark={isDark} />
          <Skeleton width="100%" height={110} borderRadius={24} isDark={isDark} />
        </View>
      ) : advisorySessions.length === 0 ? (
        <Animated.View entering={FadeInDown.duration(260)} style={[styles.emptyStateCard, isDark ? styles.bgDarker : { backgroundColor: '#FFFFFF' }]}>
          <View style={[styles.emptyIconWrapper, { backgroundColor: isDark ? 'rgba(217,102,56,0.1)' : 'rgba(217,102,56,0.05)' }]}>
            <Compass color="#d96638" size={32} />
          </View>
          <Text style={[styles.emptyStateTitle, isDark ? styles.textWhite : styles.textBlack]}>No Consultations Scheduled</Text>
          <Text style={[styles.emptyStateSub, isDark ? styles.textGray : styles.textSlate]}>
            Book a 1-on-1 consultation with UFC coaches to tailor your nutrition, powerlifting technique, or recovery program.
          </Text>
          <TouchableOpacity 
            style={[styles.stickyButton, { marginTop: 20, width: '100%', flexDirection: 'row', gap: 8 }]} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsBookModalOpen(true);
            }}
          >
            <Plus color="#FFF" size={20} />
            <Text style={styles.stickyButtonText}>Book 1-on-1 Consultation</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <View style={{ gap: 12 }}>
          {advisorySessions.map((session: any, idx: number) => {
            const isCompleted = session.status === 'Completed';
            return (
              <Animated.View 
                key={session.id || idx} 
                entering={FadeInDown.delay(idx * 50).duration(260)}
                style={[styles.sessionCard, isDark ? styles.cardDark : styles.cardLight]}
              >
                <View style={styles.sessionHeaderRow}>
                  <View style={styles.advisorRow}>
                    <View style={styles.advisorAvatar}>
                      <User color="#3A4C56" size={18} />
                    </View>
                    <View>
                      <Text style={[styles.advisorName, isDark ? styles.textWhite : styles.textBlack]}>{session.advisor || 'Coach'}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <Calendar size={12} color={isDark ? '#8E8E93' : '#64748B'} />
                        <Text style={[styles.sessionDateText, isDark ? styles.textGray : styles.textSlate]}>{session.date}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.statusPill, isCompleted ? styles.statusPillDone : styles.statusPillUpcoming]}>
                    <Text style={[styles.statusPillText, isCompleted ? styles.statusTextDone : styles.statusTextUpcoming]}>
                      {session.status || 'Upcoming'}
                    </Text>
                  </View>
                </View>

                <View style={styles.sessionTopicBox}>
                  <Text style={[styles.sessionTopicLabel, isDark ? styles.textGray : styles.textSlate]}>TOPIC</Text>
                  <Text style={[styles.sessionTopicValue, isDark ? styles.textWhite : styles.textBlack]}>{session.topic}</Text>
                </View>
              </Animated.View>
            );
          })}
        </View>
      )}
    </Animated.ScrollView>
  );

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Header Segments */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={[styles.mainTitle, isDark ? styles.textWhite : styles.textBlack]}>
          {activeTab === 'diet' ? 'Nutrition Balance' : activeTab === 'workout' ? 'Daily Challenge' : 'Coach Advisory'}
        </Text>
        <View style={[styles.segmentContainer, isDark ? styles.bgDarker : { backgroundColor: '#FFFFFF' }]}>
          <TouchableOpacity 
            style={[styles.segment, activeTab === 'diet' && { backgroundColor: '#d96638' }]}
            onPress={() => setActiveTab('diet')}
          >
            <Text style={[styles.segmentText, activeTab === 'diet' ? { color: '#FFFFFF' } : { color: '#8E8E93' }]}>Diet</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.segment, activeTab === 'workout' && { backgroundColor: '#d96638' }]}
            onPress={() => setActiveTab('workout')}
          >
            <Text style={[styles.segmentText, activeTab === 'workout' ? { color: '#FFFFFF' } : { color: '#8E8E93' }]}>Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.segment, activeTab === 'consultations' && { backgroundColor: '#d96638' }]}
            onPress={() => setActiveTab('consultations')}
          >
            <Text style={[styles.segmentText, activeTab === 'consultations' ? { color: '#FFFFFF' } : { color: '#8E8E93' }]}>1-on-1</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {activeTab === 'diet' ? renderDietTab() : activeTab === 'workout' ? renderWorkoutTab() : renderConsultationsTab()}

      {/* Book Consultation Modal */}
      <Modal
        visible={isBookModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsBookModalOpen(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalCard, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>Book Consultation</Text>
                <Text style={[styles.modalSubtitle, isDark ? styles.textGray : styles.textSlate]}>Schedule 1-on-1 session with UFC Coach</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setIsBookModalOpen(false)}
                style={styles.closeBtn}
              >
                <X color={isDark ? '#FFF' : '#000'} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.fieldLabel, isDark ? styles.textGray : styles.textSlate]}>SELECT ADVISOR</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {['Head Coach Carter', 'Coach Marcus Vance', 'Coach Elena Rostova'].map((adv) => (
                  <TouchableOpacity
                    key={adv}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setAdvisor(adv);
                    }}
                    style={[
                      styles.pill,
                      advisor === adv ? styles.pillActive : (isDark ? styles.pillDark : styles.pillLight)
                    ]}
                  >
                    <Text style={[
                      styles.pillText,
                      advisor === adv ? { color: '#FFFFFF' } : (isDark ? styles.textWhite : styles.textBlack)
                    ]}>
                      {adv}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.fieldLabel, isDark ? styles.textGray : styles.textSlate]}>TOPIC PRESETS</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {[
                  'Nutrition & Macro Planning',
                  'Powerlifting Technique Check',
                  'Fat Loss & Conditioning',
                  'Injury Recovery & Mobility',
                  'Combat & Striking Basics'
                ].map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setTopic(preset);
                    }}
                    style={[
                      styles.pill,
                      topic === preset ? styles.pillActive : (isDark ? styles.pillDark : styles.pillLight)
                    ]}
                  >
                    <Text style={[
                      styles.pillText,
                      topic === preset ? { color: '#FFFFFF' } : (isDark ? styles.textWhite : styles.textBlack)
                    ]}>
                      {preset}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.fieldLabel, isDark ? styles.textGray : styles.textSlate]}>CUSTOM TOPIC</Text>
              <TextInput
                value={topic}
                onChangeText={setTopic}
                placeholder="e.g. Preparing for amateur MMA bout"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                style={[
                  styles.textInput,
                  isDark ? styles.inputDark : styles.inputLight,
                  isDark ? styles.textWhite : styles.textBlack
                ]}
              />

              <TouchableOpacity
                onPress={() => {
                  if (!topic.trim()) {
                    showToast('Please enter or select a topic', 'error');
                    return;
                  }
                  bookSessionMutation.mutate({ topic: topic.trim(), advisor });
                }}
                disabled={bookSessionMutation.isPending}
                style={[styles.submitBookingBtn, bookSessionMutation.isPending && { opacity: 0.6 }]}
              >
                {bookSessionMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBookingBtnText}>Confirm Consultation</Text>
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
  bgDarker: { backgroundColor: '#161B22' },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D', borderWidth: 1 },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1 },
  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
  emptyText: { fontSize: 15, fontWeight: '500', textAlign: 'center', marginTop: 40 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  mainTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -1, marginBottom: 24 },
  segmentContainer: { flexDirection: 'row', padding: 4, borderRadius: 99, width: '100%', borderColor: '#E2E8F0', borderWidth: 1 },
  segment: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 99 },
  segmentText: { fontSize: 15, fontWeight: '700' },
  tabContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 16 },
  glassCard: { padding: 32, borderRadius: 40, marginBottom: 24 },
  cardTitle: { fontSize: 20, fontWeight: '800', marginBottom: 24 },
  gaugeContainer: { alignItems: 'center', marginBottom: 32 },
  gaugeRelative: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  gaugeCenterText: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  gaugeValueText: { fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  calLabel: { fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  macroCard: { flex: 1, padding: 16, borderRadius: 24 },
  macroLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  macroValue: { fontSize: 18, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  mealCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 32, marginBottom: 12 },
  mealLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  mealIconPlaceholder: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  mealName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  mealCals: { fontSize: 13, fontWeight: '500' },
  routineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  routineCount: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  routineContainer: { borderRadius: 40, overflow: 'hidden' },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  exerciseIconWrapper: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  exerciseDetails: { flex: 1 },
  exerciseTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  exerciseSub: { fontSize: 13 },
  checkboxContainer: { padding: 4 },
  stickyButtonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 16, backgroundColor: 'transparent' },
  stickyButton: { backgroundColor: '#d96638', width: '100%', paddingVertical: 18, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  stickyButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  emptyStateCard: { alignItems: 'center', justifyContent: 'center', padding: 40, borderRadius: 40, borderWidth: 1, borderColor: 'rgba(150,150,150,0.1)' },
  emptyIconWrapper: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyStateTitle: { fontSize: 24, fontWeight: '800', marginBottom: 12, textAlign: 'center', letterSpacing: -0.5 },
  emptyStateSub: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 8 },
  bookHeaderBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#d96638', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99 },
  bookHeaderBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  sessionCard: { padding: 20, borderRadius: 24, marginBottom: 12 },
  sessionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  advisorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  advisorAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#D4E2F3', alignItems: 'center', justifyContent: 'center' },
  advisorName: { fontSize: 16, fontWeight: '700' },
  sessionDateText: { fontSize: 12, fontWeight: '500' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  statusPillUpcoming: { backgroundColor: 'rgba(217, 102, 56, 0.12)' },
  statusPillDone: { backgroundColor: 'rgba(34, 197, 94, 0.12)' },
  statusPillText: { fontSize: 12, fontWeight: '700' },
  statusTextUpcoming: { color: '#d96638' },
  statusTextDone: { color: '#22C55E' },
  sessionTopicBox: { backgroundColor: 'rgba(150, 150, 150, 0.06)', padding: 12, borderRadius: 16 },
  sessionTopicLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  sessionTopicValue: { fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  modalSubtitle: { fontSize: 13, marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(150,150,150,0.1)', alignItems: 'center', justifyContent: 'center' },
  fieldLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 10 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, borderWidth: 1 },
  pillActive: { backgroundColor: '#d96638', borderColor: '#d96638' },
  pillDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  pillLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  pillText: { fontSize: 13, fontWeight: '600' },
  textInput: { height: 50, borderRadius: 16, paddingHorizontal: 16, fontSize: 15, marginBottom: 20, borderWidth: 1 },
  inputDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  inputLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  submitBookingBtn: { backgroundColor: '#d96638', height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  submitBookingBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
});


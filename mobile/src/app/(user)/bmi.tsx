import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Calculator, ChevronLeft, Save, Target, CheckCircle2, Award, Scale, Ruler, Calendar, Sparkles } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useUIStore } from '../../store/useUIStore';

export default function UserBmiScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { insets, scrollInset } = useAppBottomInset();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [heightCm, setHeightCm] = useState('');

  // Fetch current user measurements from profile
  const { data: profileUser, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await api.get('/user/profile');
      return res.data?.user;
    }
  });

  useEffect(() => {
    if (profileUser) {
      if (profileUser.age) setAge(String(profileUser.age));
      if (profileUser.gender) setGender(profileUser.gender.toLowerCase() === 'female' ? 'female' : 'male');
      if (profileUser.height) setHeightCm(String(profileUser.height));
      if (profileUser.progressLogs?.[0]?.weight) {
        setWeight(String(profileUser.progressLogs[0].weight));
      }
    }
  }, [profileUser]);

  // Oxford "New BMI" Trefethen Formula
  const healthData = useMemo(() => {
    let w = parseFloat(weight);
    let h = parseFloat(heightCm);

    if (unit === 'imperial') {
      // convert lbs to kg and inches to cm
      w = w * 0.45359237;
      h = h * 2.54;
    }

    const hInMeters = h / 100;
    if (!w || !hInMeters || w <= 0 || hInMeters <= 0) return null;

    const oxfordBmi = 1.3 * w / Math.pow(hInMeters, 2.5);

    let category = '';
    let categoryColor = '#3B82F6';
    let percentage = 0;

    if (oxfordBmi < 18.5) {
      category = 'Underweight';
      categoryColor = '#60A5FA';
      percentage = Math.max(5, (oxfordBmi / 18.5) * 25);
    } else if (oxfordBmi < 25) {
      category = 'Healthy Weight';
      categoryColor = '#10B981';
      percentage = 25 + ((oxfordBmi - 18.5) / 6.5) * 35;
    } else if (oxfordBmi < 30) {
      category = 'Overweight';
      categoryColor = '#F59E0B';
      percentage = 60 + ((oxfordBmi - 25) / 5) * 22;
    } else {
      category = 'Obese';
      categoryColor = '#EF4444';
      percentage = Math.min(100, 82 + ((oxfordBmi - 30) / 10) * 18);
    }

    // Ideal healthy weight range (BMI 18.5 - 24.9)
    const minHealthyKg = (18.5 * Math.pow(hInMeters, 2.5)) / 1.3;
    const maxHealthyKg = (24.9 * Math.pow(hInMeters, 2.5)) / 1.3;

    return {
      bmi: oxfordBmi.toFixed(1),
      category,
      categoryColor,
      percentage,
      idealMin: minHealthyKg.toFixed(1),
      idealMax: maxHealthyKg.toFixed(1),
    };
  }, [weight, heightCm, unit]);

  const saveProfileMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/user/profile', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Body metrics saved and synced to profile!', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to sync metrics', 'error');
    }
  });

  const handleSave = () => {
    if (!weight || !heightCm) {
      showToast('Please enter both weight and height', 'error');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let finalWeight = parseFloat(weight);
    let finalHeight = parseFloat(heightCm);
    if (unit === 'imperial') {
      finalWeight = finalWeight * 0.45359237;
      finalHeight = finalHeight * 2.54;
    }

    saveProfileMutation.mutate({
      age: age ? parseInt(age) : undefined,
      gender,
      height: finalHeight,
      weight: finalWeight,
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
          <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Body Profile & BMI</Text>
          <Text style={[styles.headerSubtitle, isDark ? styles.textGray : styles.textSlate]}>
            Oxford Trefethen Clinical Algorithm
          </Text>
        </View>

        <TouchableOpacity 
          onPress={handleSave} 
          disabled={saveProfileMutation.isPending}
          style={styles.saveBtn}
        >
          {saveProfileMutation.isPending ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Save color="#FFF" size={20} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollInset }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Toggle Bar */}
        <View style={styles.togglesRow}>
          {/* Gender */}
          <View style={[styles.pillToggle, isDark ? styles.toggleDark : styles.toggleLight]}>
            <TouchableOpacity 
              onPress={() => {
                Haptics.selectionAsync();
                setGender('male');
              }}
              style={[styles.pillOption, gender === 'male' && styles.pillActive]}
            >
              <Text style={[styles.pillText, gender === 'male' ? styles.textWhite : (isDark ? styles.textGray : styles.textSlate)]}>
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                Haptics.selectionAsync();
                setGender('female');
              }}
              style={[styles.pillOption, gender === 'female' && styles.pillActive]}
            >
              <Text style={[styles.pillText, gender === 'female' ? styles.textWhite : (isDark ? styles.textGray : styles.textSlate)]}>
                Female
              </Text>
            </TouchableOpacity>
          </View>

          {/* Unit */}
          <View style={[styles.pillToggle, isDark ? styles.toggleDark : styles.toggleLight]}>
            <TouchableOpacity 
              onPress={() => {
                Haptics.selectionAsync();
                setUnit('metric');
              }}
              style={[styles.pillOption, unit === 'metric' && styles.pillActive]}
            >
              <Text style={[styles.pillText, unit === 'metric' ? styles.textWhite : (isDark ? styles.textGray : styles.textSlate)]}>
                Metric (kg/cm)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                Haptics.selectionAsync();
                setUnit('imperial');
              }}
              style={[styles.pillOption, unit === 'imperial' && styles.pillActive]}
            >
              <Text style={[styles.pillText, unit === 'imperial' ? styles.textWhite : (isDark ? styles.textGray : styles.textSlate)]}>
                Imperial (lbs/in)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inputs Card */}
        <Animated.View entering={FadeInDown.duration(260)} style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
          <Text style={[styles.cardSectionTitle, isDark ? styles.textWhite : styles.textBlack]}>Biometric Inputs</Text>

          <View style={{ gap: 14 }}>
            <View>
              <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>AGE (YEARS)</Text>
              <TextInput
                style={[styles.input, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                placeholder="e.g. 26"
                placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>
                  {unit === 'metric' ? 'WEIGHT (KG)' : 'WEIGHT (LBS)'}
                </Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder={unit === 'metric' ? 'e.g. 74' : 'e.g. 165'}
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>
                  {unit === 'metric' ? 'HEIGHT (CM)' : 'HEIGHT (INCHES)'}
                </Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder={unit === 'metric' ? 'e.g. 178' : 'e.g. 70'}
                  placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                  value={heightCm}
                  onChangeText={setHeightCm}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Results Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(260)} style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
          {healthData ? (
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <Text style={[styles.bmiScore, { color: healthData.categoryColor }]}>
                {healthData.bmi}
              </Text>
              <View style={[styles.categoryBadge, { backgroundColor: `${healthData.categoryColor}25` }]}>
                <Text style={[styles.categoryText, { color: healthData.categoryColor }]}>
                  {healthData.category}
                </Text>
              </View>

              {/* Gauge Bar */}
              <View style={styles.gaugeTrack}>
                <View 
                  style={[
                    styles.gaugeFill, 
                    { width: `${healthData.percentage}%`, backgroundColor: healthData.categoryColor }
                  ]} 
                />
                <View 
                  style={[
                    styles.gaugePointer,
                    { left: `${Math.max(2, Math.min(96, healthData.percentage))}%` }
                  ]} 
                />
              </View>

              <View style={styles.gaugeLabels}>
                <Text style={[styles.gaugeLabelText, isDark ? styles.textGray : styles.textSlate]}>Under</Text>
                <Text style={[styles.gaugeLabelText, isDark ? styles.textGray : styles.textSlate]}>Healthy</Text>
                <Text style={[styles.gaugeLabelText, isDark ? styles.textGray : styles.textSlate]}>Over</Text>
                <Text style={[styles.gaugeLabelText, isDark ? styles.textGray : styles.textSlate]}>Obese</Text>
              </View>

              {/* Recommended Range */}
              <View style={[styles.idealBox, isDark ? styles.idealBoxDark : styles.idealBoxLight]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Target color="#10B981" size={18} />
                  <Text style={[styles.idealTitle, isDark ? styles.textWhite : styles.textBlack]}>
                    Optimal Weight Target
                  </Text>
                </View>
                <Text style={[styles.idealValue, isDark ? styles.textGray : styles.textSlate]}>
                  For your height, a clinical healthy weight range is {healthData.idealMin} kg – {healthData.idealMax} kg.
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.syncBtn, saveProfileMutation.isPending && styles.syncBtnDisabled]}
                disabled={saveProfileMutation.isPending}
                onPress={handleSave}
              >
                {saveProfileMutation.isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Save color="#FFF" size={18} />
                    <Text style={styles.syncBtnText}>Save & Sync with Health Logs</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Calculator color="#d96638" size={48} style={{ marginBottom: 12, opacity: 0.8 }} />
              <Text style={[styles.emptyPromptTitle, isDark ? styles.textWhite : styles.textBlack]}>
                Awaiting Stats
              </Text>
              <Text style={[styles.emptyPromptDesc, isDark ? styles.textGray : styles.textSlate]}>
                Enter your height and weight above to compute instant Oxford BMI metrics and body target analysis.
              </Text>
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
  saveBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#d96638', alignItems: 'center', justifyContent: 'center' },

  scrollContent: { padding: 20, gap: 16 },

  togglesRow: { flexDirection: 'row', gap: 10 },
  pillToggle: { flex: 1, flexDirection: 'row', borderRadius: 16, padding: 3, borderWidth: 1 },
  toggleDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  toggleLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  pillOption: { flex: 1, paddingVertical: 8, borderRadius: 13, alignItems: 'center' },
  pillActive: { backgroundColor: '#d96638' },
  pillText: { fontSize: 12, fontWeight: '700' },

  card: { padding: 20, borderRadius: 24, borderWidth: 1 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  cardSectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 14 },

  inputLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  input: { height: 48, borderRadius: 14, paddingHorizontal: 14, fontSize: 15, borderWidth: 1 },
  inputDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  inputLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },

  bmiScore: { fontSize: 64, fontWeight: '900', letterSpacing: -2 },
  categoryBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 4, marginBottom: 20 },
  categoryText: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

  gaugeTrack: { height: 10, width: '100%', borderRadius: 5, backgroundColor: 'rgba(150,150,150,0.2)', position: 'relative', overflow: 'hidden' },
  gaugeFill: { height: '100%', borderRadius: 5 },
  gaugePointer: { position: 'absolute', top: 0, bottom: 0, width: 4, borderRadius: 2, backgroundColor: '#FFF', marginLeft: -2 },
  gaugeLabels: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  gaugeLabelText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  idealBox: { width: '100%', padding: 16, borderRadius: 18, marginTop: 24, borderWidth: 1 },
  idealBoxDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  idealBoxLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  idealTitle: { fontSize: 14, fontWeight: '800' },
  idealValue: { fontSize: 13, lineHeight: 18, marginTop: 4 },

  syncBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#d96638', width: '100%', height: 48, borderRadius: 16, marginTop: 20 },
  syncBtnDisabled: { opacity: 0.5 },
  syncBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  emptyPromptTitle: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  emptyPromptDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18, paddingHorizontal: 20 },

  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
});

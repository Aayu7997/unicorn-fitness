import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions, KeyboardAvoidingView, Platform, useColorScheme, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown, useAnimatedStyle, withTiming, withSpring, useSharedValue, withDelay } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import { TrendingUp, Scale, Target, Activity, Flame, ChevronDown, ChevronUp, Calendar } from 'lucide-react-native';
import { AnimatedSaveButton } from '../../components/AnimatedSaveButton';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUIStore } from '../../store/useUIStore';
import { RefreshControl } from 'react-native';
import { Skeleton } from '../../components/ui/Skeleton';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const measurementSchema = z.object({
  weight: z.string()
    .min(1, 'Weight is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Must be a valid positive number'
    }),
  bodyFat: z.string().optional(),
  muscleMass: z.string().optional(),
});

type MeasurementFormData = z.infer<typeof measurementSchema>;

const AnimatedBar = ({ value, maxValue, index, label, isDark }: { value: number, maxValue: number, index: number, label: string, isDark: boolean }) => {
  const height = useSharedValue(0);

  useEffect(() => {
    const percentage = Math.min(100, Math.max(10, (value / maxValue) * 100));
    height.value = withDelay(index * 100, withTiming(percentage, { duration: 450 }));
  }, [value, maxValue, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${height.value}%`,
  }));

  const barColor = '#d96638';
  const bgColor = isDark ? '#161B22' : 'rgba(255,255,255,0.5)';

  return (
    <View style={styles.barContainer}>
      <View style={[styles.barBackground, { backgroundColor: bgColor }]}>
        <Animated.View style={[styles.barFill, animatedStyle, { backgroundColor: barColor }]} />
      </View>
      <Text style={[styles.barLabel, isDark ? styles.textGray : styles.textSlate]}>{label}</Text>
    </View>
  );
};

export default function MeasurementsScreen() {
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { scrollInset } = useAppBottomInset();
  const { showToast } = useUIStore();

  const [showAdvancedInputs, setShowAdvancedInputs] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<MeasurementFormData>({
    resolver: zodResolver(measurementSchema),
    defaultValues: { weight: '', bodyFat: '', muscleMass: '' }
  });

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const response = await api.get('/user/progress');
      return response.data?.logs || [];
    },
    refetchInterval: 5000,
  });

  const allLogs: any[] = Array.isArray(data) ? data : [];
  
  // Format data for chart (last 7 logs)
  const chartData = allLogs
    .slice(0, 7)
    .reverse()
    .map((log: any) => {
      const d = new Date(log.date);
      const label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      return { label, value: Number(log.weight) };
    });

  const maxWeight = chartData.length > 0 ? Math.max(...chartData.map((d: any) => d.value)) + 5 : 100;

  // Latest metrics
  const latestLog = allLogs[0];
  const prevLog = allLogs[1];
  const weightDiff = (latestLog && prevLog) ? (latestLog.weight - prevLog.weight).toFixed(1) : null;

  const mutation = useMutation({
    mutationFn: async (formData: MeasurementFormData) => {
      const payload: any = { weight: parseFloat(formData.weight) };
      if (formData.bodyFat && !isNaN(parseFloat(formData.bodyFat))) {
        payload.bodyFat = parseFloat(formData.bodyFat);
      }
      if (formData.muscleMass && !isNaN(parseFloat(formData.muscleMass))) {
        payload.muscleMass = parseFloat(formData.muscleMass);
      }
      return await api.post('/user/progress', payload);
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Measurements logged successfully!', 'success');
      reset();
      setShowAdvancedInputs(false);
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['adminMeasurements'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast('Failed to log measurements.', 'error');
    }
  });

  const onSubmit = (formData: MeasurementFormData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    mutation.mutate(formData);
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, isDark ? styles.bgDark : styles.bgLight]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: scrollInset }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={isDark ? '#FFFFFF' : '#3A4C56'}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, isDark ? styles.textWhite : styles.textBlack]}>Measurements</Text>
          <Text style={styles.subtitle}>Track body composition & trainer logs</Text>
        </View>

        {/* Dynamic Metric Cards */}
        <View style={styles.metricsRow}>
          <Animated.View entering={FadeInDown.delay(100).duration(260)} style={[styles.metricBox, { backgroundColor: '#F9D3AF' }]}>
            <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 255, 255, 0.4)' }]}>
              <Scale color="#3A4C56" size={22} />
            </View>
            <Text style={[styles.metricValue, { color: '#3A4C56' }]}>
              {latestLog?.weight ? latestLog.weight : '--'}
              <Text style={[styles.metricUnit, { color: '#3A4C56', opacity: 0.7 }]}>kg</Text>
            </Text>
            <Text style={[styles.metricLabel, { color: '#3A4C56', opacity: 0.8 }]}>
              {weightDiff ? `${Number(weightDiff) > 0 ? '+' : ''}${weightDiff}kg Prev` : 'Current Weight'}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).duration(260)} style={[styles.metricBox, { backgroundColor: '#E4D8F3' }]}>
            <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 255, 255, 0.4)' }]}>
              <Activity color="#3A4C56" size={22} />
            </View>
            <Text style={[styles.metricValue, { color: '#3A4C56' }]}>
              {latestLog?.bodyFat ? latestLog.bodyFat : '--'}
              <Text style={[styles.metricUnit, { color: '#3A4C56', opacity: 0.7 }]}>%</Text>
            </Text>
            <Text style={[styles.metricLabel, { color: '#3A4C56', opacity: 0.8 }]}>Body Fat</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(260).duration(260)} style={[styles.metricBox, { backgroundColor: '#D4E2F3' }]}>
            <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 255, 255, 0.4)' }]}>
              <Flame color="#3A4C56" size={22} />
            </View>
            <Text style={[styles.metricValue, { color: '#3A4C56' }]}>
              {latestLog?.muscleMass ? latestLog.muscleMass : '--'}
              <Text style={[styles.metricUnit, { color: '#3A4C56', opacity: 0.7 }]}>kg</Text>
            </Text>
            <Text style={[styles.metricLabel, { color: '#3A4C56', opacity: 0.8 }]}>Muscle Mass</Text>
          </Animated.View>
        </View>

        {/* Chart Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(260)} style={styles.chartWrapper}>
          <View style={[styles.chartCard, isDark ? styles.chartCardDark : styles.chartCardLight]}>
            <Text style={[styles.chartTitle, isDark ? styles.textWhite : styles.textBlack]}>Weight Trend</Text>
            
            {isLoading && !isRefetching ? (
              <View style={styles.chartArea}>
                {[1,2,3,4,5,6,7].map((i) => (
                  <Skeleton key={i} width={16} height={120} borderRadius={8} isDark={isDark} />
                ))}
              </View>
            ) : chartData.length > 0 ? (
              <View style={styles.chartArea}>
                {chartData.map((d: any, idx: number) => (
                  <AnimatedBar 
                    key={idx} 
                    value={d.value} 
                    maxValue={maxWeight} 
                    index={idx} 
                    label={d.label} 
                    isDark={isDark} 
                  />
                ))}
              </View>
            ) : (
              <View style={[styles.chartArea, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: isDark ? '#8E8E93' : '#64748B', fontWeight: '600' }}>No entries recorded yet. Log your weight below!</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Input Section */}
        <Animated.View entering={FadeInDown.delay(380).duration(260)} style={styles.inputSection}>
          <View style={[styles.formContainer, isDark ? styles.cardDark : styles.cardLight]}>
            <Text style={[styles.inputTitle, isDark ? styles.textWhite : styles.textBlack]}>Record Measurements</Text>
            
            <View style={{ marginBottom: 12 }}>
              <Text style={[styles.inputFieldLabel, isDark ? styles.textGray : styles.textSlate]}>WEIGHT (REQUIRED)</Text>
              <Controller
                control={control}
                name="weight"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[styles.inputWrapper, isDark ? styles.inputWrapperDark : styles.inputWrapperLight, errors.weight && styles.inputError]}>
                    <Scale color={errors.weight ? '#FF453A' : (isDark ? '#8E8E93' : '#3A4C56')} size={20} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, isDark ? styles.textWhite : styles.textBlack]}
                      placeholder="e.g. 74.5"
                      placeholderTextColor={isDark ? '#636366' : '#8E8E93'}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                    />
                    <Text style={styles.inputSuffix}>kg</Text>
                  </View>
                )}
              />
              {errors.weight && (
                <Text style={styles.errorText}>{errors.weight.message}</Text>
              )}
            </View>

            {/* Toggle Advanced Metrics */}
            <TouchableOpacity 
              onPress={() => setShowAdvancedInputs(!showAdvancedInputs)} 
              style={styles.advancedToggleRow}
            >
              <Text style={styles.advancedToggleText}>
                {showAdvancedInputs ? 'Hide Body Fat & Muscle Mass' : '+ Add Body Fat & Muscle Mass'}
              </Text>
              {showAdvancedInputs ? (
                <ChevronUp size={16} color="#d96638" />
              ) : (
                <ChevronDown size={16} color="#d96638" />
              )}
            </TouchableOpacity>

            {showAdvancedInputs && (
              <View style={{ gap: 12, marginBottom: 16 }}>
                <View>
                  <Text style={[styles.inputFieldLabel, isDark ? styles.textGray : styles.textSlate]}>BODY FAT % (OPTIONAL)</Text>
                  <Controller
                    control={control}
                    name="bodyFat"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={[styles.inputWrapper, isDark ? styles.inputWrapperDark : styles.inputWrapperLight]}>
                        <Activity color={isDark ? '#8E8E93' : '#3A4C56'} size={20} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, isDark ? styles.textWhite : styles.textBlack]}
                          placeholder="e.g. 15.2"
                          placeholderTextColor={isDark ? '#636366' : '#8E8E93'}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="numeric"
                        />
                        <Text style={styles.inputSuffix}>%</Text>
                      </View>
                    )}
                  />
                </View>

                <View>
                  <Text style={[styles.inputFieldLabel, isDark ? styles.textGray : styles.textSlate]}>MUSCLE MASS (OPTIONAL)</Text>
                  <Controller
                    control={control}
                    name="muscleMass"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={[styles.inputWrapper, isDark ? styles.inputWrapperDark : styles.inputWrapperLight]}>
                        <Flame color={isDark ? '#8E8E93' : '#3A4C56'} size={20} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, isDark ? styles.textWhite : styles.textBlack]}
                          placeholder="e.g. 38.0"
                          placeholderTextColor={isDark ? '#636366' : '#8E8E93'}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="numeric"
                        />
                        <Text style={styles.inputSuffix}>kg</Text>
                      </View>
                    )}
                  />
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={mutation.isPending}
              style={[styles.saveBtn, mutation.isPending && { opacity: 0.6 }]}
            >
              <Text style={styles.saveBtnText}>
                {mutation.isPending ? 'Logging Progress...' : 'Save Measurements'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* History List Section */}
        {allLogs.length > 0 && (
          <Animated.View entering={FadeInDown.delay(450).duration(260)} style={styles.historySection}>
            <Text style={[styles.historyTitle, isDark ? styles.textWhite : styles.textBlack]}>Recorded History</Text>
            <View style={{ gap: 10 }}>
              {allLogs.map((log: any, idx: number) => (
                <View 
                  key={log.id || idx}
                  style={[styles.historyCard, isDark ? styles.cardDark : styles.cardLight]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} color={isDark ? '#8E8E93' : '#64748B'} />
                      <Text style={[styles.historyDate, isDark ? styles.textGray : styles.textSlate]}>
                        {new Date(log.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </Text>
                    </View>
                    {log.goal && (
                      <View style={styles.goalTag}>
                        <Text style={styles.goalTagText}>{log.goal}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.historyMetricsRow}>
                    <View style={styles.historyMetricItem}>
                      <Text style={[styles.historyMetricLabel, isDark ? styles.textGray : styles.textSlate]}>WEIGHT</Text>
                      <Text style={[styles.historyMetricVal, isDark ? styles.textWhite : styles.textBlack]}>
                        {log.weight} kg
                      </Text>
                    </View>

                    <View style={styles.historyMetricItem}>
                      <Text style={[styles.historyMetricLabel, isDark ? styles.textGray : styles.textSlate]}>BODY FAT</Text>
                      <Text style={[styles.historyMetricVal, isDark ? styles.textWhite : styles.textBlack]}>
                        {log.bodyFat ? `${log.bodyFat}%` : '--'}
                      </Text>
                    </View>

                    <View style={styles.historyMetricItem}>
                      <Text style={[styles.historyMetricLabel, isDark ? styles.textGray : styles.textSlate]}>MUSCLE</Text>
                      <Text style={[styles.historyMetricVal, isDark ? styles.textWhite : styles.textBlack]}>
                        {log.muscleMass ? `${log.muscleMass} kg` : '--'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgDark: { backgroundColor: '#0D1117' },
  bgLight: { backgroundColor: '#F4F7F6' },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -1, marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#8E8E93' },
  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D', borderWidth: 1 },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1 },
  metricsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  metricBox: { flex: 1, padding: 16, borderRadius: 24 },
  iconWrapper: { padding: 8, borderRadius: 16, alignSelf: 'flex-start', marginBottom: 12 },
  metricValue: { fontSize: 22, fontWeight: '800', marginBottom: 2, letterSpacing: -0.5 },
  metricUnit: { fontSize: 13, fontWeight: '600' },
  metricLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  chartWrapper: { paddingHorizontal: 20, marginBottom: 24 },
  chartCard: { padding: 24, borderRadius: 32, borderWidth: 1 },
  chartCardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  chartCardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  chartTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
  chartArea: { flexDirection: 'row', justifyContent: 'space-between', height: 140, alignItems: 'flex-end' },
  barContainer: { alignItems: 'center', flex: 1 },
  barBackground: { width: 14, height: 110, borderRadius: 7, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 7 },
  barLabel: { marginTop: 10, fontSize: 11, fontWeight: '700' },
  inputSection: { paddingHorizontal: 20, marginBottom: 24 },
  formContainer: { padding: 20, borderRadius: 28 },
  inputTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  inputFieldLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 52, borderRadius: 16 },
  inputWrapperDark: { backgroundColor: '#0D1117', borderWidth: 1, borderColor: '#30363D' },
  inputWrapperLight: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  inputError: { borderColor: '#FF453A' },
  errorText: { color: '#FF453A', fontSize: 12, marginTop: 4 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, fontWeight: '700' },
  inputSuffix: { fontSize: 14, color: '#8E8E93', fontWeight: '700' },
  advancedToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 12 },
  advancedToggleText: { color: '#d96638', fontSize: 13, fontWeight: '700' },
  saveBtn: { backgroundColor: '#d96638', height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  historySection: { paddingHorizontal: 20, marginBottom: 32 },
  historyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 14 },
  historyCard: { padding: 16, borderRadius: 20 },
  historyDate: { fontSize: 12, fontWeight: '600' },
  goalTag: { backgroundColor: 'rgba(217, 102, 56, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  goalTagText: { color: '#d96638', fontSize: 10, fontWeight: '800' },
  historyMetricsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(150,150,150,0.1)', paddingTop: 10 },
  historyMetricItem: { alignItems: 'flex-start' },
  historyMetricLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
  historyMetricVal: { fontSize: 15, fontWeight: '700' }
});

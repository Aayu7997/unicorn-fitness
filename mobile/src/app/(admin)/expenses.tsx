import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { CreditCard, TrendingDown, Calendar, Plus, Home, Wrench, Zap, X, Trash2 } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import * as Haptics from 'expo-haptics';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUIStore } from '../../store/useUIStore';
import { RefreshControl } from 'react-native';
import { Skeleton } from '../../components/ui/Skeleton';
import { useLocalSearchParams } from 'expo-router';

const expenseSchema = z.object({
  description: z.string().min(3, 'Description must be at least 3 characters'),
  category: z.string().min(2, 'Category is required'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export default function ExpensesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { scrollInset } = useAppBottomInset();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const params = useLocalSearchParams();

  const [isModalVisible, setIsModalVisible] = useState(false);

  // Auto-open modal if navigated with ?action=new
  useEffect(() => {
    if (params.action === 'new') {
      setIsModalVisible(true);
    }
  }, [params.action]);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: '',
      category: 'Maintenance',
      amount: '',
    }
  });

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminExpenses'],
    queryFn: async () => {
      const response = await api.get('/admin/expenses');
      const expenses = response.data || [];
      const totalExpense = expenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);
      
      const mapCategoryToIcon = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('maintenance')) return 'wrench';
        if (cat.includes('util') || cat.includes('electric')) return 'zap';
        if (cat.includes('equip')) return 'home';
        return 'credit-card';
      };

      return {
        totalExpense,
        recentExpenses: expenses.map((exp: any) => ({
          id: exp.id,
          title: exp.description,
          category: exp.category,
          amount: Number(exp.amount),
          date: exp.date,
          icon: mapCategoryToIcon(exp.category)
        }))
      };
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      const response = await api.post('/admin/expenses', {
        description: data.description,
        category: data.category,
        amount: Number(data.amount),
        date: new Date().toISOString(),
        status: 'Paid'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminExpenses'] });
      setIsModalVisible(false);
      reset();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Expense added successfully', 'success');
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast('Failed to add expense', 'error');
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminExpenses'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Expense removed successfully', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to delete expense', 'error');
    }
  });

  const handleDeleteExpense = (id: string, description: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteExpenseMutation.mutate(id)
        }
      ]
    );
  };

  const onSubmit = (data: ExpenseFormData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addExpenseMutation.mutate(data);
  };

  const getIcon = (iconName: string) => {
    const props = { color: isDark ? '#FFF' : '#3A4C56', size: 20 };
    switch (iconName) {
      case 'wrench': return <Wrench {...props} />;
      case 'zap': return <Zap {...props} />;
      case 'home': return <Home {...props} />;
      default: return <CreditCard {...props} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Expenses</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsModalVisible(true);
          }}
        >
          <Plus color="#FFF" size={20} />
        </TouchableOpacity>
      </View>

      {isLoading && !isRefetching ? (
        <View style={styles.scrollContent}>
          <Skeleton width="100%" height={120} borderRadius={24} isDark={isDark} style={{ marginBottom: 16 }} />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={80} borderRadius={20} isDark={isDark} style={{ marginBottom: 12 }} />
          ))}
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollInset }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={isDark ? '#FFFFFF' : '#3A4C56'}
            />
          }
        >
          <Animated.View 
            entering={FadeInDown.duration(260)}
            style={[styles.summaryCard, isDark ? styles.cardDark : styles.cardLight]}
          >
            <View style={styles.summaryHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
                <TrendingDown color="#FF3B30" size={24} />
              </View>
              <Text style={[styles.summaryLabel, isDark ? styles.textGray : styles.textSlate]}>Total Expenses (This Month)</Text>
            </View>
            <Text style={[styles.summaryAmount, isDark ? styles.textWhite : styles.textBlack]}>
              {formatCurrency(data?.totalExpense || 0)}
            </Text>
          </Animated.View>

          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>Recent Expenses</Text>

          {data?.recentExpenses?.map((expense: any, index: number) => (
            <Animated.View 
              key={expense.id}
              entering={FadeInDown.delay((index + 1) * 50).duration(260)}
            >
              <TouchableOpacity 
                style={[styles.expenseCard, isDark ? styles.cardDark : styles.cardLight]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                activeOpacity={0.7}
              >
                <View style={styles.expenseRow}>
                  <View style={styles.expenseLeft}>
                    <View style={[styles.expenseIcon, { backgroundColor: isDark ? '#30363D' : '#F1F5F9' }]}>
                      {getIcon(expense.icon)}
                    </View>
                    <View>
                      <Text style={[styles.expenseTitle, isDark ? styles.textWhite : styles.textBlack]}>{expense.title}</Text>
                      <Text style={[styles.expenseCategory, isDark ? styles.textGray : styles.textSlate]}>{expense.category}</Text>
                    </View>
                  </View>
                  <View style={styles.expenseRight}>
                    <Text style={[styles.expenseAmount, { color: '#FF3B30' }]}>
                      -{formatCurrency(expense.amount)}
                    </Text>
                    <View style={styles.dateContainer}>
                      <Calendar color={isDark ? '#8E8E93' : '#64748B'} size={12} />
                      <Text style={[styles.dateText, isDark ? styles.textGray : styles.textSlate]}>{expense.date}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteExpenseBtn}
                      onPress={() => handleDeleteExpense(expense.id, expense.title)}
                      activeOpacity={0.7}
                    >
                      <Trash2 color="#FF3B30" size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      )}

      {/* Add Expense Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, isDark ? styles.bgDark : styles.bgLight]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>Add New Expense</Text>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <X color={isDark ? '#FFF' : '#1E293B'} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer}>
              {/* Description Field */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>Description</Text>
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[
                        styles.input, 
                        isDark ? styles.inputDark : styles.inputLight,
                        errors.description && styles.inputError
                      ]}
                      placeholder="e.g. Gym Equipment Repair"
                      placeholderTextColor={isDark ? '#8E8E93' : '#94A3B8'}
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}
              </View>

              {/* Category Field */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>Category</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {['Maintenance', 'Utilities', 'Equipment', 'Salaries', 'Rent', 'Supplements', 'Marketing'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryChip, isDark ? styles.chipDark : styles.chipLight]}
                      onPress={() => setValue('category', cat, { shouldValidate: true })}
                    >
                      <Text style={[styles.categoryChipText, isDark ? styles.textWhite : styles.textBlack]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Controller
                  control={control}
                  name="category"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[
                        styles.input, 
                        isDark ? styles.inputDark : styles.inputLight,
                        errors.category && styles.inputError
                      ]}
                      placeholder="e.g. Maintenance, Utilities"
                      placeholderTextColor={isDark ? '#8E8E93' : '#94A3B8'}
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}
              </View>

              {/* Amount Field */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>Amount (₹)</Text>
                <Controller
                  control={control}
                  name="amount"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[
                        styles.input, 
                        isDark ? styles.inputDark : styles.inputLight,
                        errors.amount && styles.inputError
                      ]}
                      placeholder="e.g. 5000"
                      placeholderTextColor={isDark ? '#8E8E93' : '#94A3B8'}
                      keyboardType="numeric"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, addExpenseMutation.isPending && styles.submitButtonDisabled]}
                onPress={handleSubmit(onSubmit)}
                disabled={addExpenseMutation.isPending}
              >
                {addExpenseMutation.isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Save Expense</Text>
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
  header: { paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3A4C56', alignItems: 'center', justifyContent: 'center' },
  
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, gap: 16 },
  
  summaryCard: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 8 },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  summaryLabel: { fontSize: 16, fontWeight: '600' },
  summaryAmount: { fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  
  sectionTitle: { fontSize: 20, fontWeight: '700', marginTop: 8, marginBottom: 4 },
  
  expenseCard: { padding: 16, borderRadius: 20, borderWidth: 1 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  
  expenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expenseLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expenseIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  expenseTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  expenseCategory: { fontSize: 13, fontWeight: '500' },
  
  expenseRight: { alignItems: 'flex-end' },
  expenseAmount: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, fontWeight: '500' },
  
  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: '60%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 8,
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
  },
  inputLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    color: '#1E293B',
  },
  inputDark: {
    backgroundColor: '#161B22',
    borderColor: '#30363D',
    color: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#3A4C56',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteExpenseBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipDark: {
    backgroundColor: '#21262D',
    borderColor: '#30363D',
  },
  chipLight: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

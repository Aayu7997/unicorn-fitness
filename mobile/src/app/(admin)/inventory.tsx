import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, Modal, TextInput, Alert, RefreshControl } from 'react-native';
import { Database, Plus, ChevronLeft, Trash2, X, AlertTriangle, CheckCircle2, XCircle, DollarSign, Package } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useUIStore } from '../../store/useUIStore';
import { Skeleton } from '../../components/ui/Skeleton';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const itemSchema = z.object({
  name: z.string().min(2, 'Item name is required'),
  sku: z.string().min(2, 'SKU is required'),
  category: z.string().min(2, 'Category is required'),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Price must be a valid number',
  }),
  quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Quantity must be a valid number',
  }),
});

type ItemFormData = z.infer<typeof itemSchema>;

const CATEGORIES = ['All', 'Equipment', 'Supplements', 'Apparel', 'Accessories'];

export default function AdminInventory() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { scrollInset } = useAppBottomInset();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  const [activeCategory, setActiveCategory] = useState('All');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      sku: '',
      category: 'Supplements',
      price: '',
      quantity: '10',
    }
  });

  const { data: items = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminInventory'],
    queryFn: async () => {
      const res = await api.get('/admin/inventory');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const addItemMutation = useMutation({
    mutationFn: async (data: ItemFormData) => {
      const qty = Number(data.quantity);
      const status = qty <= 0 ? 'Out of Stock' : qty <= 5 ? 'Low Stock' : 'In Stock';
      const res = await api.post('/admin/inventory', {
        name: data.name,
        sku: data.sku,
        category: data.category,
        price: Number(data.price),
        quantity: qty,
        status,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInventory'] });
      setIsModalVisible(false);
      reset();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Inventory item added successfully!', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to add item', 'error');
    }
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, newQty }: { id: string; newQty: number }) => {
      const status = newQty <= 0 ? 'Out of Stock' : newQty <= 5 ? 'Low Stock' : 'In Stock';
      await api.put(`/admin/inventory/${id}`, {
        quantity: newQty,
        status,
      });
    },
    onMutate: async ({ id, newQty }) => {
      await queryClient.cancelQueries({ queryKey: ['adminInventory'] });
      const previousItems = queryClient.getQueryData(['adminInventory']);
      queryClient.setQueryData(['adminInventory'], (old: any[]) => {
        if (!old) return [];
        return old.map(item => {
          if (item.id === id) {
            const status = newQty <= 0 ? 'Out of Stock' : newQty <= 5 ? 'Low Stock' : 'In Stock';
            return { ...item, quantity: newQty, status };
          }
          return item;
        });
      });
      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['adminInventory'], context.previousItems);
      }
      showToast('Failed to update stock quantity', 'error');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInventory'] });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInventory'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Item deleted from inventory', 'success');
    },
    onError: () => {
      showToast('Failed to delete item', 'error');
    }
  });

  const handleDelete = (id: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Inventory Item',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteItemMutation.mutate(id) 
        }
      ]
    );
  };

  const filteredItems = items.filter((item: any) => {
    if (activeCategory === 'All') return true;
    return item.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  // Calculate high-level summary KPIs
  const totalStockCount = items.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0);
  const lowStockCount = items.filter((it: any) => it.quantity > 0 && it.quantity <= 5).length;
  const outOfStockCount = items.filter((it: any) => !it.quantity || it.quantity <= 0).length;

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={isDark ? '#FFF' : '#000'} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Inventory</Text>
        <TouchableOpacity 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsModalVisible(true);
          }} 
          style={styles.addButton}
        >
          <Plus color={isDark ? '#FFF' : '#000'} size={24} />
        </TouchableOpacity>
      </View>

      {/* Summary KPI Strip */}
      <View style={styles.kpiContainer}>
        <View style={[styles.kpiCard, isDark ? styles.cardDark : styles.cardLight]}>
          <Text style={[styles.kpiNumber, { color: '#d96638' }]}>{totalStockCount}</Text>
          <Text style={[styles.kpiLabel, isDark ? styles.textGray : styles.textSlate]}>Total Units</Text>
        </View>
        <View style={[styles.kpiCard, isDark ? styles.cardDark : styles.cardLight]}>
          <Text style={[styles.kpiNumber, { color: '#F59E0B' }]}>{lowStockCount}</Text>
          <Text style={[styles.kpiLabel, isDark ? styles.textGray : styles.textSlate]}>Low Stock</Text>
        </View>
        <View style={[styles.kpiCard, isDark ? styles.cardDark : styles.cardLight]}>
          <Text style={[styles.kpiNumber, { color: '#EF4444' }]}>{outOfStockCount}</Text>
          <Text style={[styles.kpiLabel, isDark ? styles.textGray : styles.textSlate]}>Out of Stock</Text>
        </View>
      </View>

      {/* Category Filter Pills */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterPill,
                  isActive ? styles.filterPillActive : (isDark ? styles.filterPillDark : styles.filterPillLight)
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveCategory(cat);
                }}
              >
                <Text style={[
                  styles.filterPillText,
                  isActive ? { color: '#FFF', fontWeight: '700' } : (isDark ? styles.textGray : styles.textSlate)
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Inventory Items List */}
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
        {isLoading ? (
          <View style={{ gap: 14 }}>
            <Skeleton width="100%" height={130} borderRadius={20} isDark={isDark} />
            <Skeleton width="100%" height={130} borderRadius={20} isDark={isDark} />
            <Skeleton width="100%" height={130} borderRadius={20} isDark={isDark} />
          </View>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item: any, index: number) => {
            const isOutOfStock = !item.quantity || item.quantity <= 0;
            const isLowStock = item.quantity > 0 && item.quantity <= 5;
            const statusColor = isOutOfStock ? '#EF4444' : isLowStock ? '#F59E0B' : '#10B981';

            return (
              <Animated.View 
                key={item.id} 
                entering={FadeInDown.delay(index * 40).duration(260)}
                style={[styles.itemCard, isDark ? styles.cardDark : styles.cardLight]}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemName, isDark ? styles.textWhite : styles.textBlack]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.itemSku, isDark ? styles.textGray : styles.textSlate]}>
                      SKU: {item.sku} • {item.category}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18`, borderColor: `${statusColor}40` }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={[styles.priceText, isDark ? styles.textWhite : styles.textBlack]}>
                      ${Number(item.price).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.stockControls}>
                    <TouchableOpacity 
                      style={[styles.stepperButton, isDark ? styles.stepperDark : styles.stepperLight]}
                      onPress={() => {
                        if (item.quantity > 0) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          updateQuantityMutation.mutate({ id: item.id, newQty: item.quantity - 1 });
                        }
                      }}
                    >
                      <Text style={[styles.stepperText, isDark ? styles.textWhite : styles.textBlack]}>-</Text>
                    </TouchableOpacity>

                    <Text style={[styles.qtyNumber, isDark ? styles.textWhite : styles.textBlack]}>
                      {item.quantity}
                    </Text>

                    <TouchableOpacity 
                      style={[styles.stepperButton, isDark ? styles.stepperDark : styles.stepperLight]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        updateQuantityMutation.mutate({ id: item.id, newQty: (item.quantity || 0) + 1 });
                      }}
                    >
                      <Text style={[styles.stepperText, isDark ? styles.textWhite : styles.textBlack]}>+</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(item.id, item.name)}
                    >
                      <Trash2 color={isDark ? '#EF4444' : '#DC2626'} size={18} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            );
          })
        ) : (
          <View style={[styles.emptyContainer, isDark ? styles.cardDark : styles.cardLight]}>
            <Package size={48} color={isDark ? '#30363D' : '#CBD5E1'} />
            <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textBlack]}>No inventory items</Text>
            <Text style={[styles.emptySub, isDark ? styles.textGray : styles.textSlate]}>
              Tap the (+) button at top right to add supplements, apparel, or equipment.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Item Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark ? styles.modalDark : styles.modalLight, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>Add Inventory Item</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.modalClose}>
                <X color={isDark ? '#8E8E93' : '#64748B'} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Product Name</Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, isDark ? styles.inputDark : styles.inputLight, errors.name && styles.inputError]}
                      placeholder="e.g. Whey Protein Isolate 2kg"
                      placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>SKU / Code</Text>
                  <Controller
                    control={control}
                    name="sku"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[styles.input, isDark ? styles.inputDark : styles.inputLight, errors.sku && styles.inputError]}
                        placeholder="WHEY-ISO-01"
                        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                  {errors.sku && <Text style={styles.errorText}>{errors.sku.message}</Text>}
                </View>

                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Category</Text>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                        placeholder="Supplements"
                        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Price ($)</Text>
                  <Controller
                    control={control}
                    name="price"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[styles.input, isDark ? styles.inputDark : styles.inputLight, errors.price && styles.inputError]}
                        placeholder="49.99"
                        keyboardType="decimal-pad"
                        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                  {errors.price && <Text style={styles.errorText}>{errors.price.message}</Text>}
                </View>

                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.inputLabel, isDark ? styles.textGray : styles.textSlate]}>Initial Quantity</Text>
                  <Controller
                    control={control}
                    name="quantity"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[styles.input, isDark ? styles.inputDark : styles.inputLight, errors.quantity && styles.inputError]}
                        placeholder="25"
                        keyboardType="numeric"
                        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                  {errors.quantity && <Text style={styles.errorText}>{errors.quantity.message}</Text>}
                </View>
              </View>

              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit((data) => addItemMutation.mutate(data))}
                disabled={addItemMutation.isPending}
              >
                <Text style={styles.submitButtonText}>
                  {addItemMutation.isPending ? 'Saving...' : 'Add to Inventory'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
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
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  addButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  kpiContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginTop: 12 },
  kpiCard: { flex: 1, padding: 14, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  kpiNumber: { fontSize: 22, fontWeight: '800' },
  kpiLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  filterWrapper: { paddingVertical: 12 },
  filterScroll: { paddingHorizontal: 20, gap: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterPillActive: { backgroundColor: '#d96638', borderColor: '#d96638' },
  filterPillDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  filterPillLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  filterPillText: { fontSize: 13, fontWeight: '600' },

  scrollContent: { paddingHorizontal: 20, gap: 12, paddingTop: 4 },
  
  itemCard: { padding: 16, borderRadius: 20, borderWidth: 1 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },

  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  itemName: { fontSize: 16, fontWeight: '700' },
  itemSku: { fontSize: 12, fontWeight: '500', marginTop: 2 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '700' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(150, 150, 150, 0.12)' },
  priceText: { fontSize: 17, fontWeight: '800' },

  stockControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepperButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  stepperDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  stepperLight: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  stepperText: { fontSize: 18, fontWeight: '700', lineHeight: 20 },
  qtyNumber: { fontSize: 15, fontWeight: '800', minWidth: 20, textAlign: 'center' },
  deleteBtn: { padding: 6, marginLeft: 6 },

  emptyContainer: { padding: 32, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, gap: 8, marginTop: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '85%' },
  modalDark: { backgroundColor: '#161B22' },
  modalLight: { backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalClose: { padding: 4 },

  formGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { height: 48, borderRadius: 14, paddingHorizontal: 16, fontSize: 15, borderWidth: 1 },
  inputDark: { backgroundColor: '#0D1117', borderColor: '#30363D', color: '#FFF' },
  inputLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', color: '#1E293B' },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 11, marginTop: 4 },
  row: { flexDirection: 'row' },

  submitButton: { backgroundColor: '#d96638', height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
});

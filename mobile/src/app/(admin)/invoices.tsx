import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import {
  FileText,
  Download,
  Plus,
  ArrowLeft,
  X,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Check,
  User,
  CreditCard,
  Receipt,
  Share2,
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Skeleton } from '../../components/ui/Skeleton';
import { useUIStore } from '../../store/useUIStore';

export default function AdminInvoices() {
  const insets = useSafeAreaInsets();
  const { scrollInset, fixedActionBottom } = useAppBottomInset();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Unpaid'>('all');

  // Form State
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedMemberName, setSelectedMemberName] = useState('');
  const [planName, setPlanName] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'Paid' | 'Unpaid'>('Paid');
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);

  // Auto-open modal if navigated with ?action=new
  useEffect(() => {
    if (params.action === 'new') {
      setIsModalVisible(true);
    }
  }, [params.action]);

  // Queries
  const { data: invoices = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminInvoices'],
    queryFn: async () => {
      const response = await api.get('/admin/invoices');
      return response.data || [];
    },
  });

  const { data: membersData } = useQuery({
    queryKey: ['adminMembersForInvoices'],
    queryFn: async () => {
      const response = await api.get('/admin/members?limit=50');
      return response.data?.users || [];
    },
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['adminPlansForInvoices'],
    queryFn: async () => {
      const response = await api.get('/admin/plans');
      return response.data || [];
    },
  });

  // Mutations
  const addInvoiceMutation = useMutation({
    mutationFn: async (payload: { userId: string; planName: string; amount: number; status: string; date?: string }) => {
      const response = await api.post('/admin/invoices', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInvoices'] });
      setIsModalVisible(false);
      resetForm();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Invoice created successfully!', 'success');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(err.response?.data?.error || 'Failed to create invoice.', 'error');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const response = await api.put(`/admin/invoices/${id}`, { status: newStatus });
      return response.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['adminInvoices'] });
      if (selectedReceipt && selectedReceipt.id === vars.id) {
        setSelectedReceipt({ ...selectedReceipt, status: vars.newStatus });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast(`Invoice marked as ${vars.newStatus}!`, 'success');
    },
    onError: () => {
      showToast('Failed to update invoice status', 'error');
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/invoices/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInvoices'] });
      setSelectedReceipt(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Invoice deleted', 'success');
    },
    onError: () => {
      showToast('Failed to delete invoice', 'error');
    },
  });

  const resetForm = () => {
    setSelectedUserId('');
    setSelectedMemberName('');
    setPlanName('');
    setAmount('');
    setStatus('Paid');
    setMemberPickerOpen(false);
  };

  const handleCreateSubmit = () => {
    if (!selectedUserId) {
      showToast('Please select a member', 'error');
      return;
    }
    if (!planName.trim()) {
      showToast('Please enter or select a plan', 'error');
      return;
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addInvoiceMutation.mutate({
      userId: selectedUserId,
      planName: planName.trim(),
      amount: numAmount,
      status,
      date: new Date().toISOString(),
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Invoice', 'Are you sure you want to permanently delete this invoice record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          deleteInvoiceMutation.mutate(id);
        },
      },
    ]);
  };

  const { totalCollections, dueAmount } = useMemo(() => {
    return invoices.reduce(
      (acc: any, inv: any) => {
        if (inv.status === 'Paid') {
          acc.totalCollections += Number(inv.amount || 0);
        } else {
          acc.dueAmount += Number(inv.amount || 0);
        }
        return acc;
      },
      { totalCollections: 0, dueAmount: 0 }
    );
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv: any) => {
      const matchesSearch =
        !search.trim() ||
        (inv.member && inv.member.toLowerCase().includes(search.toLowerCase())) ||
        (inv.plan && inv.plan.toLowerCase().includes(search.toLowerCase())) ||
        (inv.id && inv.id.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'Paid' && inv.status === 'Paid') ||
        (statusFilter === 'Unpaid' && inv.status !== 'Paid');

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const formatCurrency = (amt: number) => {
    return `₹ ${Number(amt || 0).toLocaleString('en-IN')}`;
  };

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft color={isDark ? '#FFF' : '#000'} size={24} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>
              Invoices & Billing
            </Text>
            <Text style={[styles.headerSubtitle, isDark ? styles.textGray : styles.textSlate]}>
              {invoices.length} Registered Billing Records
            </Text>
          </View>
        </View>

        {/* Financial KPI Strip */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, isDark ? styles.boxDark : styles.boxLight]}>
            <Text style={[styles.statLabel, isDark ? styles.textGray : styles.textSlate]}>
              Total Collections
            </Text>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {formatCurrency(totalCollections)}
            </Text>
          </View>
          <View style={[styles.statBox, isDark ? styles.boxDark : styles.boxLight]}>
            <Text style={[styles.statLabel, isDark ? styles.textGray : styles.textSlate]}>
              Outstanding Due
            </Text>
            <Text style={[styles.statValue, { color: '#FF453A' }]}>
              {formatCurrency(dueAmount)}
            </Text>
          </View>
        </View>

        {/* Search & Status Filters */}
        <View style={[styles.searchBox, isDark ? styles.boxDark : styles.boxLight]}>
          <Search color={isDark ? '#8E8E93' : '#64748B'} size={18} />
          <TextInput
            style={[styles.searchInput, isDark ? styles.textWhite : styles.textBlack]}
            placeholder="Search member, plan, invoice ID..."
            placeholderTextColor={isDark ? '#8E8E93' : '#94A3B8'}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X color={isDark ? '#8E8E93' : '#64748B'} size={16} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.filterPillRow}>
          {(
            [
              { id: 'all', label: `All (${invoices.length})` },
              { id: 'Paid', label: 'Paid' },
              { id: 'Unpaid', label: 'Unpaid / Due' },
            ] as const
          ).map((f) => (
            <TouchableOpacity
              key={f.id}
              onPress={() => {
                Haptics.selectionAsync();
                setStatusFilter(f.id);
              }}
              style={[
                styles.filterPill,
                statusFilter === f.id
                  ? styles.filterPillActive
                  : isDark
                  ? styles.filterPillDark
                  : styles.filterPillLight,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterPillText,
                  statusFilter === f.id
                    ? styles.textWhite
                    : isDark
                    ? styles.textGray
                    : styles.textSlate,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Invoice List */}
      {isLoading && !isRefetching ? (
        <View style={styles.scrollContent}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width="100%" height={120} borderRadius={24} isDark={isDark} style={{ marginBottom: 14 }} />
          ))}
        </View>
      ) : filteredInvoices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FileText color={isDark ? '#475569' : '#94A3B8'} size={48} style={{ marginBottom: 12 }} />
          <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textBlack]}>
            No Invoices Found
          </Text>
          <Text style={[styles.emptySubtitle, isDark ? styles.textGray : styles.textSlate]}>
            {search ? 'Try adjusting your search criteria.' : 'Tap the + button to create a new member invoice.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollInset + 70 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={isDark ? '#FFFFFF' : '#3A4C56'}
            />
          }
        >
          {filteredInvoices.map((inv: any, index: number) => {
            const isPaid = inv.status === 'Paid';
            return (
              <Animated.View
                key={inv.id}
                entering={FadeInDown.delay(index * 60).duration(260)}
                style={[styles.invoiceCard, isDark ? styles.cardDark : styles.cardLight]}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedReceipt(inv);
                  }}
                >
                  <View style={styles.invHeader}>
                    <View style={styles.invLeft}>
                      <FileText color="#d96638" size={18} />
                      <Text style={[styles.invId, isDark ? styles.textWhite : styles.textBlack]}>
                        #{inv.id.substring(0, 8).toUpperCase()}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: isPaid
                              ? isDark
                                ? 'rgba(16, 185, 129, 0.18)'
                                : '#D1FAE5'
                              : isDark
                              ? 'rgba(239, 68, 68, 0.18)'
                              : '#FEE2E2',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: isPaid ? '#10B981' : '#EF4444' },
                          ]}
                        >
                          {inv.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.invBody}>
                    <Text style={[styles.invMember, isDark ? styles.textWhite : styles.textBlack]}>
                      {inv.member}
                    </Text>
                    <Text style={[styles.invPlan, isDark ? styles.textGray : styles.textSlate]}>
                      {inv.plan} • {inv.date}
                    </Text>
                  </View>

                  <View style={[styles.divider, isDark ? styles.borderDark : styles.borderLight]} />

                  <View style={styles.invFooter}>
                    <Text style={[styles.invAmount, isDark ? styles.textWhite : styles.textBlack]}>
                      {formatCurrency(inv.amount)}
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={[
                          styles.actionBtnSmall,
                          {
                            backgroundColor: isPaid
                              ? isDark
                                ? 'rgba(245, 158, 11, 0.15)'
                                : '#FEF3C7'
                              : isDark
                              ? 'rgba(16, 185, 129, 0.15)'
                              : '#D1FAE5',
                          },
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          toggleStatusMutation.mutate({
                            id: inv.id,
                            newStatus: isPaid ? 'Unpaid' : 'Paid',
                          });
                        }}
                      >
                        <Check color={isPaid ? '#F59E0B' : '#10B981'} size={14} />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: '700',
                            color: isPaid ? '#F59E0B' : '#10B981',
                          }}
                        >
                          {isPaid ? 'Mark Due' : 'Mark Paid'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.downloadBtn, isDark ? styles.btnDark : styles.btnLight]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setSelectedReceipt(inv);
                        }}
                      >
                        <Receipt color={isDark ? '#FFF' : '#1E293B'} size={14} />
                        <Text style={[styles.downloadText, isDark ? styles.textWhite : styles.textBlack]}>
                          Receipt
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>
      )}

      {/* Floating Action Button for New Invoice */}
      <TouchableOpacity
        style={[styles.fab, { bottom: fixedActionBottom }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setIsModalVisible(true);
        }}
        activeOpacity={0.85}
      >
        <Plus color="#FFFFFF" size={28} />
      </TouchableOpacity>

      {/* CREATE INVOICE MODAL */}
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
              <View>
                <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>
                  Create New Invoice
                </Text>
                <Text style={[styles.modalSubtitle, isDark ? styles.textGray : styles.textSlate]}>
                  Issue gym membership invoice to member
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
                <X color={isDark ? '#FFF' : '#1E293B'} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
              {/* Member Picker */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>
                  SELECT MEMBER
                </Text>
                <TouchableOpacity
                  onPress={() => setMemberPickerOpen(!memberPickerOpen)}
                  style={[styles.selectBox, isDark ? styles.inputDark : styles.inputLight]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <User color="#d96638" size={18} />
                    <Text style={[isDark ? styles.textWhite : styles.textBlack, { fontSize: 15 }]}>
                      {selectedMemberName || 'Select a registered gym member...'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Member Dropdown Options */}
                {memberPickerOpen && (
                  <View style={[styles.dropdownList, isDark ? styles.dropdownDark : styles.dropdownLight]}>
                    <ScrollView nestedScrollEnabled style={{ maxHeight: 160 }}>
                      {membersData?.map((u: any) => (
                        <TouchableOpacity
                          key={u.id}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setSelectedUserId(u.id);
                            setSelectedMemberName(u.name);
                            if (u.membership?.plan?.name) {
                              setPlanName(u.membership.plan.name);
                              setAmount(String(u.membership.plan.price || ''));
                            }
                            setMemberPickerOpen(false);
                          }}
                          style={styles.dropdownItem}
                        >
                          <Text style={[styles.memberNameText, isDark ? styles.textWhite : styles.textBlack]}>
                            {u.name}
                          </Text>
                          <Text style={[styles.memberSubText, isDark ? styles.textGray : styles.textSlate]}>
                            {u.email} {u.memberId ? `• ID: ${u.memberId}` : ''}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Plan Presets & Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>
                  PLAN / MEMBERSHIP
                </Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="e.g. Annual Championship Plan"
                  placeholderTextColor={isDark ? '#8E8E93' : '#94A3B8'}
                  value={planName}
                  onChangeText={setPlanName}
                />

                {/* Plan Shortcut Chips */}
                {plans.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 6 }}>
                    {plans.map((p: any) => (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setPlanName(p.name);
                          setAmount(String(p.price));
                        }}
                        style={[styles.planChip, isDark ? styles.chipDark : styles.chipLight]}
                      >
                        <Text style={[styles.planChipText, isDark ? styles.textWhite : styles.textBlack]}>
                          {p.name} (₹{p.price})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Amount Field */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>
                  AMOUNT (₹)
                </Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="e.g. 15000"
                  placeholderTextColor={isDark ? '#8E8E93' : '#94A3B8'}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              {/* Payment Status Switch */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>
                  INITIAL STATUS
                </Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {(['Paid', 'Unpaid'] as const).map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setStatus(s);
                      }}
                      style={[
                        styles.statusSelectBtn,
                        status === s
                          ? styles.statusSelectBtnActive
                          : isDark
                          ? styles.chipDark
                          : styles.chipLight,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusSelectText,
                          status === s ? styles.textWhite : isDark ? styles.textGray : styles.textSlate,
                        ]}
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, addInvoiceMutation.isPending && styles.submitButtonDisabled]}
                onPress={handleCreateSubmit}
                disabled={addInvoiceMutation.isPending}
                activeOpacity={0.8}
              >
                {addInvoiceMutation.isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Issue Invoice</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* RECEIPT SLIP VOUCHER MODAL */}
      <Modal
        visible={!!selectedReceipt}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedReceipt(null)}
      >
        <View style={styles.receiptOverlay}>
          <View style={[styles.receiptCard, isDark ? styles.receiptDark : styles.receiptLight]}>
            {/* Receipt Header */}
            <View style={styles.receiptTop}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Receipt color="#d96638" size={24} />
                  <Text style={[styles.receiptBrand, isDark ? styles.textWhite : styles.textBlack]}>
                    UFC GYM
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedReceipt(null)}>
                  <X color={isDark ? '#FFF' : '#000'} size={20} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.receiptSubHeader, isDark ? styles.textGray : styles.textSlate]}>
                Official Tax Invoice Voucher
              </Text>
            </View>

            <View style={[styles.receiptDivider, isDark ? styles.borderDark : styles.borderLight]} />

            {/* Receipt Content */}
            {selectedReceipt && (
              <View style={{ gap: 14 }}>
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, isDark ? styles.textGray : styles.textSlate]}>Invoice ID</Text>
                  <Text style={[styles.receiptValue, isDark ? styles.textWhite : styles.textBlack]}>
                    #{selectedReceipt.id.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, isDark ? styles.textGray : styles.textSlate]}>Member</Text>
                  <Text style={[styles.receiptValue, isDark ? styles.textWhite : styles.textBlack]}>
                    {selectedReceipt.member}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, isDark ? styles.textGray : styles.textSlate]}>Plan / Service</Text>
                  <Text style={[styles.receiptValue, isDark ? styles.textWhite : styles.textBlack]}>
                    {selectedReceipt.plan}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, isDark ? styles.textGray : styles.textSlate]}>Issue Date</Text>
                  <Text style={[styles.receiptValue, isDark ? styles.textWhite : styles.textBlack]}>
                    {selectedReceipt.date}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, isDark ? styles.textGray : styles.textSlate]}>Status</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          selectedReceipt.status === 'Paid'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '800',
                        color: selectedReceipt.status === 'Paid' ? '#10B981' : '#EF4444',
                      }}
                    >
                      {selectedReceipt.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={[styles.receiptDivider, isDark ? styles.borderDark : styles.borderLight]} />

                {/* Pricing Summary */}
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, isDark ? styles.textGray : styles.textSlate]}>Base Total</Text>
                  <Text style={[styles.receiptValue, isDark ? styles.textWhite : styles.textBlack]}>
                    {formatCurrency(Math.round(selectedReceipt.amount * 0.82))}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, isDark ? styles.textGray : styles.textSlate]}>GST (18%)</Text>
                  <Text style={[styles.receiptValue, isDark ? styles.textWhite : styles.textBlack]}>
                    {formatCurrency(Math.round(selectedReceipt.amount * 0.18))}
                  </Text>
                </View>

                <View style={[styles.receiptRow, { marginTop: 6 }]}>
                  <Text style={[{ fontSize: 16, fontWeight: '800' }, isDark ? styles.textWhite : styles.textBlack]}>
                    Total Amount
                  </Text>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: '#d96638' }}>
                    {formatCurrency(selectedReceipt.amount)}
                  </Text>
                </View>

                {/* Receipt Actions */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                  <TouchableOpacity
                    onPress={() => {
                      const newStatus = selectedReceipt.status === 'Paid' ? 'Unpaid' : 'Paid';
                      toggleStatusMutation.mutate({ id: selectedReceipt.id, newStatus });
                    }}
                    style={[styles.receiptBtn, { backgroundColor: '#d96638', flex: 1 }]}
                  >
                    <Check color="#FFF" size={16} />
                    <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>
                      {selectedReceipt.status === 'Paid' ? 'Mark Due' : 'Mark as Paid'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDelete(selectedReceipt.id)}
                    style={[styles.receiptBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)', width: 44 }]}
                  >
                    <Trash2 color="#EF4444" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.1)', gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 12, marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, padding: 14, borderRadius: 16, borderWidth: 1 },
  boxDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  boxLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  statLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 20, fontWeight: '800' },

  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, height: 44, borderRadius: 14, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14 },

  filterPillRow: { flexDirection: 'row', gap: 8 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  filterPillActive: { backgroundColor: '#d96638', borderColor: '#d96638' },
  filterPillDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  filterPillLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  filterPillText: { fontSize: 12, fontWeight: '700' },

  scrollContent: { padding: 20, gap: 14 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 18 },

  invoiceCard: { padding: 16, borderRadius: 20, borderWidth: 1 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },

  invHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  invLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  invId: { fontSize: 13, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

  invBody: { marginBottom: 12 },
  invMember: { fontSize: 17, fontWeight: '800', marginBottom: 3 },
  invPlan: { fontSize: 13 },

  divider: { height: 1, marginVertical: 12 },
  borderDark: { backgroundColor: '#30363D' },
  borderLight: { backgroundColor: '#F1F5F9' },

  invFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  invAmount: { fontSize: 20, fontWeight: '900' },
  actionBtnSmall: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  downloadText: { fontSize: 12, fontWeight: '700' },
  btnDark: { backgroundColor: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.1)' },
  btnLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },

  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#d96638',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#d96638',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '88%', padding: 24, gap: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  modalSubtitle: { fontSize: 12, marginTop: 2 },
  closeButton: { padding: 4 },
  formContainer: { gap: 16, paddingBottom: 24 },
  inputGroup: { gap: 6 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  selectBox: { borderWidth: 1, borderRadius: 14, padding: 14 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, height: 48, fontSize: 15 },
  inputLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  inputDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },

  dropdownList: { borderWidth: 1, borderRadius: 14, padding: 8, marginTop: 4 },
  dropdownDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  dropdownLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(150,150,150,0.1)' },
  memberNameText: { fontSize: 14, fontWeight: '700' },
  memberSubText: { fontSize: 12, marginTop: 2 },

  planChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  chipDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  chipLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  planChipText: { fontSize: 12, fontWeight: '600' },

  statusSelectBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  statusSelectBtnActive: { backgroundColor: '#d96638', borderColor: '#d96638' },
  statusSelectText: { fontSize: 13, fontWeight: '700' },

  submitButton: { backgroundColor: '#d96638', borderRadius: 16, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // Receipt Slip Styles
  receiptOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  receiptCard: { width: '100%', maxWidth: 380, borderRadius: 28, padding: 24, borderWidth: 1 },
  receiptDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  receiptLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  receiptTop: { alignItems: 'center', gap: 4 },
  receiptBrand: { fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  receiptSubHeader: { fontSize: 12, marginTop: 2 },
  receiptDivider: { height: 1, marginVertical: 14 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptLabel: { fontSize: 13 },
  receiptValue: { fontSize: 14, fontWeight: '700' },
  receiptBtn: { height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },

  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#0F172A' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
});

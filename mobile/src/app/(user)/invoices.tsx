import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, Modal, Share, Platform } from 'react-native';
import { FileText, Download, CheckCircle, Clock, CreditCard, ChevronLeft, Receipt, Share2, X, CheckCircle2, ShieldCheck } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { router } from 'expo-router';
import { RefreshControl } from 'react-native';
import { Skeleton } from '../../components/ui/Skeleton';
import { useUIStore } from '../../store/useUIStore';

export default function UserInvoices() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { scrollInset } = useAppBottomInset();

  const { showToast } = useUIStore();
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['userInvoices'],
    queryFn: async () => {
      const response = await api.get('/user/invoices');
      return response.data;
    }
  });

  const membership = data?.membership || {
    planName: 'No Active Plan',
    status: 'Inactive',
    nextBilling: '-',
    price: 0
  };

  const invoices = data?.invoices || [];

  const handleDownload = (inv: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReceipt(inv);
  };

  const handleShareReceipt = async () => {
    if (!selectedReceipt) return;
    try {
      await Share.share({
        message: `UFC GYM Official Receipt\nInvoice: #${selectedReceipt.id.substring(0, 8).toUpperCase()}\nPlan: ${selectedReceipt.planName || 'Gym Membership'}\nAmount Paid: ₹${(selectedReceipt.amount || 0).toLocaleString('en-IN')}\nStatus: ${selectedReceipt.status || 'Paid'}\nDate: ${new Date(selectedReceipt.date).toLocaleDateString()}\nVerified by UFC GYM India.`,
      });
    } catch (err) {
      // Ignored
    }
  };

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={[styles.backButton, isDark ? styles.btnDark : styles.btnLight]}
        >
          <ChevronLeft color={isDark ? '#FFF' : '#1E293B'} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Invoices</Text>
        <View style={{ width: 48 }} />
      </View>

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
        {isLoading && !isRefetching ? (
          <View style={{ gap: 32 }}>
            <Skeleton width="100%" height={160} borderRadius={32} isDark={isDark} />
            <View>
              <Skeleton width={180} height={28} isDark={isDark} style={{ marginBottom: 16 }} />
              <View style={{ gap: 12 }}>
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} width="100%" height={80} borderRadius={24} isDark={isDark} />
                ))}
              </View>
            </View>
          </View>
        ) : (
          <>
            {/* Current Membership Card */}
            <Animated.View entering={FadeInDown.delay(100).duration(260)} style={[styles.membershipCard, { backgroundColor: '#F9D3AF' }]}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <CreditCard color="#3A4C56" size={24} />
                </View>
                <View style={styles.statusBadge}>
                  <CheckCircle color="#34C759" size={14} />
                  <Text style={styles.statusText}>{membership.status}</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.planLabel}>Current Plan</Text>
                <Text style={styles.planName}>{membership.planName}</Text>
                <Text style={styles.planDetails}>Expires {membership.nextBilling ? new Date(membership.nextBilling).toLocaleDateString() : '-'} • ₹{(membership.price || 0).toLocaleString('en-IN')}/yr</Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(260)} style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>Payment History</Text>
            </Animated.View>

            {/* Invoices List */}
            <View style={styles.invoicesList}>
              {invoices.map((inv: any, index: number) => (
                <Animated.View 
                  key={inv.id}
                  entering={FadeInDown.delay(300 + (index * 100)).duration(260)}
                >
                  <TouchableOpacity 
                    style={[styles.invoiceItem, isDark ? styles.cardDark : styles.cardLight]}
                    onPress={() => handleDownload(inv)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.invoiceLeft}>
                      <View style={[styles.invoiceIconBg, { backgroundColor: isDark ? '#30363D' : '#F1F5F9' }]}>
                        <FileText color={isDark ? '#A8C6CB' : '#3A4C56'} size={20} />
                      </View>
                      <View>
                        <Text style={[styles.invoiceId, isDark ? styles.textWhite : styles.textBlack]}>
                          #{inv.id.split('-')[0].toUpperCase().substring(0, 8)}
                        </Text>
                        <Text style={[styles.invoiceDate, isDark ? styles.textGray : styles.textSlate]}>
                          {new Date(inv.date).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.invoiceRight}>
                      <Text style={[styles.invoiceAmount, isDark ? styles.textWhite : styles.textBlack]}>
                        ₹{(inv.amount || 0).toLocaleString('en-IN')}
                      </Text>
                      <TouchableOpacity 
                        style={[styles.downloadBtn, { backgroundColor: isDark ? '#30363D' : '#E2E8F0' }]}
                        onPress={() => handleDownload(inv)}
                        activeOpacity={0.7}
                      >
                        <Receipt color={isDark ? '#A8C6CB' : '#3A4C56'} size={16} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Official Receipt Slip Modal */}
      <Modal
        visible={!!selectedReceipt}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedReceipt(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.receiptCard, isDark ? styles.receiptDark : styles.receiptLight]}>
            <View style={styles.receiptTop}>
              <View style={styles.receiptBadge}>
                <ShieldCheck color="#34C759" size={16} />
                <Text style={styles.receiptBadgeText}>Official Receipt</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedReceipt(null)} style={styles.closeBtn}>
                <X color={isDark ? '#FFF' : '#1E293B'} size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.receiptHeader}>
              <Text style={styles.gymLogoText}>UFC GYM</Text>
              <Text style={[styles.gymSubText, isDark ? styles.textGray : styles.textSlate]}>Payment Clearance Slip</Text>
              <Text style={[styles.receiptRef, isDark ? styles.textGray : styles.textSlate]}>
                Ref: #{selectedReceipt?.id?.split('-')[0].toUpperCase()}
              </Text>
            </View>

            <View style={[styles.receiptDivider, { borderColor: isDark ? '#30363D' : '#E2E8F0' }]} />

            <View style={styles.receiptDetails}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, isDark ? styles.textGray : styles.textSlate]}>Plan / Package</Text>
                <Text style={[styles.detailValue, isDark ? styles.textWhite : styles.textBlack]}>
                  {selectedReceipt?.planName || membership?.planName || 'Gym Access Membership'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, isDark ? styles.textGray : styles.textSlate]}>Date</Text>
                <Text style={[styles.detailValue, isDark ? styles.textWhite : styles.textBlack]}>
                  {selectedReceipt?.date ? new Date(selectedReceipt.date).toLocaleDateString() : '-'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, isDark ? styles.textGray : styles.textSlate]}>Status</Text>
                <View style={styles.paidPill}>
                  <CheckCircle2 color="#34C759" size={14} />
                  <Text style={styles.paidPillText}>{selectedReceipt?.status || 'Paid'}</Text>
                </View>
              </View>

              <View style={[styles.receiptDivider, { borderColor: isDark ? '#30363D' : '#E2E8F0', marginVertical: 12 }]} />

              <View style={styles.detailRow}>
                <Text style={[styles.totalLabel, isDark ? styles.textWhite : styles.textBlack]}>Total Paid</Text>
                <Text style={styles.totalValue}>
                  ₹{(selectedReceipt?.amount || 0).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShareReceipt}
              activeOpacity={0.8}
            >
              <Share2 color="#FFF" size={18} />
              <Text style={styles.shareBtnText}>Share / Save Receipt</Text>
            </TouchableOpacity>
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
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20 },
  backButton: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  btnDark: { backgroundColor: '#161B22' },
  btnLight: { backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  
  scrollContent: { paddingHorizontal: 20 },
  
  membershipCard: { padding: 24, borderRadius: 32, marginBottom: 32 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 4 },
  statusText: { color: '#3A4C56', fontSize: 13, fontWeight: '700' },
  
  cardBody: {},
  planLabel: { color: '#3A4C56', opacity: 0.7, fontSize: 13, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
  planName: { color: '#3A4C56', fontSize: 32, fontWeight: '800', letterSpacing: -1, marginBottom: 8 },
  planDetails: { color: '#3A4C56', fontSize: 15, fontWeight: '500', opacity: 0.9 },

  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },

  invoicesList: { gap: 12 },
  invoiceItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 24, borderWidth: 1 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  
  invoiceLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  invoiceIconBg: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  invoiceId: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  invoiceDate: { fontSize: 13, fontWeight: '500' },
  
  invoiceRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  invoiceAmount: { fontSize: 16, fontWeight: '700' },
  downloadBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  
  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },

  // Receipt Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  receiptCard: { width: '100%', maxWidth: 360, borderRadius: 28, padding: 24, borderWidth: 1 },
  receiptDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  receiptLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  receiptTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  receiptBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(52, 199, 89, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  receiptBadgeText: { fontSize: 12, fontWeight: '700', color: '#34C759' },
  closeBtn: { padding: 4 },
  receiptHeader: { alignItems: 'center', marginBottom: 16 },
  gymLogoText: { fontSize: 24, fontWeight: '900', color: '#d96638', letterSpacing: 2 },
  gymSubText: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  receiptRef: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  receiptDivider: { borderBottomWidth: 1, borderStyle: 'dashed', marginVertical: 8 },
  receiptDetails: { gap: 10, marginBottom: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 13, fontWeight: '500' },
  detailValue: { fontSize: 13, fontWeight: '700' },
  paidPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  paidPillText: { fontSize: 13, fontWeight: '700', color: '#34C759' },
  totalLabel: { fontSize: 16, fontWeight: '800' },
  totalValue: { fontSize: 20, fontWeight: '900', color: '#d96638' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#d96638', paddingVertical: 14, borderRadius: 18 },
  shareBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

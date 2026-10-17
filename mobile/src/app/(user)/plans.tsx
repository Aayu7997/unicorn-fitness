import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, Dimensions, ActivityIndicator } from 'react-native';
import { FileText, ChevronLeft, CreditCard, Calendar, Star, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Skeleton } from '../../components/ui/Skeleton';
import * as Haptics from 'expo-haptics';

import { useAppBottomInset } from '../../hooks/useAppBottomInset';

export default function Plans() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { insets, scrollInset } = useAppBottomInset();

  const { data, isLoading } = useQuery({
    queryKey: ['plans-invoices'],
    queryFn: async () => {
      const res = await api.get('/user/plans');
      return res.data;
    }
  });

  const plan = data?.plan || null;
  const invoices = data?.invoices || [];

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={isDark ? '#FFF' : '#000'} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Plans & Invoices</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollInset }]}>
        {isLoading ? (
          <View style={{ gap: 20 }}>
             <Skeleton width="100%" height={220} borderRadius={24} isDark={isDark} />
             <Skeleton width="100%" height={100} borderRadius={16} isDark={isDark} />
          </View>
        ) : (
          <>
            <Animated.View entering={FadeInDown.duration(260)} style={[styles.planCard, isDark ? styles.cardDark : styles.cardLight]}>
               <View style={styles.planHeader}>
                 <View style={styles.planIcon}>
                   <Star color="#d96638" size={24} fill="#d96638" />
                 </View>
                 <View style={styles.activeBadge}>
                   <Text style={styles.activeText}>ACTIVE</Text>
                 </View>
               </View>
               
               <Text style={[styles.planTitle, isDark ? styles.textWhite : styles.textBlack]}>
                 {plan?.name || 'UFC Pro Membership'}
               </Text>
               
               <Text style={[styles.planPrice, isDark ? styles.textWhite : styles.textBlack]}>
                 ${plan?.price || '99.00'} <Text style={styles.planPeriod}>/ {plan?.billingCycle || 'month'}</Text>
               </Text>
               
               <View style={styles.divider} />
               
               <View style={styles.planDetailRow}>
                 <Calendar color={isDark ? '#8E8E93' : '#64748B'} size={18} />
                 <Text style={[styles.planDetailText, isDark ? styles.textGray : styles.textSlate]}>
                   Next billing date: {plan?.nextBillingDate ? new Date(plan.nextBillingDate).toLocaleDateString() : 'Nov 1, 2026'}
                 </Text>
               </View>
               
               <View style={styles.planDetailRow}>
                 <CreditCard color={isDark ? '#8E8E93' : '#64748B'} size={18} />
                 <Text style={[styles.planDetailText, isDark ? styles.textGray : styles.textSlate]}>
                   Payment method: •••• 4242
                 </Text>
               </View>
            </Animated.View>
            
            <Animated.View entering={FadeInDown.delay(100).duration(260)}>
               <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>Billing History</Text>
               
               <View style={[styles.invoiceList, isDark ? styles.cardDark : styles.cardLight]}>
                 {(invoices.length > 0 ? invoices : [
                   { id: 'INV-1204', date: 'Oct 1, 2026', amount: 99.00, status: 'Paid' },
                   { id: 'INV-1102', date: 'Sep 1, 2026', amount: 99.00, status: 'Paid' },
                   { id: 'INV-1005', date: 'Aug 1, 2026', amount: 99.00, status: 'Paid' }
                 ]).map((invoice: any, idx: number, arr: any[]) => (
                   <View key={invoice.id} style={[styles.invoiceRow, idx !== arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#30363D' : '#E2E8F0' }]}>
                     <View style={styles.invoiceLeft}>
                       <View style={styles.invoiceIcon}>
                         <FileText color={isDark ? '#8E8E93' : '#64748B'} size={20} />
                       </View>
                       <View>
                         <Text style={[styles.invoiceId, isDark ? styles.textWhite : styles.textBlack]}>{invoice.id}</Text>
                         <Text style={[styles.invoiceDate, isDark ? styles.textGray : styles.textSlate]}>{invoice.date}</Text>
                       </View>
                     </View>
                     <View style={{ alignItems: 'flex-end' }}>
                       <Text style={[styles.invoiceAmount, isDark ? styles.textWhite : styles.textBlack]}>${invoice.amount?.toFixed(2)}</Text>
                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                         {invoice.status === 'Paid' && <CheckCircle2 color="#22C55E" size={12} />}
                         <Text style={[styles.invoiceStatus, invoice.status === 'Paid' ? { color: '#22C55E' } : { color: '#EF4444' }]}>{invoice.status}</Text>
                       </View>
                     </View>
                   </View>
                 ))}
               </View>
            </Animated.View>
          </>
        )}
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
  
  planCard: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 32 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  planIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(217, 102, 56, 0.1)', alignItems: 'center', justifyContent: 'center' },
  activeBadge: { backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  activeText: { color: '#22C55E', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  
  planTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  planPrice: { fontSize: 32, fontWeight: '800', marginBottom: 24 },
  planPeriod: { fontSize: 16, color: '#8E8E93', fontWeight: '500' },
  
  divider: { height: 1, backgroundColor: 'rgba(150,150,150,0.1)', marginBottom: 20 },
  
  planDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  planDetailText: { fontSize: 15, fontWeight: '500' },
  
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  
  invoiceList: { borderRadius: 24, borderWidth: 1, paddingHorizontal: 20 },
  invoiceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
  invoiceLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  invoiceIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(150,150,150,0.1)', alignItems: 'center', justifyContent: 'center' },
  invoiceId: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  invoiceDate: { fontSize: 13 },
  invoiceAmount: { fontSize: 16, fontWeight: '800' },
  invoiceStatus: { fontSize: 12, fontWeight: '700' },
  
  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
});

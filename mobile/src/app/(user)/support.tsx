import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, Dimensions, TextInput, ActivityIndicator } from 'react-native';
import { MessageSquare, ChevronLeft, Plus, Clock, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppBottomInset } from '../../hooks/useAppBottomInset';
import { router } from 'expo-router';
import { Skeleton } from '../../components/ui/Skeleton';
import * as Haptics from 'expo-haptics';
import { useUIStore } from '../../store/useUIStore';

export default function Support() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { scrollInset } = useAppBottomInset();
  const { showToast } = useUIStore();
  
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      const res = await api.get('/user/support');
      return res.data;
    },
    refetchInterval: 5000,
  });

  const rawList = Array.isArray(data) ? data : (data?.tickets || data?.messages || []);
  const tickets = rawList.map((m: any) => {
    const isFromAdmin = m.sender?.role === 'admin';
    const isFromMe = m.senderId === user?.id || (!isFromAdmin && m.sender?.role !== 'admin');
    return {
      id: m.id,
      subject: m.subject || (isFromAdmin ? 'Reply from UFC Management' : 'Support Enquiry'),
      message: m.message,
      status: isFromAdmin ? 'Resolved' : (m.isRead ? 'Reviewed' : 'Open'),
      createdAt: m.createdAt,
      isFromAdmin,
      isFromMe,
      senderName: isFromAdmin ? (m.sender?.name || 'UFC Staff Team') : (m.sender?.name || 'You')
    };
  });

  const handleSubmit = async () => {
    if (!message.trim()) {
      showToast('Please describe your enquiry or message', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const fullMessage = subject.trim() ? `[${subject.trim()}] ${message.trim()}` : message.trim();
      await api.post('/user/support', { message: fullMessage, subject });
      showToast('Enquiry sent to UFC Gym staff!', 'success');
      setSubject('');
      setMessage('');
      setShowForm(false);
      refetch();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast('Failed to submit enquiry', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={isDark ? '#FFF' : '#000'} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Support</Text>
        <TouchableOpacity onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowForm(!showForm);
        }} style={styles.newButton}>
          <Plus color={isDark ? '#FFF' : '#000'} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollInset }]}>
        
        {showForm && (
          <Animated.View entering={FadeInDown.duration(260)} style={[styles.formCard, isDark ? styles.cardDark : styles.cardLight]}>
            <Text style={[styles.formTitle, isDark ? styles.textWhite : styles.textBlack]}>New Enquiry</Text>
            
            <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>SUBJECT</Text>
            <TextInput 
              style={[styles.input, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
              placeholder="What do you need help with?"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={subject}
              onChangeText={setSubject}
            />
            
            <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>MESSAGE</Text>
            <TextInput 
              style={[styles.textArea, isDark ? styles.inputDark : styles.inputLight, isDark ? styles.textWhite : styles.textBlack]}
              placeholder="Describe your issue in detail..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />
            
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Submit Enquiry</Text>}
            </TouchableOpacity>
          </Animated.View>
        )}

        {isLoading ? (
          <View style={{ gap: 16, marginTop: 20 }}>
             <Skeleton width="100%" height={120} borderRadius={16} isDark={isDark} />
             <Skeleton width="100%" height={120} borderRadius={16} isDark={isDark} />
          </View>
        ) : tickets.length > 0 ? (
          <View style={{ marginTop: 10 }}>
            <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>Enquiries & Messages</Text>
            {tickets.map((ticket: any, index: number) => (
              <Animated.View key={ticket.id} entering={FadeInDown.delay(index * 60).duration(260)} style={[styles.ticketCard, isDark ? styles.cardDark : styles.cardLight, ticket.isFromAdmin && { borderColor: '#d96638', borderWidth: 1.5 }]}>
                 <View style={styles.ticketHeader}>
                   <View style={{ flex: 1, marginRight: 8 }}>
                     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                       <View style={[styles.senderDot, { backgroundColor: ticket.isFromAdmin ? '#22C55E' : '#d96638' }]} />
                       <Text style={[styles.senderNameLabel, { color: ticket.isFromAdmin ? '#22C55E' : '#d96638' }]}>
                         {ticket.isFromAdmin ? 'STAFF REPLY' : 'SENT ENQUIRY'}
                       </Text>
                     </View>
                     <Text style={[styles.ticketSubject, isDark ? styles.textWhite : styles.textBlack]}>{ticket.subject}</Text>
                   </View>
                   <View style={[styles.statusBadge, ticket.status === 'Resolved' || ticket.isFromAdmin ? { backgroundColor: 'rgba(34, 197, 94, 0.12)' } : { backgroundColor: 'rgba(217, 102, 56, 0.12)' }]}>
                     <Text style={[styles.statusText, ticket.status === 'Resolved' || ticket.isFromAdmin ? { color: '#22C55E' } : { color: '#d96638' }]}>{ticket.status}</Text>
                   </View>
                 </View>
                 
                 <Text style={[styles.ticketMessage, isDark ? styles.textWhite : styles.textBlack]}>{ticket.message || 'No description provided'}</Text>
                 
                 <View style={styles.ticketFooter}>
                   <View style={styles.footerItem}>
                     <Clock color={isDark ? '#8E8E93' : '#64748B'} size={14} />
                     <Text style={[styles.footerText, isDark ? styles.textGray : styles.textSlate]}>
                       {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent'}
                     </Text>
                   </View>
                   <Text style={[styles.ticketId, isDark ? styles.textGray : styles.textSlate]}>#{ticket.id?.substring(0, 8) || '00000000'}</Text>
                 </View>
              </Animated.View>
            ))}
          </View>
        ) : (
          !showForm && (
            <Animated.View entering={FadeInDown.duration(260)} style={[styles.emptyState, isDark ? styles.cardDark : styles.cardLight]}>
              <View style={styles.iconCircle}>
                <MessageSquare color="#d96638" size={40} />
              </View>
              <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textBlack]}>No Support Tickets</Text>
              <Text style={[styles.emptyDesc, isDark ? styles.textGray : styles.textSlate]}>You don't have any active support requests. Need help? Create a new ticket.</Text>
            </Animated.View>
          )
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
  newButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  scrollContent: { padding: 20 },
  
  formCard: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 24 },
  cardDark: { backgroundColor: '#161B22', borderColor: '#30363D' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  formTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
  
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  input: { height: 56, borderRadius: 16, paddingHorizontal: 20, fontSize: 16, borderWidth: 1, marginBottom: 20 },
  textArea: { height: 120, borderRadius: 16, paddingHorizontal: 20, paddingTop: 16, fontSize: 16, borderWidth: 1, marginBottom: 24 },
  inputDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  inputLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  
  submitBtn: { height: 56, backgroundColor: '#d96638', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  ticketCard: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ticketSubject: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  ticketMessage: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(150,150,150,0.1)' },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, fontWeight: '600' },
  ticketId: { fontSize: 12, fontWeight: '600' },
  
  emptyState: { padding: 40, borderRadius: 24, alignItems: 'center', borderWidth: 1, marginTop: 40 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(217, 102, 56, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  emptyDesc: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  
  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
  senderDot: { width: 8, height: 8, borderRadius: 4 },
  senderNameLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
});


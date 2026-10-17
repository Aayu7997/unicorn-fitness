import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, Dimensions, TextInput } from 'react-native';
import { Gift, Copy, Share2, Users, CheckCircle2, ChevronLeft } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useUIStore } from '../../store/useUIStore';

import { useAppBottomInset } from '../../hooks/useAppBottomInset';

export default function Referrals() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { insets, scrollInset } = useAppBottomInset();
  const [copied, setCopied] = useState(false);
  const { showToast } = useUIStore();

  const referralCode = `UNICORN-${user?.name?.split(' ')[0]?.toUpperCase() || 'USER'}-${user?.id?.substring(0, 4)?.toUpperCase() || '0000'}`;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referralCode);
    setCopied(true);
    showToast('Referral code copied!', 'success');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={isDark ? '#FFF' : '#000'} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark ? styles.textWhite : styles.textBlack]}>Refer a Friend</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollInset }]}>
        <Animated.View entering={FadeInDown.delay(100).duration(260)}>
          <Text style={[styles.pageSubtitle, isDark ? styles.textGray : styles.textSlate]}>
            Earn free months by inviting your friends to the club.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(260)} style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
          <View style={styles.iconCircle}>
            <Gift color="#d96638" size={32} />
          </View>
          <Text style={[styles.cardTitle, isDark ? styles.textWhite : styles.textBlack]}>Give a Month, Get a Month</Text>
          <Text style={[styles.cardDesc, isDark ? styles.textGray : styles.textSlate]}>
            Share your unique code. When a friend signs up for any Pro plan using your code, they get 20% off their first month, and you get a month for free!
          </Text>

          <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>YOUR UNIQUE CODE</Text>
          <View style={styles.codeRow}>
            <View style={[styles.codeBox, isDark ? styles.inputDark : styles.inputLight]}>
              <Text style={styles.codeText}>{referralCode}</Text>
            </View>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
              {copied ? <CheckCircle2 color="#FFF" size={24} /> : <Copy color="#FFF" size={24} />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.shareButton, isDark ? styles.inputDark : styles.inputLight]}>
            <Share2 color={isDark ? '#FFF' : '#1E293B'} size={20} />
            <Text style={[styles.shareText, isDark ? styles.textWhite : styles.textBlack]}>Share via WhatsApp</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(260)} style={[styles.statsCard, isDark ? styles.cardDark : styles.cardLight]}>
           <View style={styles.statsHeader}>
             <View>
               <Text style={[styles.label, isDark ? styles.textGray : styles.textSlate]}>FRIENDS JOINED</Text>
               <Text style={[styles.statsValue, isDark ? styles.textWhite : styles.textBlack]}>2</Text>
             </View>
             <Users color={isDark ? '#30363D' : '#E2E8F0'} size={40} />
           </View>
           <View style={styles.progressTrack}>
             <View style={[styles.progressFill, { width: '66%' }]} />
           </View>
           <Text style={[styles.progressDesc, isDark ? styles.textGray : styles.textSlate]}>1 more friend to unlock your next free month!</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(260)} style={[styles.recentCard, isDark ? styles.cardDark : styles.cardLight]}>
          <Text style={[styles.recentTitle, isDark ? styles.textWhite : styles.textBlack]}>Recent Referrals</Text>
          {[
            { name: 'Rahul Sharma', date: 'May 12, 2026', status: 'Completed', reward: '1 Month Free' },
            { name: 'Priya Patel', date: 'May 28, 2026', status: 'Completed', reward: '1 Month Free' }
          ].map((ref, idx) => (
            <View key={idx} style={[styles.refRow, idx !== 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#30363D' : '#E2E8F0' }]}>
              <View>
                <Text style={[styles.refName, isDark ? styles.textWhite : styles.textBlack]}>{ref.name}</Text>
                <Text style={[styles.refDate, isDark ? styles.textGray : styles.textSlate]}>{ref.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={styles.statusBadge}>
                  <CheckCircle2 color="#22C55E" size={12} />
                  <Text style={styles.statusText}>{ref.status}</Text>
                </View>
                <Text style={styles.rewardText}>{ref.reward}</Text>
              </View>
            </View>
          ))}
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
  
  iconCircle: { width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(217, 102, 56, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(217, 102, 56, 0.2)' },
  cardTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  cardDesc: { fontSize: 14, lineHeight: 22, marginBottom: 24 },
  
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  codeRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  codeBox: { flex: 1, borderRadius: 16, paddingHorizontal: 16, justifyContent: 'center', borderWidth: 1 },
  inputDark: { backgroundColor: '#0D1117', borderColor: '#30363D' },
  inputLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  codeText: { fontSize: 18, fontWeight: '800', color: '#d96638', letterSpacing: 1 },
  copyButton: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#d96638', alignItems: 'center', justifyContent: 'center' },
  
  shareButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 10, borderWidth: 1 },
  shareText: { fontSize: 16, fontWeight: '700' },
  
  statsCard: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 20 },
  statsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  statsValue: { fontSize: 36, fontWeight: '800' },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(150,150,150,0.2)', marginBottom: 12 },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#22C55E' },
  progressDesc: { fontSize: 12, textAlign: 'center' },
  
  recentCard: { padding: 24, borderRadius: 24, borderWidth: 1 },
  recentTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  refRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  refName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  refDate: { fontSize: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  statusText: { fontSize: 10, fontWeight: '800', color: '#22C55E', textTransform: 'uppercase' },
  rewardText: { fontSize: 12, fontWeight: '800', color: '#d96638' },
  
  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#1E293B' },
  textGray: { color: '#8E8E93' },
  textSlate: { color: '#64748B' },
});

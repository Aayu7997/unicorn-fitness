import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  X,
  CheckCheck,
  Check,
  Info,
  AlertTriangle,
  Tag,
  Calendar,
  CreditCard,
  Sparkles,
  Shield,
  BellOff,
  RefreshCw,
} from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '../store/useUIStore';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Just now';

    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export function NotificationModal({ visible, onClose }: NotificationModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'system' | 'offers'>('all');

  const { data: notifications = [], isLoading, isRefetching, refetch } = useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data || [];
    },
    enabled: visible,
    refetchInterval: 15000,
  });

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/notifications', {});
    },
    onSuccess: () => {
      queryClient.setQueryData<NotificationItem[]>(['notifications'], (old = []) =>
        old.map((n) => ({ ...n, isRead: true }))
      );
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('All notifications marked as read', 'success');
    },
    onError: () => {
      showToast('Failed to mark notifications as read', 'error');
    },
  });

  const markSingleReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch('/notifications', { notificationIds: [id] });
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData<NotificationItem[]>(['notifications'], (old = []) =>
        old.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  const handleMarkAllRead = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    markAllReadMutation.mutate();
  };

  const handleItemPress = (item: NotificationItem) => {
    if (!item.isRead) {
      markSingleReadMutation.mutate(item.id);
    } else {
      Haptics.selectionAsync();
    }
  };

  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter((n) => !n.isRead);
      case 'system':
        return notifications.filter((n) => n.type === 'system');
      case 'offers':
        return notifications.filter((n) => n.type === 'offer' || n.type === 'promo');
      case 'all':
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  const getTypeMeta = (type: string) => {
    switch (type) {
      case 'system':
        return {
          icon: <AlertTriangle color="#EF4444" size={16} />,
          badgeBg: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEE2E2',
          badgeText: '#EF4444',
          label: 'System',
        };
      case 'offer':
      case 'promo':
        return {
          icon: <Tag color="#10B981" size={16} />,
          badgeBg: isDark ? 'rgba(16, 185, 129, 0.18)' : '#D1FAE5',
          badgeText: '#10B981',
          label: 'Offer',
        };
      case 'class':
      case 'booking':
        return {
          icon: <Calendar color="#3B82F6" size={16} />,
          badgeBg: isDark ? 'rgba(59, 130, 246, 0.18)' : '#DBEAFE',
          badgeText: '#3B82F6',
          label: 'Class',
        };
      case 'payment':
      case 'invoice':
        return {
          icon: <CreditCard color="#F59E0B" size={16} />,
          badgeBg: isDark ? 'rgba(245, 158, 11, 0.18)' : '#FEF3C7',
          badgeText: '#F59E0B',
          label: 'Billing',
        };
      default:
        return {
          icon: <Info color="#d96638" size={16} />,
          badgeBg: isDark ? 'rgba(217, 102, 56, 0.18)' : 'rgba(217, 102, 56, 0.12)',
          badgeText: '#d96638',
          label: 'Update',
        };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        {/* Blur backdrop for optical frosted glass immersion */}
        <BlurView
          tint={isDark ? 'dark' : 'light'}
          intensity={ Platform.OS === 'ios' ? 70 : 90 }
          style={StyleSheet.absoluteFill}
        />
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdropPressArea} />
        </TouchableWithoutFeedback>

        {/* Modal Floating Container */}
        <View
          style={[
            styles.modalSheet,
            {
              paddingTop: insets.top > 0 ? insets.top + 8 : 24,
              paddingBottom: Math.max(insets.bottom, 20),
            },
            isDark ? styles.modalDark : styles.modalLight,
          ]}
        >
          {/* Specular Rim Light Top Edge */}
          <View style={[styles.topRimLight, isDark ? styles.topRimDark : styles.topRimLightColor]} />

          {/* Frosted Glass Internal Specular Gradient */}
          <LinearGradient
            colors={
              isDark
                ? ['rgba(255, 255, 255, 0.06)', 'rgba(21, 26, 33, 0.40)', 'rgba(13, 17, 23, 0.75)']
                : ['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.50)', 'rgba(244, 247, 246, 0.70)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          {/* Header Bar */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconWrap, isDark ? styles.iconWrapDark : styles.iconWrapLight]}>
                <Bell color="#d96638" size={20} />
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.title, isDark ? styles.textWhite : styles.textBlack]}>
                    Notifications
                  </Text>
                  {unreadCount > 0 && (
                    <View style={styles.unreadChip}>
                      <Text style={styles.unreadChipText}>{unreadCount} new</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.subtitle, isDark ? styles.textGray : styles.textSlate]}>
                  Real-time club announcements & alerts
                </Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  onPress={handleMarkAllRead}
                  disabled={markAllReadMutation.isPending}
                  style={[styles.markReadBtn, isDark ? styles.btnDark : styles.btnLight]}
                  activeOpacity={0.7}
                >
                  <CheckCheck color="#d96638" size={16} />
                  <Text style={styles.markReadText}>Read All</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onClose();
                }}
                style={[styles.closeBtn, isDark ? styles.closeBtnDark : styles.closeBtnLight]}
                activeOpacity={0.7}
              >
                <X color={isDark ? '#FFF' : '#0F172A'} size={18} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Pills */}
          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: `Unread (${unreadCount})` },
                { id: 'system', label: 'System' },
                { id: 'offers', label: 'Offers' },
              ].map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setActiveFilter(tab.id as any);
                    }}
                    style={[
                      styles.filterPill,
                      isActive
                        ? styles.filterPillActive
                        : isDark
                        ? styles.filterPillInactiveDark
                        : styles.filterPillInactiveLight,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        isActive
                          ? styles.filterPillTextActive
                          : isDark
                          ? styles.filterPillTextDark
                          : styles.filterPillTextLight,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Content List */}
          {isLoading && !isRefetching ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator color="#d96638" size="large" />
              <Text style={[styles.loadingText, isDark ? styles.textGray : styles.textSlate]}>
                Loading notifications...
              </Text>
            </View>
          ) : filteredNotifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconWrap, isDark ? styles.emptyIconDark : styles.emptyIconLight]}>
                <BellOff color={isDark ? '#475569' : '#94A3B8'} size={38} />
              </View>
              <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textBlack]}>
                {activeFilter === 'unread' ? 'No unread notifications' : "You're all caught up"}
              </Text>
              <Text style={[styles.emptySub, isDark ? styles.textGray : styles.textSlate]}>
                {activeFilter === 'unread'
                  ? 'All club alerts and updates have been acknowledged.'
                  : 'New schedule updates, payment alerts, and announcements will appear here.'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  refetch();
                }}
                style={[styles.refreshBtn, isDark ? styles.btnDark : styles.btnLight]}
                activeOpacity={0.8}
              >
                <RefreshCw color={isDark ? '#FFF' : '#0F172A'} size={15} />
                <Text style={[styles.refreshText, isDark ? styles.textWhite : styles.textBlack]}>
                  Refresh
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {filteredNotifications.map((item) => {
                const meta = getTypeMeta(item.type);
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleItemPress(item)}
                    style={[
                      styles.itemCard,
                      isDark ? styles.itemCardDark : styles.itemCardLight,
                      !item.isRead && (isDark ? styles.itemUnreadDark : styles.itemUnreadLight),
                    ]}
                    activeOpacity={0.85}
                  >
                    <View style={styles.itemHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                        <View style={[styles.typeBadge, { backgroundColor: meta.badgeBg }]}>
                          {meta.icon}
                          <Text style={[styles.typeBadgeText, { color: meta.badgeText }]}>
                            {meta.label}
                          </Text>
                        </View>
                        <Text style={[styles.timestamp, isDark ? styles.textGray : styles.textSlate]}>
                          • {formatRelativeTime(item.createdAt)}
                        </Text>
                      </View>

                      {!item.isRead ? (
                        <View style={styles.unreadDot} />
                      ) : (
                        <View style={styles.readCheck}>
                          <Check color={isDark ? '#64748B' : '#94A3B8'} size={14} />
                        </View>
                      )}
                    </View>

                    <Text style={[styles.itemTitle, isDark ? styles.textWhite : styles.textBlack]}>
                      {item.title}
                    </Text>

                    <Text style={[styles.itemMessage, isDark ? styles.textGray : styles.textSlate]}>
                      {item.message}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdropPressArea: {
    flex: 1,
  },
  modalSheet: {
    maxHeight: '88%',
    minHeight: '60%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  modalDark: {
    backgroundColor: 'rgba(18, 22, 30, 0.94)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  modalLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  topRimLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  topRimDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  topRimLightColor: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(142, 142, 147, 0.2)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDark: {
    backgroundColor: 'rgba(217, 102, 56, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(217, 102, 56, 0.3)',
  },
  iconWrapLight: {
    backgroundColor: 'rgba(217, 102, 56, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(217, 102, 56, 0.2)',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  unreadChip: {
    backgroundColor: '#d96638',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  unreadChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  markReadText: {
    color: '#d96638',
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  closeBtnLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  btnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  btnLight: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterRow: {
    paddingVertical: 12,
  },
  filterScroll: {
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  filterPillActive: {
    backgroundColor: '#d96638',
    borderColor: '#d96638',
  },
  filterPillInactiveDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterPillInactiveLight: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  filterPillTextDark: {
    color: '#94A3B8',
  },
  filterPillTextLight: {
    color: '#64748B',
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  itemCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  itemCardDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  itemCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  itemUnreadDark: {
    backgroundColor: 'rgba(217, 102, 56, 0.07)',
    borderColor: 'rgba(217, 102, 56, 0.28)',
  },
  itemUnreadLight: {
    backgroundColor: 'rgba(217, 102, 56, 0.04)',
    borderColor: 'rgba(217, 102, 56, 0.2)',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 11,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#d96638',
    shadowColor: '#d96638',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  readCheck: {
    padding: 2,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  itemMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 30,
    gap: 10,
  },
  emptyIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyIconDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyIconLight: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
  },
  refreshText: {
    fontSize: 13,
    fontWeight: '600',
  },
  textWhite: { color: '#FFFFFF' },
  textBlack: { color: '#0F172A' },
  textGray: { color: '#94A3B8' },
  textSlate: { color: '#64748B' },
});

import React from 'react';
import { View, Text } from 'react-native';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  valueColor?: string; // e.g. text-neonGreen
}

export function StatCard({ title, value, subtitle, icon, valueColor = 'text-white' }: StatCardProps) {
  return (
    <View className="flex-1 bg-[#1a1a1a] rounded-2xl p-4 border border-white/5 shadow-sm">
      <View className="flex-row justify-between items-start mb-2">
        {icon && <View className="p-2 bg-white/5 rounded-full">{icon}</View>}
        <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider">{title}</Text>
      </View>
      <View className="mt-2">
        <Text className={`text-3xl font-bold ${valueColor}`}>{value}</Text>
        {subtitle && <Text className="text-gray-500 text-xs mt-1">{subtitle}</Text>}
      </View>
    </View>
  );
}

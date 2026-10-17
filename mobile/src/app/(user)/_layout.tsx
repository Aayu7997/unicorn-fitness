import { Tabs, Redirect } from 'expo-router';
import { Home, Calendar, Compass, Flame, Menu, Bot } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { CustomTabBar } from '../../components/CustomTabBar';

export default function AppLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {/* 6 Visible Main Destinations */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size || 22} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size || 22} />,
        }}
      />
      <Tabs.Screen
        name="advisory"
        options={{
          title: 'Plans',
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size || 22} />,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Workouts',
          tabBarIcon: ({ color, size }) => <Flame color={color} size={size || 22} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI Coach',
          tabBarIcon: ({ color, size }) => <Bot color={color} size={size || 22} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <Menu color={color} size={size || 22} />,
        }}
      />
      
      {/* Sub-screens (Excluded from Bottom Tab Bar via href: null) */}
      <Tabs.Screen
        name="enquiries"
        options={{
          href: null,
          title: 'Enquiries',
        }}
      />
      <Tabs.Screen
        name="measurements"
        options={{
          href: null,
          title: 'Measurements',
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          href: null,
          title: 'Invoices',
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          href: null,
          title: 'My Goals',
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          href: null,
          title: 'My Plans',
        }}
      />
      <Tabs.Screen
        name="programs"
        options={{
          href: null,
          title: 'My Programs',
        }}
      />
      <Tabs.Screen
        name="referrals"
        options={{
          href: null,
          title: 'My Referrals',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          title: 'Settings',
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          href: null,
          title: 'Support',
        }}
      />
      <Tabs.Screen
        name="bmi"
        options={{
          href: null,
          title: 'BMI & Body Composition',
        }}
      />
    </Tabs>
  );
}

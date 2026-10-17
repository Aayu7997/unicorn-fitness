import { Tabs, Redirect } from 'expo-router';
import { Home, Users, MessageSquare, HelpCircle, Menu, Bot } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { CustomTabBar } from '../../components/CustomTabBar';

export default function AdminLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  // Strict role check for admin
  const role = user.role?.toUpperCase();
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return <Redirect href="/(user)" />;
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
          title: 'Overview',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size || 22} />,
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: 'Members',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size || 22} />,
        }}
      />
      <Tabs.Screen
        name="enquiries"
        options={{
          title: 'Enquiries',
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size || 22} />,
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Support',
          tabBarIcon: ({ color, size }) => <HelpCircle color={color} size={size || 22} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI Admin',
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
        name="invoices"
        options={{
          href: null,
          title: 'Invoices',
        }}
      />
      <Tabs.Screen
        name="advisory"
        options={{
          href: null,
          title: 'Diet & Exercise',
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
        name="expenses"
        options={{
          href: null,
          title: 'Expenses',
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          href: null,
          title: 'Classes & Schedule',
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          href: null,
          title: 'Inventory',
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          href: null,
          title: 'Analytics & Reports',
        }}
      />
      <Tabs.Screen
        name="content"
        options={{
          href: null,
          title: 'Content',
        }}
      />
      <Tabs.Screen
        name="programs"
        options={{
          href: null,
          title: 'Programs',
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
        name="trainers"
        options={{
          href: null,
          title: 'Trainers',
        }}
      />
      <Tabs.Screen
        name="communication"
        options={{
          href: null,
          title: 'Broadcasts & Comms',
        }}
      />
      <Tabs.Screen
        name="blog"
        options={{
          href: null,
          title: 'Blog & Articles',
        }}
      />
    </Tabs>
  );
}

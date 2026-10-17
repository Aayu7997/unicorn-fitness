import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function Index() {
  const { user, isLoading } = useAuth();

  // While checking the authentication state, show a loading spinner
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-darkSurface">
        <ActivityIndicator size="large" color="#D7C8B4" />
      </View>
    );
  }

  // If the user is not authenticated, redirect them to the login screen
  if (!user) {
    return <Redirect href="/login" />;
  }

  // If the user is an admin, redirect them to the admin dashboard
  if (user.role.toUpperCase() === 'ADMIN' || user.role.toUpperCase() === 'SUPER_ADMIN') {
    return <Redirect href="/(admin)" />;
  }

  // Otherwise, redirect them to the regular member dashboard
  return <Redirect href="/(user)" />;
}

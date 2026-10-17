import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  StatusBar,
  Dimensions,
  StyleSheet
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  Layout, 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

WebBrowser.maybeCompleteAuthSession();
const { width, height } = Dimensions.get('window');

const AnimatedGradientBackground = () => {
  return (
    <View style={StyleSheet.absoluteFill} className="bg-[#050302] overflow-hidden">
      <LinearGradient
        colors={['#d96638', '#914747', '#1e0f0a', '#0a0a0f']}
        locations={[0, 0.28, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
        locations={[0, 0.25, 0.75, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </View>
  );
};

export default function LoginScreen() {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, register, googleLogin, forgotPassword, resetPassword, isLoading } = useAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '1014169970929-YOUR-CLIENT-ID.apps.googleusercontent.com',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'dummy-ios-client-id.apps.googleusercontent.com',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'dummy-android-client-id.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleLogin(authentication.accessToken);
      }
    }
  }, [response]);

  const handleGoogleLogin = async (token: string) => {
    try {
      const authUser = await googleLogin(token);
      const role = authUser?.role?.toUpperCase();
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        router.replace('/(admin)' as any);
      } else {
        router.replace('/(user)' as any);
      }
    } catch (error: any) {
      Alert.alert('Google Login Failed', error?.message || 'Invalid credentials');
    }
  }

  const handleSubmit = async () => {
    if (authMode === 'forgot') {
      if (!email) {
        Alert.alert('Error', 'Please enter your email address');
        return;
      }
      try {
        await forgotPassword(email);
        Alert.alert('Email Sent', 'If an account exists, a reset code was sent.');
        setAuthMode('reset');
      } catch (error: any) {
        Alert.alert('Error', error?.message || 'Failed to send reset code');
      }
      return;
    }

    if (authMode === 'reset') {
      if (!email || !resetToken || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      try {
        await resetPassword(email, resetToken, password);
        Alert.alert('Success', 'Password has been reset successfully. Please login.');
        setAuthMode('login');
        setPassword('');
        setResetToken('');
      } catch (error: any) {
        Alert.alert('Error', error?.message || 'Failed to reset password');
      }
      return;
    }

    if (!email || !password || (authMode === 'signup' && !name)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    try {
      let authUser;
      if (authMode === 'login') {
        authUser = await login(email, password);
      } else {
        authUser = await register(email, password, name);
      }
      
      const role = authUser?.role?.toUpperCase();
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        router.replace('/(admin)' as any);
      } else {
        router.replace('/(user)' as any);
      }
    } catch (error: any) {
      Alert.alert('Authentication Failed', error?.message || 'Invalid credentials');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <AnimatedGradientBackground />

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Logo Perfectly Centered */}
          <Animated.View entering={FadeInDown.duration(260)} style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/icon.png')} 
              style={styles.logo}
            />
          </Animated.View>

          {/* Large Stylish Header */}
          <Animated.View entering={FadeInDown.delay(200).duration(260)} style={styles.headerContainer}>
            <Text style={styles.titleRegular}>
              {authMode === 'login' ? 'Welcome back,' : 
               authMode === 'signup' ? 'Defy your' :
               authMode === 'forgot' ? 'Reset your' : 'Create new'}
            </Text>
            <Text style={styles.titleItalic}>
              {authMode === 'login' ? 'Champion.' : 
               authMode === 'signup' ? 'Limits.' : 
               authMode === 'forgot' ? 'Password.' : 'Access.'}
            </Text>
          </Animated.View>

          {/* Tab Selector - Bold Yellow Style */}
          {(authMode === 'login' || authMode === 'signup') && (
            <Animated.View entering={FadeInDown.delay(300).duration(260)} style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tabButton, authMode === 'login' && styles.tabButtonActive]}
                onPress={() => setAuthMode('login')}
              >
                <Text style={[styles.tabText, authMode === 'login' && styles.tabTextActive]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabButton, authMode === 'signup' && styles.tabButtonActive]}
                onPress={() => setAuthMode('signup')}
              >
                <Text style={[styles.tabText, authMode === 'signup' && styles.tabTextActive]}>Sign Up</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Forms */}
          <Animated.View layout={Layout.duration(260)} style={styles.formContainer}>
            {authMode === 'signup' && (
              <Animated.View entering={FadeInDown.duration(300)} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <User color="#A1A1AA" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor="#71717A"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    selectionColor="#D7C8B4"
                  />
                </View>
              </Animated.View>
            )}
            
            <Animated.View entering={FadeInDown.duration(300).delay(100)} style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Mail color="#A1A1AA" size={18} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#71717A"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  selectionColor="#D7C8B4"
                />
              </View>
            </Animated.View>
            
            {authMode === 'reset' && (
              <Animated.View entering={FadeInDown.duration(300).delay(150)} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reset Code (Sent to Email)</Text>
                <View style={styles.inputWrapper}>
                  <Lock color="#A1A1AA" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#71717A"
                    value={resetToken}
                    onChangeText={setResetToken}
                    keyboardType="number-pad"
                    selectionColor="#D7C8B4"
                  />
                </View>
              </Animated.View>
            )}

            {authMode !== 'forgot' && (
              <Animated.View entering={FadeInDown.duration(300).delay(200)} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{authMode === 'reset' ? 'New Password' : 'Password'}</Text>
                <View style={styles.inputWrapper}>
                  <Lock color="#A1A1AA" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={authMode === 'reset' ? "Enter new password" : "Enter your password"}
                    placeholderTextColor="#71717A"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    selectionColor="#D7C8B4"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    {showPassword ? (
                      <EyeOff color="#A1A1AA" size={18} />
                    ) : (
                      <Eye color="#A1A1AA" size={18} />
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
            
            {authMode === 'login' && (
              <TouchableOpacity onPress={() => setAuthMode('forgot')} style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {(authMode === 'forgot' || authMode === 'reset') && (
              <TouchableOpacity onPress={() => setAuthMode('login')} style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>Back to Login</Text>
              </TouchableOpacity>
            )}

            {/* Solid Yellow Primary Button */}
            <TouchableOpacity 
              style={[styles.primaryButtonWrapper, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <View style={styles.primaryButton}>
                {isLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {authMode === 'login' ? 'Login' : 
                     authMode === 'signup' ? 'Sign Up' :
                     authMode === 'forgot' ? 'Send Reset Code' : 'Reset Password'}
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {(authMode === 'login' || authMode === 'signup') && (
              <>
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.divider} />
                </View>

                <View style={styles.socialContainer}>
                  <TouchableOpacity 
                    style={[styles.socialButton, (isLoading || !request) && styles.buttonDisabled]}
                    onPress={() => promptAsync()}
                    disabled={!request || isLoading}
                    activeOpacity={0.7}
                  >
                    <Image source={{uri: 'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png'}} style={styles.googleIcon} />
                    <Text style={styles.socialButtonText}>Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Coming Soon', 'Apple Sign In will be available soon.')} activeOpacity={0.7}>
                    <Image source={{uri: 'https://cdn-icons-png.flaticon.com/512/0/747.png'}} style={[styles.googleIcon, {tintColor: '#FFF'}]} />
                    <Text style={styles.socialButtonText}>Apple</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  titleRegular: {
    fontSize: 28,
    fontWeight: '400', // Clean, lighter weight for the first line
    color: 'rgba(255, 255, 255, 0.8)', // Slightly translucent for depth
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
    letterSpacing: -0.5, 
  },
  titleItalic: {
    fontSize: 34, // Significantly larger for massive emphasis
    fontWeight: '900', // Ultra-heavy lockscreen weight
    color: '#FFF', // Pure white to pop against the translucent top line
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
    letterSpacing: -1.5, // Extremely tight tracking for modern aesthetic
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)', // Darker background for the tabs
    borderRadius: 999,
    padding: 4,
    marginBottom: 32,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 999,
  },
  tabButtonActive: {
    backgroundColor: '#D7C8B4', // Apple Champagne
    shadowColor: '#D7C8B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  tabTextActive: {
    color: '#000', // Black text on yellow background
    fontWeight: '700',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#D1D5DB', // Lighter label
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)', // Darker inputs matching the image
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 20,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 28,
    marginTop: -8,
  },
  forgotPasswordText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
  },
  primaryButtonWrapper: {
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 28,
  },
  primaryButton: {
    backgroundColor: '#D7C8B4', // Apple Champagne
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: '#71717A',
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    height: 56,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  socialButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
  }
});

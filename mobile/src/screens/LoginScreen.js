import React, { useState, useContext, useRef, useMemo, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, ArrowRight, X } from 'lucide-react-native';
import { MotiView } from 'moti';
import { AuthContext } from '../context/AuthContext';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';
import * as AppleAuthentication from 'expo-apple-authentication';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const { login, forgotPassword, socialLogin } = useContext(AuthContext);

  // Bottom Sheet Refs
  const bottomSheetModalRef = useRef(null);
  const snapPoints = useMemo(() => ['45%'], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleCloseModalPress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    setError('');
    setIsLoggingIn(true);
    const result = await login(email, password);
    if (!result.success) {
      setError(result.message);
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async () => {
    Keyboard.dismiss();
    if (!resetEmail) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập email của bạn' });
      return;
    }
    setIsResetting(true);
    await forgotPassword(resetEmail);
    setIsResetting(false);
    handleCloseModalPress();
    Toast.show({
      type: 'success',
      text1: 'Đã gửi link khôi phục!',
      text2: 'Vui lòng kiểm tra hộp thư của bạn.',
      position: 'top',
    });
    setResetEmail('');
  };

  const handleSocialLogin = async (provider) => {
    try {
      let token = null;

      if (provider === 'google') {
        if (Platform.OS === 'web') {
          Toast.show({ type: 'info', text1: 'Google Login', text2: 'Not supported on web in this demo' });
          return;
        }
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Tính năng này không hoạt động trên Expo Go. Vui lòng build app thật.' });
        return;
      } else if (provider === 'apple') {
        if (Platform.OS !== 'ios') {
          Toast.show({ type: 'info', text1: 'Apple Login', text2: 'Only supported on iOS' });
          return;
        }
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
        token = credential.identityToken;
      } else if (provider === 'facebook') {
        if (Platform.OS === 'web') {
          Toast.show({ type: 'info', text1: 'Facebook Login', text2: 'Not supported on web in this demo' });
          return;
        }
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Tính năng này không hoạt động trên Expo Go. Vui lòng build app thật.' });
        return;
      }

      if (token) {
        const result = await socialLogin(provider, token);
        if (!result.success) {
          setError(result.message || 'Đăng nhập thất bại');
        }
      }
    } catch (error) {
      console.log(`${provider} login error:`, error);
      setError(`Lỗi đăng nhập ${provider}`);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <LinearGradient colors={['#1E1B4B', '#312E81', '#4338CA']} style={styles.background} />
      
      <MotiView from={{ opacity: 0, translateY: -50 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 1000 }} style={styles.headerContainer}>
        <Text style={styles.title}>Giả Kim Thuật</Text>
        <Text style={styles.subtitle}>Đăng nhập để tiếp tục hành trình</Text>
      </MotiView>

      <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'timing', duration: 800, delay: 300 }} style={styles.formContainer}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.inputContainer}>
          <Mail color="#9CA3AF" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email của bạn"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock color="#9CA3AF" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.forgotPasswordLink} onPress={handlePresentModalPress}>
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoggingIn}>
          {isLoggingIn ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.loginButtonText}>Đăng Nhập</Text>
              <ArrowRight color="#FFF" size={20} />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('google')}>
            <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} style={styles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('apple')}>
            <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/0/747.png' }} style={[styles.socialIcon, { tintColor: '#FFF' }]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('facebook')}>
            <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/124/124010.png' }} style={styles.socialIcon} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>Chưa có tài khoản? <Text style={styles.registerTextBold}>Đăng ký ngay</Text></Text>
        </TouchableOpacity>
      </MotiView>

      {/* Forgot Password Bottom Sheet */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
      >
        <View style={styles.bottomSheetContent}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Quên mật khẩu?</Text>
            <TouchableOpacity onPress={handleCloseModalPress} style={styles.closeButton}>
              <X color="#64748B" size={24} />
            </TouchableOpacity>
          </View>
          <Text style={styles.bottomSheetSubtitle}>
            Đừng lo lắng! Hãy nhập email của bạn, chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.
          </Text>
          
          <View style={[styles.inputContainer, styles.bottomSheetInputContainer]}>
            <Mail color="#94A3B8" size={20} style={styles.icon} />
            <BottomSheetTextInput
              style={styles.bottomSheetInput}
              placeholder="Nhập email của bạn"
              placeholderTextColor="#94A3B8"
              value={resetEmail}
              onChangeText={setResetEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={handleForgotPassword}
            disabled={isResetting}
          >
            {isResetting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.resetButtonText}>Gửi yêu cầu</Text>
            )}
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#FFF', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#E0E7FF' },
  formContainer: { backgroundColor: 'rgba(255, 255, 255, 0.1)', marginHorizontal: 20, padding: 25, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, height: 55 },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#FFF', fontSize: 16 },
  forgotPasswordLink: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotPasswordText: { color: '#A5B4FC', fontSize: 14, fontWeight: '500' },
  loginButton: { flexDirection: 'row', backgroundColor: '#6366F1', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  dividerText: { color: '#A5B4FC', paddingHorizontal: 15, fontSize: 14 },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 20 },
  socialButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  socialIcon: { width: 24, height: 24 },
  registerLink: { marginTop: 10, alignItems: 'center' },
  registerText: { color: '#E0E7FF', fontSize: 14 },
  registerTextBold: { fontWeight: 'bold', color: '#818CF8' },
  errorText: { color: '#FCA5A5', textAlign: 'center', marginBottom: 15, fontSize: 14 },
  
  // Bottom Sheet Styles
  bottomSheetBackground: { backgroundColor: '#1E293B', borderRadius: 24 },
  bottomSheetIndicator: { backgroundColor: '#475569', width: 40 },
  bottomSheetContent: { flex: 1, padding: 24 },
  bottomSheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  bottomSheetTitle: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC' },
  closeButton: { padding: 5, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 20 },
  bottomSheetSubtitle: { fontSize: 15, color: '#94A3B8', lineHeight: 22, marginBottom: 25 },
  bottomSheetInputContainer: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' },
  bottomSheetInput: { flex: 1, color: '#F8FAFC', fontSize: 16 },
  resetButton: { backgroundColor: '#6366F1', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  resetButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

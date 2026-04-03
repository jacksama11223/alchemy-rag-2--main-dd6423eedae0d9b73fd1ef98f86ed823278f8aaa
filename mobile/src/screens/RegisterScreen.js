import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, ArrowRight } from 'lucide-react-native';
import { MotiView } from 'moti';
import { AuthContext } from '../context/AuthContext';
import Toast from 'react-native-toast-message';
import * as AppleAuthentication from 'expo-apple-authentication';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { register, socialLogin } = useContext(AuthContext);

  const handleRegister = async () => {
    Keyboard.dismiss();
    if (!name || !email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setError('');
    setIsRegistering(true);
    const result = await register(name, email, password);
    if (!result.success) {
      setError(result.message);
      setIsRegistering(false);
    }
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
          setError(result.message || 'Đăng ký thất bại');
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
        <Text style={styles.title}>Tạo Tài Khoản</Text>
        <Text style={styles.subtitle}>Bắt đầu thu thập tinh hoa tri thức</Text>
      </MotiView>

      <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'timing', duration: 800, delay: 300 }} style={styles.formContainer}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.inputContainer}>
          <User color="#9CA3AF" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Tên hiển thị"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />
        </View>

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

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={isRegistering}>
          {isRegistering ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.registerButtonText}>Đăng Ký</Text>
              <ArrowRight color="#FFF" size={20} />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Hoặc đăng ký với</Text>
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

        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Đã có tài khoản? <Text style={styles.loginTextBold}>Đăng nhập</Text></Text>
        </TouchableOpacity>
      </MotiView>
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
  registerButton: { flexDirection: 'row', backgroundColor: '#10B981', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  registerButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  dividerText: { color: '#A5B4FC', paddingHorizontal: 15, fontSize: 14 },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 20 },
  socialButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  socialIcon: { width: 24, height: 24 },
  loginLink: { marginTop: 10, alignItems: 'center' },
  loginText: { color: '#E0E7FF', fontSize: 14 },
  loginTextBold: { fontWeight: 'bold', color: '#34D399' },
  errorText: { color: '#FCA5A5', textAlign: 'center', marginBottom: 15, fontSize: 14 }
});

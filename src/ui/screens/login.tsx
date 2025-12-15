import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../nav/navTypes';

import { useSelector } from 'react-redux';
import { RootState } from '../../redux/stateStore';

import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { setToken } from '../../services/auth/tokenManager';
import { serviceManager } from '../../services/serviceManager';

WebBrowser.maybeCompleteAuthSession(); // must be called once

// Type the navigation prop
type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function Login() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  

  const pushToken = useSelector(
  (state: RootState) => state.pushToken?.expoPushToken ?? 'No token yet'
);

const logo: ImageSourcePropType = require('../../../assets/upfit_icon_225.png');

 const goToJobQueue = () => {
    navigation.navigate('JobQueue');
  };

const goToSchemaViewer = () => {
    navigation.navigate('SchemaViewer');
  }

  const simulateLogin = async () => {
    try {
      // Simulate a logged-in user for testing
      const testUserId = 'test-user-123';
      
      Alert.alert('Simulating Login...', 'Initializing user cache and writing to SQLite');
      
      // Trigger service manager to initialize user cache (this will write to SQLite)
      await serviceManager.onUserLogin(testUserId);
      
      Alert.alert(
        'Login Simulation Complete!', 
        'User cache initialized. Check Schema Viewer to see SQLite records.',
        [
          { text: 'View Schema', onPress: goToSchemaViewer },
          { text: 'OK' }
        ]
      );
      
    } catch (error) {
      console.error('Simulate login failed:', error);
      Alert.alert('Simulation Failed', (error as Error).message || 'Unknown error');
    }
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
  {
    clientId: 'holman-upfit-mobile-app.dev',//Constants.expoConfig?.extra?.authSettings.clientId,
    scopes: ['openid', 'profile', 'email', 'offline_access', 'azure_holman_apim'],
    redirectUri: AuthSession.makeRedirectUri({ 
      scheme: 'com.holman.upfit.mobile',
      path: 'callback'
    }),
    usePKCE: true,
  },
  {
    authorizationEndpoint: 'https://passport.dev.holman.com/sts/connect/authorize',
    tokenEndpoint: 'https://passport.dev.holman.com/sts/connect/token',
    revocationEndpoint: 'https://passport.dev.holman.com/sts/connect/revocation',
  }
);

// Log the generated codeVerifier to console
React.useEffect(() => {
  if (request?.codeVerifier) {
    console.log('Generated PKCE code_verifier:', request.codeVerifier);
  }
}, [request])

React.useEffect(() => {
  const fetchToken = async () => {
    if (response?.type === 'success' && response.params.code) {
      try {
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: 'holman-upfit-mobile-app.dev',//Constants.expoConfig?.extra?.authSettings.clientId,
            code: response.params.code,
            redirectUri: AuthSession.makeRedirectUri({ scheme: 'com.holman.upfit.mobile', path: 'callback' }),
            extraParams: {
              code_verifier: request?.codeVerifier ?? '',
            },
          },
          {
            tokenEndpoint: 'https://passport.dev.holman.com/sts/connect/token',
          }
        );

        const { accessToken, refreshToken, expiresIn, idToken } = tokenResponse;
        setToken(accessToken, parseInt(expiresIn?.toString() ?? '3600', 10));
        Alert.alert('Login Successful');

        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);
        console.log('ID Token:', idToken);
        console.log('Expires In:', expiresIn);

      } catch (err) {
        console.log('Token Exchange Failed', (err as Error).message);
        Alert.alert('Token Exchange Failed', (err as Error).message);
      }
    }
  };

  fetchToken();
}, [response]);



  return (
    <View style={styles.container}>

      {/* Logo at top center */}
    <Image source={logo} style={styles.logo} />

      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={{ fontSize: 14 }}>
        {pushToken ? `Expo Push Token: ${pushToken}` : 'Fetching push token...'}
      </Text>

       <TouchableOpacity style={styles.button} onPress={() => promptAsync()}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {__DEV__ && (

        <>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#28a745' }]} onPress={simulateLogin}>
            <Text style={styles.buttonText}>🧪 Simulate Login (Test SQLite)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={goToSchemaViewer}>
            <Text style={styles.buttonText}>View Schema & Cache Data</Text>
          </TouchableOpacity>
               
          <TouchableOpacity style={styles.button} onPress={goToJobQueue}>
            <Text style={styles.buttonText}>Go to JobQueue</Text>
          </TouchableOpacity>
        </>

      )}

    </View>

    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 15, width: '80%' },
 button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    width:'60%'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 200, // space between logo and title
  }
});

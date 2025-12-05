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

const logo: ImageSourcePropType = require('../../../assets/HolmanBlueSquareLogo.png');

 const goToJobQueue = () => {
    navigation.navigate('JobQueue');
  };

const goToSchemaViewer = () => {
    navigation.navigate('SchemaViewer');
  }

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
  {
    clientId: Constants.expoConfig?.extra?.authSettings.clientId,
    scopes: ['openid', 'profile', 'email', 'offline_access'],
    redirectUri: AuthSession.makeRedirectUri({ scheme: 'hub-mobile' }),
    usePKCE: true,
  },
  {
    authorizationEndpoint: 'https://passport.dev.holman.com/sts/connect/authorize',
    tokenEndpoint: 'https://passport.dev.holman.com/sts/connect/token',
    revocationEndpoint: 'https://passport.dev.holman.com/sts/connect/revocation',
  }
);

React.useEffect(() => {
  if (response?.type === 'success') {
    const { access_token, expires_in } = response.params;
    const expiresIn = parseInt(expires_in ?? '3600', 10);
    setToken(access_token, expiresIn);
    Alert.alert('Login Successful');
  } else if (response?.type === 'error') {
    Alert.alert('Login Failed', response.error?.message || 'Unknown error');
  }
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
          <TouchableOpacity style={styles.button} onPress={goToSchemaViewer}>
            <Text style={styles.buttonText}>View Schema</Text>
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
